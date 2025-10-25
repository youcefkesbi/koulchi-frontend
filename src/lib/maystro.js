import { supabase } from './supabase'

/**
 * MaystroClient - Utility class for all Maystro-related operations
 * 
 * This class handles all interactions with Maystro delivery service
 * including credential management, status checking, and API operations
 */
export class MaystroClient {
  constructor() {
    this.baseUrl = 'https://backend.maystro-delivery.com/api/stores'
    this.edgeFunctionUrl = supabase.supabaseUrl + '/functions/v1'
  }

  /**
   * Get current user session and validate authentication
   * @returns {Promise<Object>} - User session data
   */
  async validateSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session validation error:', error)
        throw new Error('Authentication failed. Please log in again.')
      }
      
      if (!session || !session.user) {
        throw new Error('User not authenticated')
      }
      
      return session
    } catch (err) {
      console.error('Session validation error:', err)
      throw err
    }
  }

  /**
   * Make authenticated request to Supabase Edge Functions
   * @param {string} functionName - Name of the Edge Function
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async callEdgeFunction(functionName, options = {}) {
    try {
      const session = await this.validateSession()
      
      const response = await fetch(`${this.edgeFunctionUrl}/${functionName}`, {
        method: options.method || 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Edge Function request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error)
      throw error
    }
  }

  /**
   * Get current integration status for the authenticated user
   * @returns {Promise<Object>} - Integration status data
   */
  async getIntegration() {
    try {
      const session = await this.validateSession()
      
      // Get integration data from database
      const { data: integration, error } = await supabase
        .from('seller_shipping')
        .select('*')
        .eq('seller_id', session.user.id)
        .eq('provider', 'maystro')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get integration: ${error.message}`)
      }

      if (!integration) {
        return {
          connected: false,
          enabled: false,
          integration: null,
          message: 'No Maystro integration found'
        }
      }

      // Check if token is expired
      const isExpired = integration.expires_at && new Date(integration.expires_at) < new Date()
      
      return {
        connected: true,
        enabled: integration.enabled && !isExpired,
        integration: {
          id: integration.id,
          provider: integration.provider,
          enabled: integration.enabled,
          expires_at: integration.expires_at,
          created_at: integration.created_at,
          updated_at: integration.updated_at
        },
        message: isExpired ? 'Integration token has expired' : 'Integration is active'
      }
    } catch (error) {
      console.error('Error getting integration:', error)
      return {
        connected: false,
        enabled: false,
        error: error.message,
        message: 'Failed to get integration status'
      }
    }
  }

  /**
   * Connect to Maystro delivery service
   * @param {Object} credentials - Maystro credentials
   * @param {string} credentials.accountId - Maystro account ID
   * @param {string} credentials.accessToken - Maystro access token
   * @param {string} credentials.refreshToken - Maystro refresh token (optional)
   * @param {string} credentials.expiresAt - Token expiry date (optional)
   * @returns {Promise<Object>} - Connection result
   */
  async connect(credentials) {
    try {
      // Validate credentials
      if (!credentials.accountId || !credentials.accessToken) {
        throw new Error('Account ID and access token are required')
      }

      // Call connect-maystro Edge Function
      const result = await this.callEdgeFunction('connect-maystro', {
        method: 'POST',
        body: credentials
      })

      return {
        success: true,
        integration: result.integration,
        message: result.message || 'Maystro integration connected successfully'
      }
    } catch (error) {
      console.error('Error connecting to Maystro:', error)
      return {
        success: false,
        error: error.message,
        message: 'Failed to connect Maystro integration'
      }
    }
  }

  /**
   * Disconnect from Maystro delivery service
   * @returns {Promise<Object>} - Disconnection result
   */
  async disconnect() {
    try {
      // Call disconnect-maystro Edge Function
      const result = await this.callEdgeFunction('disconnect-maystro', {
        method: 'POST'
      })

      return {
        success: true,
        message: result.message || 'Maystro integration disconnected successfully'
      }
    } catch (error) {
      console.error('Error disconnecting from Maystro:', error)
      return {
        success: false,
        error: error.message,
        message: 'Failed to disconnect Maystro integration'
      }
    }
  }

  /**
   * Update integration status (enable/disable)
   * @param {boolean} enabled - Whether to enable or disable integration
   * @returns {Promise<Object>} - Update result
   */
  async updateStatus(enabled) {
    try {
      const session = await this.validateSession()
      
      // Update integration status in database
      const { data, error } = await supabase
        .from('seller_shipping')
        .update({ enabled })
        .eq('seller_id', session.user.id)
        .eq('provider', 'maystro')
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update integration status: ${error.message}`)
      }

      return {
        success: true,
        integration: data,
        message: `Integration ${enabled ? 'enabled' : 'disabled'} successfully`
      }
    } catch (error) {
      console.error('Error updating integration status:', error)
      return {
        success: false,
        error: error.message,
        message: 'Failed to update integration status'
      }
    }
  }

  /**
   * Check if Maystro integration is enabled and valid
   * @returns {Promise<boolean>} - Whether integration is active
   */
  async isEnabled() {
    try {
      const status = await this.getIntegration()
      return status.connected && status.enabled
    } catch (error) {
      console.error('Error checking if integration is enabled:', error)
      return false
    }
  }

  /**
   * Get Maystro API token for making requests to Maystro API
   * @returns {Promise<string|null>} - Decrypted access token or null
   */
  async getMaystroToken() {
    try {
      const session = await this.validateSession()
      
      // Get integration data
      const { data: integration, error } = await supabase
        .from('seller_shipping')
        .select('access_token, expires_at')
        .eq('seller_id', session.user.id)
        .eq('provider', 'maystro')
        .eq('enabled', true)
        .single()

      if (error || !integration) {
        return null
      }

      // Check if token is expired
      if (integration.expires_at && new Date(integration.expires_at) < new Date()) {
        return null
      }

      // Note: In a real implementation, you would decrypt the token here
      // For now, we'll return the encrypted token (this needs to be fixed)
      return integration.access_token
    } catch (error) {
      console.error('Error getting Maystro token:', error)
      return null
    }
  }

  /**
   * Make authenticated request to Maystro API
   * @param {string} endpoint - Maystro API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async makeMaystroRequest(endpoint, options = {}) {
    try {
      const token = await this.getMaystroToken()
      
      if (!token) {
        throw new Error('No valid Maystro token available')
      }

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
        throw new Error(errorData.detail || `Maystro API request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error making Maystro API request:', error)
      throw error
    }
  }

  /**
   * Get products from Maystro API
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} - Products data
   */
  async getProducts(page = 1) {
    return await this.makeMaystroRequest(`/product?page=${page}`, {
      method: 'GET'
    })
  }

  /**
   * Create product via Maystro API
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} - Created product data
   */
  async createProduct(productData) {
    return await this.makeMaystroRequest('/product/', {
      method: 'POST',
      body: JSON.stringify(productData)
    })
  }

  /**
   * Update product via Maystro API
   * @param {string} productId - Product ID
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} - Updated product data
   */
  async updateProduct(productId, productData) {
    return await this.makeMaystroRequest(`/product/${productId}/`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    })
  }

  /**
   * Delete product via Maystro API
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteProduct(productId) {
    return await this.makeMaystroRequest(`/product/${productId}/`, {
      method: 'DELETE'
    })
  }
}

// Export singleton instance
export const maystroClient = new MaystroClient()