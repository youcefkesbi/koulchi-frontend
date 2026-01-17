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
   * RLS automatically scopes to current user
   */
  async addToSupabaseWishlist(productId) {
    console.log('WishlistService.addToSupabaseWishlist called with:', { productId })
    
    try {
      // Get current user ID for logging purposes
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      console.log('Adding wishlist item for user:', user.id)
      
      // Profile creation is handled automatically by Supabase Auth triggers
      // No need to manually check/create profiles

      // Now add the wishlist item using the exact SQL format specified
      console.log('Adding wishlist item to Supabase...')
      console.log('Inserting wishlist item with product_id:', productId)
      
      // Use raw SQL query as specified:
      // insert into wishlist (user_id, product_id)
      // values ('<user_id>', '<product_id>')
      // on conflict (user_id, product_id) do nothing;
      // Note: user_id is automatically set by RLS to auth.uid()
      
      let data, error
      
      try {
        console.log('Attempting to use RPC function add_to_wishlist...')
        const result = await supabase
          .rpc('add_to_wishlist', {
            p_product_id: productId
          })
        
        data = result.data
        error = result.error
        
        if (error) {
          console.log('RPC function failed, error:', error)
        } else {
          console.log('RPC function succeeded, data:', data)
        }
      } catch (rpcError) {
        console.log('RPC function not found or failed, falling back to upsert...', rpcError)
        
        console.log('Using upsert fallback with data:', {
          product_id: productId
        })
        
        const result = await supabase
          .from('wishlist')
          .upsert(
            {
              product_id: productId
            },
            {
              onConflict: 'user_id,product_id'
            }
          )
        
        data = result.data
        error = result.error
        
        console.log('Upsert result:', { data, error })
      }

      if (error) {
        console.error('Supabase wishlist insert error:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
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
  async removeFromSupabaseWishlist(productId) {
    console.log('Removing wishlist item with product_id:', productId)
    
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('product_id', productId)

      if (error) {
        console.error('Supabase wishlist delete error:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw new Error(`Failed to remove item from Supabase wishlist: ${error.message}`)
      }
      
      console.log('Wishlist item removed successfully')
    } catch (error) {
      console.error('Error in removeFromSupabaseWishlist:', error)
      throw error
    }
  }

  /**
   * Get wishlist items from Supabase with product details
   * RLS automatically filters by current user
   */
  async getSupabaseWishlist() {
    console.log('Fetching wishlist for current user (RLS auto-filtered)')
    
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id, 
          created_at, 
          products(id, name, price, image_urls, seller_id)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase wishlist query error:', error)
        throw new Error(`Failed to fetch Supabase wishlist: ${error.message}`)
      }

      console.log('Raw wishlist data from Supabase:', data)

      const mappedData = (data || []).map(item => {
        const mappedItem = {
          id: item.id, // Wishlist entry ID
          wishlistId: item.id, // Also store as wishlistId for clarity
          productId: item.product_id,
          name: item.products?.name || 'Unknown Product',
          price: item.products?.price || 0,
          image: item.products?.image_urls?.[0] || '',
          seller_id: item.products?.seller_id,
          created_at: item.created_at
        }
        console.log('Mapped wishlist item:', mappedItem)
        return mappedItem
      })

      console.log('Final mapped wishlist data:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Error in getSupabaseWishlist:', error)
      throw error
    }
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
        await this.addToSupabaseWishlist(productId)
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
      // RLS automatically scopes to current user
      await this.removeFromSupabaseWishlist(productId)
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
      // RLS automatically scopes to current user
      return await this.getSupabaseWishlist()
    } else {
      // User is not signed in - get from localStorage
      const localWishlist = this.getLocalWishlist()
      
      if (localWishlist.length === 0) return []
      
      // Fetch product details for local wishlist items
      const productIds = localWishlist.map(item => item.productId)
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price, image_urls, seller_id')
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
      // RLS automatically scopes to current user
      const { error } = await supabase
        .from('wishlist')
        .delete()

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
   * RLS automatically scopes to current user
   */
  async syncLocalToSupabase() {
    const localWishlist = this.getLocalWishlist()
    
    if (localWishlist.length === 0) return

    try {
      // Insert all local wishlist items into Supabase
      // RLS automatically sets user_id to auth.uid()
      const wishlistItems = localWishlist.map(item => ({
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
