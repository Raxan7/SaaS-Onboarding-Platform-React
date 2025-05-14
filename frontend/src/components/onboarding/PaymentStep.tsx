import { Box, Typography, Card, CardContent, CircularProgress, Button } from '@mui/material';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useState, useEffect, useMemo } from 'react';
import { createApiClient } from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { debounce } from '../../utils/debounce';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

const PaymentStep = () => {
  const { data, setData } = useOnboarding();
  const { token, getAuthHeader, logout } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const navigate = useNavigate();
  const apiClient = useMemo(() => createApiClient(getAuthHeader), [getAuthHeader]);

  useEffect(() => {
    const fetchPlans = async () => {
      if (loading) return;
      setLoading(true);
      try {
        const response = await apiClient.get('/api/subscriptions/plans/');
        console.log('Full plans response:', response);
        console.log('response.data:', response.data);

        let plansData = [];
        if (Array.isArray(response?.data)) {
          plansData = response.data;
        } else if (Array.isArray(response?.data?.plans)) {
          plansData = response.data.plans;
        } else if (Array.isArray(response)) {
          plansData = response;
        } else {
          throw new Error('Unexpected plan response structure');
        }

        console.log('Parsed plans data:', plansData);
        setPlans(plansData);

      } catch (err: any) {
        console.error('Failed to fetch plans:', err);
        setError('Failed to load plans. Please try again later.');

        if (
          err.message.includes('Invalid token') ||
          err.message.includes('Authentication required')
        ) {
          logout();
          navigate('/login');
          return; // Prevent further execution
        }

        // Fallback test data
        const fallbackPlans = [
          {
            id: 'price_1RO3HrLa8vPOEHR78kogds4D',
            name: 'Basic Plan',
            price: '$29/month',
            features: ['Up to 100 users', 'Basic support', 'Core features'],
          },
          {
            id: 'price_1RO3I9La8vPOEHR7d9EzMNvl',
            name: 'Pro Plan',
            price: '$99/month',
            features: ['Up to 500 users', 'Priority support', 'All features'],
          },
        ];
        console.log('Fallback plans set:', fallbackPlans);
        setPlans(fallbackPlans);
      } finally {
        setLoading(false);
        console.log('Loading state set to false');
      }
    };

    if (token) {
      fetchPlans();
    } else {
      navigate('/login');
    }
  }, [token, logout, navigate, apiClient]);

  const handlePayment = async () => {
    try {
      const response = await apiClient.post('/api/subscriptions/create-checkout-session/', {
        price_id: data.payment.planId,
      });

      const sessionUrl = response?.url;

      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        console.error("Stripe response missing URL:", response);
        throw new Error("Failed to retrieve Stripe checkout URL");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error.message || "Failed to create checkout session");
    }
  };

  const debouncedHandlePayment = debounce(handlePayment, 1000);

  if (loading && (!plans || plans.length === 0)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading plans...</Typography>
      </Box>
    );
  }

  console.log('Final plans array:', plans); // Log final plans before rendering

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select a Plan
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {Array.isArray(plans) && plans.length > 0 ? (
          plans.map((plan) => {
            console.log('Rendering plan:', plan);
            return (
              <Card 
                key={plan.id}
                onClick={() => {
                  setData(prev => {
                    const updated = {
                      ...prev,
                      payment: { ...prev.payment, planId: plan.id }
                    };
                    console.log('Updated data:', updated);
                    return updated;
                  });
                }}
                sx={{ 
                  cursor: 'pointer',
                  minWidth: 275,
                  border: data.payment.planId === plan.id ? '2px solid #6C63FF' : '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                    {plan.price}
                  </Typography>
                  <ul style={{ paddingLeft: '20px' }}>
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Typography>No plans available</Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/dashboard')}
          disabled={loading}
        >
          Skip for now
        </Button>
        <Button
          variant="contained"
          onClick={debouncedHandlePayment}
          disabled={!data.payment.planId || loading || paymentInitiated}
        >
          {loading ? <CircularProgress size={24} /> : 'Continue to Payment'}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentStep;