import { ref, computed, watch } from 'vue'
import { useCartStore } from '../stores/useCartStore'
import { useAuthStore } from '../stores/useAuthStore'

const GUEST_CART_KEY = 'guestCart'

export function useCart() {
  const cartStore = useCartStore()
  const authStore = useAuthStore()
  
  // Guest cart state
  const guestCart = ref([])
  const loading = ref(false)
  const error = ref(null)
  const feedback = ref(null)

  // Load guest cart from localStorage
  const loadGuestCart = () => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY)
      if (stored) {
        guestCart.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('Error loading guest cart:', err)
      guestCart.value = []
    }
  }

  // Save guest cart to localStorage
  const saveGuestCart = () => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart.value))
    } catch (err) {
      console.error('Error saving guest cart:', err)
    }
  }

  // Clear guest cart
  const clearGuestCart = () => {
    guestCart.value = []
    localStorage.removeItem(GUEST_CART_KEY)
  }

  // Add item to guest cart
  const addToGuestCart = (product) => {
    const existingItem = guestCart.value.find(item => item.product_id === product.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      guestCart.value.push({
        product_id: product.id,
        quantity: 1,
        price: product.price,
        name: product.name,
        image_url: product.image_urls?.[0] || null,
        added_at: new Date().toISOString()
      })
    }
    
    saveGuestCart()
    showFeedback('Added to cart! (Saved locally)')
  }

  // Remove item from guest cart
  const removeFromGuestCart = (productId) => {
    guestCart.value = guestCart.value.filter(item => item.product_id !== productId)
    saveGuestCart()
  }

  // Update quantity in guest cart
  const updateGuestCartQuantity = (productId, quantity) => {
    const item = guestCart.value.find(item => item.product_id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromGuestCart(productId)
      } else {
        item.quantity = quantity
        saveGuestCart()
      }
    }
  }

  // Sync guest cart to Supabase when user logs in
  const syncGuestCartToSupabase = async () => {
    if (guestCart.value.length === 0) return

    try {
      loading.value = true
      
      // Add each guest cart item to Supabase cart
      for (const item of guestCart.value) {
        await cartStore.addItem(item.product_id, item.quantity)
      }
      
      // Clear guest cart after successful sync
      clearGuestCart()
      showFeedback('Cart synced to your account!')
    } catch (err) {
      error.value = err.message || 'Failed to sync cart'
      console.error('Error syncing guest cart:', err)
    } finally {
      loading.value = false
    }
  }

  // Main add to cart function
  const addToCart = async (product) => {
    if (!product || (product.stock_quantity || 0) <= 0) {
      showFeedback('Product is out of stock', 'error')
      return
    }

    try {
      loading.value = true
      error.value = null

      if (authStore.isAuthenticated) {
        // User is signed in - use Supabase cart
        await cartStore.addItem(product.id, 1)
        showFeedback('Added to cart!')
      } else {
        // Guest user - use localStorage
        addToGuestCart(product)
      }
    } catch (err) {
      error.value = err.message || 'Failed to add to cart'
      showFeedback('Failed to add to cart', 'error')
    } finally {
      loading.value = false
    }
  }

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      loading.value = true

      if (authStore.isAuthenticated) {
        await cartStore.removeItem(productId)
        showFeedback('Removed from cart')
      } else {
        removeFromGuestCart(productId)
        showFeedback('Removed from cart')
      }
    } catch (err) {
      error.value = err.message || 'Failed to remove from cart'
      showFeedback('Failed to remove from cart', 'error')
    } finally {
      loading.value = false
    }
  }

  // Update cart quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      loading.value = true

      if (authStore.isAuthenticated) {
        await cartStore.updateQuantity(productId, quantity)
      } else {
        updateGuestCartQuantity(productId, quantity)
      }
    } catch (err) {
      error.value = err.message || 'Failed to update quantity'
      showFeedback('Failed to update quantity', 'error')
    } finally {
      loading.value = false
    }
  }

  // Check if product is in cart
  const isInCart = (productId) => {
    if (authStore.isAuthenticated) {
      return cartStore.isProductInCart(productId)
    } else {
      return guestCart.value.some(item => item.product_id === productId)
    }
  }

  // Get cart item quantity
  const getCartQuantity = (productId) => {
    if (authStore.isAuthenticated) {
      const item = cartStore.items.find(item => item.product_id === productId)
      return item ? item.quantity : 0
    } else {
      const item = guestCart.value.find(item => item.product_id === productId)
      return item ? item.quantity : 0
    }
  }

  // Show feedback message
  const showFeedback = (message, type = 'success') => {
    feedback.value = { message, type }
    setTimeout(() => {
      feedback.value = null
    }, 3000)
  }

  // Computed properties
  const totalItems = computed(() => {
    if (authStore.isAuthenticated) {
      return cartStore.totalItems
    } else {
      return guestCart.value.reduce((sum, item) => sum + item.quantity, 0)
    }
  })

  const cartItems = computed(() => {
    if (authStore.isAuthenticated) {
      return cartStore.items
    } else {
      return guestCart.value
    }
  })

  const hasItems = computed(() => {
    if (authStore.isAuthenticated) {
      return cartStore.hasItems
    } else {
      return guestCart.value.length > 0
    }
  })

  // Watch for auth state changes to sync guest cart
  watch(() => authStore.isAuthenticated, async (isAuthenticated, wasAuthenticated) => {
    if (isAuthenticated && !wasAuthenticated) {
      // User just logged in - sync guest cart
      await syncGuestCartToSupabase()
    }
  })

  // Initialize guest cart on mount
  loadGuestCart()

  return {
    // State
    loading,
    error,
    feedback,
    guestCart,
    
    // Computed
    totalItems,
    cartItems,
    hasItems,
    
    // Methods
    addToCart,
    removeFromCart,
    updateQuantity,
    isInCart,
    getCartQuantity,
    syncGuestCartToSupabase,
    clearGuestCart,
    loadGuestCart,
    saveGuestCart
  }
}