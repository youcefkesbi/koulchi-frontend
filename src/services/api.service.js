import api from '@/api/apiClient';

/**
 * Base API service with common CRUD operations
 */
class ApiService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Get all items with optional query parameters
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response
   */
  getAll(params = {}) {
    return api.get(`/${this.endpoint}`, { params });
  }

  /**
   * Get a single item by ID
   * @param {string|number} id - Item ID
   * @returns {Promise} - API response
   */
  getById(id) {
    return api.get(`/${this.endpoint}/${id}`);
  }

  /**
   * Create a new item
   * @param {Object} data - Item data
   * @returns {Promise} - API response
   */
  create(data) {
    return api.post(`/${this.endpoint}`, data);
  }

  /**
   * Update an existing item
   * @param {string|number} id - Item ID
   * @param {Object} data - Updated item data
   * @returns {Promise} - API response
   */
  update(id, data) {
    return api.patch(`/${this.endpoint}/${id}`, data);
  }

  /**
   * Delete an item
   * @param {string|number} id - Item ID
   * @returns {Promise} - API response
   */
  delete(id) {
    return api.delete(`/${this.endpoint}/${id}`);
  }
}

/**
 * Auth service for authentication related API calls
 */
class AuthService extends ApiService {
  constructor() {
    super('auth');
  }

  /**
   * Login with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - API response
   */
  login(email, password) {
    return api.post(`/${this.endpoint}/login`, { email, password });
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - API response
   */
  register(userData) {
    return api.post(`/${this.endpoint}/register`, userData);
  }

  /**
   * Request password reset
   * @param {string} email - User's email
   * @returns {Promise} - API response
   */
  forgotPassword(email) {
    return api.post(`/${this.endpoint}/forgot-password`, { email });
  }

  /**
   * Reset password with token
   * @param {string} token - Password reset token
   * @param {string} password - New password
   * @param {string} passwordConfirm - Password confirmation
   * @returns {Promise} - API response
   */
  resetPassword(token, password, passwordConfirm) {
    return api.post(`/${this.endpoint}/reset-password/${token}`, {
      password,
      passwordConfirm,
    });
  }

  /**
   * Get current user profile
   * @returns {Promise} - API response
   */
  getProfile() {
    return api.get(`/users/me`);
  }

  /**
   * Update current user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} - API response
   */
  updateProfile(userData) {
    return api.patch(`/users/me`, userData);
  }

  /**
   * Update user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} newPasswordConfirm - New password confirmation
   * @returns {Promise} - API response
   */
  updatePassword(currentPassword, newPassword, newPasswordConfirm) {
    return api.patch(`/users/me/password`, {
      currentPassword,
      newPassword,
      newPasswordConfirm,
    });
  }
}

/**
 * User service for user-related API calls
 */
class UserService extends ApiService {
  constructor() {
    super('users');
  }

  // Add any user-specific methods here
  // For example:
  // getUsersByRole(role) {
  //   return this.getAll({ role });
  // }
}

// Export service instances
export const authService = new AuthService();
export const userService = new UserService();

// Export all services as a single object
export default {
  auth: authService,
  users: userService,
};
