import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

/**
 * Centralized store operations composable following Supabase best practices
 * - Uses Supabase JS client (not manual fetch)
 * - Handles JWT expiration gracefully
 * - Avoids CORS issues by using official client
 * - Proper session validation and refresh
 */
export function useStores() {
  const authStore = useAuthStore()
  const router = useRouter()
  
  // State
  const stores = ref([])
  const userStores = ref([])
  const currentStore = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalStores = computed(() => stores.value.length)
  const userTotalStores = computed(() => userStores.value.length)

  /**
   * Enhanced session validation with automatic refresh
   * Handles JWT expiration gracefully
   */
  const validateSession = async () => {
    try {
      // 1. Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication failed. Please log in again.')
      }
      
      // 2. Check if session exists and is valid
      if (!session || !session.user) {
        console.log('No valid session found')
        return null
      }
      
      // 3. Check if token is expired (optional - Supabase handles this automatically)
      const now = Math.floor(Date.now() / 1000)
      if (session.expires_at && session.expires_at < now) {
        console.log('Token expired, attempting refresh...')
        
        // Attempt to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !refreshData.session) {
          console.log('Session refresh failed')
          return null
        }
        
        console.log('Session refreshed successfully')
        return refreshData.session
      }
      
      console.log('Valid session found', { 
        userId: session.user.id, 
        email: session.user.email,
        expiresAt: new Date(session.expires_at * 1000).toISOString()
      })
      
      return session
    } catch (err) {
      console.error('Session validation error:', err)
      return null
    }
  }

  /**
   * Handle authentication errors consistently
   */
  const handleAuthError = (error) => {
    console.error('Authentication error:', error)
    
    // Clear local auth state
    authStore.user = null
    
    // Redirect to login
    const currentLocale = router.currentRoute.value.meta?.locale || 'en'
    router.push(`/${currentLocale}/login`)
    
    throw new Error('Please log in to continue')
  }

  /**
   * Fetch all stores (public access)
   */
  const fetchAllStores = async () => {
    try {
      loading.value = true
      error.value = null

      // Public access - no authentication required
      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      stores.value = data || []
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching stores:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch user's stores (requires authentication)
   */
  const fetchUserStores = async () => {
    try {
      loading.value = true
      error.value = null

      // Validate session first
      const session = await validateSession()
      if (!session) {
        throw new Error('User not authenticated')
      }

      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      userStores.value = data || []
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching user stores:', err)
      
      // Handle auth errors
      if (err.message.includes('not authenticated') || err.message.includes('Authentication failed')) {
        handleAuthError(err)
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch store by ID (public access)
   */
  const fetchStoreById = async (storeId) => {
    try {
      loading.value = true
      error.value = null

      if (!storeId) {
        throw new Error('Store ID is required')
      }

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

  /**
   * Create a new store (requires authentication)
   * Follows all Supabase best practices
   */
  const createStore = async (storeData) => {
    try {
      loading.value = true
      error.value = null

      // 1. Validate session first
      const session = await validateSession()
      if (!session) {
        throw new Error('User not authenticated')
      }

      // 2. Input validation
      if (!storeData || typeof storeData !== 'object') {
        throw new Error('Invalid store data provided')
      }

      const storeName = storeData.name?.trim()
      if (!storeName || storeName.length === 0) {
        throw new Error('Store name is required')
      }

      if (storeName.length > 100) {
        throw new Error('Store name must be less than 100 characters')
      }

      const storeDescription = storeData.description?.trim() || null
      if (storeDescription && storeDescription.length > 500) {
        throw new Error('Store description must be less than 500 characters')
      }

      // 3. Prepare store data
      const storeInsertData = {
        owner_id: session.user.id, // Uses authenticated user's ID
        name: storeName,
        description: storeDescription
      }

      console.log('Creating store with data:', { 
        ...storeInsertData, 
        owner_id: '***' // Hide user ID in logs for security
      })

      // 4. Database insert using Supabase client (JWT automatically attached)
      const { data, error: createError } = await supabase
        .from('stores')
        .insert(storeInsertData)
        .select()
        .single()

      if (createError) {
        console.error('Database insert error:', createError)
        
        // Handle specific error types
        if (createError.code === '23505') {
          if (createError.message.includes('unique_owner')) {
            throw new Error('You already have a store. Each user can only create one store.')
          }
          throw new Error('This store name is already taken. Please choose a different name.')
        } else if (createError.code === '23503') {
          throw new Error('Invalid user account. Please log out and log in again.')
        } else if (createError.code === '42501') {
          throw new Error('Permission denied. Please ensure you have the necessary permissions to create a store.')
        } else {
          throw new Error(`Failed to create store: ${createError.message}`)
        }
      }

      if (!data) {
        throw new Error('Store was created but no data was returned. Please refresh the page.')
      }

      console.log('Store created successfully:', data.id)

      // 5. Update local state
      try {
        if (Array.isArray(userStores.value)) {
          userStores.value.unshift(data)
        } else {
          userStores.value = [data]
        }

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
      const errorMessage = err.message || 'An unexpected error occurred while creating the store'
      error.value = errorMessage
      console.error('Error creating store:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      })
      
      // Handle auth errors
      if (err.message.includes('not authenticated') || err.message.includes('Authentication failed')) {
        handleAuthError(err)
      }
      
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Upload store image (requires authentication)
   * Uses Supabase Storage with proper authentication
   */
  const uploadStoreImage = async (file, bucketName, fileName) => {
    try {
      // Validate session first
      const session = await validateSession()
      if (!session) {
        throw new Error('User not authenticated')
      }

      // Validate bucket name
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

      console.log('Uploading image:', { bucketName, fileName, fileSize: file.size })

      // Upload file to Supabase storage (JWT automatically attached)
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        
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

      console.log('Image uploaded successfully:', publicUrl)
      return publicUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      
      // Handle auth errors
      if (err.message.includes('not authenticated') || err.message.includes('Authentication failed')) {
        handleAuthError(err)
      }
      
      throw new Error(`Failed to upload image: ${err.message}`)
    }
  }

  /**
   * Create store with images (requires authentication)
   * Handles both store creation and image uploads
   */
  const createStoreWithImages = async (storeData, logoFile = null, bannerFile = null) => {
    try {
      loading.value = true
      error.value = null

      // Validate session first
      const session = await validateSession()
      if (!session) {
        throw new Error('User not authenticated')
      }

      console.log('Creating store with images:', {
        hasLogo: !!logoFile,
        hasBanner: !!bannerFile,
        storeName: storeData.name
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

      // Create store using the main createStore function
      return await createStore(finalStoreData)
    } catch (err) {
      error.value = err.message
      console.error('Error creating store with images:', err)
      
      // Handle auth errors
      if (err.message.includes('not authenticated') || err.message.includes('Authentication failed')) {
        handleAuthError(err)
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update store (requires authentication)
   */
  const updateStore = async (storeId, updates) => {
    try {
      loading.value = true
      error.value = null

      // Validate session first
      const session = await validateSession()
      if (!session) {
        throw new Error('User not authenticated')
      }

      const { data, error: updateError } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
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
      
      // Handle auth errors
      if (err.message.includes('not authenticated') || err.message.includes('Authentication failed')) {
        handleAuthError(err)
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete store (requires authentication)
   */
  const deleteStore = async (storeId) => {
    try {
      loading.value = true
      error.value = null

      // Validate session first
      const session = await validateSession()
      if (!session) {
        throw new Error('User not authenticated')
      }

      const { error: deleteError } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId)

      if (deleteError) throw deleteError

      // Remove from local state
      userStores.value = userStores.value.filter(s => s.id !== storeId)
      stores.value = stores.value.filter(s => s.id !== storeId)
      
      if (currentStore.value?.id === storeId) {
        currentStore.value = null
      }
    } catch (err) {
      error.value = err.message
      console.error('Error deleting store:', err)
      
      // Handle auth errors
      if (err.message.includes('not authenticated') || err.message.includes('Authentication failed')) {
        handleAuthError(err)
      }
      
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility functions
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
    createStoreWithImages,
    updateStore,
    deleteStore,
    uploadStoreImage,
    
    // Utilities
    clearError,
    clearCurrentStore,
    validateSession
  }
}
