// pages/LoginPage.tsx
import { Container, Box, TextField, Button, Typography, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';

const LoginPage = () => {
  const { login, isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('/api/auth/csrf/', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch CSRF token:', response.statusText);
      } else {
        console.log('CSRF token fetched successfully');
      }
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
    }
  };

  useEffect(() => {
    fetchCsrfToken();

    // Redirect if already authenticated
    if (isAuthenticated) {
      const dashboardPath = userType === 'host' ? '/host-dashboard' : '/client-dashboard';
      navigate(dashboardPath);
    }
  }, [isAuthenticated, userType, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const csrfToken = getCookie('csrftoken');
      if (!csrfToken) {
        console.error('CSRF token not found');
        setError('CSRF token missing. Please refresh the page.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        const { token, user_id, email, user_type, first_name, last_name } = data;
        const user = {
          id: user_id,
          email,
          first_name,
          last_name,
          user_type
        };

        const { isComplete } = await login(token, user_type, user); // Pass constructed user object here
        const dashboardPath = user_type === 'host' ? '/host-dashboard' : '/client-dashboard';
        
        if (isComplete) {
          navigate(dashboardPath); // Redirect to appropriate dashboard
        } else {
          navigate('/onboarding');
        }
      } else {
        console.error('Login failed:', data);
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
        </form>
        <Typography>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/onboarding">
            Sign up
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    if (!cookieValue) {
      console.error(`Cookie '${name}' found but has no value.`);
    }
    return cookieValue;
  } else {
    console.error(`Cookie '${name}' not found in document.cookie.`);
    return null;
  }
}

export default LoginPage;