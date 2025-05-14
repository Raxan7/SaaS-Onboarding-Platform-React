// utils/apiClient.ts
import { getCookie } from './cookieUtils'; // Extract cookie function to separate file
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const createApiClient = (_getAuthHeader: () => { Authorization: string; } | {}) => {
  const apiClient = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null') {
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
      // Handle token expiration if needed
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
  };

  return {
    get: (endpoint: string) => apiClient(endpoint, { method: 'GET' }),
    post: (endpoint: string, data: any) => 
      apiClient(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint: string, data: any) => 
      apiClient(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint: string) => apiClient(endpoint, { method: 'DELETE' }),
  };
};

export const useApiClient = () => {
  const { getAuthHeader } = useAuth();
  return createApiClient(getAuthHeader);
};