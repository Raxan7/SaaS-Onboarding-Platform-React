import { Typography, Box, Grid, Card, CardContent, LinearProgress, Paper, Alert, Chip, IconButton, Collapse } from '@mui/material';
import { CheckCircle, People, TrendingUp, CalendarToday, RadioButtonUnchecked, Close } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ActiveMeeting from '../components/meetings/ActiveMeeting';
import { useTheme } from '@mui/material';

const onboardingSteps = [
  { name: 'Account Setup', completed: true },
  { name: 'Company Info', completed: false },
  { name: 'Meeting Scheduling', completed: false },
  { name: 'Payment', completed: false },
];

export default function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();
  
  const [onboardingStatus, setOnboardingStatus] = useState({
    completedSteps: 1,
    totalSteps: 4,
  });
  const [showOnboardingAlert, setShowOnboardingAlert] = useState(true);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    // Check if payment_success parameter exists in URL
    const searchParams = new URLSearchParams(location.search);
    const paymentSuccess = searchParams.get('payment_success') === 'true';
    setShowPaymentSuccess(paymentSuccess);

    // Mark onboarding as complete if payment was successful
    const markPaymentComplete = async () => {
      if (paymentSuccess) {
        try {
          console.log("Marking payment as complete...");
          // Use fetch API directly with full error handling
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/onboarding/user-onboarding-status/payment/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('token')}`
            },
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error from payment completion API:", errorData);
            throw new Error(errorData.error || 'Failed to mark payment as complete');
          }
          
          const result = await response.json();
          console.log("Payment marked as complete:", result);
          
          // Refetch onboarding status to update UI
          await fetchOnboardingStatus();
        } catch (error) {
          console.error('Error marking payment complete:', error);
        }
      }
    };

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
        console.log('Onboarding status:', status);
        
        if (status) {
          // If the payment is complete or the whole onboarding is complete, mark all steps as completed
          const isPaymentComplete = status.payment_step_completed || status.is_complete;
          const completedSteps = isPaymentComplete ? 4 : (status.current_step || 1);
          
          setOnboardingStatus({
            completedSteps,
            totalSteps: 4,
          });
          
          // Only show the onboarding alert if the onboarding is not complete
          setShowOnboardingAlert(!status.is_complete);
        }
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
      }
    };

    // First fetch the status, then handle payment completion if needed
    fetchOnboardingStatus();
    if (paymentSuccess) {
      // Show a success message for payment
      setShowPaymentSuccess(true);
      // Mark payment as complete in the backend
      markPaymentComplete();
    }
  }, [location.search]);

  // Display payment success alert
  useEffect(() => {
    if (showPaymentSuccess) {
      // Hide the payment success alert after 10 seconds
      const timer = setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [showPaymentSuccess]);

  const onboardingPercentage = Math.round(
    (onboardingStatus.completedSteps / onboardingStatus.totalSteps) * 100
  );

  const metrics = [
    { title: 'Onboarding Progress', value: `${onboardingPercentage}%`, icon: <TrendingUp fontSize="large" color="primary" /> },
    { title: 'Upcoming Meetings', value: '2', icon: <CalendarToday fontSize="large" color="secondary" /> },
    { title: 'Active Users', value: '1', icon: <People fontSize="large" color="warning" /> },
    { title: 'Completed Meetings', value: '3', icon: <CheckCircle fontSize="large" color="success" /> },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Welcome back, {user?.first_name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's what's happening with your account today
        </Typography>
      </Box>

      {/* Payment Success Alert */}
      <Collapse in={showPaymentSuccess}>
        <Alert 
          severity="success" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowPaymentSuccess(false)}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
          icon={<CheckCircle fontSize="inherit" />}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="body1" fontWeight={500}>
              Payment successful! Your subscription is now active.
            </Typography>
          </Box>
        </Alert>
      </Collapse>

      {showOnboardingAlert && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
          action={
            <Chip 
              label="Continue Onboarding" 
              onClick={() => window.location.href = "/onboarding?step=2"}
              color="warning"
              variant="outlined"
              clickable
            />
          }
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="body1">
              Complete your onboarding to schedule your first free meeting
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {onboardingPercentage}% completed
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Metrics Cards */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {metrics.map((metric) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={metric.title}>
            <Paper elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                      {metric.value}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)', p: 1.5, borderRadius: '50%' }}>
                    {metric.icon}
                  </Box>
                </Box>
              </CardContent>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
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
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Active Meeting
              </Typography>
              <ActiveMeeting />
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}