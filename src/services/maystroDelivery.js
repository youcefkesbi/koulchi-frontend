/**
 * Maystro Delivery API Service for Public Endpoints
 * 
 * This service handles public Maystro API endpoints for fetching
 * wilayas, communes, and delivery options.
 * 
 * Note: Uses application-wide token (not per-user) since these are public data endpoints.
 */

const MAYSTRO_BASE_URL = 'https://orders-management.maystro-delivery.com/api/base'

/**
 * Get Maystro public API token from environment variables
 * @returns {string} API token
 */
const getMaystroPublicToken = () => {
  // Get token from environment variable
  const token = import.meta.env.VITE_MAYSTRO_PUBLIC_TOKEN || 'b5ed9f0a9b150d209559d5e8f6461ddb06a876da'
  
  if (!token) {
    throw new Error('Maystro public API token is not configured. Please set VITE_MAYSTRO_PUBLIC_TOKEN in your environment variables.')
  }
  
  return token
}

/**
 * Maystro Delivery API client for public endpoints
 */
class MaystroDeliveryAPI {
  constructor() {
    this.baseUrl = MAYSTRO_BASE_URL
  }

  /**
   * Fetch wilayas (provinces) from Maystro API
   * @param {string} language - Language code: 'ar' (default), 'en', or 'fr'
   * @returns {Promise<Array>} Array of wilaya objects
   */
  async getWilayas(language = 'ar') {
    try {
      // Hardcoded token for testing
      const token = 'b5ed9f0a9b150d209559d5e8f6461ddb06a876da'
      const url = new URL(`${this.baseUrl}/wilayas/`)
      
      // Add query parameters
      url.searchParams.append('language', language)
      url.searchParams.append('country', '1') // 1 for Algeria

      const fullUrl = url.toString()
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token  // Maystro expects just the token, not "Bearer {token}"
      }

      // Debug logging
      console.log('=== MAYSTRO WILAYAS DEBUG ===')
      console.log('URL:', fullUrl)
      console.log('Method: GET')
      console.log('Headers:', JSON.stringify(headers, null, 2))
      console.log('Token (raw):', token)
      console.log('Token length:', token.length)
      console.log('Language:', language)
      console.log('Country:', '1')
      console.log('===========================')

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers
      })

      // Debug response
      console.log('=== RESPONSE DEBUG ===')
      console.log('Status:', response.status)
      console.log('Status Text:', response.statusText)
      console.log('Headers:', Object.fromEntries(response.headers.entries()))
      
      // Clone response to read body for debugging without consuming it
      const responseClone = response.clone()
      let responseBody = null
      try {
        responseBody = await responseClone.text()
        console.log('Response Body (raw):', responseBody)
        try {
          const parsedBody = JSON.parse(responseBody)
          console.log('Response Body (parsed):', JSON.stringify(parsedBody, null, 2))
        } catch (e) {
          console.log('Response Body is not JSON')
        }
      } catch (e) {
        console.log('Could not read response body:', e.message)
      }
      console.log('======================')

      if (!response.ok) {
        if (response.status === 404) {
          return []
        }
        if (response.status === 401) {
          const errorDetails = {
            status: response.status,
            statusText: response.statusText,
            responseBody: responseBody,
            url: fullUrl,
            token: token,
            tokenLength: token.length,
            headers: headers
          }
          console.error('=== 401 UNAUTHORIZED ERROR DETAILS ===')
          console.error(JSON.stringify(errorDetails, null, 2))
          console.error('======================================')
          throw new Error(`Unauthorized (401): ${response.statusText}. Response: ${responseBody || 'No response body'}. Check token format and Authorization header.`)
        }
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          responseBody: responseBody,
          url: fullUrl
        }
        console.error('=== HTTP ERROR DETAILS ===')
        console.error(JSON.stringify(errorDetails, null, 2))
        console.error('==========================')
        throw new Error(`Failed to fetch wilayas: ${response.status} ${response.statusText}. Response: ${responseBody || 'No response body'}`)
      }

      return await response.json()
    } catch (error) {
      console.error('=== FINAL ERROR ===')
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('==================')
      throw error
    }
  }

  /**
   * Fetch communes for a specific wilaya
   * @param {number} wilayaId - The wilaya ID
   * @param {string} language - Language code: 'ar' (default), 'en', or 'fr'
   * @returns {Promise<Array>} Array of commune objects
   */
  async getCommunes(wilayaId, language = 'ar') {
    try {
      if (!wilayaId) {
        throw new Error('Wilaya ID is required')
      }

      // Hardcoded token for testing
      const token = 'b5ed9f0a9b150d209559d5e8f6461ddb06a876da'
      const url = new URL(`${this.baseUrl}/communes/`)
      
      // Add query parameters
      url.searchParams.append('wilaya', wilayaId.toString())
      // Note: Documentation only mentions 'wilaya' parameter, not 'language' or 'country'
      // But keeping them for consistency with wilayas endpoint
      if (language) {
        url.searchParams.append('language', language)
      }
      url.searchParams.append('country', '1') // 1 for Algeria

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token  // Maystro expects just the token, not "Bearer {token}"
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return []
        }
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid Maystro API token. Please check VITE_MAYSTRO_PUBLIC_TOKEN environment variable.')
        }
        throw new Error(`Failed to fetch communes: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching communes:', error)
      throw error
    }
  }

  /**
   * Get delivery options for a specific commune
   * @param {number} communeId - The commune ID
   * @returns {Promise<Array>} Array of delivery options
   */
  async getDeliveryOptions(communeId) {
    try {
      if (!communeId) {
        throw new Error('Commune ID is required')
      }

      const token = getMaystroPublicToken()
      const url = new URL(`${this.baseUrl}/delivery-options/`)
      
      // Add query parameters
      url.searchParams.append('commune', communeId.toString())

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token  // Maystro expects just the token, not "Bearer {token}"
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pricing not found for this commune')
        }
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid Maystro API token. Please check VITE_MAYSTRO_PUBLIC_TOKEN environment variable.')
        }
        throw new Error(`Failed to fetch delivery options: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching delivery options:', error)
      throw error
    }
  }

  /**
   * Get delivery price for a specific commune and delivery type
   * @param {number} communeId - The commune ID
   * @param {number} deliveryType - Delivery type (1: Home, 2: Stop-Desk, 3: Pickup)
   * @returns {Promise<Object>} Delivery price information
   */
  async getDeliveryPrice(communeId, deliveryType = 1) {
    try {
      if (!communeId) {
        throw new Error('Commune ID is required')
      }

      const token = getMaystroPublicToken()
      const url = new URL(`${this.baseUrl}/delivery-prices/`)
      
      // Add query parameters
      url.searchParams.append('commune', communeId.toString())
      url.searchParams.append('delivery_type', deliveryType.toString())

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token  // Maystro expects just the token, not "Bearer {token}"
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pricing not found for this commune')
        }
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid Maystro API token. Please check VITE_MAYSTRO_PUBLIC_TOKEN environment variable.')
        }
        throw new Error(`Failed to fetch delivery price: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching delivery price:', error)
      throw error
    }
  }
}

// Export singleton instance
export const maystroDelivery = new MaystroDeliveryAPI()
