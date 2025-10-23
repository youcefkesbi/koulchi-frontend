const MAYSTRO_BASE_URL = 'https://backend.maystro-delivery.com/api/stores'

// Maystro API configuration
const MAYSTRO_CONFIG = {
  // You can set this directly or use environment variables
  API_TOKEN: import.meta.env.VITE_MAYSTRO_API_TOKEN || 'YOUR_MAYSTRO_API_TOKEN_HERE',
  // Fallback to a default token if needed
  DEFAULT_TOKEN: 'YOUR_MAYSTRO_API_TOKEN_HERE',
  // Direct configuration (uncomment and set your token here)
  // DIRECT_TOKEN: 'your_actual_maystro_token_here'
}

// Get the API token with fallback
const MAYSTRO_API_TOKEN = MAYSTRO_CONFIG.API_TOKEN || MAYSTRO_CONFIG.DEFAULT_TOKEN

// Validate API token
if (MAYSTRO_API_TOKEN === 'YOUR_MAYSTRO_API_TOKEN_HERE') {
  console.warn('⚠️ Maystro API token not configured. Please set VITE_MAYSTRO_API_TOKEN in your .env file or update the DEFAULT_TOKEN in maystroApi.js')
}

export const maystroApi = {
  // Get all products with pagination
  getProducts: async (page = 1, userToken = null) => {
    try {
      // Use Maystro API token instead of user token
      const authToken = MAYSTRO_API_TOKEN
      
      const response = await fetch(`${MAYSTRO_BASE_URL}/product?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch products')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  // Get single product
  getProduct: async (id, userToken = null) => {
    try {
      const authToken = MAYSTRO_API_TOKEN
      
      const response = await fetch(`${MAYSTRO_BASE_URL}/product/${id}/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch product')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  },

  // Create product
  createProduct: async (data, userToken = null) => {
    try {
      const authToken = MAYSTRO_API_TOKEN
      
      const response = await fetch(`${MAYSTRO_BASE_URL}/product/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create product')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  // Update product (full update)
  updateProduct: async (id, data, userToken = null) => {
    try {
      const authToken = MAYSTRO_API_TOKEN
      
      const response = await fetch(`${MAYSTRO_BASE_URL}/product/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update product')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  // Partial update product
  patchProduct: async (id, data, userToken = null) => {
    try {
      const authToken = MAYSTRO_API_TOKEN
      
      const response = await fetch(`${MAYSTRO_BASE_URL}/product/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update product')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error patching product:', error)
      throw error
    }
  },

  // Delete product
  deleteProduct: async (id, userToken = null) => {
    try {
      const authToken = MAYSTRO_API_TOKEN
      
      const response = await fetch(`${MAYSTRO_BASE_URL}/product/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to delete product')
      }
      
      return response
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }
}

// Data transformation utilities
export const transformToMaystro = (product) => ({
  store_id: product.store_id,
  logistical_description: product.description || product.name,
  product_id: product.id || generateId()
})

export const transformFromMaystro = (maystroProduct) => ({
  id: maystroProduct.id,
  name: maystroProduct.logistical_description,
  description: maystroProduct.logistical_description,
  store_id: maystroProduct.store,
  created_at: maystroProduct.created_at,
  updated_at: maystroProduct.updated_at,
  // Add default values for missing fields
  price: 0,
  stock_quantity: 0,
  status: maystroProduct.deleted ? 'inactive' : 'approved',
  category_name: 'No Category',
  seller_name: 'Unknown Seller',
  // Map additional fields
  product_id: maystroProduct.product_id,
  delivery_rate: maystroProduct.delivery_rate,
  cancelation_rate: maystroProduct.cancelation_rate,
  low_stock_level: maystroProduct.low_stock_level
})

// Generate simple ID if needed
const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}
