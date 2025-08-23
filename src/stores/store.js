import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useStoreStore = defineStore('store', () => {
  const stores = ref([])
  const userStores = ref([])
  const currentStore = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalStores = computed(() => stores.value.length)
  const userTotalStores = computed(() => userStores.value.length)

  // Actions
  const fetchAllStores = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      stores.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching stores:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUserStores = async () => {
    try {
      loading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      userStores.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching user stores:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchStoreById = async (storeId) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

      if (fetchError) throw fetchError

      currentStore.value = data
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching store:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createStore = async (storeData) => {
    try {
      loading.value = true
      error.value = null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error: createError } = await supabase
        .from('stores')
        .insert({
          owner_id: user.id,
          name: storeData.name,
          description: storeData.description,
          logo_url: storeData.logo_url,
          banner_url: storeData.banner_url
        })
        .select()
        .single()

      if (createError) throw createError

      userStores.value.unshift(data)
      stores.value.unshift(data)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error creating store:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateStore = async (storeId, updates) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update in both arrays
      const updateArray = (arr) => {
        const index = arr.findIndex(s => s.id === storeId)
        if (index !== -1) {
          arr[index] = data
        }
      }

      updateArray(userStores.value)
      updateArray(stores.value)
      
      if (currentStore.value?.id === storeId) {
        currentStore.value = data
      }

      return data
    } catch (err) {
      error.value = err.message
      console.error('Error updating store:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteStore = async (storeId) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId)

      if (deleteError) throw deleteError

      // Remove from both arrays
      userStores.value = userStores.value.filter(s => s.id !== storeId)
      stores.value = stores.value.filter(s => s.id !== storeId)
      
      if (currentStore.value?.id === storeId) {
        currentStore.value = null
      }
    } catch (err) {
      error.value = err.message
      console.error('Error deleting store:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadStoreImage = async (file, bucketName, fileName) => {
    try {
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      throw err
    }
  }

  const deleteStoreImage = async (fileName, bucketName) => {
    try {
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([fileName])

      if (deleteError) throw deleteError
    } catch (err) {
      console.error('Error deleting image:', err)
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentStore = () => {
    currentStore.value = null
  }

  return {
    // State
    stores,
    userStores,
    currentStore,
    loading,
    error,
    
    // Getters
    totalStores,
    userTotalStores,
    
    // Actions
    fetchAllStores,
    fetchUserStores,
    fetchStoreById,
    createStore,
    updateStore,
    deleteStore,
    uploadStoreImage,
    deleteStoreImage,
    clearError,
    clearCurrentStore
  }
})
