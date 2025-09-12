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

      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !session.user) {
        console.log('Fetch user stores request: User not authenticated')
        throw new Error('User not authenticated')
      }
      
      console.log('Fetch user stores request: User authenticated', { 
        userId: session.user.id, 
        email: session.user.email 
      })
      
      const user = session.user

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

      // 1. Enhanced Authentication Validation using getSession()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication failed. Please log in again.')
      }
      
      if (!session || !session.user) {
        console.log('Store creation request: User not authenticated')
        throw new Error('User not authenticated')
      }
      
      console.log('Store creation request: User authenticated', { 
        userId: session.user.id, 
        email: session.user.email 
      })
      
      const user = session.user

      // 2. Enhanced Input Validation
      if (!storeData || typeof storeData !== 'object') {
        throw new Error('Invalid store data provided')
      }

      // Check if pack is provided
      if (!storeData.pack_id) {
        throw new Error('Pack selection is required')
      }

      // Validate pack limits
      const { data: packData, error: packError } = await supabase
        .from('packs')
        .select('*')
        .eq('id', storeData.pack_id)
        .single()

      if (packError || !packData) {
        throw new Error('Invalid pack selected')
      }

      // Check if user can create store with this pack
      const canCreate = await supabase.rpc('can_user_create_store', {
        p_user_id: user.id,
        p_pack_name: packData.name
      })

      if (canCreate.error || !canCreate.data) {
        throw new Error('You do not have the required verifications for this pack')
      }

      // Validate store name (only required for Pro Pack)
      if (packData.name === 'Pro Pack') {
        const storeName = storeData.name?.trim()
        if (!storeName || storeName.length === 0) {
          throw new Error('Store name is required for Pro Pack')
        }
        if (storeName.length > 100) {
          throw new Error('Store name must be less than 100 characters')
        }
      }

      const storeDescription = storeData.description?.trim() || null
      if (storeDescription && storeDescription.length > 500) {
        throw new Error('Store description must be less than 500 characters')
      }

      // Validate location
      if (!storeData.location?.trim()) {
        throw new Error('Store location is required')
      }

      // 3. Prepare store data with proper validation and null handling
      const storeInsertData = {
        owner_id: user.id,
        pack_id: storeData.pack_id,
        name: packData.name === 'Pro Pack' ? storeData.name?.trim() : null,
        description: storeDescription,
        location: storeData.location.trim(),
        external_buttons: storeData.external_buttons || [],
        customization_settings: storeData.customization_settings || {},
        logo_url: storeData.logo_url || null,
        banner_url: storeData.banner_url || null,
        status: 'pending' // All stores start as pending for review
      }

      console.log('Creating store with data:', { 
        ...storeInsertData, 
        owner_id: '***' // Hide user ID in logs for security
      })

      // 4. Database Insert with Enhanced Error Handling
      const { data, error: createError } = await supabase
        .from('stores')
        .insert(storeInsertData)
        .select()
        .single()

      if (createError) {
        console.error('Database insert error:', createError)
        
        // Provide user-friendly error messages based on error type
        if (createError.code === '23505') {
          // Unique constraint violation
          if (createError.message.includes('unique_owner')) {
            throw new Error('You already have a store. Each user can only create one store.')
          }
          throw new Error('This store name is already taken. Please choose a different name.')
        } else if (createError.code === '23503') {
          // Foreign key constraint violation
          throw new Error('Invalid user account or pack. Please log out and log in again.')
        } else if (createError.code === '42501') {
          // Permission denied
          throw new Error('Permission denied. Please ensure you have the necessary permissions to create a store.')
        } else if (createError.message?.includes('permission denied')) {
          throw new Error('Permission denied. Database permissions may not be properly configured.')
        } else {
          throw new Error(`Failed to create store: ${createError.message}`)
        }
      }

      if (!data) {
        throw new Error('Store was created but no data was returned. Please refresh the page.')
      }

      console.log('Store created successfully:', data.id)

      // 5. Update Local State (Optimistic Updates)
      try {
        // Add to user stores (at the beginning for newest first)
        if (Array.isArray(userStores.value)) {
          userStores.value.unshift(data)
        } else {
          userStores.value = [data]
        }

        // Add to all stores (at the beginning for newest first)
        if (Array.isArray(stores.value)) {
          stores.value.unshift(data)
        } else {
          stores.value = [data]
        }
      } catch (stateError) {
        console.warn('Error updating local state:', stateError)
        // Don't throw here as the store was successfully created
      }

      return data
    } catch (err) {
      // Enhanced Error Handling
      const errorMessage = err.message || 'An unexpected error occurred while creating the store'
      error.value = errorMessage
      console.error('Error creating store:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      })
      throw new Error(errorMessage)
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

      // Upload file to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        
        // Provide specific error messages based on error type
        if (uploadError.message?.includes('already exists')) {
          throw new Error('A file with this name already exists. Please try again.')
        } else if (uploadError.message?.includes('permission denied')) {
          throw new Error('Permission denied. Please check your account permissions.')
        } else if (uploadError.message?.includes('quota')) {
          throw new Error('Storage quota exceeded. Please contact support.')
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded file')
      }

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

  const createStoreWithImages = async (storeData, logoFile = null, bannerFile = null) => {
    try {
      loading.value = true
      error.value = null

      // 1. Enhanced Authentication Validation using getSession()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication failed. Please log in again.')
      }
      
      if (!session || !session.user) {
        console.log('Store creation with images request: User not authenticated')
        throw new Error('User not authenticated')
      }
      
      console.log('Store creation with images request: User authenticated', { 
        userId: session.user.id, 
        email: session.user.email 
      })

      // Upload images in parallel for better performance
      const uploadPromises = []
      
      if (logoFile instanceof File) {
        const fileName = `logo-${Date.now()}-${Math.random().toString(36).substring(2)}-${logoFile.name}`
        uploadPromises.push(uploadStoreImage(logoFile, 'stores-logos', fileName))
      } else {
        uploadPromises.push(Promise.resolve(null))
      }

      if (bannerFile instanceof File) {
        const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(2)}-${bannerFile.name}`
        uploadPromises.push(uploadStoreImage(bannerFile, 'stores-banners', fileName))
      } else {
        uploadPromises.push(Promise.resolve(null))
      }

      const [logoUrl, bannerUrl] = await Promise.all(uploadPromises)

      // Prepare store data with uploaded image URLs
      const finalStoreData = {
        ...storeData,
        logo_url: logoUrl,
        banner_url: bannerUrl
      }

      // Create store using existing createStore function
      return await createStore(finalStoreData)
    } catch (err) {
      error.value = err.message
      console.error('Error creating store with images:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateStoreWithImages = async (storeId, updates, logoFile = null, bannerFile = null) => {
    try {
      loading.value = true
      error.value = null

      // Upload images in parallel for better performance
      const uploadPromises = []
      
      if (logoFile instanceof File) {
        const fileName = `logo-${storeId}-${Date.now()}-${logoFile.name}`
        uploadPromises.push(uploadStoreImage(logoFile, 'stores-logos', fileName))
      } else {
        uploadPromises.push(Promise.resolve(updates.logo_url))
      }

      if (bannerFile instanceof File) {
        const fileName = `banner-${storeId}-${Date.now()}-${bannerFile.name}`
        uploadPromises.push(uploadStoreImage(bannerFile, 'stores-banners', fileName))
      } else {
        uploadPromises.push(Promise.resolve(updates.banner_url))
      }

      const [logoUrl, bannerUrl] = await Promise.all(uploadPromises)

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

  // Check if user owns a specific store
  const checkStoreOwnership = async (storeId, userId) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('owner_id')
        .eq('id', storeId)
        .single()

      if (error) {
        console.error('Error checking store ownership:', error)
        return false
      }

      return data && data.owner_id === userId
    } catch (err) {
      console.error('Error checking store ownership:', err)
      return false
    }
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
    createStoreWithImages,
    updateStore,
    deleteStore,
    uploadStoreImage,
    deleteStoreImage,
    updateStoreWithImages,
    clearError,
    clearCurrentStore,
    checkStoreOwnership
  }
})
