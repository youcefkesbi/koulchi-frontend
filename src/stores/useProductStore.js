import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([])
  const categories = ref([])
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

  const fetchCategories = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('id, name_en, name_ar, name_fr')
        .eq('is_active', true)
        .order('name_en')

      if (fetchError) throw fetchError
      categories.value = Array.isArray(data) ? data : []
      return categories.value
    } catch (err) {
      error.value = err?.message || 'Failed to load categories'
      console.error('Error fetching categories:', err)
      categories.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchApprovedProducts = async (limit = 8) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('id, name, description, price, thumbnail_url, image_urls, category_id, stock_quantity, sold_count, is_new, status, created_at, store_id, seller_id, stores(owner_id)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError
      const fetchedProducts = Array.isArray(data) ? data : []
      console.log('✅ Fetched approved products:', fetchedProducts.length)
      return fetchedProducts
    } catch (err) {
      error.value = err?.message || 'Failed to load products'
      console.error('Error fetching products:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchProductById = async (productId) => {
    try {
      loading.value = true
      error.value = null
      
      if (!productId) {
        throw new Error('Product ID is required')
      }
      
      // Validate that the ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(productId)) {
        throw new Error(`Invalid product ID format: ${productId}. Expected UUID format.`)
      }
      
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name_en,
            name_ar,
            name_fr
          ),
          stores (
            id,
            name,
            owner_id
          )
        `)
        .eq('id', productId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Product not found')
        }
        throw fetchError
      }
      
      currentProduct.value = data
      return data
    } catch (err) {
      error.value = err?.message || 'Failed to fetch product'
      console.error('Error fetching product by ID:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    products,
    categories,
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
    fetchCategories,
    fetchApprovedProducts,
    fetchProductById,
    clearError,
    clearCurrentProduct
  }
})

