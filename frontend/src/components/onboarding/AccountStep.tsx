// components/onboarding/AccountStep.tsx
import { Box, TextField, Typography, Button } from '@mui/material';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/constants';

const AccountStep = () => {
  const { data, setData } = useOnboarding();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      account: {
        ...prev.account,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/token/' : '/api/auth/register/';
      const payload = isLogin 
        ? { email: data.account.email, password: data.account.password }
        : {
            email: data.account.email,
            password: data.account.password,
            first_name: data.account.fullName.split(' ')[0],
            last_name: data.account.fullName.split(' ').slice(1).join(' '),
            password2: data.account.password,
            user_type: 'client'
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.email?.[0] || responseData.error || 'Authentication failed');
      }

      if (isLogin) {
        // For login, proceed with full authentication
        const userType = responseData.user_type || 'client';
        await login(responseData.token, userType, responseData.user);
        
        // Redirect to the appropriate dashboard based on user type
        if (userType === 'host') {
          navigate('/host-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      } else {
        // For registration, redirect to login page
        navigate('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        {isLogin ? 'Login' : 'Create Account'}
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <TextField
            name="fullName"
            label="Full Name"
            value={data.account.fullName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
        )}
        <TextField
          name="email"
          label="Email"
          type="email"
          value={data.account.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          value={data.account.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </Button>
      </form>

      <Button
        onClick={() => setIsLogin(!isLogin)}
        sx={{ mt: 2 }}
      >
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </Button>
    </Box>
  );
};

// Helper function to get CSRF token
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export default AccountStep;