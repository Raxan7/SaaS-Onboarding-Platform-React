import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globalStyles.css';

// Load Inter font
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import axios from 'axios';
import { API_BASE_URL } from './utils/constants';
import { fetchCSRFToken } from './utils/csrf';
import { setupAxiosInterceptors } from './utils/errorInterceptor';

// Set base URL for API requests
axios.defaults.baseURL = API_BASE_URL;

// Ensure credentials are included in all requests
axios.defaults.withCredentials = true;

// Initialize CSRF token
const initializeCSRF = async () => {
  try {
    const csrfToken = await fetchCSRFToken();
    
    if (csrfToken) {
      // Set the token in axios defaults for all future requests
      axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
      console.log('Successfully initialized CSRF token');
    } else {
      console.warn('Failed to get CSRF token during initialization');
      
      // Setup retry mechanism using an event listener
      document.addEventListener('click', async () => {
        if (!axios.defaults.headers.common['X-CSRFToken']) {
          const retryToken = await fetchCSRFToken();
          if (retryToken) {
            axios.defaults.headers.common['X-CSRFToken'] = retryToken;
            console.log('CSRF token initialized on user interaction');
          }
        }
      }, { once: true });
    }
  } catch (error) {
    console.error('CSRF initialization failed:', error);
  }
};

// Register axios interceptor to always include CSRF token
axios.interceptors.request.use(async (config) => {
  // If we don't have a CSRF token yet, try to get one
  if (!config.headers['X-CSRFToken']) {
    const token = await fetchCSRFToken();
    if (token) {
      config.headers['X-CSRFToken'] = token;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Setup error handling interceptors
setupAxiosInterceptors();

// Call initialization before rendering app
initializeCSRF().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});