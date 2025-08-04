import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/api.service';

/**
 * Authentication store for managing user authentication state
 */
export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  
  // State
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = ref(!!localStorage.getItem('token'));
  const loading = ref(false);
  const error = ref(null);
  const returnUrl = ref(null);

  // Getters
  const isAdmin = computed(() => user.value?.role === 'admin');
  const userDisplayName = computed(() => user.value?.name || user.value?.email?.split('@')[0] || '');
  const userEmail = computed(() => user.value?.email || '');
  const userAvatar = computed(
    () => user.value?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName.value)}&background=random`
  );

  // Actions
  /**
   * Initialize authentication state
   */
  const initAuth = async () => {
    if (token.value) {
      try {
        await fetchUser();
      } catch (error) {
        console.error('Failed to fetch user:', error);
        logout();
      }
    }
  };

  /**
   * Login with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const login = async (email, password) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authService.login(email, password);
      
      // Update state
      user.value = response.data.user;
      token.value = response.token;
      isAuthenticated.value = true;
      
      // Store token in localStorage
      localStorage.setItem('token', token.value);
      
      // Redirect to returnUrl or home
      const redirectPath = returnUrl.value || '/';
      router.push(redirectPath);
      returnUrl.value = null;
      
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed. Please check your credentials.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   */
  const signup = async (userData) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authService.signup(userData);
      
      // After successful registration, log the user in
      if (response.token) {
        user.value = response.data.user;
        token.value = response.token;
        isAuthenticated.value = true;
        localStorage.setItem('token', token.value);
        
        // Redirect to home or verification page
        const redirectPath = returnUrl.value || '/';
        router.push(redirectPath);
        returnUrl.value = null;
      }
      
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed. Please try again.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Logout the current user
   */
  const logout = () => {
    // Clear state
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    
    // Clear localStorage
    localStorage.removeItem('token');
    
    // Redirect to login
    router.push('/login');
    
    // Clear any API authorization
    authService.defaults.headers.common['Authorization'] = '';
  };

  /**
   * Fetch the current authenticated user
   */
  const fetchUser = async () => {
    try {
      const response = await authService.fetchUser();
      user.value = response.data;
      return user.value;
    } catch (err) {
      // If we get a 401, the token is invalid, so log the user out
      if (err.response?.status === 401) {
        logout();
      }
      throw err;
    }
  };

  /**
   * Refresh the authentication token
   */
  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      token.value = response.token;
      localStorage.setItem('token', token.value);
      return token.value;
    } catch (err) {
      logout();
      throw err;
    }
  };

  /**
   * Request a password reset email
   * @param {string} email - User's email address
   */
  const forgotPassword = async (email) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authService.forgotPassword(email);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send password reset email.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reset password with a token
   * @param {string} token - Password reset token
   * @param {string} password - New password
   * @param {string} passwordConfirm - New password confirmation
   */
  const resetPassword = async (token, password, passwordConfirm) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authService.resetPassword(token, password, passwordConfirm);
      
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reset password.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update the current user's password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} newPasswordConfirm - New password confirmation
   */
  const updatePassword = async (currentPassword, newPassword, newPasswordConfirm) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authService.updatePassword(currentPassword, newPassword, newPasswordConfirm);
      
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update password.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Clear any error messages
   */
  const clearError = () => {
    error.value = null;
  };

  // Initialize the store
  initAuth();

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error,
    returnUrl,
    
    // Getters
    isAdmin,
    userDisplayName,
    userEmail,
    userAvatar,
    
    // Actions
    init: initAuth,
    login,
    register: signup,
    logout,
    fetchUser,
    refreshToken,
    forgotPassword,
    resetPassword,
    updatePassword,
    clearError,
  };
}, {
  // Persist the store to localStorage
  persist: {
    paths: ['token', 'user', 'isAuthenticated'],
  },
});
