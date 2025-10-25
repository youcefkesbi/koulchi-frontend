import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentProduct = ref(null)

  // Getters
  const getProductById = computed(() => {
    return (id) => products.value.find(product => product.id === id)
  })

  const getProductsByCategory = computed(() => {
    return (categoryId) => products.value.filter(product => product.category_id === categoryId)
  })

  // Actions
  const fetchProducts = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(filters)
      // })
      // const data = await response.json()
      // products.value = data
      
      console.log('Fetching products with filters:', filters)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/products/${id}`)
      // const data = await response.json()
      // currentProduct.value = data
      
      console.log('Fetching product:', id)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching product:', err)
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    try {
      loading.value = true
      error.value = null
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(productData)
      // })
      // const data = await response.json()
      // products.value.push(data)
      
      console.log('Creating product:', productData)
    } catch (err) {
      error.value = err.message
      console.error('Error creating product:', err)
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id, productData) => {
    try {
      loading.value = true
      error.value = null
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/products/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(productData)
      // })
      // const data = await response.json()
      // const index = products.value.findIndex(p => p.id === id)
      // if (index !== -1) {
      //   products.value[index] = data
      // }
      
      console.log('Updating product:', id, productData)
    } catch (err) {
      error.value = err.message
      console.error('Error updating product:', err)
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      // TODO: Replace with actual API call
      // await fetch(`/api/products/${id}`, { method: 'DELETE' })
      // products.value = products.value.filter(p => p.id !== id)
      
      console.log('Deleting product:', id)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting product:', err)
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentProduct = () => {
    currentProduct.value = null
  }

  return {
    // State
    products,
    loading,
    error,
    currentProduct,
    
    // Getters
    getProductById,
    getProductsByCategory,
    
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
    clearCurrentProduct
  }
})

