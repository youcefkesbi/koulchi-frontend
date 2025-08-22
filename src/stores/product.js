import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([]);
  const categories = ref([]);
  const currentProduct = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const selectedCategory = ref('all');
  const searchQuery = ref('');

  // Actions
  const fetchProducts = async (params = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters if provided
      if (params.category_id && params.category_id !== 'all') {
        query = query.eq('category_id', params.category_id);
      }
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) throw supabaseError;
      
      products.value = data || [];
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch products';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchProduct = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (supabaseError) throw supabaseError;
      
      currentProduct.value = data;
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductById = async (id) => {
    try {
      if (!id) {
        throw new Error('Product ID is required')
      }
      
      // Validate that the ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        throw new Error(`Invalid product ID format: ${id}. Expected UUID format.`)
      }
      
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (supabaseError) {
        if (supabaseError.code === 'PGRST116') {
          throw new Error('Product not found')
        }
        throw supabaseError
      }
      
      return data
    } catch (err) {
      error.value = err.message || 'Failed to fetch product'
      throw err
    }
  }

  const createProduct = async (productData, images = []) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload images to Supabase storage
      const imageUrls = [];
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const fileExt = image.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, image);
          
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
          
          imageUrls.push(publicUrl);
        }
      }

      // Create product with image URLs
      const productWithImages = {
        ...productData,
        seller_id: user.id,
        image_urls: imageUrls
      };

      const { data, error: supabaseError } = await supabase
        .from('products')
        .insert(productWithImages)
        .select()
        .single();
      
      if (supabaseError) throw supabaseError;
      
      products.value.unshift(data);
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to create product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id, productData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      
      if (supabaseError) throw supabaseError;
      
      const updatedProduct = data;
      
      const index = products.value.findIndex(p => p.id === id);
      if (index !== -1) {
        products.value[index] = updatedProduct;
      }
      
      if (currentProduct.value?.id === id) {
        currentProduct.value = updatedProduct;
      }
      
      return updatedProduct;
    } catch (err) {
      error.value = err.message || 'Failed to update product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { error: supabaseError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (supabaseError) throw supabaseError;
      
      products.value = products.value.filter(p => p.id !== id);
      
      if (currentProduct.value?.id === id) {
        currentProduct.value = null;
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (supabaseError) throw supabaseError;
      
      categories.value = data || [];
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch categories';
      throw err;
    }
  };

  const getUserProducts = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (supabaseError) throw supabaseError;
      
      return data || [];
    } catch (err) {
      error.value = err.message || 'Failed to fetch user products';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Filter methods
  const setCategory = (categoryId) => {
    selectedCategory.value = categoryId;
  };

  const setSearchQuery = (query) => {
    searchQuery.value = query;
  };

  const clearFilters = () => {
    selectedCategory.value = 'all';
    searchQuery.value = '';
  };

  // Computed filtered products
  const filteredProducts = computed(() => {
    let filtered = products.value;
    
    // Filter by category
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory.value);
    }
    
    // Filter by search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  });

  // Computed new products (latest 8 products)
  const newProducts = computed(() => {
    return products.value.slice(0, 8);
  });

  // Computed sale products (products with discount)
  const saleProducts = computed(() => {
    // Since we removed original_price, we'll show new products instead
    return products.value.filter(product => 
      product.is_new
    ).slice(0, 8);
  });

  // Initialize store
  const initializeStore = async () => {
    try {
      await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
    } catch (err) {
      console.error('Failed to initialize store:', err);
    }
  };

  return {
    // State
    products,
    categories,
    currentProduct,
    loading,
    error,
    selectedCategory,
    searchQuery,
    filteredProducts,
    newProducts,
    saleProducts,
    
    // Actions
    fetchProducts,
    fetchProduct,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    getUserProducts,
    setCategory,
    setSearchQuery,
    clearFilters,
    initializeStore,
  };
});
