import { Box, Typography, Card, CardContent, CircularProgress, Button, Chip, List, ListItem, ListItemIcon } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useState, useEffect, useMemo } from 'react';
import { createApiClient } from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { debounce } from '../../utils/debounce';
import { motion } from 'framer-motion';

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
            features: [
              '1 qualified meeting included (Free Trial)',
              'Access to AI-powered onboarding wizard',
              'Personalized welcome guide',
              'Secure account dashboard access',
              'Standard onboarding use cases & video demos',
              'Email support during trial period',
              'Access to FAQs & knowledge base'
            ],
          },
          {
            id: 'price_1RO3I9La8vPOEHR7d9EzMNvl',
            name: 'Pro Plan',
            price: '$99/month',
            features: [
              'Up to 5 qualified meetings per month',
              'Onboarding progress tracking dashboard',
              'Full feature walkthrough with real-time AI insights',
              'Customizable onboarding workflows per client',
              'Priority email & live chat support',
              'Stripe billing integration & plan auto-upgrade',
              'Customer testimonials management access',
              'Advanced usage analytics'
            ],
          },
          {
            id: 'price_1RPhD8La8vPOEHR7GtHdIp91',
            name: 'Enterprise Plan',
            price: '$499/month',
            features: [
              'Unlimited qualified meetings',
              'Dedicated success manager',
              'Custom integration (CRM, scheduling, etc.)',
              'Role-based dashboard customization',
              'SLA-backed support & live onboarding sessions',
              'Full onboarding data exports & compliance support',
              'Branding customization and white-labeling options'
            ],
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
      setLoading(true);
      // Mark the payment step as completed in the context
      setData(prev => ({
        ...prev,
        paymentStepCompleted: true
      }));
      
      // Save the selected plan ID to the backend
      try {
        await apiClient.post('/api/onboarding/update-payment-info/', {
          plan_id: data.payment.planId
        });
        console.log('Payment plan saved to backend:', data.payment.planId);
      } catch (err: any) {
        console.error('Failed to save plan ID to backend:', err);
        if (err.response?.status === 400) {
          setError(err.response.data.error || 'Invalid plan ID. Please select another plan.');
          setLoading(false);
          return;
        }
        // Continue with checkout for other errors
      }
      
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
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(error.message || "Failed to create checkout session");
      }
    } finally {
      setLoading(false);
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

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.isArray(plans) && plans.length > 0 ? (
          plans.map((plan) => {
            console.log('Rendering plan:', plan);
            
            // Determine plan colors and highlights
            const isPro = plan.name === 'Pro Plan';
            const isBasic = plan.name === 'Basic Plan';
            const isEnterprise = plan.name === 'Enterprise Plan';
            
            return (
              <motion.div whileHover={{ y: -10 }} key={plan.id} style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                <Card 
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
                    height: '100%',
                    border: data.payment.planId === plan.id ? '2px solid #6C63FF' : 
                           isBasic ? '2px solid #4caf50' : 
                           isEnterprise ? '2px solid #333' : 'none',
                    transform: isPro ? 'scale(1.03)' : 'none',
                    borderRadius: 2,
                    boxShadow: isPro ? '0 8px 24px rgba(108, 99, 255, 0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.3s ease',
                    bgcolor: data.payment.planId === plan.id ? 'rgba(108, 99, 255, 0.04)' : 'white'
                  }}
                >
                  {isBasic && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: -12, 
                      left: 0, 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'center' 
                    }}>
                      <Chip 
                        label="Most Popular for Beginners" 
                        size="small" 
                        sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 'bold' }} 
                      />
                    </Box>
                  )}
                  {isPro && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: -12, 
                      left: 0, 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'center' 
                    }}>
                      <Chip 
                        label="Most Popular" 
                        size="small" 
                        sx={{ bgcolor: '#6C63FF', color: 'white', fontWeight: 'bold' }} 
                      />
                    </Box>
                  )}
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      {plan.name.replace(' Plan', '')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {plan.price.split('/')[0]}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        /month
                      </Typography>
                    </Box>
                    <List sx={{ pl: 0 }}>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon 
                              color={
                                isBasic ? "success" : 
                                isPro ? "primary" : 
                                "action"
                              } 
                            />
                          </ListItemIcon>
                          <Typography variant="body2">{feature}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
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
          disabled={!data.payment.planId || loading}
          color={
            data.payment.planId?.includes('1RO3HrLa8vPOEHR78kogds4D') ? 'success' :
            data.payment.planId?.includes('1RO3I9La8vPOEHR7d9EzMNvl') ? 'primary' :
            data.payment.planId?.includes('1RPhD8La8vPOEHR7GtHdIp91') ? 'inherit' :
            'primary'
          }
          sx={{
            fontWeight: 'medium',
            py: 1.5,
            px: 4
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Continue to Payment'}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentStep;