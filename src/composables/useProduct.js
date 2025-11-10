import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { useLocaleRouter } from './useLocaleRouter'

export function useProduct() {
  const authStore = useAuthStore()
  const { navigateToPath } = useLocaleRouter()
  
  const loading = ref(false)
  const error = ref(null)
  const feedback = ref(null)

  // Delete product (owner only)
  const deleteProduct = async (productId) => {
    if (!authStore.isAuthenticated) {
      showFeedback('You must be logged in to delete products', 'error')
      return false
    }

    try {
      loading.value = true
      error.value = null

      // Delete from Supabase
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', authStore.user.id) // Ensure user owns the product

      if (deleteError) {
        throw deleteError
      }

      showFeedback('Product deleted successfully!')
      return true
    } catch (err) {
      error.value = err.message || 'Failed to delete product'
      showFeedback('Failed to delete product', 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // Navigate to edit product page
  const editProduct = (productId) => {
    if (!authStore.isAuthenticated) {
      showFeedback('You must be logged in to edit products', 'error')
      return
    }

    navigateToPath(`/products/${productId}/edit`)
  }

  // Navigate to product detail page
  const viewProduct = (productId) => {
    navigateToPath(`/product/${productId}`)
  }

  // Show feedback message
  const showFeedback = (message, type = 'success') => {
    feedback.value = { message, type }
    setTimeout(() => {
      feedback.value = null
    }, 3000)
  }

  return {
    // State
    loading,
    error,
    feedback,
    
    // Methods
    deleteProduct,
    editProduct,
    viewProduct
  }
}
