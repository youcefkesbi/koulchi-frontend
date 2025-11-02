import { supabase, environment } from './supabase'

/**
 * MaystroClient - Utility class for all Maystro-related operations
 * 
 * This class handles all interactions with Maystro delivery service
 * including credential management, status checking, and API operations
 */
export class MaystroClient {
  constructor() {
    this.baseUrl = 'https://backend.maystro-delivery.com/api/stores'
    console.log('🔧 MaystroClient constructed')
  }

  /**
   * Get current user session and validate authentication
   * @returns {Promise<Object>} - User session data
   */
  async validateSession() {
    try {
      console.log('🔑 validateSession - start')
      // Log env quick check
      try {
        console.log('🌍 Supabase URL:', environment?.supabase?.url)
      } catch {}

      // Fail fast if auth hangs
      const timeoutMs = 6000
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase getSession timeout. Check VITE_SUPABASE_URL/KEY and network.')), timeoutMs))
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
      console.log('🔑 validateSession - got session response', { hasError: !!error, hasSession: !!(session && session.user) })
      
      if (error) {
        console.error('Session validation error:', error)
        throw new Error('Authentication failed. Please log in again.')
      }
      
      if (!session || !session.user) {
        throw new Error('User not authenticated')
      }
      
      console.log('🔑 validateSession - success for user', session.user.id)
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
      // CRITICAL: Check if supabase.functions exists
      if (!supabase || !supabase.functions) {
        console.error('❌ supabase.functions is not available', { 
          hasSupabase: !!supabase, 
          hasFunctions: !!(supabase && supabase.functions),
          supabaseKeys: supabase ? Object.keys(supabase) : []
        })
        throw new Error('Supabase client not properly initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env')
      }

      // Use supabase-js to invoke the function (handles headers/auth)
      const safeBody = options.body ? { ...options.body, apiToken: options.body.apiToken ? `***${String(options.body.apiToken).slice(-4)}` : undefined } : undefined
      console.log('🔗 MaystroClient.invoke', { functionName, method: options.method || 'POST', body: safeBody, supabaseUrl: environment?.supabase?.url })

      const timeoutMs = 15000
      
      // Get access token directly from localStorage (getSession hangs, so bypass it)
      console.log('🔑 Edge call - reading token from localStorage')
      let accessToken = null
      
      if (typeof window !== 'undefined') {
        try {
          // Try primary storage key
          const raw = window.localStorage.getItem('koulchi-auth-token')
          if (raw) {
            const parsed = JSON.parse(raw)
            // Try various possible structures
            accessToken = parsed?.currentSession?.access_token || 
                         parsed?.session?.access_token ||
                         parsed?.access_token ||
                         (parsed?.access_token && parsed.access_token) ||
                         null
            console.log('🔑 Found token in koulchi-auth-token:', !!accessToken)
          }
          
          // Fallback: try supabase default storage key
          if (!accessToken) {
            const supabaseRaw = window.localStorage.getItem('sb-' + environment.supabase.url.replace(/https?:\/\//, '').split('.')[0] + '-auth-token')
            if (supabaseRaw) {
              const supabaseParsed = JSON.parse(supabaseRaw)
              accessToken = supabaseParsed?.access_token || null
              console.log('🔑 Found token in supabase default key:', !!accessToken)
            }
          }
          
          // Last resort: search all localStorage keys for 'access_token'
          if (!accessToken) {
            for (let i = 0; i < window.localStorage.length; i++) {
              const key = window.localStorage.key(i)
              if (key && (key.includes('auth') || key.includes('token') || key.includes('session'))) {
                try {
                  const val = JSON.parse(window.localStorage.getItem(key))
                  if (val?.access_token || val?.currentSession?.access_token || val?.session?.access_token) {
                    accessToken = val.access_token || val.currentSession?.access_token || val.session?.access_token
                    console.log('🔑 Found token in', key, ':', !!accessToken)
                    break
                  }
                } catch {}
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ Failed to read token from localStorage:', e?.message)
        }
      }
      
      console.log('🔑 Edge call - got accessToken?', !!accessToken)
      if (!accessToken) {
        throw new Error('No active session. Please log in again.')
      }

      // Build the function URL
      const functionUrl = `${environment.supabase.url}/functions/v1/${functionName}`
      console.log('🌐 Calling edge function directly:', functionUrl)

      // Use fetch directly with proper CORS headers
      const fetchOptions = {
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': environment.supabase.anonKey
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      }

      const fetchPromise = fetch(functionUrl, fetchOptions)
        .then(async response => {
          const text = await response.text()
          let data = null
          try {
            data = JSON.parse(text)
          } catch {
            data = { success: false, error: text || 'Invalid JSON response' }
          }

          if (!response.ok) {
            return { 
              data: null, 
              error: { 
                message: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
                status: response.status,
                statusText: response.statusText
              } 
            }
          }

          return { data, error: null }
        })
        .catch(err => {
          console.error('❌ fetch threw:', err)
          return { 
            data: null, 
            error: { 
              message: err.message || 'Network error', 
              originalError: err 
            } 
          }
        })

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Edge Function timeout or unreachable')), timeoutMs)
      )
      
      const result = await Promise.race([fetchPromise, timeoutPromise])
      
      // Handle timeout case
      if (result && typeof result === 'object' && result.error && result.error.message === 'Edge Function timeout or unreachable') {
        throw new Error('Edge Function timeout or unreachable')
      }

      // Handle response format
      const { data, error } = result || {}
      
      if (error) {
        console.error('❌ Edge function error:', error)
        throw new Error(error.message || 'Function invoke failed')
      }

      console.log('✅ MaystroClient.invoke success:', { functionName })
      return data
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error)
      // Re-throw with more context if it's about supabase not being available
      if (error.message && error.message.includes('not properly initialized')) {
        throw error
      }
      throw error
    }
  }

  /**
   * Get current integration status for the authenticated user
   * @returns {Promise<Object>} - Integration status data
   */
  async getIntegration() {
    try {
      // Get user ID from localStorage (avoid getSession timeout)
      let userId = null
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('koulchi-auth-token')
          if (raw) {
            const parsed = JSON.parse(raw)
            const session = parsed?.currentSession || parsed?.session || parsed
            userId = session?.user?.id || session?.user_id || null
          }
        } catch (e) {
          console.warn('Failed to read userId from localStorage:', e?.message)
        }
      }
      
      if (!userId) {
        // Fallback to validateSession if localStorage doesn't have it
        try {
          const session = await this.validateSession()
          userId = session.user.id
        } catch (e) {
          console.error('Failed to get user ID:', e)
          return {
            connected: false,
            enabled: false,
            integration: null,
            message: 'Failed to authenticate. Please log in again.'
          }
        }
      }
      
      console.log('🔍 getIntegration - Querying database for userId:', userId)
      
      // Get integration data from database
      const { data: integration, error } = await supabase
        .from('seller_shipping')
        .select('*')
        .eq('seller_id', userId)
        .eq('provider', 'maystro')
        .maybeSingle()  // Use maybeSingle instead of single to handle "not found" gracefully

      if (error && error.code !== 'PGRST116') {
        console.error('❌ getIntegration - Database error:', error)
        throw new Error(`Failed to get integration: ${error.message}`)
      }

      console.log('🔍 getIntegration - Found integration:', !!integration)
      
      if (!integration) {
        console.log('ℹ️ getIntegration - No integration found for user')
        return {
          connected: false,
          enabled: false,
          integration: null,
          message: 'No Maystro integration found'
        }
      }

      console.log('✅ getIntegration - Integration found:', {
        id: integration.id,
        enabled: integration.enabled,
        expires_at: integration.expires_at
      })

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
   * @param {string} credentials.apiToken - Maystro API token (received via email)
   * @returns {Promise<Object>} - Connection result
   */
  async connect(credentials) {
    try {
      // Validate credentials
      if (!credentials.apiToken) {
        throw new Error('API token is required')
      }
      if (!credentials.storeId) {
        throw new Error('Store ID is required for Maystro integration')
      }

      // Call connect-maystro Edge Function with simplified credentials
      const result = await this.callEdgeFunction('connect-maystro', {
        method: 'POST',
        body: {
          apiToken: credentials.apiToken,
          storeId: credentials.storeId
        }
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
      // Get user ID from localStorage (avoid getSession timeout)
      let userId = null
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('koulchi-auth-token')
          if (raw) {
            const parsed = JSON.parse(raw)
            const session = parsed?.currentSession || parsed?.session || parsed
            userId = session?.user?.id || session?.user_id || null
          }
        } catch (e) {
          console.warn('Failed to read userId from localStorage:', e?.message)
        }
      }
      
      if (!userId) {
        // Fallback to validateSession if localStorage doesn't have it
        const session = await this.validateSession()
        userId = session.user.id
      }
      
      // Update integration status in database
      const { data, error } = await supabase
        .from('seller_shipping')
        .update({ enabled })
        .eq('seller_id', userId)
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
      // Get user ID from localStorage (avoid getSession timeout)
      let userId = null
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('koulchi-auth-token')
          if (raw) {
            const parsed = JSON.parse(raw)
            const session = parsed?.currentSession || parsed?.session || parsed
            userId = session?.user?.id || session?.user_id || null
          }
        } catch (e) {
          console.warn('Failed to read userId from localStorage:', e?.message)
        }
      }
      
      if (!userId) {
        // Fallback to validateSession if localStorage doesn't have it
        const session = await this.validateSession()
        userId = session.user.id
      }
      
      // Get integration data
      const { data: integration, error } = await supabase
        .from('seller_shipping')
        .select('access_token, expires_at')
        .eq('seller_id', userId)
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