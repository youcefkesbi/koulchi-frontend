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

  // Search stores by name or description
  const searchStores = async (query) => {
    try {
      loading.value = true
      error.value = null
      
      if (!query || !query.trim()) {
        // If no query, return all stores
        return await fetchAllStores()
      }
      
      const searchTerm = query.trim()
      
      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .eq('status', 'approved')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError
      
      return Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err?.message || 'Failed to search stores'
      console.error('Error searching stores:', err)
      return []
    } finally {
      loading.value = false
    }
  }

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
        throw new Error('User not authenticated')
      }
      
      const user = session.user

      // Uses the public SELECT policy but with explicit filter by owner_id
      // This ensures we only get the user's own stores
      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'approved')  // Only fetch approved stores
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Error fetching user stores:', fetchError)
        throw fetchError
      }

      console.log('🔍 Debug - Raw approved store data:', data)
      console.log('🔍 Debug - User ID:', user.id)
      
      // Log approved store details for debugging
      if (data && data.length > 0) {
        data.forEach((store, index) => {
          console.log(`🔍 Debug - Approved Store ${index + 1}:`, {
            id: store.id,
            name: store.name,
            status: store.status,
            owner_id: store.owner_id
          })
        })
      } else {
        console.log('🔍 Debug - No approved stores found for user')
      }

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

      // Fetch store with all necessary information using the store_details view
      const { data, error: fetchError } = await supabase
        .from('store_details')
        .select('*')
        .eq('id', storeId)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching store details:', fetchError)
        throw fetchError
      }

      console.log('🔍 Debug - Store details from view:', data)

      // Transform the data to include computed properties
      const storeData = {
        ...data,
        // Determine pack type based on store name (as per user's suggestion)
        isProPack: !!data.name && data.name.trim() !== '',
        packType: (!!data.name && data.name.trim() !== '') ? 'Pro Pack' : 'Basic Pack',
        // Add computed properties for easier access
        displayName: data.name || `Store #${data.id?.slice(-8)}`,
        hasBanner: !!data.banner_url,
        hasLogo: !!data.logo_url,
        hasLocation: !!data.location,
        hasDescription: !!data.description
      }

      console.log('🔍 Debug - Transformed store data:', storeData)
      currentStore.value = storeData
      return storeData
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
        throw new Error('User not authenticated')
      }
      
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
        throw new Error('User not authenticated')
      }

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

  // Get store status and rejection reason
  const getStoreStatus = async (storeId) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('status, rejection_reason')
        .eq('id', storeId)
        .single()

      if (error) {
        console.error('Error fetching store status:', error)
        return { status: 'unknown', rejection_reason: null }
      }

      return {
        status: data?.status || 'pending',
        rejection_reason: data?.rejection_reason || null
      }
    } catch (err) {
      console.error('Error fetching store status:', err)
      return { status: 'unknown', rejection_reason: null }
    }
  }

  // Get user store status using the optimized RPC function
  const getUserStoreStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !session.user) {
        return { store_id: null, status: null, can_create: true }
      }

      const { data, error } = await supabase.rpc('get_user_store_status', {
        auth_uid: session.user.id
      })

      if (error) {
        console.error('Error fetching user store status:', error)
        return { store_id: null, status: null, can_create: true }
      }

      // The function returns one row (or none). Handle defensively.
      const result = Array.isArray(data) ? (data[0] || null) : (data || null)
      return {
        store_id: result?.store_id || null,
        status: result?.status || null,
        // respect false; only default to true when no result
        can_create: result ? !!result.can_create : true
      }
    } catch (err) {
      console.error('Error fetching user store status:', err)
      return { store_id: null, status: null, can_create: true }
    }
  }

  // Store statistics functions
  const storeStatistics = ref({
    totalOrders: 0,
    totalProducts: 0,
    totalSales: 0,
    totalVisitors: 0,
    storeId: null,
    storeName: null
  })

  const fetchStoreStatistics = async (storeId = null) => {
    try {
      loading.value = true
      error.value = null

      let functionName, params
      
      if (storeId) {
        // Get statistics for a specific store
        functionName = 'get_store_statistics'
        params = { store_uuid: storeId }
      } else {
        // Get statistics for the authenticated user's store
        functionName = 'get_my_store_statistics'
        params = {}
      }

      const { data, error: statsError } = await supabase.rpc(functionName, params)

      if (statsError) {
        console.error('Error fetching store statistics:', statsError)
        throw statsError
      }

      if (data && data.length > 0) {
        const stats = data[0]
        storeStatistics.value = {
          totalOrders: stats.total_orders || 0,
          totalProducts: stats.total_products || 0,
          totalSales: parseFloat(stats.total_sales || 0),
          totalVisitors: stats.total_visitors || 0,
          storeId: stats.store_id || null,
          storeName: stats.store_name || null
        }
      } else {
        // No store found or no data
        storeStatistics.value = {
          totalOrders: 0,
          totalProducts: 0,
          totalSales: 0,
          totalVisitors: 0,
          storeId: null,
          storeName: null
        }
      }

      return storeStatistics.value
    } catch (err) {
      error.value = err.message
      console.error('Error fetching store statistics:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStoreTotalOrders = async (storeId) => {
    try {
      const { data, error } = await supabase.rpc('get_store_total_orders', {
        store_uuid: storeId
      })

      if (error) throw error
      return data || 0
    } catch (err) {
      console.error('Error fetching total orders:', err)
      throw err
    }
  }

  const getStoreTotalProducts = async (storeId) => {
    try {
      const { data, error } = await supabase.rpc('get_store_total_products', {
        store_uuid: storeId
      })

      if (error) throw error
      return data || 0
    } catch (err) {
      console.error('Error fetching total products:', err)
      throw err
    }
  }

  const getStoreTotalSales = async (storeId) => {
    try {
      const { data, error } = await supabase.rpc('get_store_total_sales', {
        store_uuid: storeId
      })

      if (error) throw error
      return parseFloat(data || 0)
    } catch (err) {
      console.error('Error fetching total sales:', err)
      throw err
    }
  }

  const getStoreTotalVisitors = async (storeId) => {
    try {
      const { data, error } = await supabase.rpc('get_store_total_visitors', {
        store_uuid: storeId
      })

      if (error) throw error
      return data || 0
    } catch (err) {
      console.error('Error fetching total visitors:', err)
      throw err
    }
  }

  return {
    // State
    stores,
    userStores,
    currentStore,
    loading,
    error,
    storeStatistics,
    
    // Getters
    totalStores,
    userTotalStores,
    
    // Actions
    fetchAllStores,
    fetchUserStores,
    searchStores,
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
    checkStoreOwnership,
    getStoreStatus,
    getUserStoreStatus,
    
    // Statistics
    fetchStoreStatistics,
    getStoreTotalOrders,
    getStoreTotalProducts,
    getStoreTotalSales,
    getStoreTotalVisitors
  }
})

// Export the store function for compatibility
export const useStoresStore = useStoreStore