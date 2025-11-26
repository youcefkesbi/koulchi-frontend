import { ref, computed, watch } from 'vue'
import { useWishlistStore } from '../stores/useWishlistStore'
import { useAuthStore } from '../stores/useAuthStore'

const GUEST_WISHLIST_KEY = 'guestWishlist'

export function useWishlist() {
  const wishlistStore = useWishlistStore()
  const authStore = useAuthStore()
  
  // Guest wishlist state
  const guestWishlist = ref([])
  const loading = ref(false)
  const error = ref(null)
  const feedback = ref(null)

  // Load guest wishlist from localStorage
  const loadGuestWishlist = () => {
    try {
      const stored = localStorage.getItem(GUEST_WISHLIST_KEY)
      if (stored) {
        guestWishlist.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('Error loading guest wishlist:', err)
      guestWishlist.value = []
    }
  }

  // Save guest wishlist to localStorage
  const saveGuestWishlist = () => {
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(guestWishlist.value))
    } catch (err) {
      console.error('Error saving guest wishlist:', err)
    }
  }

  // Clear guest wishlist
  const clearGuestWishlist = () => {
    guestWishlist.value = []
    localStorage.removeItem(GUEST_WISHLIST_KEY)
  }

  // Add item to guest wishlist
  const addToGuestWishlist = (product) => {
    const existingItem = guestWishlist.value.find(item => item.product_id === product.id)
    
    if (!existingItem) {
      guestWishlist.value.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_urls?.[0] || null,
        added_at: new Date().toISOString()
      })
      
      saveGuestWishlist()
      showFeedback('Added to wishlist! (Saved locally)')
    } else {
      showFeedback('Already in wishlist', 'info')
    }
  }

  // Remove item from guest wishlist
  const removeFromGuestWishlist = (productId) => {
    guestWishlist.value = guestWishlist.value.filter(item => item.product_id !== productId)
    saveGuestWishlist()
    showFeedback('Removed from wishlist')
  }

  // Sync guest wishlist to Supabase when user logs in
  const syncGuestWishlistToSupabase = async () => {
    if (guestWishlist.value.length === 0) return

    try {
      loading.value = true
      
      // Add each guest wishlist item to Supabase wishlist
      for (const item of guestWishlist.value) {
        await wishlistStore.addToWishlist(item.product_id)
      }
      
      // Clear guest wishlist after successful sync
      clearGuestWishlist()
      showFeedback('Wishlist synced to your account!')
    } catch (err) {
      error.value = err.message || 'Failed to sync wishlist'
      console.error('Error syncing guest wishlist:', err)
    } finally {
      loading.value = false
    }
  }

  // Main add to wishlist function
  const addToWishlist = async (product) => {
    if (!product) {
      showFeedback('Invalid product', 'error')
      return
    }

    try {
      loading.value = true
      error.value = null

      if (authStore.isAuthenticated) {
        // User is signed in - use Supabase wishlist
        await wishlistStore.addToWishlist(product.id)
        showFeedback('Added to wishlist!')
      } else {
        // Guest user - use localStorage
        addToGuestWishlist(product)
      }
    } catch (err) {
      error.value = err.message || 'Failed to add to wishlist'
      showFeedback('Failed to add to wishlist', 'error')
    } finally {
      loading.value = false
    }
  }

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      loading.value = true

      if (authStore.isAuthenticated) {
        await wishlistStore.removeFromWishlist(productId)
        showFeedback('Removed from wishlist')
      } else {
        removeFromGuestWishlist(productId)
        showFeedback('Removed from wishlist')
      }
    } catch (err) {
      error.value = err.message || 'Failed to remove from wishlist'
      showFeedback('Failed to remove from wishlist', 'error')
    } finally {
      loading.value = false
    }
  }

  // Toggle wishlist item
  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product)
    }
  }

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    if (authStore.isAuthenticated) {
      return wishlistStore.wishlistItems.some(item => item.product_id === productId)
    } else {
      return guestWishlist.value.some(item => item.product_id === productId)
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
  const wishlistItems = computed(() => {
    if (authStore.isAuthenticated) {
      return wishlistStore.wishlistItems
    } else {
      return guestWishlist.value
    }
  })

  const totalItems = computed(() => {
    if (authStore.isAuthenticated) {
      return wishlistStore.wishlistItems.length
    } else {
      return guestWishlist.value.length
    }
  })

  const hasItems = computed(() => {
    if (authStore.isAuthenticated) {
      return wishlistStore.wishlistItems.length > 0
    } else {
      return guestWishlist.value.length > 0
    }
  })

  // Watch for auth state changes to sync guest wishlist
  watch(() => authStore.isAuthenticated, async (isAuthenticated, wasAuthenticated) => {
    if (isAuthenticated && !wasAuthenticated) {
      // User just logged in - sync guest wishlist
      await syncGuestWishlistToSupabase()
    }
  })

  // Initialize guest wishlist on mount
  loadGuestWishlist()

  return {
    // State
    loading,
    error,
    feedback,
    guestWishlist,
    
    // Computed
    wishlistItems,
    totalItems,
    hasItems,
    
    // Methods
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    syncGuestWishlistToSupabase,
    clearGuestWishlist,
    loadGuestWishlist,
    saveGuestWishlist
  }
}
