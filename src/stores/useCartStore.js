import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  // Getters
  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )
  
  const subtotal = computed(() => 
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  )
  
  const deliveryFee = ref(0) // Delivery fee from Maystro API
  
  const total = computed(() => subtotal.value + deliveryFee.value)
  
  // Method to set delivery fee
  const setDeliveryFee = (fee) => {
    deliveryFee.value = fee || 0
  }
  
  const hasItems = computed(() => items.value.length > 0)
  
  const isProductInCart = computed(() => {
    return (productId) => items.value.some(item => item.product_id === productId)
  })

  /**
   * Validates active Supabase session and ensures user is authenticated
   * This is required for all cart operations due to RLS policies
   * @returns {Promise<Object>} Authenticated user object
   * @throws {Error} If session is invalid, expired, or user not authenticated
   */
  const validateActiveSession = async () => {
    console.log('🔐 Validating active session for cart operation...')
    
    // Check for active session first - required by RLS policies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      throw new Error('Authentication session error. Please log in again.')
    }

    if (!session || !session.user) {
      console.warn('⚠️ No active session found')
      throw new Error('Please log in to manage cart')
    }

    // Verify session is not expired - prevents RLS permission denied errors
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      console.warn('⏰ Session expired, attempting to refresh...')
      
      // Try to refresh the session to maintain authentication
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError || !refreshData.session) {
        console.error('❌ Session refresh failed:', refreshError)
        throw new Error('Your session has expired. Please log in again.')
      }
      
      console.log('✅ Session refreshed successfully')
    }

    // Get current user - required for auth.uid() in RLS policies
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

  // Actions
  /**
   * Fetches cart items for the authenticated user
   * Respects RLS policies: only shows items from user's own cart
   * @returns {Promise<void>}
   */
  const fetchCartItems = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('🛒 Fetching cart items...')
      
      // Check for active session (graceful for loading)
      // RLS policies require authentication to access cart_items
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session || !session.user) {
        console.log('ℹ️ No active session, clearing cart items')
        items.value = []
        return
      }

      // Verify session is not expired to prevent RLS permission denied
      const now = Math.floor(Date.now() / 1000)
      if (session.expires_at && session.expires_at < now) {
        console.warn('⏰ Session expired, attempting to refresh...')
        
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !refreshData.session) {
          console.warn('❌ Session refresh failed, clearing cart')
          items.value = []
          return
        }
        
        console.log('✅ Session refreshed successfully')
      }

      // Get current user - required for RLS policy evaluation
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.log('ℹ️ No user found, clearing cart items')
        items.value = []
        return
      }

      // First, get the user's cart ID - RLS policy ensures user can only access their own cart
      console.log('🔍 Looking up cart for user:', user.id)
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
        // User has no cart yet, return empty items
        console.log('ℹ️ No cart found for user, returning empty items')
        items.value = []
        return
      }

      console.log('✅ Found cart:', cartData.id)

      // Fetch cart items with product details using a join
      // RLS policy ensures user can only see items from their own cart
      // Using explicit foreign key relationship to avoid ambiguity
      console.log('🔍 Fetching cart items for cart:', cartData.id)
      const { data, error: fetchError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product_id,
          updated_at,
          products!fk_product_cascade (
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
      // Includes all fields from database schema: id, product_id, quantity, updated_at
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

      // Update last updated timestamp
      lastUpdated.value = new Date().toISOString()
      console.log('✅ Cart items loaded successfully')

    } catch (err) {
      error.value = err.message
      console.error('Error fetching cart items:', err)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Adds a product to the user's cart using the add_to_cart RPC function
   * Respects RLS policies: only allows adding to user's own cart
   * @param {string} productId - UUID of the product to add
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Promise<void>}
   */
  const addToCart = async (productId, quantity = 1) => {
    try {
      loading.value = true
      error.value = null
      console.log('➕ Adding to cart:', { productId, quantity })
      
      // Validate active session - required by RLS policies
      const user = await validateActiveSession()

      // Validate inputs
      if (!productId) {
        throw new Error('Product ID is required')
      }

      if (!quantity || quantity < 1) {
        throw new Error('Quantity must be at least 1')
      }

      // Call the Supabase RPC function - uses auth.uid() automatically
      // RLS policies ensure user can only modify their own cart
      console.log('🔄 Calling add_to_cart RPC function...')
      const { data, error: rpcError } = await supabase.rpc('add_to_cart', {
        p_product_id: productId,
        p_quantity: quantity
      })

      // Log RPC response for debugging
      console.log('📊 RPC Response - data:', data)
      console.log('📊 RPC Response - error:', rpcError)

      if (rpcError) {
        console.error('❌ RPC Error:', rpcError)
        
        // Handle specific RLS and permission errors
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

      console.log('✅ Item added to cart successfully')

      // Refresh cart items after successful addition to update UI
      await fetchCartItems()

    } catch (err) {
      error.value = err.message
      console.error('❌ Error adding to cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Removes a product from the user's cart using the decrease_or_remove_row RPC function
   * Respects RLS policies: only allows removing from user's own cart
   * @param {string} productId - UUID of the product to remove
   * @returns {Promise<void>}
   */
  const removeFromCart = async (productId) => {
    try {
      loading.value = true
      error.value = null
      console.log('➖ Removing from cart:', { productId })
      
      // Validate active session - required by RLS policies
      const user = await validateActiveSession()

      if (!productId) {
        throw new Error('Product ID is required')
      }

      // Call the Supabase RPC function - uses auth.uid() automatically
      // RLS policies ensure user can only modify their own cart
      console.log('🔄 Calling decrease_or_remove_row RPC function...')
      const { data, error: rpcError } = await supabase.rpc('decrease_or_remove_row', {
        p_product_id: productId,
        p_quantity: 1
      })

      // Log RPC response for debugging
      console.log('📊 RPC Response - data:', data)
      console.log('📊 RPC Response - error:', rpcError)

      if (rpcError) {
        console.error('❌ RPC Error:', rpcError)
        
        // Handle specific RLS and permission errors
        if (rpcError.message?.includes('permission denied') || rpcError.message?.includes('RLS')) {
          throw new Error('You do not have permission to modify this cart. Please log in again.')
        }
        if (rpcError.message?.includes('not authenticated')) {
          throw new Error('Please log in to manage cart')
        }
        throw new Error(rpcError.message)
      }

      console.log('✅ Item removed from cart successfully')

      // Refresh cart items after successful removal to update UI
      await fetchCartItems()

    } catch (err) {
      error.value = err.message
      console.error('❌ Error removing from cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Updates the quantity of a product in the user's cart
   * Uses RPC functions to ensure RLS policy compliance
   * @param {string} productId - UUID of the product to update
   * @param {number} quantity - New quantity (0 removes the item)
   * @returns {Promise<void>}
   */
  const updateQuantity = async (productId, quantity) => {
    try {
      console.log('🔄 Updating quantity:', { productId, quantity })
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await removeFromCart(productId)
        return
      }

      loading.value = true
      error.value = null
      
      // Validate active session - required by RLS policies
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
      console.log('📊 Quantity difference:', quantityDifference)

      if (quantityDifference > 0) {
        // Add the difference using addToCart (which handles RLS)
        console.log('➕ Adding quantity difference:', quantityDifference)
        await addToCart(productId, quantityDifference)
      } else if (quantityDifference < 0) {
        // Remove the difference using RPC function (respects RLS)
        console.log('➖ Removing quantity difference:', Math.abs(quantityDifference))
        const { data, error: rpcError } = await supabase.rpc('decrease_or_remove_row', {
          p_product_id: productId,
          p_quantity: Math.abs(quantityDifference)
        })

        // Log RPC response for debugging
        console.log('📊 RPC Response - data:', data)
        console.log('📊 RPC Response - error:', rpcError)

        if (rpcError) {
          console.error('❌ RPC Error:', rpcError)
          
          // Handle specific RLS and permission errors
          if (rpcError.message?.includes('permission denied') || rpcError.message?.includes('RLS')) {
            throw new Error('You do not have permission to modify this cart. Please log in again.')
          }
          if (rpcError.message?.includes('not authenticated')) {
            throw new Error('Please log in to manage cart')
          }
          throw new Error(rpcError.message)
        }

        console.log('✅ Quantity updated successfully')

        // Refresh cart items to update UI
        await fetchCartItems()
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
   * Clears all items from the user's cart using the clear_user_cart RPC function
   * Respects RLS policies: only allows clearing user's own cart
   * @returns {Promise<void>}
   */
  const clearCart = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('🗑️ [CartStore] Clearing cart...')
      
      // Validate active session - required by RLS policies
      console.log('🔐 [CartStore] Validating session before clearing cart...')
      const user = await validateActiveSession()
      console.log('✅ [CartStore] Session validated, user ID:', user.id)

      // Double-check session is still valid and refresh if needed
      let { data: { session }, error: sessionCheckError } = await supabase.auth.getSession()
      
      // If session is expired or missing, try to refresh it
      if (!session || !session.user) {
        console.warn('⚠️ [CartStore] No session found, attempting to refresh...')
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError || !refreshData.session) {
          console.error('❌ [CartStore] Session refresh failed:', refreshError)
          throw new Error('Session validation failed. Please log in again.')
        }
        session = refreshData.session
        console.log('✅ [CartStore] Session refreshed successfully')
      } else if (session.expires_at && session.expires_at * 1000 < Date.now() + 60000) {
        // Session expires in less than 1 minute, refresh it
        console.warn('⚠️ [CartStore] Session expiring soon, refreshing...')
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        if (!refreshError && refreshData.session) {
          session = refreshData.session
          console.log('✅ [CartStore] Session refreshed proactively')
        }
      }
      
      if (!session || !session.user) {
        console.error('❌ [CartStore] Session check failed after refresh:', {
          sessionCheckError,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id
        })
        throw new Error('Session validation failed. Please log in again.')
      }
      
      console.log('✅ [CartStore] Session confirmed valid:', {
        userId: session.user.id,
        expiresAt: new Date(session.expires_at * 1000).toISOString(),
        accessToken: session.access_token ? 'present' : 'missing'
      })

      // Use the clear_user_cart RPC function - uses auth.uid() automatically
      // RLS policies ensure user can only clear their own cart
      console.log('🔄 [CartStore] Calling clear_user_cart RPC function...')
      const { data, error: rpcError } = await supabase.rpc('clear_user_cart')

      // Log RPC response for debugging
      console.log('📊 [CartStore] RPC Response - data:', data)
      console.log('📊 [CartStore] RPC Response - error:', rpcError)

      if (rpcError) {
        console.error('❌ [CartStore] RPC Error:', rpcError)
        console.error('❌ [CartStore] RPC Error details:', {
          code: rpcError.code,
          message: rpcError.message,
          details: rpcError.details,
          hint: rpcError.hint
        })
        
        // Handle specific RLS and permission errors
        if (rpcError.code === '42501' || rpcError.message?.includes('permission denied') || rpcError.message?.includes('RLS')) {
          // Try to get current user again to verify session
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
          console.error('🔍 [CartStore] Current user check after RPC error:', {
            userError,
            hasUser: !!currentUser,
            userId: currentUser?.id
          })
          throw new Error('You do not have permission to modify this cart. Please log in again.')
        }
        if (rpcError.message?.includes('not authenticated')) {
          throw new Error('Please log in to manage cart')
        }
        throw new Error(rpcError.message || 'Failed to clear cart')
      }

      console.log('✅ [CartStore] Cart cleared successfully')

      // Clear local state immediately for UI responsiveness
      items.value = []
      lastUpdated.value = new Date().toISOString()

    } catch (err) {
      error.value = err.message
      console.error('❌ [CartStore] Error clearing cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Get cart statistics
  const getCartStats = () => {
    return {
      totalItems: totalItems.value,
      subtotal: subtotal.value,
      deliveryFee: deliveryFee.value,
      total: total.value,
      itemCount: items.value.length,
      lastUpdated: lastUpdated.value
    }
  }

  /**
   * Subscribes to real-time cart changes for the authenticated user
   * Respects RLS policies: only receives changes for user's own cart
   * @returns {Object|null} Subscription object or null if failed
   */
  const subscribeToCartChanges = () => {
    try {
      console.log('🔔 Setting up real-time cart subscription...')
      
      // Subscribe to cart_items changes for the current user
      // RLS policies ensure user only receives changes for their own cart
      const subscription = supabase
        .channel('cart_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'cart_items' 
          }, 
          (payload) => {
            console.log('🔄 Cart change detected:', payload)
            console.log('📊 Change details:', {
              eventType: payload.eventType,
              table: payload.table,
              schema: payload.schema,
              new: payload.new,
              old: payload.old
            })
            
            // Refresh cart items when changes are detected
            // This ensures UI stays in sync with database changes
            fetchCartItems()
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time cart subscription active')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Real-time subscription error')
          }
        })

      return subscription
    } catch (error) {
      console.error('❌ Error subscribing to cart changes:', error)
      return null
    }
  }

  return {
    // State
    items,
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
    fetchCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearError,
    getCartStats,
    subscribeToCartChanges,
    setDeliveryFee
  }
})