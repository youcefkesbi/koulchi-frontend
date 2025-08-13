import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios' // Use axios for backend requests

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true
})

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const categories = ref([
    { id: 'all', name: 'All Products', nameAr: 'جميع المنتجات' },
    { id: 'cars', name: 'Cars', nameAr: 'السيارات' },
    { id: 'realestate', name: 'Real Estate', nameAr: 'العقارات' },
    { id: 'electronics', name: 'Electronics', nameAr: 'الإلكترونيات' },
    { id: 'fashion', name: 'Fashion', nameAr: 'الموضة' },
    { id: 'home', name: 'Home & Kitchen', nameAr: 'المنزل والمطبخ' },
    { id: 'beauty', name: 'Beauty & Personal Care', nameAr: 'الجمال والرعاية الشخصية' },
    { id: 'kids', name: 'Kids', nameAr: 'الأطفال' },
    { id: 'food', name: 'Food & Beverages', nameAr: 'الطعام والمشروبات' }
  ])
  const selectedCategory = ref('all')
  const searchQuery = ref('')
  const loading = ref(false)
  const error = ref(null)
  const totalProducts = ref(0)
  const currentPage = ref(1)
  const perPage = 10

  // Helper function to map database fields to frontend fields
  const mapProductFields = (dbProduct) => {
    return {
      id: dbProduct.id,
      seller_id: dbProduct.seller_id,
      name: dbProduct.name || 'Unknown Product',
      name_ar: dbProduct.name_ar || 'منتج غير معروف',
      description: dbProduct.description || '',
      description_ar: dbProduct.description_ar || '',
      price: dbProduct.price || 0,
      original_price: dbProduct.original_price,
      image: dbProduct.image || 'https://via.placeholder.com/300',
      category: dbProduct.category || 'Uncategorized',
      in_stock: dbProduct.in_stock || false,
      is_new: dbProduct.is_new || false,
      is_on_sale: dbProduct.is_on_sale || false,
      rating: dbProduct.rating || 0,
      reviews: dbProduct.reviews || 0,
      created_at: dbProduct.created_at,
      updated_at: dbProduct.updated_at
    }
  }

  // Getters
  const filteredProducts = computed(() => {
    let filtered = [...products.value]

    // Filter by category
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory.value)
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
      // Build query params for backend
      const params = { page, limit: perPage };
      if (category && category !== 'all') params.category = category;
      if (search) params.search = search;
      const response = await api.get('/products', { params });
      // Backend returns { products, total, page, totalPages }
      const { products: backendProducts, total } = response.data;
      // Map backend products to frontend format
      products.value = backendProducts.map(p => ({
        id: p.id,
        name: p.title || p.name || 'Unknown Product',
        name_ar: p.title || p.name_ar || 'منتج غير معروف',
        description: p.description || '',
        price: p.price || 0,
        image: p.image || 'https://via.placeholder.com/300',
        category: (p.category && (p.category.id || p.category.name)) ? (p.category.id || p.category.name) : (p.category || 'Uncategorized'),
        in_stock: p.stock > 0,
        is_new: false,
        is_on_sale: false,
        rating: 0,
        reviews: 0
      }));
      totalProducts.value = total || products.value.length;
      return { products: products.value, total: totalProducts.value };
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching products:', err);
      products.value = [];
      totalProducts.value = 0;
      return { products: [], total: 0 };
    } finally {
      loading.value = false;
    }
  }

  const fetchCategories = async () => {
    // Categories are hardcoded for now, but could be fetched from Supabase if needed
    return categories.value
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

  // Initialize with some sample data if no products exist
  const initializeWithSampleData = () => {
    if (products.value.length === 0) {
      products.value = [
        {
          id: '1',
          name: 'Sample Product',
          name_ar: 'منتج تجريبي',
          description: 'This is a sample product',
          price: 1000,
          image: 'https://via.placeholder.com/300',
          category: 'electronics',
          in_stock: true,
          is_new: true,
          is_on_sale: false
        }
      ]
      totalProducts.value = 1
    }
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
    clearError,
    initializeWithSampleData
  }
}) 