import { supabase } from '../src/lib/supabase.js'

class CartService {
  constructor() {
    this.CART_STORAGE_KEY = 'cart'
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      console.log('CartService.isAuthenticated - Checking authentication...')
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('CartService.isAuthenticated - Auth error:', error)
        return false
      }
      
      console.log('CartService.isAuthenticated - User data:', user)
      const isAuth = !!user
      console.log('CartService.isAuthenticated - Result:', isAuth)
      return isAuth
    } catch (error) {
      console.error('CartService.isAuthenticated - Exception:', error)
      return false
    }
  }

  /**
   * Get current user ID
   */
  async getCurrentUserId() {
    try {
      console.log('CartService.getCurrentUserId - Getting user ID...')
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('CartService.getCurrentUserId - Auth error:', error)
        return null
      }
      
      const userId = user?.id || null
      console.log('CartService.getCurrentUserId - User ID:', userId)
      return userId
    } catch (error) {
      console.error('CartService.getCurrentUserId - Exception:', error)
      return null
    }
  }

  /**
   * Get cart items from localStorage
   */
  getLocalCart() {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY)
      return cartData ? JSON.parse(cartData) : []
    } catch (error) {
      console.error('Error reading local cart:', error)
      return []
    }
  }

  /**
   * Save cart items to localStorage
   */
  saveLocalCart(cart) {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving local cart:', error)
    }
  }

  /**
   * Clear localStorage cart
   */
  clearLocalCart() {
    try {
      localStorage.removeItem(this.CART_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing local cart:', error)
    }
  }

  /**
   * Add or update cart item in Supabase
   * RLS automatically scopes to current user
   */
  async addToSupabaseCart(productId, quantity) {
    console.log('CartService.addToSupabaseCart called with:', { productId, quantity })
    
    try {
      // Get current user ID for logging purposes
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      console.log('Adding cart item for user:', user.id)
      
      // Profile creation is handled automatically by Supabase Auth triggers
      // No need to manually check/create profiles

      // Now add/update the cart item using the exact SQL format specified
      console.log('Adding/updating cart item in Supabase...')
      console.log('Inserting cart item with product_id:', productId, 'quantity:', quantity)
      
      // Use raw SQL query as specified:
      // insert into cart (user_id, product_id, quantity, created_at)
      // values ('<user_id>', '<product_id>', <quantity>, now())
      // on conflict (user_id, product_id) do update set quantity = excluded.quantity;
      // Note: user_id is automatically set by RLS to auth.uid()
      
      let data, error
      
      try {
        console.log('Attempting to use RPC function add_to_cart...')
        const result = await supabase
          .rpc('add_to_cart', {
            p_product_id: productId,
            p_quantity: quantity
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
          product_id: productId,
          quantity,
          created_at: new Date().toISOString()
        })
        
        const result = await supabase
          .from('cart')
          .upsert(
            {
              product_id: productId,
              quantity,
              created_at: new Date().toISOString()
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
        console.error('Supabase cart insert error:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw new Error(`Failed to add item to Supabase cart: ${error.message}`)
      }
      
      console.log('Cart item added/updated successfully:', data)
    } catch (error) {
      console.error('Error in addToSupabaseCart:', error)
      throw error
    }
  }

  /**
   * Remove cart item from Supabase
   * RLS automatically scopes to current user
   */
  async removeFromSupabaseCart(productId) {
    console.log('Removing cart item with product_id:', productId)
    
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('product_id', productId)

      if (error) {
        console.error('Supabase cart delete error:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw new Error(`Failed to remove item from Supabase cart: ${error.message}`)
      }
      
      console.log('Cart item removed successfully')
    } catch (error) {
      console.error('Error in removeFromSupabaseCart:', error)
      throw error
    }
  }

  /**
   * Get cart items from Supabase with product details
   * RLS automatically filters by current user
   */
  async getSupabaseCart() {
    console.log('Fetching cart for current user (RLS auto-filtered)')
    
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          product_id,
          quantity,
          products(id, name, price, image_urls, seller_id)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase cart query error:', error)
        throw new Error(`Failed to fetch Supabase cart: ${error.message}`)
      }

      console.log('Raw cart data from Supabase:', data)

      const mappedData = (data || []).map(item => {
        const mappedItem = {
          id: item.product_id,
          productId: item.product_id,
          quantity: item.quantity,
          name: item.products?.name || 'Unknown Product',
          price: item.products?.price || 0,
          image: item.products?.image_urls?.[0] || '',
          seller_id: item.products?.seller_id
        }
        console.log('Mapped cart item:', mappedItem)
        return mappedItem
      })

      console.log('Final mapped cart data:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Error in getSupabaseCart:', error)
      throw error
    }
  }

  /**
   * Add item to cart (works for both authenticated and guest users)
   */
  async addItem(productId, quantity = 1) {
    console.log('=== CartService.addItem START ===')
    console.log('CartService.addItem called with:', { productId, quantity })
    
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
        
        console.log('Adding to Supabase cart...')
        await this.addToSupabaseCart(productId, quantity)
        console.log('Successfully added to Supabase cart')
      } else {
        // User is not signed in - add to localStorage
        console.log('User is not authenticated, using localStorage...')
        const localCart = this.getLocalCart()
        const existingItem = localCart.find(item => item.productId === productId)
        
        if (existingItem) {
          existingItem.quantity += quantity
          console.log('Updated existing item quantity:', existingItem.quantity)
        } else {
          localCart.push({ productId, quantity })
          console.log('Added new item to local cart')
        }
        
        this.saveLocalCart(localCart)
        console.log('Successfully added to localStorage cart')
      }
      
      console.log('=== CartService.addItem SUCCESS ===')
    } catch (error) {
      console.error('=== CartService.addItem ERROR ===')
      console.error('Error in addItem:', error)
      throw error
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(productId) {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - remove from Supabase
      // RLS automatically scopes to current user
      await this.removeFromSupabaseCart(productId)
    } else {
      // User is not signed in - remove from localStorage
      const localCart = this.getLocalCart()
      const filteredCart = localCart.filter(item => item.productId !== productId)
      this.saveLocalCart(filteredCart)
    }
  }

  /**
   * Update item quantity in cart
   */
  async updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      await this.removeItem(productId)
      return
    }

    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - update in Supabase
      // RLS automatically scopes to current user
      await this.addToSupabaseCart(productId, quantity)
    } else {
      // User is not signed in - update in localStorage
      const localCart = this.getLocalCart()
      const item = localCart.find(item => item.productId === productId)
      
      if (item) {
        item.quantity = quantity
        this.saveLocalCart(localCart)
      }
    }
  }

  /**
   * Get all cart items with product details
   */
  async getItems() {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - get from Supabase
      // RLS automatically scopes to current user
      return await this.getSupabaseCart()
    } else {
      // User is not signed in - get from localStorage
      const localCart = this.getLocalCart()
      
      if (localCart.length === 0) return []
      
      // Fetch product details for local cart items
      const productIds = localCart.map(item => item.productId)
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price, image_urls, seller_id')
        .in('id', productIds)

      if (error || !products) {
        console.error('Error fetching products for local cart:', error)
        return []
      }

      return localCart.map(item => {
        const product = products.find(p => p.id === item.productId)
        return {
          id: item.productId,
          productId: item.productId,
          quantity: item.quantity,
          name: product?.name || 'Unknown Product',
          price: product?.price || 0,
          image: product?.image_urls?.[0] || '',
          seller_id: product?.seller_id
        }
      })
    }
  }

  /**
   * Clear all cart items
   */
  async clearCart() {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - clear from Supabase
      // RLS automatically scopes to current user
      const { error } = await supabase
        .from('cart')
        .delete()

      if (error) {
        throw new Error(`Failed to clear Supabase cart: ${error.message}`)
      }
    } else {
      // User is not signed in - clear from localStorage
      this.clearLocalCart()
    }
  }

  /**
   * Sync localStorage cart to Supabase (called after login)
   * RLS automatically scopes to current user
   */
  async syncLocalToSupabase() {
    const localCart = this.getLocalCart()
    
    if (localCart.length === 0) return

    try {
      // Insert all local cart items into Supabase
      // RLS automatically sets user_id to auth.uid()
      const cartItems = localCart.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        created_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('cart')
        .upsert(cartItems, {
          onConflict: 'user_id,product_id'
        })

      if (error) {
        throw new Error(`Failed to sync local cart to Supabase: ${error.message}`)
      }

      // Clear localStorage after successful sync
      this.clearLocalCart()
    } catch (error) {
      console.error('Error syncing local cart to Supabase:', error)
      throw error
    }
  }

  /**
   * Get cart item count
   */
  async getItemCount() {
    const items = await this.getItems()
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  /**
   * Check if product is in cart
   */
  async isProductInCart(productId) {
    const items = await this.getItems()
    return items.some(item => item.productId === productId)
  }

  /**
   * Get cart total price
   */
  async getTotalPrice() {
    const items = await this.getItems()
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
}

// Export singleton instance
export const cartService = new CartService()
export default cartService
