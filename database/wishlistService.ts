import { supabase } from '../src/lib/supabase'

export interface WishlistItem {
  productId: string
}

export interface WishlistItemWithProduct extends WishlistItem {
  id: string
  name: string
  nameAr?: string
  price: number
  image: string
  seller_id?: string
  created_at: string
}

export interface LocalWishlistItem {
  productId: string
}

class WishlistService {
  private readonly WISHLIST_STORAGE_KEY = 'wishlist'

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
   * Get wishlist items from localStorage
   */
  private getLocalWishlist(): LocalWishlistItem[] {
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
  private saveLocalWishlist(wishlist: LocalWishlistItem[]): void {
    try {
      localStorage.setItem(this.WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
    } catch (error) {
      console.error('Error saving local wishlist:', error)
    }
  }

  /**
   * Clear localStorage wishlist
   */
  private clearLocalWishlist(): void {
    try {
      localStorage.removeItem(this.WISHLIST_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing local wishlist:', error)
    }
  }

  /**
   * Add item to wishlist in Supabase
   */
  private async addToSupabaseWishlist(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
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

    if (error) {
      throw new Error(`Failed to add item to Supabase wishlist: ${error.message}`)
    }
  }

  /**
   * Remove item from wishlist in Supabase
   */
  private async removeFromSupabaseWishlist(userId: string, productId: string): Promise<void> {
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
  private async getSupabaseWishlist(userId: string): Promise<WishlistItemWithProduct[]> {
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
  async addItem(productId: string): Promise<void> {
    const isAuth = await this.isAuthenticated()

    if (isAuth) {
      // User is signed in - add to Supabase
      const userId = await this.getCurrentUserId()
      if (!userId) throw new Error('User ID not found')
      
      await this.addToSupabaseWishlist(userId, productId)
    } else {
      // User is not signed in - add to localStorage
      const localWishlist = this.getLocalWishlist()
      
      // Check if item already exists
      if (!localWishlist.some(item => item.productId === productId)) {
        localWishlist.push({ productId })
        this.saveLocalWishlist(localWishlist)
      }
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeItem(productId: string): Promise<void> {
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
  async getItems(): Promise<WishlistItemWithProduct[]> {
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
  async clearWishlist(): Promise<void> {
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
  async syncLocalToSupabase(userId: string): Promise<void> {
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
  async getItemCount(): Promise<number> {
    const items = await this.getItems()
    return items.length
  }

  /**
   * Check if product is in wishlist
   */
  async isProductInWishlist(productId: string): Promise<boolean> {
    const items = await this.getItems()
    return items.some(item => item.productId === productId)
  }

  /**
   * Toggle wishlist item (add if not present, remove if present)
   */
  async toggleItem(productId: string): Promise<boolean> {
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
