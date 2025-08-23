import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useSellerStore = defineStore('seller', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalProducts = computed(() => products.value.length)
  const activeProducts = computed(() => products.value.filter(p => p.is_active))
  const inactiveProducts = computed(() => products.value.filter(p => !p.is_active))

  // Actions
  const fetchSellerProducts = async () => {
    try {
      loading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*, categories(name, name_ar)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      products.value = data || []
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

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error: createError } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          name: productData.name,
          price: productData.price,
          category_id: productData.category_id,
          description: productData.description,
          stock_quantity: productData.stock_quantity,
          is_new: productData.is_new,
          store_id: productData.store_id,
          is_active: true
        })
        .select()
        .single()

      if (createError) throw createError

      products.value.unshift(data)
      return data
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

      const { data, error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single()

      if (updateError) throw updateError

      const index = products.value.findIndex(p => p.id === productId)
      if (index !== -1) {
        products.value[index] = data
      }

      return data
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

      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (deleteError) throw deleteError

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
    return await updateProduct(productId, { is_active: isActive })
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