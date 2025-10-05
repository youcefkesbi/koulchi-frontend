import { supabase } from '../lib/supabase.js'

/**
 * Add product to cart using Supabase RPC function
 * @param {string} productId - The UUID of the product
 * @param {number} quantity - The quantity to add (default: 1)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    // Check for active session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return { success: false, error: 'Authentication session error. Please log in again.' }
    }

    if (!session || !session.user) {
      console.error('No active session')
      return { success: false, error: 'Please log in to add items to cart' }
    }

    // Verify session is not expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      console.warn('Session expired, attempting to refresh...')
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError || !refreshData.session) {
        return { success: false, error: 'Your session has expired. Please log in again.' }
      }
      
      console.log('Session refreshed successfully')
    }

    // Get current user (should be available after session check)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Error getting user:', userError)
      return { success: false, error: userError.message }
    }

    if (!user) {
      console.error('No user logged in')
      return { success: false, error: 'Please log in to add items to cart' }
    }

    // Validate inputs
    if (!productId) {
      console.error('Product ID is required')
      return { success: false, error: 'Product ID is required' }
    }

    if (!quantity || quantity < 1) {
      console.error('Invalid quantity')
      return { success: false, error: 'Quantity must be at least 1' }
    }

    // Call the Supabase RPC function (uses auth.uid() automatically)
    const { data, error } = await supabase.rpc('add_to_cart', {
      p_product_id: productId,
      p_quantity: quantity
    })

    // Log both data and error for debugging
    console.log('Add to cart - data:', data)
    console.log('Add to cart - error:', error)

    if (error) {
      console.error('Error adding to cart:', error)
      // Handle specific RLS and permission errors
      if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        return { success: false, error: 'You do not have permission to modify this cart. Please log in again.' }
      }
      if (error.message?.includes('not authenticated')) {
        return { success: false, error: 'Please log in to add items to cart' }
      }
      return { success: false, error: error.message || 'Failed to add item to cart' }
    }

    console.log('Successfully added to cart:', data)
    return { success: true, data }

  } catch (err) {
    console.error('Unexpected error adding to cart:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
