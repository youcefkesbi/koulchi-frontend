import { supabase } from '../src/lib/supabase.js'

class WishlistService {
  constructor() {
    this.WISHLIST_STORAGE_KEY = 'wishlist'
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      console.log('WishlistService.isAuthenticated - Checking authentication...')
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('WishlistService.isAuthenticated - Auth error:', error)
        return false
      }
      
      console.log('WishlistService.isAuthenticated - User data:', user)
      const isAuth = !!user
      console.log('WishlistService.isAuthenticated - Result:', isAuth)
      return isAuth
    } catch (error) {
      console.error('WishlistService.isAuthenticated - Exception:', error)
      return false
    }
  }

  /**
   * Get current user ID
   */
  async getCurrentUserId() {
    try {
      console.log('WishlistService.getCurrentUserId - Getting user ID...')
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('WishlistService.getCurrentUserId - Auth error:', error)
        return null
      }
      
      const userId = user?.id || null
      console.log('WishlistService.getCurrentUserId - User ID:', userId)
      return userId
    } catch (error) {
      console.error('WishlistService.getCurrentUserId - Exception:', error)
      return null
    }
  }

  /**
   * Get wishlist items from localStorage
   */
  getLocalWishlist() {
    try {
      const wishlistData = localStorage.getItem(this.WISHLIST_STORAGE_KEY)
      return wishlistData ? JSON.parse(wishlistData) : []
    } catch (error) {
      console.error('Error reading local wishlist:', error)
      return []
    }
  }

  /**
   * Save wishlist items to localStorage
   */
  saveLocalWishlist(wishlist) {
    try {
      localStorage.setItem(this.WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
    } catch (error) {
      console.error('Error saving local wishlist:', error)
    }
  }

  /**
   * Clear localStorage wishlist
   */
  clearLocalWishlist() {
    try {
      localStorage.removeItem(this.WISHLIST_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing local wishlist:', error)
    }
  }

  /**
   * Add item to wishlist in Supabase
   */
  async addToSupabaseWishlist(userId, productId) {
    console.log('WishlistService.addToSupabaseWishlist called with:', { userId, productId })
    
    try {
      // First, ensure the user profile exists
      console.log('Checking if user profile exists...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single()
      
      if (profileError || !profile) {
        console.log('Profile does not exist, creating new profile...')
        // Create profile if it doesn't exist
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            role: 'user'
          })
        
        if (createError) {
          console.error('Failed to create profile:', createError)
          throw new Error(`Failed to create user profile: ${createError.message}`)
        }
        console.log('Profile created successfully')
      } else {
        console.log('Profile exists:', profile)
      }

      // Now add the wishlist item using the exact SQL format specified
      console.log('Adding wishlist item to Supabase...')
      
      // Use raw SQL query as specified:
      // insert into wishlist (user_id, product_id)
      // values ('<user_id>', '<product_id>')
      // on conflict (user_id, product_id) do nothing;
      
      let data, error
      
      try {
        const result = await supabase
          .rpc('add_to_wishlist', {
            p_user_id: userId,
            p_product_id: productId
          })
        
        data = result.data
        error = result.error
      } catch (rpcError) {
        console.log('RPC function not found, falling back to upsert...')
        const result = await supabase
          .from('wishlist')
          .upsert(
            {
              user_id: userId,
              product_id: productId
            },
            {
              onConflict: 'user_id,product_id'
            }
          )
        
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('Supabase wishlist insert error:', error)
        throw new Error(`Failed to add item to Supabase wishlist: ${error.message}`)
      }
      
      console.log('Wishlist item added successfully:', data)
    } catch (error) {
      console.error('Error in addToSupabaseWishlist:', error)
      throw error
    }
  }

  /**
   * Remove item from wishlist in Supabase
   */
  async removeFromSupabaseWishlist(userId, productId) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) {
      throw new Error(`Failed to remove item from Supabase wishlist: ${error.message}`)
    }
  }

  /**
   * Get wishlist items from Supabase with product details
   */
  async getSupabaseWishlist(userId) {
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        product_id,
        created_at,
        products (
          id,
          name,
          name_ar,
          price,
          image_urls,
          seller_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch Supabase wishlist: ${error.message}`)
    }

    return (data || []).map(item => ({
      id: item.product_id,
      productId: item.product_id,
      name: item.products?.name || 'Unknown Product',
      nameAr: item.products?.name_ar,
      price: item.products?.price || 0,
      image: item.products?.image_urls?.[0] || '',
      seller_id: item.products?.seller_id,
      created_at: item.created_at
    }))
  }

  /**
   * Add item to wishlist (works for both authenticated and guest users)
   */
  async addItem(productId) {
    console.log('=== WishlistService.addItem START ===')
    console.log('WishlistService.addItem called with:', { productId })
    
    try {
      const isAuth = await this.isAuthenticated()
      console.log('User authenticated:', isAuth)

      if (isAuth) {
        // User is signed in - add to Supabase
        console.log('User is authenticated, proceeding to Supabase...')
        const userId = await this.getCurrentUserId()
        console.log('User ID:', userId)
        
        if (!userId) {
          console.error('User ID not found despite being authenticated')
          throw new Error('User ID not found')
        }
        
        console.log('Adding to Supabase wishlist...')
        await this.addToSupabaseWishlist(userId, productId)
        console.log('Successfully added to Supabase wishlist')
      } else {
        // User is not signed in - add to localStorage
        console.log('User is not authenticated, using localStorage...')
        const localWishlist = this.getLocalWishlist()
        
        // Check if item already exists
        if (!localWishlist.some(item => item.productId === productId)) {
          localWishlist.push({ productId })
          this.saveLocalWishlist(localWishlist)
          console.log('Successfully added to localStorage wishlist')
        } else {
          console.log('Item already exists in localStorage wishlist')
        }
      }
      
      console.log('=== WishlistService.addItem SUCCESS ===')
    } catch (error) {
      console.error('=== WishlistService.addItem ERROR ===')
      console.error('Error in addItem:', error)
      throw error
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeItem(productId) {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - remove from Supabase
      const userId = await this.getCurrentUserId()
      if (!userId) throw new Error('User ID not found')
      
      await this.removeFromSupabaseWishlist(userId, productId)
    } else {
      // User is not signed in - remove from localStorage
      const localWishlist = this.getLocalWishlist()
      const filteredWishlist = localWishlist.filter(item => item.productId !== productId)
      this.saveLocalWishlist(filteredWishlist)
    }
  }

  /**
   * Get all wishlist items with product details
   */
  async getItems() {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - get from Supabase
      const userId = await this.getCurrentUserId()
      if (!userId) return []
      
      return await this.getSupabaseWishlist(userId)
    } else {
      // User is not signed in - get from localStorage
      const localWishlist = this.getLocalWishlist()
      
      if (localWishlist.length === 0) return []
      
      // Fetch product details for local wishlist items
      const productIds = localWishlist.map(item => item.productId)
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, name_ar, price, image_urls, seller_id')
        .in('id', productIds)

      if (error || !products) {
        console.error('Error fetching products for local wishlist:', error)
        return []
      }

      return localWishlist.map(item => {
        const product = products.find(p => p.id === item.productId)
        return {
          id: item.productId,
          productId: item.productId,
          name: product?.name || 'Unknown Product',
          nameAr: product?.name_ar,
          price: product?.price || 0,
          image: product?.image_urls?.[0] || '',
          seller_id: product?.seller_id,
          created_at: new Date().toISOString()
        }
      })
    }
  }

  /**
   * Clear all wishlist items
   */
  async clearWishlist() {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - clear from Supabase
      const userId = await this.getCurrentUserId()
      if (!userId) return
      
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to clear Supabase wishlist: ${error.message}`)
      }
    } else {
      // User is not signed in - clear from localStorage
      this.clearLocalWishlist()
    }
  }

  /**
   * Sync localStorage wishlist to Supabase (called after login)
   */
  async syncLocalToSupabase(userId) {
    const localWishlist = this.getLocalWishlist()
    
    if (localWishlist.length === 0) return

    try {
      // Insert all local wishlist items into Supabase
      const wishlistItems = localWishlist.map(item => ({
        user_id: userId,
        product_id: item.productId
      }))

      const { error } = await supabase
        .from('wishlist')
        .upsert(wishlistItems, {
          onConflict: 'user_id,product_id'
        })

      if (error) {
        throw new Error(`Failed to sync local wishlist to Supabase: ${error.message}`)
      }

      // Clear localStorage after successful sync
      this.clearLocalWishlist()
    } catch (error) {
      console.error('Error syncing local wishlist to Supabase:', error)
      throw error
    }
  }

  /**
   * Get wishlist item count
   */
  async getItemCount() {
    const items = await this.getItems()
    return items.length
  }

  /**
   * Check if product is in wishlist
   */
  async isProductInWishlist(productId) {
    const items = await this.getItems()
    return items.some(item => item.productId === productId)
  }

  /**
   * Toggle wishlist item (add if not present, remove if present)
   */
  async toggleItem(productId) {
    const isInWishlist = await this.isProductInWishlist(productId)
    
    if (isInWishlist) {
      await this.removeItem(productId)
      return false
    } else {
      await this.addItem(productId)
      return true
    }
  }
}

// Export singleton instance
export const wishlistService = new WishlistService()
export default wishlistService
