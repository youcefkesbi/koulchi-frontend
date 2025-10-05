import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

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

  // Actions
  const fetchCartItems = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(userError.message)
      }

      if (!user) {
        items.value = []
        return
      }

      // First, get the user's cart ID
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (cartError && cartError.code !== 'PGRST116') {
        throw new Error(cartError.message)
      }

      if (!cartData) {
        // User has no cart yet, return empty items
        items.value = []
        return
      }

      // Fetch cart items with product details using a join
      const { data, error: fetchError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product_id,
          products (
            id,
            name,
            price,
            image_urls,
            seller_id
          )
        `)
        .eq('cart_id', cartData.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      // Map the data to match the expected format
      items.value = (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        name: item.products?.name || 'Unknown Product',
        price: item.products?.price || 0,
        image: item.products?.image_urls?.[0] || '',
        seller_id: item.products?.seller_id
      }))

    } catch (err) {
      error.value = err.message
      console.error('Error fetching cart items:', err)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      loading.value = true
      error.value = null
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(userError.message)
      }

      if (!user) {
        throw new Error('Please log in to add items to cart')
      }

      // Validate inputs
      if (!productId) {
        throw new Error('Product ID is required')
      }

      if (!quantity || quantity < 1) {
        throw new Error('Quantity must be at least 1')
      }

      // Call the Supabase RPC function
      const { data, error: rpcError } = await supabase.rpc('add_to_cart', {
        p_product_id: productId,
        p_quantity: quantity,
        p_user_id: user.id
      })

      // Log both data and error for debugging
      console.log('Add to cart - data:', data)
      console.log('Add to cart - error:', rpcError)

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      // Refresh cart items after successful addition
      await fetchCartItems()

    } catch (err) {
      error.value = err.message
      console.error('Error adding to cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeFromCart = async (productId) => {
    try {
      loading.value = true
      error.value = null
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(userError.message)
      }

      if (!user) {
        throw new Error('Please log in to manage cart')
      }

      if (!productId) {
        throw new Error('Product ID is required')
      }

      // Call the Supabase RPC function to decrease or remove
      const { error: rpcError } = await supabase.rpc('decrease_or_remove_row', {
        p_user_id: user.id,
        p_product_id: productId,
        p_quantity: 1
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      // Refresh cart items after successful removal
      await fetchCartItems()

    } catch (err) {
      error.value = err.message
      console.error('Error removing from cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      loading.value = true
      error.value = null
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(userError.message)
      }

      if (!user) {
        throw new Error('Please log in to manage cart')
      }

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
        await addToCart(productId, quantityDifference)
      } else if (quantityDifference < 0) {
        // Remove the difference
        const { error: rpcError } = await supabase.rpc('decrease_or_remove_row', {
          p_user_id: user.id,
          p_product_id: productId,
          p_quantity: Math.abs(quantityDifference)
        })

        if (rpcError) {
          throw new Error(rpcError.message)
        }

        // Refresh cart items
        await fetchCartItems()
      }

    } catch (err) {
      error.value = err.message
      console.error('Error updating quantity:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearCart = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw new Error(userError.message)
      }

      if (!user) {
        throw new Error('Please log in to manage cart')
      }

      // Use the clear_user_cart SQL function
      const { error: rpcError } = await supabase.rpc('clear_user_cart', {
        p_user_id: user.id
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      // Clear local state
      items.value = []

    } catch (err) {
      error.value = err.message
      console.error('Error clearing cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    items,
    loading,
    error,
    
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
    clearError
  }
})