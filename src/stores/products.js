import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'
import axios from 'axios';

export const fetchCategories = async () => {
  const response = await axios.get('http://localhost:5000/api/categories');
  return response.data;
};

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  // const categories = ref([
  //   { id: 'all', name: 'All Products', nameFr:'Tous les produits', nameAr: 'جميع المنتجات' },
  //   { id: 'cars', name: 'Cars', nameAr: 'السيارات' },
  //   { id: 'realestate', name: 'Real Estate', nameAr: 'العقارات' },
  //   { id: 'electronics', name: 'Electronics', nameAr: 'الإلكترونيات' },
  //   { id: 'fashion', name: 'Fashion', nameAr: 'الموضة' },
  //   { id: 'home', name: 'Home & Kitchen', nameAr: 'المنزل والمطبخ' },
  //   { id: 'beauty', name: 'Beauty & Personal Care', nameAr: 'الجمال والرعاية الشخصية' },
  //   { id: 'kids', name: 'Kids', nameAr: 'الأطفال' },
  //   { id: 'food', name: 'Food & Beverages', nameAr: 'الطعام والمشروبات' }
  // ])

  const selectedCategory = ref('all')
  const searchQuery = ref('')
  const loading = ref(false)
  const error = ref(null)

  // Helper function to map database fields to frontend fields
  const mapProductFields = (dbProduct) => {
    return {
      id: dbProduct.id,
      sellerId: dbProduct.seller_id,
      name: dbProduct.name,
      nameAr: dbProduct.name_ar,
      price: dbProduct.price,
      originalPrice: dbProduct.original_price,
      image: dbProduct.image,
      category: dbProduct.category,
      description: dbProduct.description,
      descriptionAr: dbProduct.description_ar,
      inStock: dbProduct.in_stock,
      isNew: dbProduct.is_new,
      isOnSale: dbProduct.is_on_sale,
      rating: dbProduct.rating,
      reviews: dbProduct.reviews,
      createdAt: dbProduct.created_at
    }
  }

  // Getters
  const filteredProducts = computed(() => {
    let filtered = products.value

    // Filter by category
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory.value)
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
  const fetchProducts = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      // Map database fields to frontend fields
      products.value = (data || []).map(mapProductFields)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProductById = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      return data ? mapProductFields(data) : null
    } catch (err) {
      error.value = err.message
      console.error('Error fetching product:', err)
      return null
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