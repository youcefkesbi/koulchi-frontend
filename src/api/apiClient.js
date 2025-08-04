import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

// Create axios instance with base URL and headers
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    
    // Add auth token to request if it exists
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If this is a login request, don't try to refresh token
      if (originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      // Mark the request to prevent infinite retry loops
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await authStore.refreshToken();
        
        // Update the authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${authStore.token}`;
        
        // Retry the original request with the new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, log the user out
        await authStore.logout();
        router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

/**
 * Make a GET request
 * @param {string} url - The URL to make the request to
 * @param {Object} params - Query parameters
 * @param {Object} config - Additional axios config
 * @returns {Promise} - The response data
 */
const get = (url, params = {}, config = {}) => {
  return apiClient.get(url, { params, ...config });
};

/**
 * Make a POST request
 * @param {string} url - The URL to make the request to
 * @param {Object} data - The data to send in the request body
 * @param {Object} config - Additional axios config
 * @returns {Promise} - The response data
 */
const post = (url, data = {}, config = {}) => {
  return apiClient.post(url, data, config);
};

/**
 * Make a PUT request
 * @param {string} url - The URL to make the request to
 * @param {Object} data - The data to send in the request body
 * @param {Object} config - Additional axios config
 * @returns {Promise} - The response data
 */
const put = (url, data = {}, config = {}) => {
  return apiClient.put(url, data, config);
};

/**
 * Make a PATCH request
 * @param {string} url - The URL to make the request to
 * @param {Object} data - The data to send in the request body
 * @param {Object} config - Additional axios config
 * @returns {Promise} - The response data
 */
const patch = (url, data = {}, config = {}) => {
  return apiClient.patch(url, data, config);
};

/**
 * Make a DELETE request
 * @param {string} url - The URL to make the request to
 * @param {Object} config - Additional axios config
 * @returns {Promise} - The response data
 */
const del = (url, config = {}) => {
  return apiClient.delete(url, config);
};

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  instance: apiClient,
};
