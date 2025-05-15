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

// Set base URL for API requests
axios.defaults.baseURL = API_BASE_URL;

// Ensure credentials are included
axios.defaults.withCredentials = true;

// Enhanced getCookie function
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

// Initialize CSRF token
const initializeCSRF = async () => {
  try {
    await axios.get('/api/auth/csrf/');
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
    } else {
      console.warn('Failed to get CSRF token from cookies after initialization.');
    }
  } catch (error) {
    console.error('CSRF initialization failed:', error);
  }
};

// Call this before rendering your app
initializeCSRF().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});