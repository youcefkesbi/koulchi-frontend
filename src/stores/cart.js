import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartService } from '../../database/cartService.js'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const deliveryAddress = ref(null)
  const customerInfo = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0))
  
  const deliveryFee = computed(() => {
    // Algerian delivery fees based on wilaya (province)
    const baseFee = 500 // 500 DZD base delivery fee
    return baseFee
  })
  
  const total = computed(() => subtotal.value + deliveryFee.value)
  
  const hasItems = computed(() => items.value.length > 0)
  
  const isProductInCart = computed(() => {
    return (productId) => items.value.some(item => item.id === productId)
  })



  // Actions
  const fetchCart = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('Fetching cart...')
      
      // Use the cart service to fetch items
      const cartItems = await cartService.getItems()
      items.value = cartItems
      console.log('Fetched', cartItems.length, 'cart items')
    } catch (err) {
      error.value = err.message
      console.error('Error fetching cart:', err)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  // Sync local cart to Supabase after login
  const syncLocalToSupabase = async (userId) => {
    try {
      await cartService.syncLocalToSupabase(userId)
      // Refresh cart items after sync
      await fetchCart()
    } catch (err) {
      error.value = err.message
      console.error('Error syncing local cart to Supabase:', err)
    }
  }

  const addToCart = async (product, quantity = 1) => {
    try {
      console.log('=== Cart Store addToCart START ===')
      console.log('Cart store addToCart called with:', { product, quantity })
      console.log('Cart service available:', !!cartService)
      
      // Use the cart service to add item
      console.log('Calling cartService.addItem...')
      await cartService.addItem(product.id, quantity)
      console.log('cartService.addItem completed successfully')
      
      // Refresh cart items
      console.log('Refreshing cart items...')
      await fetchCart()
      console.log('Cart items refreshed successfully')
      
      console.log('=== Cart Store addToCart SUCCESS ===')
    } catch (err) {
      console.error('=== Cart Store addToCart ERROR ===')
      error.value = err.message
      console.error('Error adding to cart:', err)
      throw err
    }
  }

  const removeFromCart = async (productId) => {
    try {
      // Use the cart service to remove item
      await cartService.removeItem(productId)
      
      // Refresh cart items
      await fetchCart()
    } catch (err) {
      error.value = err.message
      console.error('Error removing from cart:', err)
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      // Use the cart service to update quantity
      await cartService.updateQuantity(productId, quantity)
      
      // Refresh cart items
      await fetchCart()
    } catch (err) {
      error.value = err.message
      console.error('Error updating quantity:', err)
    }
  }

  const clearCart = async () => {
    try {
      // Use the cart service to clear cart
      await cartService.clearCart()
      
      // Clear local state
      items.value = []
    } catch (err) {
      error.value = err.message
      console.error('Error clearing cart:', err)
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    items,
    deliveryAddress,
    customerInfo,
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
    fetchCart,
    syncLocalToSupabase,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearError
  }
}) 