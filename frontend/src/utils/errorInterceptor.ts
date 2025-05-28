/**
 * Error interceptor for API responses
 * This will automatically handle authentication errors and redirect to login page
 */

import axios from 'axios';

/**
 * Setup axios interceptor to handle authentication errors
 */
export const setupAxiosInterceptors = () => {
  // Response interceptor
  axios.interceptors.response.use(
    (response) => response, // Just return successful responses
    (error) => {
      // Handle 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        // Clean up auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );
};
