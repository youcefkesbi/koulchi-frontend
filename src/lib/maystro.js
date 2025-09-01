import { supabase } from './supabase'

/**
 * Maystro Integration Client
 * Provides methods for managing Maystro delivery integration
 */
export class MaystroClient {
  /**
   * Get the current user's Maystro integration status
   * @returns {Promise<Object|null>} Integration data or null if not connected
   */
  static async getIntegration() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('seller_integrations')
        .select('*')
        .eq('seller_id', user.id)
        .eq('provider', 'maystro')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching Maystro integration:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting Maystro integration:', error)
      return null
    }
  }

  /**
   * Connect to Maystro by storing encrypted credentials
   * @param {Object} credentials - Maystro account credentials
   * @param {string} credentials.accountId - Maystro account ID
   * @param {string} credentials.accessToken - Maystro access token
   * @param {string} credentials.refreshToken - Maystro refresh token
   * @param {string} credentials.expiresAt - Token expiry date (ISO string)
   * @returns {Promise<Object>} Response from the Edge Function
   */
  static async connect(credentials) {
    try {
      const { data, error } = await supabase.functions.invoke('connect-maystro', {
        body: credentials
      })

      if (error) {
        throw new Error(error.message || 'Failed to connect to Maystro')
      }

      return data
    } catch (error) {
      console.error('Error connecting to Maystro:', error)
      throw error
    }
  }

  /**
   * Disconnect from Maystro (removes integration)
   * @returns {Promise<Object>} Response from the Edge Function
   */
  static async disconnect() {
    try {
      const { data, error } = await supabase.functions.invoke('disconnect-maystro')

      if (error) {
        throw new Error(error.message || 'Failed to disconnect from Maystro')
      }

      return data
    } catch (error) {
      console.error('Error disconnecting from Maystro:', error)
      throw error
    }
  }

  /**
   * Update the enabled status of the integration
   * @param {boolean} enabled - Whether the integration should be enabled
   * @returns {Promise<Object>} Updated integration data
   */
  static async updateStatus(enabled) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('seller_integrations')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('seller_id', user.id)
        .eq('provider', 'maystro')
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to update integration status')
      }

      return data
    } catch (error) {
      console.error('Error updating Maystro integration status:', error)
      throw error
    }
  }

  /**
   * Check if the integration is enabled and valid
   * @returns {Promise<boolean>} True if integration is enabled and valid
   */
  static async isEnabled() {
    try {
      const integration = await this.getIntegration()
      if (!integration) return false

      // Check if tokens are expired
      if (integration.expires_at) {
        const expiryDate = new Date(integration.expires_at)
        const now = new Date()
        if (expiryDate <= now) {
          // Token expired, disable integration
          await this.updateStatus(false)
          return false
        }
      }

      return integration.enabled
    } catch (error) {
      console.error('Error checking Maystro integration status:', error)
      return false
    }
  }

  /**
   * Refresh the integration data
   * @returns {Promise<Object|null>} Updated integration data
   */
  static async refresh() {
    try {
      // Force a fresh fetch from the database
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('seller_integrations')
        .select('*')
        .eq('seller_id', user.id)
        .eq('provider', 'maystro')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error refreshing Maystro integration:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error refreshing Maystro integration:', error)
      return null
    }
  }
}

export default MaystroClient
