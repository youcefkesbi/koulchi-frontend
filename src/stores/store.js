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

      // Uses the public SELECT policy "everyone can view stores" - no authentication required
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

      // Uses the public SELECT policy but with explicit filter by owner_id
      // This ensures we only get the user's own stores
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

      // Uses the public SELECT policy "everyone can view stores" - any user can view any store
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

      // Prepare store data with proper null handling
      // RLS INSERT policy ensures owner_id must equal auth.uid()
      const storeInsertData = {
        owner_id: user.id,
        name: storeData.name,
        description: storeData.description || null,
        logo_url: storeData.logo_url || null,
        banner_url: storeData.banner_url || null
      }

      const { data, error: createError } = await supabase
        .from('stores')
        .insert(storeInsertData)
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

      // RLS UPDATE policy ensures only owner can update their store (owner_id = auth.uid())
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

      // RLS DELETE policy ensures only owner can delete their store (owner_id = auth.uid())
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
      // Validate bucket name to ensure correct storage location
      if (bucketName !== 'stores-logos' && bucketName !== 'stores-banners') {
        throw new Error(`Invalid bucket name: ${bucketName}. Must be 'stores-logos' or 'stores-banners'`)
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB')
      }

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
      throw new Error(`Failed to upload image: ${err.message}`)
    }
  }

  const deleteStoreImage = async (fileName, bucketName) => {
    try {
      // Validate bucket name
      if (bucketName !== 'stores-logos' && bucketName !== 'stores-banners') {
        throw new Error(`Invalid bucket name: ${bucketName}. Must be 'stores-logos' or 'stores-banners'`)
      }

      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([fileName])

      if (deleteError) throw deleteError
    } catch (err) {
      console.error('Error deleting image:', err)
      throw new Error(`Failed to delete image: ${err.message}`)
    }
  }

  const updateStoreWithImages = async (storeId, updates, logoFile = null, bannerFile = null) => {
    try {
      loading.value = true
      error.value = null

      let logoUrl = updates.logo_url
      let bannerUrl = updates.banner_url

      // Handle logo upload if provided
      if (logoFile instanceof File) {
        const fileName = `logo-${storeId}-${Date.now()}-${logoFile.name}`
        logoUrl = await uploadStoreImage(logoFile, 'stores-logos', fileName)
      }

      // Handle banner upload if provided
      if (bannerFile instanceof File) {
        const fileName = `banner-${storeId}-${Date.now()}-${bannerFile.name}`
        bannerUrl = await uploadStoreImage(bannerFile, 'stores-banners', fileName)
      }

      // Update store data with new URLs
      const updateData = {
        ...updates,
        logo_url: logoUrl,
        banner_url: bannerUrl
      }

      // RLS UPDATE policy ensures only owner can update their store (owner_id = auth.uid())
      const { data, error: updateError } = await supabase
        .from('stores')
        .update(updateData)
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
      console.error('Error updating store with images:', err)
      throw err
    } finally {
      loading.value = false
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
    updateStoreWithImages,
    clearError,
    clearCurrentStore
  }
})
