import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

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

  // Helper function to map database fields to frontend fields
  const mapProductFields = (apiProduct) => {
    return {
      id: apiProduct.id,
      userId: apiProduct.userId,
      title: apiProduct.title,
      description: apiProduct.description,
      price: apiProduct.price,
      image: apiProduct.image || 'https://via.placeholder.com/300',
      category: apiProduct.category?.name || 'Uncategorized',
      categoryId: apiProduct.categoryId,
      user: apiProduct.user,
      createdAt: apiProduct.createdAt,
      updatedAt: apiProduct.updatedAt
    }
  }

  // Getters
  const filteredProducts = computed(() => {
    let filtered = [...products.value]

    // Filter by category
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory.value || product.categoryId === selectedCategory.value)
    }

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.nameAr.includes(query) ||
        product.description.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  const newProducts = computed(() => products.value.filter(product => product.isNew))
  
  const saleProducts = computed(() => products.value.filter(product => product.isOnSale))
  
  const getProductById = computed(() => (id) => products.value.find(product => product.id === id))

  // Actions
  const fetchProducts = async (page = 1, search = '', category = '') => {
    loading.value = true
    error.value = null
    currentPage.value = page
    
    try {
      // Build query params
      const params = new URLSearchParams({
        page,
        limit: perPage,
        ...(search && { search }),
        ...(category && category !== 'all' && { categoryId: category })
      })
      
      const response = await axios.get(`${API_BASE_URL}/api/products?${params}`)
      
      // Map the data to our frontend format
      products.value = response.data.products.map(mapProductFields)
      totalProducts.value = response.data.total || 0
      
      // If categories are not loaded, fetch them
      if (categories.value.length === 0) {
        categories.value = await fetchCategories()
      }
      
      return response.data
    } catch (err) {
      console.error('Error fetching products:', err)
      error.value = err.response?.data?.message || 'Failed to fetch products'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchProductById = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/${id}`)
      
      if (!response.data) {
        throw new Error('Product not found')
      }
      
      return mapProductFields(response.data)
    } catch (err) {
      console.error(`Error fetching product ${id}:`, err)
      error.value = err.response?.data?.message || 'Failed to fetch product'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCategory = (category) => {
    selectedCategory.value = category
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const clearFilters = () => {
    selectedCategory.value = 'all'
    searchQuery.value = ''
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
    
    // Getters
    filteredProducts,
    newProducts,
    saleProducts,
    getProductById,
    
    // Actions
    fetchProducts,
    fetchProductById,
    setCategory,
    setSearchQuery,
    clearFilters,
    clearError
  }
}) 