// pages/LoginPage.tsx
import { Container, Box, TextField, Button, Typography, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ensureCsrfToken } from '../utils/csrf';
import { API_BASE_URL } from '../utils/constants';

const LoginPage = () => {
  const { login, isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/csrf/`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch CSRF token:', response.statusText);
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
      // Ensure we have a CSRF token before proceeding
      const csrfToken = await ensureCsrfToken();
      if (!csrfToken) {
        setError('Unable to get security token. Please refresh the page.');
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

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        // Construct user object from response data
        const user = {
          id: responseData.user_id,
          email: responseData.email,
          first_name: responseData.first_name,
          last_name: responseData.last_name,
          user_type: responseData.user_type || 'client'
        };

        // Complete the login process
        await login(
          responseData.token,
          responseData.user_type || 'client',
          user
        );

        // Redirect directly to the appropriate dashboard based on user type
        // Bypassing onboarding for all users
        if (user.user_type === 'host') {
          navigate('/host-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      } else {
        console.error('Login failed:', responseData);
        setError(responseData.error || 'Login failed');
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

export default LoginPage;