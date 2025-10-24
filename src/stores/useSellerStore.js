import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { maystroApi, transformToMaystro, transformFromMaystro } from '../services/maystroApi'

export const useSellerStore = defineStore('seller', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalProducts = computed(() => products.value.length)
  const activeProducts = computed(() => products.value.filter(p => p.status === 'approved'))
  const inactiveProducts = computed(() => products.value.filter(p => p.status !== 'approved'))

  // Actions
  const fetchSellerProducts = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await maystroApi.getProducts(1)
      
      // Transform Maystro response to frontend format
      const transformedProducts = response.list.results.map(product => 
        transformFromMaystro(product)
      )
      
      products.value = transformedProducts
    } catch (err) {
      error.value = err.message
      console.error('Error fetching seller products:', err)
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    try {
      loading.value = true
      error.value = null

      // Transform data to Maystro format
      const maystroData = transformToMaystro(productData)
      
      const response = await maystroApi.createProduct(maystroData)
      
      // Transform back to frontend format
      const transformedProduct = transformFromMaystro(response)
      
      products.value.unshift(transformedProduct)
      return transformedProduct
    } catch (err) {
      error.value = err.message
      console.error('Error creating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (productId, updates) => {
    try {
      loading.value = true
      error.value = null

      // Transform updates to Maystro format
      const maystroData = transformToMaystro(updates)
      
      const response = await maystroApi.updateProduct(productId, maystroData)
      
      // Transform back to frontend format
      const transformedProduct = transformFromMaystro(response)

      const index = products.value.findIndex(p => p.id === productId)
      if (index !== -1) {
        products.value[index] = transformedProduct
      }

      return transformedProduct
    } catch (err) {
      error.value = err.message
      console.error('Error updating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (productId) => {
    try {
      loading.value = true
      error.value = null

      await maystroApi.deleteProduct(productId)

      products.value = products.value.filter(p => p.id !== productId)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleProductStatus = async (productId, isActive) => {
    return await updateProduct(productId, { status: isActive ? 'approved' : 'inactive' })
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    products,
    loading,
    error,
    
    // Getters
    totalProducts,
    activeProducts,
    inactiveProducts,
    
    // Actions
    fetchSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    clearError
  }
}) 