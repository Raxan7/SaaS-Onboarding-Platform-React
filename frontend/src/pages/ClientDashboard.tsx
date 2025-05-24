// pages/ClientDashboard.tsx
import { 
  Typography, 
  Box, 
  Grid, 
  CardContent, 
  Alert,
  Divider,
  Collapse,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Paper,
  LinearProgress
} from '@mui/material';
import MeetingsList from '../components/meetings/MeetingsList';
import ActiveMeeting from '../components/meetings/ActiveMeeting';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { CheckCircle, Close, Add as AddIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TimezonePicker from '../components/meetings/TimezonePicker';
import { useApiClient } from '../utils/apiClient';
import { PickerValue } from '@mui/x-date-pickers/internals';
import DashboardLayout from '../components/DashboardLayout';
import { useMeetingLimits } from '../hooks/useMeetingLimits';
import WalkThrough from '../components/WalkThrough';

// Onboarding steps moved to SubscriptionPage

const ClientDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const apiClient = useApiClient();
  
  const [onboardingStatus, setOnboardingStatus] = useState({
    completedSteps: 1,
    totalSteps: 4,
  });
  const [showOnboardingAlert, setShowOnboardingAlert] = useState(true);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showWalkThrough, setShowWalkThrough] = useState(false);
  
  // New Meeting Dialog State
  const [openNewMeetingDialog, setOpenNewMeetingDialog] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: 'Consultation Meeting',
    goals: '',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 30,
    timezone: '',
    host_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [doubleBookingWarning, setDoubleBookingWarning] = useState('');
  
  // Check for availability when time, duration, or timezone changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (openNewMeetingDialog && newMeeting.scheduled_at && newMeeting.timezone) {
        try {
          const response = await apiClient.post('/api/meetings/check-availability/', {
            scheduled_at: newMeeting.scheduled_at.toISOString(),
            duration: newMeeting.duration,
            timezone: newMeeting.timezone
          });
          
          if (!response.available) {
            setDoubleBookingWarning('You already have a meeting scheduled at this time');
          } else {
            setDoubleBookingWarning('');
          }
        } catch (err) {
          console.error('Error checking availability:', err);
        }
      }
    };
    
    checkAvailability();
  }, [newMeeting.scheduled_at, newMeeting.duration, newMeeting.timezone, openNewMeetingDialog, apiClient]);

  useEffect(() => {
    // Check if payment_success parameter exists in URL
    const searchParams = new URLSearchParams(location.search);
    const paymentSuccess = searchParams.get('payment_success') === 'true';
    setShowPaymentSuccess(paymentSuccess);

    // Only fetch onboarding status for client users - hosts don't need to complete onboarding
    if (user?.user_type !== 'client') {
      setShowOnboardingAlert(false);
      return;
    }

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
        console.log('Onboarding status:', status); // For debugging
        
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
  }, [location.search, user?.user_type]);

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

  // Check if the user has completed the walk-through
  useEffect(() => {
    const hasCompletedWalkThrough = localStorage.getItem('walkThroughCompleted') === 'true';
    if (!hasCompletedWalkThrough) {
      // Delay showing the walk-through to allow the page to fully render
      const timer = setTimeout(() => {
        setShowWalkThrough(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const onboardingPercentage = Math.round(
    (onboardingStatus.completedSteps / onboardingStatus.totalSteps) * 100
  );
  
  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | PickerValue) => {
    setNewMeeting(prev => ({ ...prev, [field]: value }));
  };
  
  // Get meeting limits
  const { limits, refresh: refreshLimits } = useMeetingLimits();
  
  // Handle meeting creation
  const handleCreateMeeting = async () => {
    setLoading(true);
    setError('');
    
    // Validation
    if (!newMeeting.title) {
      setError('Meeting title is required');
      setLoading(false);
      return;
    }
    
    if (!newMeeting.goals) {
      setError('Meeting goals are required');
      setLoading(false);
      return;
    }
    
    if (!newMeeting.scheduled_at) {
      setError('Meeting date and time are required');
      setLoading(false);
      return;
    }
    
    if (!newMeeting.timezone) {
      setError('Please select a timezone');
      setLoading(false);
      return;
    }
    
    if (doubleBookingWarning) {
      setError('Please select a different time to avoid scheduling conflicts');
      setLoading(false);
      return;
    }
    
    // Check if user has reached their meeting limit
    if (limits && !limits.can_create) {
      setError(`You've reached your monthly meeting limit (${limits.limit} meetings). Please upgrade your plan for more meetings.`);
      setLoading(false);
      return;
    }
    
    try {
      await apiClient.post('/api/meetings/', {
        title: newMeeting.title,
        goals: newMeeting.goals,
        scheduled_at: newMeeting.scheduled_at.toISOString(),
        duration: newMeeting.duration,
        timezone: newMeeting.timezone,
        host_id: newMeeting.host_id,
        status: 'pending'
      });
      
      // Meeting created successfully
      setSuccess(true);
      
      // Refresh meeting limits to show updated count
      refreshLimits();
      
      // Close the dialog and reset form after a short delay
      setTimeout(() => {
        setOpenNewMeetingDialog(false);
        setNewMeeting({
          title: 'Consultation Meeting',
          goals: '',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30,
          timezone: '',
          host_id: ''
        });
        setSuccess(false);
        // Refresh the page to show the new meeting
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('Error creating meeting:', err);
      // Check if the error is related to meeting limits
      if (err.response && err.response.status === 403 && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to create meeting. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Enhanced Header Section with Gradient Background */}
      <Box sx={{ 
        mb: 6,
        p: 4,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat',
          opacity: 0.1,
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header Content */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 0 } }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight={700} 
                gutterBottom
                sx={{ 
                  background: 'linear-gradient(45deg, #ffffff 30%, #f8f9ff 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
                }}
              >
                Welcome back, {user?.first_name}! ✨
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9,
                  fontWeight: 400,
                  fontSize: { xs: '0.95rem', sm: '1.1rem' }
                }}
              >
                Here's what's happening with your account today
              </Typography>
            </Box>
            
            {/* Tour Button - Only show on desktop */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Button 
                variant="contained"
                size="large"
                onClick={() => setShowWalkThrough(true)}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}
              >
                🎯 Dashboard Tour
              </Button>
            </Box>
          </Box>
          
          {/* Tour Button - Mobile version positioned below header */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 2 }}>
            <Button 
              variant="contained"
              size="medium"
              onClick={() => setShowWalkThrough(true)}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              🎯 Dashboard Tour
            </Button>
          </Box>
        </Box>
      </Box>

      {/* AI Walk-through Component */}
      <WalkThrough open={showWalkThrough} onClose={() => setShowWalkThrough(false)} />

      {/* Enhanced Payment Success Alert */}
      <Collapse in={showPaymentSuccess}>
        <Alert 
          severity="success" 
          sx={{ 
            mb: 4,
            borderRadius: 3,
            bgcolor: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)',
            '& .MuiAlert-message': {
              width: '100%'
            },
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowPaymentSuccess(false)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
          icon={<CheckCircle fontSize="inherit" />}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                🎉 Payment Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your subscription is now active and ready to use.
              </Typography>
            </Box>
          </Box>
        </Alert>
      </Collapse>

      {/* Enhanced Onboarding Alert */}
      {showOnboardingAlert && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 4,
            borderRadius: 3,
            bgcolor: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(255, 193, 7, 0.2)',
            '& .MuiAlert-message': {
              width: '100%'
            },
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
          action={
            <Button 
              variant="contained"
              onClick={() => window.location.href = "/onboarding?step=2"}
              sx={{
                bgcolor: 'rgba(255, 193, 7, 0.8)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255, 193, 7, 1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(255, 193, 7, 0.4)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Continue Setup 🚀
            </Button>
          }
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                🎯 Complete Your Setup
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Finish your onboarding to unlock your first free consultation meeting
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mr: 2 }}>
                  Progress: {onboardingPercentage}%
                </Typography>
                <Box sx={{ width: 100, mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={onboardingPercentage} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 193, 7, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: '#ff9800'
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Alert>
      )}

      {/* Enhanced Active Meeting Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              height: '100%', 
              borderRadius: 4, 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }
            }} 
            data-tour="active-meeting"
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box 
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <Typography variant="h5" sx={{ color: 'white' }}>🎥</Typography>
                </Box>
                <Typography 
                  variant="h5" 
                  fontWeight={700}
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Active Meeting
                </Typography>
              </Box>
              <ActiveMeeting />
            </CardContent>
          </Paper>
        </Grid>
      </Grid>

      {/* Enhanced Meeting Management Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Upcoming Meetings Card */}
        <Grid size={{ xs: 12 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.1)'
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)'
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'white' }}>📅</Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={700}
                    sx={{ 
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Upcoming Meetings
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  onClick={() => setOpenNewMeetingDialog(true)}
                  startIcon={<AddIcon />}
                  disabled={!!(limits && !limits.can_create)}
                  title={limits && !limits.can_create ? `You've reached your limit of ${limits.limit} meetings this month` : ""}
                  data-tour="new-meeting-button"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)',
                      color: '#a0aec0'
                    }
                  }}
                >
                  New Meeting
                </Button>
              </Box>
              <Divider sx={{ mb: 3, bgcolor: 'rgba(102, 126, 234, 0.1)' }} />
              <MeetingsList filter="upcoming" />
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Enhanced Past Meetings Section */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              border: '1px solid rgba(252, 182, 159, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(252, 182, 159, 0.2)'
              }
            }} 
            data-tour="past-meetings"
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box 
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: '0 8px 25px rgba(255, 154, 158, 0.3)'
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white' }}>📚</Typography>
                </Box>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Meeting History
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, bgcolor: 'rgba(252, 182, 159, 0.3)' }} />
              <MeetingsList filter="past" showActions={false} />
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Enhanced New Meeting Dialog */}
      <Dialog 
        open={openNewMeetingDialog} 
        onClose={() => !loading && setOpenNewMeetingDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 4, 
          pb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px 16px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <Typography variant="h6">📅</Typography>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Schedule New Meeting
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(244, 67, 54, 0.15)'
              }}
            >
              {error}
            </Alert>
          )}
          
          {doubleBookingWarning && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(255, 193, 7, 0.15)'
              }}
            >
              {doubleBookingWarning}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)'
              }}
            >
              🎉 Meeting scheduled successfully!
            </Alert>
          )}
          
          {limits && !limits.can_create && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(255, 193, 7, 0.15)'
              }}
            >
              You have reached your monthly meeting limit ({limits.limit} meetings). 
              Please upgrade your plan to schedule more meetings.
            </Alert>
          )}
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Meeting Title"
                value={newMeeting.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                fullWidth
                margin="normal"
                required
                disabled={loading || success}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  }
                }}
              />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DateTimePicker
                    label="Meeting Date & Time"
                    value={newMeeting.scheduled_at}
                    onChange={(newValue) => handleInputChange('scheduled_at', newValue)}
                    disablePast
                    sx={{ 
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': {
                          borderColor: '#667eea'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea'
                        }
                      }
                    }}
                    disabled={loading || success}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl 
                    fullWidth 
                    disabled={loading || success}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': {
                          borderColor: '#667eea'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea'
                        }
                      }
                    }}
                  >
                    <InputLabel>Duration</InputLabel>
                    <Select
                      value={newMeeting.duration.toString()}
                      label="Duration"
                      onChange={(e: SelectChangeEvent) => handleInputChange('duration', parseInt(e.target.value))}
                    >
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={45}>45 minutes</MenuItem>
                      <MenuItem value={60}>60 minutes</MenuItem>
                      <MenuItem value={90}>90 minutes</MenuItem>
                      <MenuItem value={120}>120 minutes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <TimezonePicker
                  value={newMeeting.timezone}
                  onChange={(value) => handleInputChange('timezone', value)}
                  label="Meeting Timezone"
                  required
                  disabled={loading || success}
                />
              </Box>
              
              <TextField
                label="Meeting Goals"
                value={newMeeting.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                required
                placeholder="What would you like to discuss in this meeting?"
                disabled={loading || success}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  }
                }}
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button 
            onClick={() => setOpenNewMeetingDialog(false)} 
            disabled={loading}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateMeeting}
            disabled={!!(loading || !!doubleBookingWarning || success || (limits && !limits.can_create))}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Schedule Meeting'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClientDashboard;
