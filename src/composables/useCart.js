import { ref, computed } from 'vue'
import { useCartStore } from '../stores/useCartStore'
import { useAuthStore } from '../stores/useAuthStore'

/**
 * Cart composable that provides a simple interface to the cart store
 * Handles both authenticated and guest users automatically
 */
export function useCart() {
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  
  // Local state for UI feedback
  const loading = ref(false)
  const error = ref(null)
  const feedback = ref(null)

  /**
   * Shows feedback message to user
   * @param {string} message - Message to show
   * @param {string} type - Type of feedback (success, error, info)
   */
  const showFeedback = (message, type = 'success') => {
    feedback.value = { message, type }
    setTimeout(() => {
      feedback.value = null
    }, 3000)
  }

  /**
   * Adds a product to the cart
   * @param {Object} product - Product object with id, name, price, etc.
   * @param {number} quantity - Quantity to add (default: 1)
   */
  const addToCart = async (product, quantity = 1) => {
    if (!product || (product.stock_quantity || 0) <= 0) {
      showFeedback('Product is out of stock', 'error')
      return
    }

    try {
      loading.value = true
      error.value = null

      await cartStore.addToCart(product.id, quantity)
      
      const message = authStore.isAuthenticated 
        ? 'Added to cart!' 
        : 'Added to cart! (Saved locally)'
      showFeedback(message, 'success')
    } catch (err) {
      error.value = err.message || 'Failed to add to cart'
      showFeedback('Failed to add to cart', 'error')
    } finally {
      loading.value = false
    }
  }

  /**
   * Removes a product from the cart
   * @param {string} productId - Product ID to remove
   */
  const removeFromCart = async (productId) => {
    try {
      loading.value = true
      error.value = null

      await cartStore.removeFromCart(productId)
      showFeedback('Removed from cart', 'success')
    } catch (err) {
      error.value = err.message || 'Failed to remove from cart'
      showFeedback('Failed to remove from cart', 'error')
    } finally {
      loading.value = false
    }
  }

  /**
   * Updates the quantity of a product in the cart
   * @param {string} productId - Product ID to update
   * @param {number} quantity - New quantity (0 removes the item)
   */
  const updateQuantity = async (productId, quantity) => {
    try {
      loading.value = true
      error.value = null

      await cartStore.updateQuantity(productId, quantity)
      
      if (quantity <= 0) {
        showFeedback('Removed from cart', 'success')
      } else {
        showFeedback('Quantity updated', 'success')
      }
    } catch (err) {
      error.value = err.message || 'Failed to update quantity'
      showFeedback('Failed to update quantity', 'error')
    } finally {
      loading.value = false
    }
  }

  /**
   * Clears all items from the cart
   */
  const clearCart = async () => {
    try {
      loading.value = true
      error.value = null

      await cartStore.clearCart()
      showFeedback('Cart cleared', 'success')
    } catch (err) {
      error.value = err.message || 'Failed to clear cart'
      showFeedback('Failed to clear cart', 'error')
    } finally {
      loading.value = false
    }
  }

  /**
   * Checks if a product is in the cart
   * @param {string} productId - Product ID to check
   * @returns {boolean} True if product is in cart
   */
  const isInCart = (productId) => {
    return cartStore.isProductInCart(productId)
  }

  /**
   * Gets the quantity of a product in the cart
   * @param {string} productId - Product ID to check
   * @returns {number} Quantity of product in cart
   */
  const getCartQuantity = (productId) => {
    const item = cartStore.items.find(item => item.product_id === productId)
    return item ? item.quantity : 0
  }

  /**
   * Fetches cart data (called automatically on auth state changes)
   */
  const fetchCart = async () => {
    try {
      loading.value = true
      error.value = null
      await cartStore.fetchCart()
    } catch (err) {
      error.value = err.message || 'Failed to fetch cart'
    } finally {
      loading.value = false
    }
  }

  /**
   * Syncs local cart to Supabase (called automatically on login)
   */
  const syncLocalCart = async () => {
    try {
      loading.value = true
      error.value = null
      await cartStore.syncLocalCart()
      showFeedback('Cart synced to your account!', 'success')
    } catch (err) {
      error.value = err.message || 'Failed to sync cart'
      showFeedback('Failed to sync cart', 'error')
    } finally {
      loading.value = false
    }
  }

  /**
   * Clears error state
   */
  const clearError = () => {
    error.value = null
    cartStore.clearError()
  }

  // Computed properties that delegate to the store
  const totalItems = computed(() => cartStore.totalItems)
  const cartItems = computed(() => cartStore.items)
  const hasItems = computed(() => cartStore.hasItems)
  const subtotal = computed(() => cartStore.subtotal)
  const deliveryFee = computed(() => cartStore.deliveryFee)
  const total = computed(() => cartStore.total)
  const isGuest = computed(() => cartStore.isGuest)
  const cartId = computed(() => cartStore.cartId)

  return {
    // State
    loading,
    error,
    feedback,
    
    // Computed
    totalItems,
    cartItems,
    hasItems,
    subtotal,
    deliveryFee,
    total,
    isGuest,
    cartId,
    
    // Methods
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartQuantity,
    fetchCart,
    syncLocalCart,
    clearError
  }
}