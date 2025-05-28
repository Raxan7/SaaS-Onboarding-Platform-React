// utils/apiClient.ts
import { getCookie } from './cookieUtils'; // Extract cookie function to separate file
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const createApiClient = (_getAuthHeader: () => { Authorization: string; } | {}) => {
  const apiClient = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null' || token === 'undefined') {
        return Promise.reject(new Error('Authentication token is missing or invalid.'));
      } else {
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
          // Extract error details from response
          const contentType = response.headers.get('content-type');
          let errorData;

          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            
            // Handle different error formats
            if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.non_field_errors) {
              errorMessage = Array.isArray(errorData.non_field_errors) 
                ? errorData.non_field_errors.join('. ') 
                : errorData.non_field_errors;
            } else {
              // Handle field-specific errors
              const fieldErrors = [];
              for (const [field, errors] of Object.entries(errorData)) {
                if (Array.isArray(errors)) {
                  fieldErrors.push(`${field}: ${errors.join(', ')}`);
                } else if (typeof errors === 'string') {
                  fieldErrors.push(`${field}: ${errors}`);
                } else if (errors && typeof errors === 'object') {
                  fieldErrors.push(`${field}: ${JSON.stringify(errors)}`);
                }
              }
              
              if (fieldErrors.length > 0) {
                errorMessage = fieldErrors.join('. ');
              }
            }
            
            console.error(`API error (${response.status}):`, errorData || errorMessage);
          } else {
            // Try to extract text content if not JSON
            const textContent = await response.text();
            if (textContent) {
              errorMessage = textContent;
            }
            console.error('API error text response:', errorMessage);
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      try {
        const jsonData = await response.json();
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
      apiClient(endpoint, { 
        method: 'POST', 
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...(_getAuthHeader())
        }
      }),
    put: (endpoint: string, data: any) => 
      apiClient(endpoint, { 
        method: 'PUT', 
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...(_getAuthHeader())
        }
      }),
    delete: (endpoint: string) => apiClient(endpoint, { 
      method: 'DELETE',
      headers: {
        ...(_getAuthHeader())
      }
    }),
    patch: (endpoint: string, data: any) => 
      apiClient(endpoint, { 
        method: 'PATCH', 
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...(_getAuthHeader())
        }
      })
  };
};

export const useApiClient = () => {
  const { getAuthHeader } = useAuth();
  return createApiClient(getAuthHeader);
};