import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const categories = ref([])
  const selectedCategory = ref('all')
  const searchQuery = ref('')
  const loading = ref(false)
  const error = ref(null)
  const totalProducts = ref(0)
  const currentPage = ref(1)
  const perPage = 10

  // Getters
  const filteredProducts = computed(() => {
    let filtered = [...products.value]

    // Filter by category
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory.value)
    }

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(product => 
        (product.name && product.name.toLowerCase().includes(query)) ||
        (product.name_ar && product.name_ar.includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query))
      )
    }

    return filtered
  })

  const newProducts = computed(() => products.value.filter(product => product.is_new))
  
  const saleProducts = computed(() => products.value.filter(product => product.is_on_sale))
  
  const getProductById = computed(() => (id) => products.value.find(product => product.id === id))

  // Actions
  const fetchProducts = async (page = 1, search = '', category = '') => {
    loading.value = true
    error.value = null
    currentPage.value = page
    
    try {
      let query = supabase
        .from('products')
        .select('*, categories(name, name_ar)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('category_id', category)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const { data, error: fetchError, count } = await query
        .range((page - 1) * perPage, page * perPage - 1)
        .select('*', { count: 'exact' })

      if (fetchError) throw fetchError

      products.value = data || []
      totalProducts.value = count || 0
      
      return { products: products.value, total: totalProducts.value }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching products:', err)
      products.value = []
      totalProducts.value = 0
      return { products: [], total: 0 }
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (fetchError) throw fetchError

      categories.value = data || []
      return categories.value
    } catch (err) {
      console.error('Error fetching categories:', err)
      return []
    }
  }

  const setCategory = (categoryId) => {
    selectedCategory.value = categoryId
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    products,
    categories,
    selectedCategory,
    searchQuery,
    loading,
    error,
    totalProducts,
    currentPage,
    perPage,
    
    // Getters
    filteredProducts,
    newProducts,
    saleProducts,
    getProductById,
    
    // Actions
    fetchProducts,
    fetchCategories,
    setCategory,
    setSearchQuery,
    clearError
  }
}) 