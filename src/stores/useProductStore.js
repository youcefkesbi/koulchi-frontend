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
  
  // Search and filter state
  const searchQuery = ref('')
  const selectedCategory = ref('all')

  // Getters
  const getProductById = computed(() => {
    return (id) => products.value.find(product => product.id === id)
  })

  const getProductsByCategory = computed(() => {
    return (categoryId) => products.value.filter(product => product.category_id === categoryId)
  })

  // Filtered products based on search and category
  const filteredProducts = computed(() => {
    let filtered = products.value

    // Filter by category
    if (selectedCategory.value && selectedCategory.value !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory.value)
    }

    // Filter by search query
    if (searchQuery.value && searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(product => {
        const name = (product.name || '').toLowerCase()
        const description = (product.description || '').toLowerCase()
        return name.includes(query) || description.includes(query)
      })
    }

    return filtered
  })

  // Actions — fetches from products table only (used by category page Products section)
  const fetchProducts = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null

      const { category_id: categoryId } = filters

      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          thumbnail_url,
          image_urls,
          category_id,
          stock_quantity,
          sold_count,
          is_new,
          status,
          created_at,
          store_id,
          seller_id,
          stores(owner_id)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5000)

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      products.value = Array.isArray(data) ? data : []
      return products.value
    } catch (err) {
      error.value = err?.message || 'Failed to fetch products'
      console.error('Error fetching products:', err)
      products.value = []
      throw err
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

  // Search products from database
  const searchProducts = async (query, categoryId = null) => {
    try {
      loading.value = true
      error.value = null
      
      if (!query || !query.trim()) {
        // If no query, fetch all approved products
        return await fetchApprovedProducts(100)
      }
      
      const searchTerm = query.trim()
      
      let queryBuilder = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          thumbnail_url,
          image_urls,
          category_id,
          stock_quantity,
          sold_count,
          is_new,
          status,
          created_at,
          store_id,
          seller_id,
          stores(owner_id)
        `)
        .eq('status', 'approved')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(100)

      // Add category filter if provided
      if (categoryId && categoryId !== 'all') {
        queryBuilder = queryBuilder.eq('category_id', categoryId)
      }

      const { data, error: fetchError } = await queryBuilder

      if (fetchError) throw fetchError
      
      const fetchedProducts = Array.isArray(data) ? data : []
      return fetchedProducts
    } catch (err) {
      error.value = err?.message || 'Failed to search products'
      console.error('Error searching products:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Initialize store - fetch products and categories
  const initializeStore = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Fetch categories if not already loaded
      if (categories.value.length === 0) {
        await fetchCategories()
      }
      
      // Fetch all approved products
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          thumbnail_url,
          image_urls,
          category_id,
          stock_quantity,
          sold_count,
          is_new,
          status,
          created_at,
          store_id,
          seller_id,
          stores(owner_id)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(500) // Limit to prevent performance issues

      if (fetchError) throw fetchError
      
      products.value = Array.isArray(data) ? data : []
      console.log('✅ Initialized product store with', products.value.length, 'products')
    } catch (err) {
      error.value = err?.message || 'Failed to initialize store'
      console.error('Error initializing product store:', err)
      products.value = []
    } finally {
      loading.value = false
    }
  }

  // Set search query
  const setSearchQuery = (query) => {
    searchQuery.value = query || ''
  }

  // Set selected category
  const setCategory = (categoryId) => {
    selectedCategory.value = categoryId || 'all'
  }

  // Clear all filters
  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = 'all'
  }

  return {
    // State
    products,
    categories,
    loading,
    error,
    currentProduct,
    searchQuery,
    selectedCategory,
    
    // Getters
    getProductById,
    getProductsByCategory,
    filteredProducts,
    
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    fetchApprovedProducts,
    fetchProductById,
    searchProducts,
    initializeStore,
    setSearchQuery,
    setCategory,
    clearFilters,
    clearError,
    clearCurrentProduct
  }
})

