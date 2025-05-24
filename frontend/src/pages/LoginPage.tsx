// pages/LoginPage.tsx
import { Container, Box, TextField, Button, Typography, Link, CircularProgress, Alert } from '@mui/material';
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
  const [loading, setLoading] = useState(false);
  const [csrfStatus, setCsrfStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const fetchCsrfToken = async () => {
    setCsrfStatus('loading');
    try {
      const csrfToken = await ensureCsrfToken();
      
      if (csrfToken) {
        console.log('CSRF token successfully retrieved');
        setCsrfStatus('success');
        return csrfToken;
      } else {
        console.error('Failed to fetch CSRF token');
        setCsrfStatus('error');
        return null;
      }
    } catch (err) {
      console.error('Error fetching CSRF token:', err);
      setCsrfStatus('error');
      return null;
    }
  };

  useEffect(() => {
    // Fetch CSRF token when component mounts
    fetchCsrfToken();

    // Redirect if already authenticated
    if (isAuthenticated) {
      const dashboardPath = userType === 'host' ? '/host-dashboard' : '/client-dashboard';
      navigate(dashboardPath);
    }
  }, [isAuthenticated, userType, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure we have a CSRF token before proceeding
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) {
        setError('Unable to get security token. Please try again or refresh the page.');
        setLoading(false);
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

        // Redirect to the appropriate dashboard based on user type
        if (user.user_type === 'host') {
          navigate('/host-dashboard');
        } else {
          // For client users, check onboarding completion
          try {
            // Check if onboarding is complete
            const onboardingResponse = await fetch(`${API_BASE_URL}/api/onboarding/user-onboarding-status/`, {
              headers: {
                'Authorization': `Token ${responseData.token}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            });
            
            if (onboardingResponse.ok) {
              const statusData = await onboardingResponse.json();
              if (statusData.is_complete) {
                // Onboarding is complete, go to client dashboard
                navigate('/client-dashboard');
              } else {
                // Onboarding is not complete, direct to onboarding
                navigate('/onboarding');
              }
            } else {
              // If we can't determine onboarding status, default to onboarding
              navigate('/onboarding');
            }
          } catch (err) {
            console.error('Error checking onboarding status:', err);
            navigate('/onboarding');
          }
        }
      } else {
        console.error('Login failed:', responseData);
        setError(responseData.error || responseData.non_field_errors?.[0] || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to try again getting CSRF token
  const handleRetryCsrf = async () => {
    setCsrfStatus('loading');
    const result = await fetchCsrfToken();
    if (result) {
      setError('');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        
        {csrfStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Security token could not be retrieved. 
            <Button color="inherit" size="small" onClick={handleRetryCsrf} sx={{ ml: 1 }}>
              Try Again
            </Button>
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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
            disabled={loading || csrfStatus === 'loading'}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || csrfStatus === 'loading'}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || csrfStatus === 'loading' || csrfStatus === 'error'}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
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