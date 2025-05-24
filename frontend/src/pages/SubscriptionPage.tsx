import { Typography, Box, Paper, Button, Chip, useTheme, Grid, CardContent, LinearProgress } from '@mui/material';
import { CreditCard as PaymentIcon, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import SubscriptionInfo from '../components/subscriptions/SubscriptionInfo';
import MeetingUsage from '../components/meetings/MeetingUsage';
import { useSubscription } from '../hooks/useSubscription';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Define onboarding steps
const onboardingSteps = [
  { name: 'Account Setup', completed: true },
  { name: 'Company Info', completed: false },
  { name: 'Meeting Scheduling', completed: false },
  { name: 'Payment', completed: false },
];

const SubscriptionPage = () => {
  const theme = useTheme();
  const { subscription } = useSubscription();
  const { user } = useAuth();
  
  const [onboardingStatus, setOnboardingStatus] = useState({
    completedSteps: 1,
    totalSteps: 4,
  });

  // Fetch onboarding status on component mount
  useEffect(() => {
    // Only fetch onboarding status for client users
    if (user?.user_type !== 'client') {
      return;
    }
    
    const fetchOnboardingStatus = async () => {
      try {
        // Use fetch directly for better error handling
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/onboarding/user-onboarding-status/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch onboarding status');
        }
        
        const status = await response.json();
        
        if (status) {
          // If the payment is complete or the whole onboarding is complete, mark all steps as completed
          const isPaymentComplete = status.payment_step_completed || status.is_complete;
          const completedSteps = isPaymentComplete ? 4 : (status.current_step || 1);
          
          setOnboardingStatus({
            completedSteps,
            totalSteps: 4,
          });
        }
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
      }
    };

    fetchOnboardingStatus();
  }, [user]);

  // Calculate onboarding percentage
  const onboardingPercentage = Math.round(
    (onboardingStatus.completedSteps / onboardingStatus.totalSteps) * 100
  );

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Your Subscription
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your plan and billing information
        </Typography>
      </Box>

      {/* Onboarding Progress - only show for client users */}
      {user?.user_type === 'client' && (
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12 }}>
            <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }} data-tour="onboarding-progress">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Onboarding Progress
                  </Typography>
                  <Chip 
                    label={`${onboardingStatus.completedSteps}/${onboardingStatus.totalSteps}`} 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={onboardingPercentage}
                  sx={{ 
                    height: 10, 
                    borderRadius: 5, 
                    mb: 3,
                    backgroundColor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5
                    }
                  }}
                />
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                  gap: 2 
                }}>
                  {onboardingSteps.map((step, index) => (
                    <Box 
                      key={step.name} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: index < onboardingStatus.completedSteps ? 
                          theme.palette.success.light : theme.palette.grey[100]
                      }}
                    >
                      {index < onboardingStatus.completedSteps ? (
                        <CheckCircle color="success" sx={{ mr: 2 }} />
                      ) : (
                        <RadioButtonUnchecked color="disabled" sx={{ mr: 2 }} />
                      )}
                      <Typography variant="body1" fontWeight={500}>
                        {step.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Main subscription content */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SubscriptionInfo />
        </Grid>
        
        {/* Meeting Usage Card */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box data-tour="meeting-usage" sx={{ height: '100%' }}>
            <MeetingUsage />
          </Box>
        </Grid>
      </Grid>

      {/* Payment History */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight={600}>
            Payment History
          </Typography>
          <Button variant="outlined" startIcon={<PaymentIcon />}>
            View All
          </Button>
        </Box>
        <Box sx={{ p: 3 }}>
          {/* You can replace this with actual payment history data */}
          {subscription ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {subscription.plan.name} - Monthly
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString()} 
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1" fontWeight={600}>
                  ${typeof subscription.plan.price === 'number' 
                    ? subscription.plan.price.toFixed(2) 
                    : subscription.plan.price}
                </Typography>
                <Chip 
                  label="Paid" 
                  size="small" 
                  color="success" 
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No payment history available
            </Typography>
          )}
        </Box>
      </Paper>
      
      {/* Billing Information */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight={600}>
            Billing Information
          </Typography>
          <Button variant="outlined">
            Update
          </Button>
        </Box>
        <Box sx={{ p: 3 }}>
          {subscription ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  Visa ending in 4242
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Billing Address
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  123 Business Street, Suite 100
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  San Francisco, CA 94107
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No billing information available
            </Typography>
          )}
        </Box>
      </Paper>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
