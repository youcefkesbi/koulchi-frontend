import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiService from '@/services/api.service';

/**
 * Authentication store for managing user authentication state
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = ref(!!localStorage.getItem('token'));
  const loading = ref(false);
  const error = ref(null);
  const returnUrl = ref(null);

  // Getters
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isSeller = computed(() => user.value?.role === 'SELLER' || user.value?.isSeller === true);
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
        console.warn('Failed to fetch user during initialization:', error.message);
        // Clear invalid token but don't redirect to avoid navigation issues
        token.value = null;
        isAuthenticated.value = false;
        user.value = null;
        localStorage.removeItem('token');
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
      
      const response = await apiService.post('/auth/login', { email, password });
      
      // Update state
      user.value = response.data.user;
      token.value = response.token;
      isAuthenticated.value = true;
      
      // Store token in localStorage
      localStorage.setItem('token', token.value);
      
      // Redirect to returnUrl or home
      const redirectPath = returnUrl.value || '/';
      // Use window.location for navigation to avoid router context issues
      window.location.href = redirectPath;
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
      
      // Structure the data for the backend API
      const signupData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        passwordConfirm: userData.confirmPassword
      };
      
      const response = await apiService.post('/auth/signup', signupData);
      
      // After successful registration, log the user in
      if (response.data && response.data.token) {
        user.value = response.data.user;
        token.value = response.data.token;
        isAuthenticated.value = true;
        localStorage.setItem('token', token.value);
        
        // Redirect to home or verification page
        const redirectPath = returnUrl.value || '/';
        window.location.href = redirectPath;
        returnUrl.value = null;
      }
      
      return response;
    } catch (err) {
      console.error('Signup error:', err);
      error.value = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
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
    window.location.href = '/login';
    
    // Clear any API authorization
    apiService.defaults.headers.common['Authorization'] = '';
  };

  /**
   * Fetch the current authenticated user
   */
  const fetchUser = async () => {
    try {
      const response = await apiService.get('/users/me');
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
      // Token refresh not implemented in simplified version
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
      
      // Password reset not implemented in simplified version
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
  /**
   * Update user profile
   */
  const updateProfile = async (profileData) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await apiService.patch('/users/me', profileData);
      user.value = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(user.value));
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'Update failed';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Login with Google
   */
  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/auth/google`;
  };

  /**
   * Login with Facebook
   */
  const loginWithFacebook = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/auth/facebook`;
  };

  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    
    // Actions
    fetchUser,
    signup,
    login,
    logout,
    updateProfile,
    loginWithGoogle,
    loginWithFacebook,
  };
});
