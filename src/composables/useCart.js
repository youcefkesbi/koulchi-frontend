import { supabase } from '../lib/supabase.js'

/**
 * Add product to cart using Supabase RPC function
 * @param {string} productId - The UUID of the product
 * @param {number} quantity - The quantity to add (default: 1)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    // Get current user
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

    // Call the Supabase RPC function
    const { data, error } = await supabase.rpc('add_to_cart', {
      p_product_id: productId,
      p_quantity: quantity,
      p_user_id: user.id
    })

    // Log both data and error for debugging
    console.log('Add to cart - data:', data)
    console.log('Add to cart - error:', error)

    if (error) {
      console.error('Error adding to cart:', error)
      return { success: false, error: error.message || 'Failed to add item to cart' }
    }

    console.log('Successfully added to cart:', data)
    return { success: true, data }

  } catch (err) {
    console.error('Unexpected error adding to cart:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
