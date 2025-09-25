/**
 * Order validation utilities
 * Handles validation for order statuses and other order-related data
 */

// Valid order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed', 
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

// Array of valid statuses for easy validation
export const VALID_ORDER_STATUSES = Object.values(ORDER_STATUSES)

/**
 * Validates if a status is valid
 * @param {string} status - The status to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidOrderStatus = (status) => {
  return typeof status === 'string' && VALID_ORDER_STATUSES.includes(status)
}

/**
 * Validates order status and throws error if invalid
 * @param {string} status - The status to validate
 * @throws {Error} - If status is invalid
 */
export const validateOrderStatus = (status) => {
  if (!isValidOrderStatus(status)) {
    throw new Error(`Invalid order status: ${status}. Valid statuses are: ${VALID_ORDER_STATUSES.join(', ')}`)
  }
}

/**
 * Gets the next valid status in the order workflow
 * @param {string} currentStatus - Current order status
 * @returns {string|null} - Next valid status or null if at end of workflow
 */
export const getNextOrderStatus = (currentStatus) => {
  const statusFlow = [
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.DELIVERED
  ]
  
  const currentIndex = statusFlow.indexOf(currentStatus)
  if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
    return null
  }
  
  return statusFlow[currentIndex + 1]
}

/**
 * Checks if a status transition is valid
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @returns {boolean} - True if transition is valid
 */
export const isValidStatusTransition = (fromStatus, toStatus) => {
  // Can always cancel from any status except delivered or already cancelled
  if (toStatus === ORDER_STATUSES.CANCELLED) {
    return fromStatus !== ORDER_STATUSES.DELIVERED && fromStatus !== ORDER_STATUSES.CANCELLED
  }
  
  // Can only move forward in the workflow
  const statusFlow = [
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.DELIVERED
  ]
  
  const fromIndex = statusFlow.indexOf(fromStatus)
  const toIndex = statusFlow.indexOf(toStatus)
  
  if (fromIndex === -1 || toIndex === -1) {
    return false
  }
  
  return toIndex === fromIndex + 1
}

/**
 * Sanitizes and validates order data
 * @param {Object} orderData - Order data to validate
 * @returns {Object} - Sanitized order data
 */
export const sanitizeOrderData = (orderData) => {
  const sanitized = { ...orderData }
  
  // Validate and sanitize status
  if (sanitized.status) {
    validateOrderStatus(sanitized.status)
  }
  
  // Ensure total_amount is a positive number
  if (sanitized.total_amount !== undefined) {
    const amount = parseFloat(sanitized.total_amount)
    if (isNaN(amount) || amount < 0) {
      throw new Error('Total amount must be a positive number')
    }
    sanitized.total_amount = amount
  }
  
  return sanitized
}
