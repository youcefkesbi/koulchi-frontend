import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase } from '../lib/supabase.js'
import { useAuthStore } from './useAuthStore.js'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])
  const cartId = ref(null)
  const isGuest = ref(true)
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  // Constants
  const LOCAL_CART_KEY = 'koulchi_guest_cart'

  // Getters
  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )
  
  const subtotal = computed(() => 
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  )
  
  const deliveryFee = computed(() => {
    // Algerian delivery fees based on wilaya (province)
    const baseFee = 500 // 500 DZD base delivery fee
    return baseFee
  })
  
  const total = computed(() => subtotal.value + deliveryFee.value)
  
  const hasItems = computed(() => items.value.length > 0)
  
  const isProductInCart = computed(() => {
    return (productId) => items.value.some(item => item.product_id === productId)
  })

  // Get auth store
  const authStore = useAuthStore()

  /**
   * Validates active Supabase session and ensures user is authenticated
   * @returns {Promise<Object>} Authenticated user object
   * @throws {Error} If session is invalid, expired, or user not authenticated
   */
  const validateActiveSession = async () => {
    console.log('🔐 Validating active session for cart operation...')
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      throw new Error('Authentication session error. Please log in again.')
    }

    if (!session || !session.user) {
      console.warn('⚠️ No active session found')
      throw new Error('Please log in to manage cart')
    }

    // Verify session is not expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      console.warn('⏰ Session expired, attempting to refresh...')
      
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError || !refreshData.session) {
        console.error('❌ Session refresh failed:', refreshError)
        throw new Error('Your session has expired. Please log in again.')
      }
      
      console.log('✅ Session refreshed successfully')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ User validation error:', userError)
      throw new Error(userError.message)
    }

    if (!user) {
      console.warn('⚠️ No user found in session')
      throw new Error('Please log in to manage cart')
    }

    console.log('✅ Session validated for user:', user.id)
    return user
  }

  /**
   * Loads cart from localStorage for guest users
   * @returns {Array} Array of cart items
   */
  const loadLocalCart = () => {
    try {
      const stored = localStorage.getItem(LOCAL_CART_KEY)
      if (stored) {
        const localCart = JSON.parse(stored)
        console.log('📦 Loaded local cart:', localCart.length, 'items')
        return localCart
      }
    } catch (err) {
      console.error('❌ Error loading local cart:', err)
    }
    return []
  }

  /**
   * Saves cart to localStorage for guest users
   * @param {Array} cartItems - Array of cart items to save
   */
  const saveLocalCart = (cartItems) => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartItems))
      console.log('💾 Saved local cart:', cartItems.length, 'items')
    } catch (err) {
      console.error('❌ Error saving local cart:', err)
    }
  }

  /**
   * Clears localStorage cart
   */
  const clearLocalCart = () => {
    try {
      localStorage.removeItem(LOCAL_CART_KEY)
      console.log('🗑️ Cleared local cart')
    } catch (err) {
      console.error('❌ Error clearing local cart:', err)
    }
  }

  /**
   * Fetches cart items from Supabase for authenticated users
   * @returns {Promise<void>}
   */
  const fetchSupabaseCart = async () => {
    try {
      console.log('🛒 Fetching cart from Supabase...')
      
      const user = await validateActiveSession()

      // Get the user's cart ID
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('id, created_at, updated_at')
        .eq('user_id', user.id)
        .single()

      if (cartError && cartError.code !== 'PGRST116') {
        console.error('❌ Cart lookup error:', cartError)
        throw new Error(cartError.message)
      }

      if (!cartData) {
        console.log('ℹ️ No cart found for user, returning empty items')
        items.value = []
        cartId.value = null
        return
      }

      console.log('✅ Found cart:', cartData.id)
      cartId.value = cartData.id

      // Fetch cart items with product details
      const { data, error: fetchError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product_id,
          updated_at,
          products (
            id,
            name,
            price,
            image_urls,
            seller_id
          )
        `)
        .eq('cart_id', cartData.id)
        .order('updated_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Cart items fetch error:', fetchError)
        throw new Error(fetchError.message)
      }

      console.log('✅ Fetched cart items:', data?.length || 0)

      // Map the data to match the expected format
      items.value = (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        name: item.products?.name || 'Unknown Product',
        price: item.products?.price || 0,
        image: item.products?.image_urls?.[0] || '',
        seller_id: item.products?.seller_id,
        updated_at: item.updated_at
      }))

      lastUpdated.value = new Date().toISOString()
      console.log('✅ Cart items loaded successfully')

    } catch (err) {
      error.value = err.message
      console.error('❌ Error fetching Supabase cart:', err)
      items.value = []
      cartId.value = null
    }
  }

  /**
   * Fetches cart items from localStorage for guest users
   * @returns {Promise<void>}
   */
  const fetchLocalCart = async () => {
    try {
      console.log('🛒 Fetching local cart...')
      
      const localCart = loadLocalCart()
      
      if (localCart.length === 0) {
        items.value = []
        return
      }

      // Fetch product details for local cart items
      const productIds = localCart.map(item => item.product_id)
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, name, price, image_urls, seller_id')
        .in('id', productIds)

      if (productError) {
        console.error('❌ Error fetching products for local cart:', productError)
        items.value = []
        return
      }

      // Map local cart items with product details
      items.value = localCart.map(item => {
        const product = products.find(p => p.id === item.product_id)
        return {
          id: item.id || `local_${item.product_id}`,
          product_id: item.product_id,
          quantity: item.quantity,
          name: product?.name || 'Unknown Product',
          price: product?.price || 0,
          image: product?.image_urls?.[0] || '',
          seller_id: product?.seller_id,
          updated_at: item.updated_at || new Date().toISOString()
        }
      })

      lastUpdated.value = new Date().toISOString()
      console.log('✅ Local cart loaded successfully')

    } catch (err) {
      error.value = err.message
      console.error('❌ Error fetching local cart:', err)
      items.value = []
    }
  }

  /**
   * Main fetch cart method - determines whether to use Supabase or localStorage
   * @returns {Promise<void>}
   */
  const fetchCart = async () => {
    try {
      loading.value = true
      error.value = null

      if (authStore.isAuthenticated) {
        isGuest.value = false
        await fetchSupabaseCart()
      } else {
        isGuest.value = true
        await fetchLocalCart()
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ Error fetching cart:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Adds a product to the cart using Supabase RPC function
   * @param {string} productId - UUID of the product to add
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Promise<void>}
   */
  const addToSupabaseCart = async (productId, quantity = 1) => {
    try {
      console.log('➕ Adding to Supabase cart:', { productId, quantity })
      
      const user = await validateActiveSession()

      if (!productId) {
        throw new Error('Product ID is required')
      }

      if (!quantity || quantity < 1) {
        throw new Error('Quantity must be at least 1')
      }

      // Call the Supabase RPC function
      const { data, error: rpcError } = await supabase.rpc('add_to_cart', {
        p_product_id: productId,
        p_quantity: quantity
      })

      if (rpcError) {
        console.error('❌ RPC Error:', rpcError)
        
        if (rpcError.message?.includes('permission denied') || rpcError.message?.includes('RLS')) {
          throw new Error('You do not have permission to modify this cart. Please log in again.')
        }
        if (rpcError.message?.includes('not authenticated')) {
          throw new Error('Please log in to add items to cart')
        }
        if (rpcError.message?.includes('foreign key')) {
          throw new Error('Product not found. Please try again.')
        }
        throw new Error(rpcError.message)
      }

      console.log('✅ Item added to Supabase cart successfully')
      await fetchCart() // Refresh cart after successful addition

    } catch (err) {
      error.value = err.message
      console.error('❌ Error adding to Supabase cart:', err)
      throw err
    }
  }

  /**
   * Adds a product to the local cart
   * @param {string} productId - UUID of the product to add
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Promise<void>}
   */
  const addToLocalCart = async (productId, quantity = 1) => {
    try {
      console.log('➕ Adding to local cart:', { productId, quantity })
      
      const localCart = loadLocalCart()
      const existingItem = localCart.find(item => item.product_id === productId)
      
      if (existingItem) {
        existingItem.quantity += quantity
        console.log('📈 Updated existing item quantity:', existingItem.quantity)
      } else {
        localCart.push({
          id: `local_${productId}_${Date.now()}`,
          product_id: productId,
          quantity,
          updated_at: new Date().toISOString()
        })
        console.log('➕ Added new item to local cart')
      }
      
      saveLocalCart(localCart)
      await fetchCart() // Refresh cart to get product details

    } catch (err) {
      error.value = err.message
      console.error('❌ Error adding to local cart:', err)
      throw err
    }
  }

  /**
   * Main add to cart method - determines whether to use Supabase or localStorage
   * @param {string} productId - UUID of the product to add
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Promise<void>}
   */
  const addToCart = async (productId, quantity = 1) => {
    try {
      loading.value = true
      error.value = null

      if (authStore.isAuthenticated) {
        await addToSupabaseCart(productId, quantity)
      } else {
        await addToLocalCart(productId, quantity)
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ Error adding to cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Removes a product from Supabase cart using RPC function
   * @param {string} productId - UUID of the product to remove
   * @returns {Promise<void>}
   */
  const removeFromSupabaseCart = async (productId) => {
    try {
      console.log('➖ Removing from Supabase cart:', { productId })
      
      const user = await validateActiveSession()

      if (!productId) {
        throw new Error('Product ID is required')
      }

      // Call the Supabase RPC function
      const { data, error: rpcError } = await supabase.rpc('decrease_or_remove_row', {
        p_product_id: productId,
        p_quantity: 1
      })

      if (rpcError) {
        console.error('❌ RPC Error:', rpcError)
        
        if (rpcError.message?.includes('permission denied') || rpcError.message?.includes('RLS')) {
          throw new Error('You do not have permission to modify this cart. Please log in again.')
        }
        if (rpcError.message?.includes('not authenticated')) {
          throw new Error('Please log in to manage cart')
        }
        throw new Error(rpcError.message)
      }

      console.log('✅ Item removed from Supabase cart successfully')
      await fetchCart() // Refresh cart after successful removal

    } catch (err) {
      error.value = err.message
      console.error('❌ Error removing from Supabase cart:', err)
      throw err
    }
  }

  /**
   * Removes a product from local cart
   * @param {string} productId - UUID of the product to remove
   * @returns {Promise<void>}
   */
  const removeFromLocalCart = async (productId) => {
    try {
      console.log('➖ Removing from local cart:', { productId })
      
      const localCart = loadLocalCart()
      const filteredCart = localCart.filter(item => item.product_id !== productId)
      saveLocalCart(filteredCart)
      await fetchCart() // Refresh cart

    } catch (err) {
      error.value = err.message
      console.error('❌ Error removing from local cart:', err)
      throw err
    }
  }

  /**
   * Main remove from cart method - determines whether to use Supabase or localStorage
   * @param {string} productId - UUID of the product to remove
   * @returns {Promise<void>}
   */
  const removeFromCart = async (productId) => {
    try {
      loading.value = true
      error.value = null

      if (authStore.isAuthenticated) {
        await removeFromSupabaseCart(productId)
      } else {
        await removeFromLocalCart(productId)
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ Error removing from cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Updates quantity in Supabase cart
   * @param {string} productId - UUID of the product to update
   * @param {number} quantity - New quantity (0 removes the item)
   * @returns {Promise<void>}
   */
  const updateSupabaseQuantity = async (productId, quantity) => {
    try {
      console.log('🔄 Updating Supabase cart quantity:', { productId, quantity })
      
      if (quantity <= 0) {
        await removeFromSupabaseCart(productId)
        return
      }

      const user = await validateActiveSession()

      if (!productId) {
        throw new Error('Product ID is required')
      }

      // Find the current item to get its current quantity
      const currentItem = items.value.find(item => item.product_id === productId)
      if (!currentItem) {
        throw new Error('Product not found in cart')
      }

      const quantityDifference = quantity - currentItem.quantity

      if (quantityDifference > 0) {
        // Add the difference
        await addToSupabaseCart(productId, quantityDifference)
      } else if (quantityDifference < 0) {
        // Remove the difference
        const { data, error: rpcError } = await supabase.rpc('decrease_or_remove_row', {
          p_product_id: productId,
          p_quantity: Math.abs(quantityDifference)
        })

        if (rpcError) {
          console.error('❌ RPC Error:', rpcError)
          
          if (rpcError.message?.includes('permission denied') || rpcError.message?.includes('RLS')) {
            throw new Error('You do not have permission to modify this cart. Please log in again.')
          }
          if (rpcError.message?.includes('not authenticated')) {
            throw new Error('Please log in to manage cart')
          }
          throw new Error(rpcError.message)
        }

        await fetchCart() // Refresh cart
      }

    } catch (err) {
      error.value = err.message
      console.error('❌ Error updating Supabase cart quantity:', err)
      throw err
    }
  }

  /**
   * Updates quantity in local cart
   * @param {string} productId - UUID of the product to update
   * @param {number} quantity - New quantity (0 removes the item)
   * @returns {Promise<void>}
   */
  const updateLocalQuantity = async (productId, quantity) => {
    try {
      console.log('🔄 Updating local cart quantity:', { productId, quantity })
      
      if (quantity <= 0) {
        await removeFromLocalCart(productId)
        return
      }

      const localCart = loadLocalCart()
      const item = localCart.find(item => item.product_id === productId)
      
      if (item) {
        item.quantity = quantity
        item.updated_at = new Date().toISOString()
        saveLocalCart(localCart)
        await fetchCart() // Refresh cart
      }

    } catch (err) {
      error.value = err.message
      console.error('❌ Error updating local cart quantity:', err)
      throw err
    }
  }

  /**
   * Main update quantity method - determines whether to use Supabase or localStorage
   * @param {string} productId - UUID of the product to update
   * @param {number} quantity - New quantity (0 removes the item)
   * @returns {Promise<void>}
   */
  const updateQuantity = async (productId, quantity) => {
    try {
      loading.value = true
      error.value = null

      if (authStore.isAuthenticated) {
        await updateSupabaseQuantity(productId, quantity)
      } else {
        await updateLocalQuantity(productId, quantity)
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ Error updating quantity:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clears Supabase cart using RPC function
   * @returns {Promise<void>}
   */
  const clearSupabaseCart = async () => {
    try {
      console.log('🗑️ Clearing Supabase cart...')
      
      const user = await validateActiveSession()

      const { data, error: rpcError } = await supabase.rpc('clear_user_cart')

      if (rpcError) {
        console.error('❌ RPC Error:', rpcError)
        
        if (rpcError.message?.includes('permission denied') || rpcError.message?.includes('RLS')) {
          throw new Error('You do not have permission to modify this cart. Please log in again.')
        }
        if (rpcError.message?.includes('not authenticated')) {
          throw new Error('Please log in to manage cart')
        }
        throw new Error(rpcError.message)
      }

      console.log('✅ Supabase cart cleared successfully')
      items.value = []
      cartId.value = null
      lastUpdated.value = new Date().toISOString()

    } catch (err) {
      error.value = err.message
      console.error('❌ Error clearing Supabase cart:', err)
      throw err
    }
  }

  /**
   * Clears local cart
   * @returns {Promise<void>}
   */
  const clearLocalCartData = async () => {
    try {
      console.log('🗑️ Clearing local cart...')
      
      clearLocalCart()
      items.value = []
      lastUpdated.value = new Date().toISOString()

    } catch (err) {
      error.value = err.message
      console.error('❌ Error clearing local cart:', err)
      throw err
    }
  }

  /**
   * Main clear cart method - determines whether to use Supabase or localStorage
   * @returns {Promise<void>}
   */
  const clearCart = async () => {
    try {
      loading.value = true
      error.value = null

      if (authStore.isAuthenticated) {
        await clearSupabaseCart()
      } else {
        await clearLocalCartData()
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ Error clearing cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Syncs local cart to Supabase when user logs in
   * @returns {Promise<void>}
   */
  const syncLocalCart = async () => {
    try {
      console.log('🔄 Syncing local cart to Supabase...')
      
      const localCart = loadLocalCart()
      
      if (localCart.length === 0) {
        console.log('ℹ️ No local cart items to sync')
        return
      }

      loading.value = true
      error.value = null

      // Add each local cart item to Supabase using the RPC function
      for (const item of localCart) {
        try {
          await addToSupabaseCart(item.product_id, item.quantity)
          console.log(`✅ Synced item: ${item.product_id} (qty: ${item.quantity})`)
        } catch (itemError) {
          console.error(`❌ Failed to sync item ${item.product_id}:`, itemError)
          // Continue with other items even if one fails
        }
      }

      // Clear local cart after successful sync
      clearLocalCart()
      console.log('✅ Local cart synced successfully')

    } catch (err) {
      error.value = err.message
      console.error('❌ Error syncing local cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clears error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Get cart statistics
   */
  const getCartStats = () => {
    return {
      totalItems: totalItems.value,
      subtotal: subtotal.value,
      deliveryFee: deliveryFee.value,
      total: total.value,
      itemCount: items.value.length,
      lastUpdated: lastUpdated.value,
      isGuest: isGuest.value,
      cartId: cartId.value
    }
  }

  // Watch for authentication state changes
  watch(() => authStore.isAuthenticated, async (isAuthenticated, wasAuthenticated) => {
    console.log('🔄 Auth state changed:', { isAuthenticated, wasAuthenticated })
    
    if (isAuthenticated && !wasAuthenticated) {
      // User just logged in - sync local cart and fetch Supabase cart
      console.log('👤 User logged in, syncing local cart...')
      try {
        await syncLocalCart()
        await fetchCart()
      } catch (err) {
        console.error('❌ Error during login sync:', err)
      }
    } else if (!isAuthenticated && wasAuthenticated) {
      // User just logged out - clear cart and fetch local cart
      console.log('👤 User logged out, switching to local cart...')
      try {
        items.value = []
        cartId.value = null
        isGuest.value = true
        await fetchCart()
      } catch (err) {
        console.error('❌ Error during logout:', err)
      }
    }
  })

  return {
    // State
    items,
    cartId,
    isGuest,
    loading,
    error,
    lastUpdated,
    
    // Getters
    totalItems,
    subtotal,
    deliveryFee,
    total,
    hasItems,
    isProductInCart,
    
    // Actions
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncLocalCart,
    clearError,
    getCartStats
  }
})