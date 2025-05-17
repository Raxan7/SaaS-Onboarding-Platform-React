// utils/api.ts
import { createApiClient } from './apiClient';

// Create a default API client that doesn't require context
const getDefaultAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Token ${token}` } : {};
};

const api = createApiClient(getDefaultAuthHeader);

export default api;
