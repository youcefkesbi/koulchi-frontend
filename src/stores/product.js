import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api.service';

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([]);
  const categories = ref([]);
  const currentProduct = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const fetchProducts = async (params = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.get('/products', { params });
      products.value = response.data.data.products;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch products';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchProduct = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.get(`/products/${id}`);
      currentProduct.value = response.data.data.product;
      return response.data.data.product;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (productData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.post('/products', productData);
      products.value.unshift(response.data.data.product);
      return response.data.data.product;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id, productData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.patch(`/products/${id}`, productData);
      const updatedProduct = response.data.data.product;
      
      const index = products.value.findIndex(p => p.id === id);
      if (index !== -1) {
        products.value[index] = updatedProduct;
      }
      
      if (currentProduct.value?.id === id) {
        currentProduct.value = updatedProduct;
      }
      
      return updatedProduct;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      await api.delete(`/products/${id}`);
      products.value = products.value.filter(p => p.id !== id);
      
      if (currentProduct.value?.id === id) {
        currentProduct.value = null;
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      categories.value = response.data.data.categories;
      return response.data.data.categories;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch categories';
      throw err;
    }
  };

  const getUserProducts = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.get('/products/user/my-products');
      return response.data.data.products;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch user products';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    products,
    categories,
    currentProduct,
    loading,
    error,
    
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    getUserProducts,
  };
});
