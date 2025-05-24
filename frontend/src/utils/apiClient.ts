// utils/apiClient.ts
import { getCookie } from './cookieUtils'; // Extract cookie function to separate file
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const createApiClient = (_getAuthHeader: () => { Authorization: string; } | {}) => {
  const apiClient = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null' || token === 'undefined') {
        console.warn('Token is null or invalid. Ensure the user is logged in before making API calls.');
        return Promise.reject(new Error('Authentication token is missing or invalid.'));
      } else {
        console.log('Token found in localStorage:', token); // Debugging log
      }

      const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || '',
        Authorization: token ? `Token ${token}` : '', // Use 'Token' prefix for the Authorization header
        ...options.headers,
      };

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (response.status === 401) {
        // Clear auth data on 401 Unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          // If response is not JSON, use text content if available
          try {
            const textContent = await response.text();
            console.error('API error text response:', textContent);
            if (textContent) errorMessage += `: ${textContent}`;
          } catch (textError) {
            console.error('Failed to extract error text content', textError);
          }
        }
        throw new Error(errorMessage);
      }

      try {
        const jsonData = await response.json();
        console.log(`API response for ${endpoint}:`, jsonData);
        return jsonData;
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Failed to parse API response as JSON');
      }
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };

  return {
    get: (endpoint: string) => apiClient(endpoint, { method: 'GET' }),
    post: (endpoint: string, data: any) => 
      apiClient(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint: string, data: any) => 
      apiClient(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint: string) => apiClient(endpoint, { method: 'DELETE' }),
    patch: (endpoint: string, data: any) => 
      apiClient(endpoint, { method: 'PATCH', body: JSON.stringify(data) })
  };
};

export const useApiClient = () => {
  const { getAuthHeader } = useAuth();
  return createApiClient(getAuthHeader);
};