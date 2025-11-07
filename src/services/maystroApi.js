/**
 * Maystro Delivery API Service
 * 
 * This service handles integration with Maystro Delivery API for product management.
 * Each store owner will have their own Maystro account and API token.
 */

const MAYSTRO_BASE_URL = 'https://backend.maystro-delivery.com/api/stores'

/**
 * Maystro API client class
 * 
 * Note: Store-specific token implementation pending
 */
class MaystroAPI {
  constructor() {
    this.baseUrl = MAYSTRO_BASE_URL
  }

  /**
   * Get store-specific API token
   * 
   * TODO: Implement to fetch from store's Maystro credentials
   */
  async getStoreToken(storeId) {
    // TODO: Fetch from stores table: maystro_api_token
    throw new Error('Store-specific Maystro integration not yet implemented. Each store needs their own Maystro account and API token.')
  }

  /**
   * Make authenticated request to Maystro API
   */
  async makeRequest(endpoint, options = {}) {
    try {
      const storeId = options.storeId
      if (!storeId) {
        throw new Error('Store ID is required for Maystro API calls')
      }

      const token = await this.getStoreToken(storeId)
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Maystro API request failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Maystro API error:', error)
      throw error
    }
  }

  /**
   * Get all products for a store
   */
  async getProducts(storeId, page = 1) {
    return await this.makeRequest(`/product?page=${page}`, {
      method: 'GET',
      storeId
    })
  }

  /**
   * Get single product
   */
  async getProduct(storeId, productId) {
    return await this.makeRequest(`/product/${productId}/`, {
      method: 'GET',
      storeId
    })
  }

  /**
   * Create product
   */
  async createProduct(storeId, data) {
    return await this.makeRequest('/product/', {
      method: 'POST',
      body: JSON.stringify(data),
      storeId
    })
  }

  /**
   * Update product (full update)
   */
  async updateProduct(storeId, productId, data) {
    return await this.makeRequest(`/product/${productId}/`, {
        method: 'PUT',
      body: JSON.stringify(data),
      storeId
    })
  }

  /**
   * Partial update product
   */
  async patchProduct(storeId, productId, data) {
    return await this.makeRequest(`/product/${productId}/`, {
        method: 'PATCH',
      body: JSON.stringify(data),
      storeId
    })
  }

  /**
   * Delete product
   */
  async deleteProduct(storeId, productId) {
    return await this.makeRequest(`/product/${productId}/`, {
        method: 'DELETE',
      storeId
    })
  }
}

/**
 * Data transformation utilities
 */

/**
 * Transform product data to Maystro format
 * 
 * @param {Object} product - Product data from frontend
 * @returns {Object} - Data formatted for Maystro API
 */
export const transformToMaystro = (product) => ({
  store_id: product.store_id,
  logistical_description: product.description,
  product_id: product.id, // Maystro uses product_id as an optional field
  // Note: Maystro API has limited fields compared to our product schema
  // Additional fields like price, category, stock will need to be managed separately
})

/**
 * Transform Maystro product data to frontend format
 * 
 * @param {Object} maystroProduct - Product data from Maystro API
 * @returns {Object} - Data formatted for frontend
 */
export const transformFromMaystro = (maystroProduct) => ({
  id: maystroProduct.id,
  name: maystroProduct.logistical_description,
  description: maystroProduct.logistical_description,
  store_id: maystroProduct.store,
  created_at: maystroProduct.created_at,
  updated_at: maystroProduct.updated_at,
  // Default values for fields not present in Maystro API
  price: 0, // Maystro API does not provide price
  stock_quantity: 0, // Maystro API does not provide stock_quantity
  status: maystroProduct.deleted ? 'inactive' : 'approved', // Map Maystro's deleted to your status
  category_id: null, // Maystro API does not provide category_id
  category_name: 'No Category', // Default category name
  seller_id: null, // Maystro API does not provide seller_id
  seller_name: 'Unknown Seller', // Default seller name
  sold_count: 0, // Maystro API does not provide sold_count
  is_new: false, // Default value
  product_image: maystroProduct.picture || '', // Use 'picture' if available
  thumbnail_url: maystroProduct.picture || '',
})

// Export API instance
export const maystroApi = new MaystroAPI()

// Export the class for testing
export { MaystroAPI }
