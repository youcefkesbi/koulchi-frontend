import { ref, computed } from 'vue'
import axios from 'axios'
import { environment } from '../config/environment'

/**
 * Products composable for fetching best-selling products from backend API
 * - Uses axios for HTTP requests to backend API
 * - Handles loading states and error handling
 * - Supports both general and category-specific best-selling products
 */
export function useProducts() {
  // State
  const bestSellingProducts = ref([])
  const bestSellingByCategory = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const hasProducts = computed(() => bestSellingProducts.value.length > 0)
  const hasCategoryProducts = computed(() => bestSellingByCategory.value.length > 0)
  const totalProducts = computed(() => bestSellingProducts.value.length)
  const totalCategoryProducts = computed(() => bestSellingByCategory.value.length)

  /**
   * Get backend base URL from environment
   */
  const getBackendUrl = () => {
    return environment.backend.url
  }

  /**
   * Handle API errors consistently
   */
  const handleError = (err, context = 'API request') => {
    console.error(`${context} error:`, err)
    
    let errorMessage = 'An unexpected error occurred'
    
    if (err.response) {
      // Server responded with error status
      const status = err.response.status
      const data = err.response.data
      
      if (status === 404) {
        errorMessage = 'Products not found'
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later'
      } else if (status === 503) {
        errorMessage = 'Service temporarily unavailable. Please try again later'
      } else if (data?.message) {
        errorMessage = data.message
      } else {
        errorMessage = `Request failed with status ${status}`
      }
    } else if (err.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection and try again'
    } else if (err.message) {
      errorMessage = err.message
    }
    
    error.value = errorMessage
    throw new Error(errorMessage)
  }

  /**
   * Fetch best-selling products from backend API
   */
  const fetchBestSellingProducts = async () => {
    try {
      loading.value = true
      error.value = null

      const backendUrl = getBackendUrl()
      const url = `${backendUrl}/products/best-selling`

      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (response.status === 200 && response.data) {
        bestSellingProducts.value = Array.isArray(response.data) ? response.data : []
        return bestSellingProducts.value
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      handleError(err, 'Fetch best-selling products')
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch best-selling products by category from backend API
   */
  const fetchBestSellingProductsByCategory = async (categoryId) => {
    try {
      loading.value = true
      error.value = null

      if (!categoryId) {
        throw new Error('Category ID is required')
      }

      const backendUrl = getBackendUrl()
      const url = `${backendUrl}/products/best-selling/${categoryId}`

      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (response.status === 200 && response.data) {
        bestSellingByCategory.value = Array.isArray(response.data) ? response.data : []
        return bestSellingByCategory.value
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      handleError(err, 'Fetch best-selling products by category')
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh best-selling products
   */
  const refreshBestSellingProducts = async () => {
    return await fetchBestSellingProducts()
  }

  /**
   * Refresh best-selling products by category
   */
  const refreshBestSellingProductsByCategory = async (categoryId) => {
    return await fetchBestSellingProductsByCategory(categoryId)
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Clear all products data
   */
  const clearProducts = () => {
    bestSellingProducts.value = []
    bestSellingByCategory.value = []
    error.value = null
  }

  /**
   * Get product by ID from current products
   */
  const getProductById = (productId) => {
    const allProducts = [...bestSellingProducts.value, ...bestSellingByCategory.value]
    return allProducts.find(product => product.id === productId)
  }

  /**
   * Search products by name or description
   */
  const searchProducts = (query) => {
    if (!query || typeof query !== 'string') {
      return []
    }

    const searchTerm = query.toLowerCase().trim()
    const allProducts = [...bestSellingProducts.value, ...bestSellingByCategory.value]
    
    return allProducts.filter(product => {
      const name = (product.name || '').toLowerCase()
      const description = (product.description || '').toLowerCase()
      
      return name.includes(searchTerm) || description.includes(searchTerm)
    })
  }

  return {
    // State
    bestSellingProducts,
    bestSellingByCategory,
    loading,
    error,
    
    // Getters
    hasProducts,
    hasCategoryProducts,
    totalProducts,
    totalCategoryProducts,
    
    // Actions
    fetchBestSellingProducts,
    fetchBestSellingProductsByCategory,
    refreshBestSellingProducts,
    refreshBestSellingProductsByCategory,
    
    // Utilities
    clearError,
    clearProducts,
    getProductById,
    searchProducts
  }
}
