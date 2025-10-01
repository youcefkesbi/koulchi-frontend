import { supabase } from '../lib/supabase'

/**
 * Centralized API service following Supabase best practices
 * - Uses Supabase JS client (not manual fetch)
 * - Handles JWT expiration gracefully
 * - Avoids CORS issues by using official client
 * - Proper session validation and refresh
 */

/**
 * Base API class with common functionality
 */
class BaseAPI {
  constructor() {
    this.supabase = supabase
  }

  /**
   * Validate session before making authenticated requests
   */
  async validateSession() {
    try {
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication failed. Please log in again.')
      }
      
      if (!session || !session.user) {
        throw new Error('User not authenticated')
      }
      
      // Check if token is expired and refresh if needed
      const now = Math.floor(Date.now() / 1000)
      if (session.expires_at && session.expires_at < now) {
        
        const { data: refreshData, error: refreshError } = await this.supabase.auth.refreshSession()
        
        if (refreshError || !refreshData.session) {
          throw new Error('Session refresh failed')
        }
        
        return refreshData.session
      }
      
      return session
    } catch (err) {
      console.error('Session validation error:', err)
      throw err
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error, context = 'API request') {
    console.error(`${context} error:`, error)
    
    if (error.message?.includes('not authenticated') || error.message?.includes('Authentication failed')) {
      // Redirect to login
      const currentLocale = window.location.pathname.split('/')[1] || 'en'
      window.location.href = `/${currentLocale}/login`
      return
    }
    
    throw error
  }
}

/**
 * Stores API service
 */
export class StoresAPI extends BaseAPI {
  /**
   * Fetch all stores (public access)
   */
  async fetchAll() {
    try {
      const { data, error } = await this.supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      this.handleError(err, 'Fetch all stores')
    }
  }

  /**
   * Fetch user's stores (requires authentication)
   */
  async fetchUserStores() {
    try {
      const session = await this.validateSession()
      
      const { data, error } = await this.supabase
        .from('stores')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      this.handleError(err, 'Fetch user stores')
    }
  }

  /**
   * Fetch store by ID (public access)
   */
  async fetchById(storeId) {
    try {
      if (!storeId) {
        throw new Error('Store ID is required')
      }

      const { data, error } = await this.supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      this.handleError(err, 'Fetch store by ID')
    }
  }

  /**
   * Create a new store (requires authentication)
   */
  async create(storeData) {
    try {
      const session = await this.validateSession()
      
      // Validate input
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

      // Prepare store data
      const storeInsertData = {
        owner_id: session.user.id,
        name: storeName,
        description: storeDescription
      }

        ...storeInsertData, 
        owner_id: '***' // Hide user ID in logs for security
      })

      const { data, error } = await this.supabase
        .from('stores')
        .insert(storeInsertData)
        .select()
        .single()

      if (error) {
        // Handle specific error types
        if (error.code === '23505') {
          if (error.message.includes('unique_owner')) {
            throw new Error('You already have a store. Each user can only create one store.')
          }
          throw new Error('This store name is already taken. Please choose a different name.')
        } else if (error.code === '23503') {
          throw new Error('Invalid user account. Please log out and log in again.')
        } else if (error.code === '42501') {
          throw new Error('Permission denied. Please ensure you have the necessary permissions to create a store.')
        } else {
          throw new Error(`Failed to create store: ${error.message}`)
        }
      }

      if (!data) {
        throw new Error('Store was created but no data was returned. Please refresh the page.')
      }

      return data
    } catch (err) {
      this.handleError(err, 'Create store')
    }
  }

  /**
   * Update store (requires authentication)
   */
  async update(storeId, updates) {
    try {
      await this.validateSession()
      
      const { data, error } = await this.supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      this.handleError(err, 'Update store')
    }
  }

  /**
   * Delete store (requires authentication)
   */
  async delete(storeId) {
    try {
      await this.validateSession()
      
      const { error } = await this.supabase
        .from('stores')
        .delete()
        .eq('id', storeId)

      if (error) throw error
    } catch (err) {
      this.handleError(err, 'Delete store')
    }
  }
}

/**
 * Storage API service
 */
export class StorageAPI extends BaseAPI {
  /**
   * Upload file to Supabase storage (requires authentication)
   */
  async uploadFile(file, bucketName, fileName) {
    try {
      await this.validateSession()
      
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


      // Upload file to Supabase storage (JWT automatically attached)
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        if (error.message?.includes('already exists')) {
          throw new Error('A file with this name already exists. Please try again.')
        } else if (error.message?.includes('permission denied')) {
          throw new Error('Permission denied. Please check your account permissions.')
        } else if (error.message?.includes('quota')) {
          throw new Error('Storage quota exceeded. Please contact support.')
        } else {
          throw new Error(`Upload failed: ${error.message}`)
        }
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded file')
      }

      return publicUrl
    } catch (err) {
      this.handleError(err, 'Upload file')
    }
  }

  /**
   * Delete file from Supabase storage (requires authentication)
   */
  async deleteFile(fileName, bucketName) {
    try {
      await this.validateSession()
      
      // Validate bucket name
      if (bucketName !== 'stores-logos' && bucketName !== 'stores-banners') {
        throw new Error(`Invalid bucket name: ${bucketName}. Must be 'stores-logos' or 'stores-banners'`)
      }

      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove([fileName])

      if (error) throw error
    } catch (err) {
      this.handleError(err, 'Delete file')
    }
  }
}

/**
 * Products API service
 */
export class ProductsAPI extends BaseAPI {
  /**
   * Fetch all products (public access)
   */
  async fetchAll(params = {}) {
    try {
      let query = this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Apply filters if provided
      if (params.category_id && params.category_id !== 'all') {
        query = query.eq('category_id', params.category_id)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (err) {
      this.handleError(err, 'Fetch all products')
    }
  }

  /**
   * Fetch product by ID (public access)
   */
  async fetchById(productId) {
    try {
      if (!productId) {
        throw new Error('Product ID is required')
      }
      
      // Validate that the ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(productId)) {
        throw new Error(`Invalid product ID format: ${productId}. Expected UUID format.`)
      }
      
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Product not found')
        }
        throw error
      }
      
      return data
    } catch (err) {
      this.handleError(err, 'Fetch product by ID')
    }
  }

  /**
   * Create product (requires authentication)
   */
  async create(productData) {
    try {
      const session = await this.validateSession()
      
      // Add store_id from authenticated user's store
      const storeData = {
        ...productData,
        store_id: session.user.id // Assuming user has one store
      }
      
      const { data, error } = await this.supabase
        .from('products')
        .insert(storeData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      this.handleError(err, 'Create product')
    }
  }
}

// Export API instances
export const storesAPI = new StoresAPI()
export const storageAPI = new StorageAPI()
export const productsAPI = new ProductsAPI()

// Export the base class for extending
export { BaseAPI }
