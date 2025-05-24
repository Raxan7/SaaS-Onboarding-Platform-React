import { Box, Typography, Card, CardContent, CircularProgress, Button, Chip, List, ListItem, ListItemIcon, Alert, Collapse, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useState, useEffect, useMemo } from 'react';
import { createApiClient } from '../../utils/apiClient';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const apiClient = useMemo(() => createApiClient(getAuthHeader), [getAuthHeader]);

  useEffect(() => {
    const fetchPlans = async () => {
      if (loading) return;
      setLoading(true);
      try {
        const response = await apiClient.get('/api/subscriptions/plans/');
        
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

        setPlans(plansData);

      } catch (err: any) {
        console.error('Failed to fetch plans:', err);
        setError('Failed to load plans. Please try again later.');

        if (err.message.includes('Invalid token') || err.message.includes('Authentication required')) {
          logout();
          navigate('/login');
          return;
        }

        // Fallback test data
        const fallbackPlans = [
          {
            id: 'price_1RO3HrLa8vPOEHR78kogds4D',
            name: 'Basic Plan',
            price: '$29/month',
            features: [
              '2 qualified meetings included during free trial',
              'Host and join meetings with enhanced features',
              'AI-powered onboarding wizard for initial setup',
              'Secure dashboard with real-time meeting tracking',
              'Access to video tutorials, use cases & comprehensive FAQs',
              'Email support during extended business hours',
              'Basic analytics and meeting insights'
            ],
          },
          {
            id: 'price_1RO3I9La8vPOEHR7d9EzMNvl',
            name: 'Pro Plan',
            price: '$99/month',
            features: [
              'Up to 10 qualified meetings/month',
              'Priority access to live chat support',
              'Advanced meeting tracking dashboard',
              'Team role management (Hosts, Clients)',
              'Automated calendar invites & confirmations',
              'Stripe billing and automatic plan upgrades',
              'Access to customer testimonials dashboard',
              'Enhanced analytics with custom reporting'
            ],
          },
          {
            id: 'price_1RPhD8La8vPOEHR7GtHdIp91',
            name: 'Enterprise Plan',
            price: '$499/month',
            features: [
              'Unlimited qualified meetings/month',
              'Dedicated account manager',
              'Comprehensive analytics with customizable exports',
              'Full API access & enterprise integrations (CRM, ERP)',
              'Custom roles with granular permission controls',
              '24/7 SLA-backed premium support',
              'Advanced branding & white-label options',
              'SSO authentication & enhanced security features'
            ],
          },
        ];
        setPlans(fallbackPlans);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPlans();
    } else {
      navigate('/login');
    }
  }, [token, logout, navigate, apiClient]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentSuccessParam = params.get('payment_success');
    const sessionId = params.get('session_id');

    // When user returns from Stripe with success parameter
    if (paymentSuccessParam === 'true' && sessionId) {
      console.log('Payment success detected with session ID:', sessionId);
      
      // Robust payment completion process with retries
      (async () => {
        setPaymentProcessing(true);
        setError('');
        
        // Collect all possible plan IDs to ensure we have the correct one
        const planId = data.payment.planId || sessionStorage.getItem('selected_plan_id');
        console.log('Using plan ID for payment completion:', planId);
        
        // Try up to 3 times to complete the payment
        let attempts = 0;
        let success = false;
        
        while (attempts < 3 && !success) {
          attempts++;
          console.log(`Payment completion attempt ${attempts}/3`);
          
          try {
            // First verify the payment status with Stripe
            const verifyResponse = await apiClient.get(`/api/subscriptions/check-payment-status/?session_id=${sessionId}`);
            console.log('Payment verification response:', verifyResponse);
            
            if (verifyResponse?.status === 'completed' || verifyResponse?.payment_status === 'paid') {
              console.log('Payment verified as completed with Stripe');
            } else {
              console.log('Payment not yet verified with Stripe, continuing anyway');
            }
            
            // Now complete the payment in our system
            console.log('Notifying backend about successful payment');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/onboarding/user-onboarding-status/payment/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
              },
              body: JSON.stringify({
                session_id: sessionId,
                payment_success: true,
                plan_id: planId
              })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Failed to register payment completion:', response.status, errorText);
              
              // Try the subscriptions API as a fallback
              console.log('Trying fallback payment confirmation endpoint');
              const fallbackResponse = await apiClient.post('/api/subscriptions/confirm-payment/', {
                session_id: sessionId
              });
              
              if (fallbackResponse) {
                console.log('Fallback payment confirmation successful');
                success = true;
              } else {
                throw new Error('Both payment registration attempts failed');
              }
            } else {
              const data = await response.json();
              console.log('Payment successfully registered in backend:', data);
              success = true;
            }
            
            if (success) {
              // Update frontend state
              setPaymentSuccess(true);
              setData(prev => ({
                ...prev,
                paymentStepCompleted: true
              }));
              
              // Clear URL params and redirect
              window.history.replaceState({}, '', '/client-dashboard');
              console.log('Payment registration complete, redirecting to dashboard');
              setTimeout(() => {
                navigate('/client-dashboard');
              }, 2000);
              
              break; // Exit the retry loop
            }
          } catch (error) {
            console.error(`Error completing payment (attempt ${attempts}/3):`, error);
            if (attempts === 3) {
              setError('Error registering payment. Your payment was processed but we had trouble updating your account. Please contact support or try refreshing the page.');
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        // Even if we couldn't confirm payment in our system, still redirect after delay
        // The subscription might have been created by the webhook
        if (!success) {
          console.log('Could not confirm payment in our system, redirecting anyway');
          setTimeout(() => {
            navigate('/client-dashboard');
          }, 5000);
        }
        
        setPaymentProcessing(false);
      })();
    }
  }, [location.search, navigate, setData, token, data.payment.planId, apiClient]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!data.payment?.planId) {
        setError('Please select a plan first.');
        setLoading(false);
        return;
      }
      
      console.log('Starting payment process for plan ID:', data.payment.planId);
      
      // Step 1: Save the selected plan ID to the backend and session storage for redundancy
      try {
        // Store in session storage first as a failsafe
        try {
          sessionStorage.setItem('selected_plan_id', data.payment.planId);
          // Also store in local storage as backup for session storage
          localStorage.setItem('selected_plan_id', data.payment.planId);
        } catch (storageError) {
          console.warn('Failed to store data in client storage:', storageError);
        }
        
        // Then save to backend
        const updateResponse = await apiClient.post('/api/onboarding/update-payment-info/', {
          plan_id: data.payment.planId
        });
        console.log('Plan ID saved to backend:', updateResponse);
      } catch (err: any) {
        console.error('Failed to save plan ID to backend:', err);
        if (err.response?.status === 400) {
          setError(err.response.data.error || 'Invalid plan ID. Please select another plan.');
          setLoading(false);
          return;
        }
      }
      
      // Step 2: Create checkout session with Stripe
      console.log('Creating Stripe checkout session for plan ID:', data.payment.planId);
      const response = await apiClient.post('/api/subscriptions/create-checkout-session/', {
        price_id: data.payment.planId,
      });

      console.log('Checkout session created, response:', response);
      
      // Step 3: Extract the session URL and ID from the response
      let sessionUrl = '';
      let sessionId = '';
      
      // Handle different response formats
      if (response?.url) {
        sessionUrl = response.url;
      } else if (response?.data?.url) {
        sessionUrl = response.data.url;
      } else if (typeof response === 'string' && response.includes('http')) {
        sessionUrl = response;
      } else if (response?.checkout_url) {
        sessionUrl = response.checkout_url;
      } else if (response?.session_url) {
        sessionUrl = response.session_url;
      }
      
      // Try to extract session ID
      if (response?.session_id) {
        sessionId = response.session_id;
      } else if (response?.data?.session_id) {
        sessionId = response.data.session_id;
      }
      
      if (!sessionUrl) {
        throw new Error("Failed to retrieve Stripe checkout URL");
      }
      
      console.log('Extracted session URL:', sessionUrl);
      
      // Step 4: Store session ID in storage and update onboarding context
      try {
        if (sessionId) {
          sessionStorage.setItem('stripe_session_id', sessionId);
          localStorage.setItem('stripe_session_id', sessionId);
        }
        
        // Also store the full plan data for better recovery
        if (plans) {
          const selectedPlan = plans.find(plan => plan.id === data.payment.planId);
          if (selectedPlan) {
            sessionStorage.setItem('selected_plan_data', JSON.stringify(selectedPlan));
            localStorage.setItem('selected_plan_data', JSON.stringify(selectedPlan));
          }
        }
        
        // Update context with plan data too
        const planData = plans.find(plan => plan.id === data.payment.planId);
        if (planData) {
          setData(prev => ({
            ...prev,
            payment: {
              ...prev.payment,
              planId: data.payment.planId,
              plans: [planData]
            }
          }));
        }
      } catch (storageError) {
        console.warn('Failed to store data in storage:', storageError);
      }
      
      // Step 5: Make additional API call to ensure plan is recorded properly
      try {
        // This is a redundancy measure to ensure the plan is recorded
        await apiClient.post('/api/subscriptions/confirm-payment/', {
          session_id: sessionId,
          plan_id: data.payment.planId
        });
      } catch (confirmError) {
        console.warn('Pre-confirmation failed, but proceeding to checkout:', confirmError);
      }
      
      // Step 6: Redirect to Stripe checkout
      console.log('Redirecting to Stripe checkout URL:', sessionUrl);
      window.location.href = sessionUrl;
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

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select a Plan
      </Typography>
      
      {/* Payment success message */}
      <Collapse in={paymentSuccess}>
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setPaymentSuccess(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          Payment successful! Redirecting to dashboard...
        </Alert>
      </Collapse>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Payment processing message */}
      {paymentProcessing && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            Verifying your payment, please wait...
          </Box>
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.isArray(plans) && plans.length > 0 ? (
          plans.map((plan) => {
            const isPro = plan.name === 'Pro Plan';
            const isBasic = plan.name === 'Basic Plan';
            const isEnterprise = plan.name === 'Enterprise Plan';
            
            return (
              <motion.div whileHover={{ y: -10 }} key={plan.id} style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                <Card 
                  onClick={() => {
                    setData(prev => ({
                      ...prev,
                      payment: { ...prev.payment, planId: plan.id }
                    }));
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
          onClick={() => navigate('/client-dashboard')}
          disabled={loading || paymentProcessing}
        >
          Skip for now
        </Button>
        <Button
          variant="contained"
          onClick={debouncedHandlePayment}
          disabled={!data.payment.planId || loading || paymentProcessing}
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
          {loading || paymentProcessing ? (
            <CircularProgress size={24} />
          ) : (
            'Continue to Payment'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentStep;