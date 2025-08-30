import { supabase } from '../src/lib/supabase'

export interface CartItem {
  productId: string
  quantity: number
}

export interface CartItemWithProduct extends CartItem {
  id: string
  name: string
  nameAr?: string
  price: number
  image: string
  seller_id?: string
}

export interface LocalCartItem {
  productId: string
  quantity: number
}

class CartService {
  private readonly CART_STORAGE_KEY = 'cart'

  /**
   * Check if user is authenticated
   */
  private async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  }

  /**
   * Get current user ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  /**
   * Get cart items from localStorage
   */
  private getLocalCart(): LocalCartItem[] {
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
  private saveLocalCart(cart: LocalCartItem[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving local cart:', error)
    }
  }

  /**
   * Clear localStorage cart
   */
  private clearLocalCart(): void {
    try {
      localStorage.removeItem(this.CART_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing local cart:', error)
    }
  }

  /**
   * Add or update cart item in Supabase
   */
  private async addToSupabaseCart(userId: string, productId: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('cart')
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          quantity,
          created_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id,product_id'
        }
      )

    if (error) {
      throw new Error(`Failed to add item to Supabase cart: ${error.message}`)
    }
  }

  /**
   * Remove cart item from Supabase
   */
  private async removeFromSupabaseCart(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) {
      throw new Error(`Failed to remove item from Supabase cart: ${error.message}`)
    }
  }

  /**
   * Get cart items from Supabase with product details
   */
  private async getSupabaseCart(userId: string): Promise<CartItemWithProduct[]> {
    const { data, error } = await supabase
      .from('cart')
      .select(`
        product_id,
        quantity,
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

    if (error) {
      throw new Error(`Failed to fetch Supabase cart: ${error.message}`)
    }

    return (data || []).map(item => ({
      id: item.product_id,
      productId: item.product_id,
      quantity: item.quantity,
      name: item.products?.name || 'Unknown Product',
      nameAr: item.products?.name_ar,
      price: item.products?.price || 0,
      image: item.products?.image_urls?.[0] || '',
      seller_id: item.products?.seller_id
    }))
  }

  /**
   * Add item to cart (works for both authenticated and guest users)
   */
  async addItem(productId: string, quantity: number = 1): Promise<void> {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - add to Supabase
      const userId = await this.getCurrentUserId()
      if (!userId) throw new Error('User ID not found')
      
      await this.addToSupabaseCart(userId, productId, quantity)
    } else {
      // User is not signed in - add to localStorage
      const localCart = this.getLocalCart()
      const existingItem = localCart.find(item => item.productId === productId)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        localCart.push({ productId, quantity })
      }
      
      this.saveLocalCart(localCart)
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(productId: string): Promise<void> {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - remove from Supabase
      const userId = await this.getCurrentUserId()
      if (!userId) throw new Error('User ID not found')
      
      await this.removeFromSupabaseCart(userId, productId)
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
  async updateQuantity(productId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.removeItem(productId)
      return
    }

    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - update in Supabase
      const userId = await this.getCurrentUserId()
      if (!userId) throw new Error('User ID not found')
      
      await this.addToSupabaseCart(userId, productId, quantity)
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
  async getItems(): Promise<CartItemWithProduct[]> {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - get from Supabase
      const userId = await this.getCurrentUserId()
      if (!userId) return []
      
      return await this.getSupabaseCart(userId)
    } else {
      // User is not signed in - get from localStorage
      const localCart = this.getLocalCart()
      
      if (localCart.length === 0) return []
      
      // Fetch product details for local cart items
      const productIds = localCart.map(item => item.productId)
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, name_ar, price, image_urls, seller_id')
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
          nameAr: product?.name_ar,
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
  async clearCart(): Promise<void> {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - clear from Supabase
      const userId = await this.getCurrentUserId()
      if (!userId) return
      
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId)

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
   */
  async syncLocalToSupabase(userId: string): Promise<void> {
    const localCart = this.getLocalCart()
    
    if (localCart.length === 0) return

    try {
      // Insert all local cart items into Supabase
      const cartItems = localCart.map(item => ({
        user_id: userId,
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
  async getItemCount(): Promise<number> {
    const items = await this.getItems()
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  /**
   * Check if product is in cart
   */
  async isProductInCart(productId: string): Promise<boolean> {
    const items = await this.getItems()
    return items.some(item => item.productId === productId)
  }

  /**
   * Get cart total price
   */
  async getTotalPrice(): Promise<number> {
    const items = await this.getItems()
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
}

// Export singleton instance
export const cartService = new CartService()
export default cartService
