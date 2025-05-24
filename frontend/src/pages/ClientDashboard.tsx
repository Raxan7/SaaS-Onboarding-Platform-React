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
      
      // Show success message briefly, then reload page to refresh the UI
      setTimeout(() => {
        console.log('[ClientDashboard] Meeting created successfully, reloading page');
        window.location.reload();
      }, 1500);
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
      {/* Professional Header Section */}
      <Box sx={{ 
        mb: 4,
        p: 4,
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 0 } }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight={600} 
              gutterBottom
              sx={{ 
                color: '#111827',
                fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.25rem' }
              }}
            >
              Welcome back, {user?.first_name}!
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#6b7280',
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              Ready to schedule your next consultation?
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewMeetingDialog(true)}
            disabled={!!(limits && !limits.can_create)}
            sx={{
              backgroundColor: '#3b82f6',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: '#2563eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: '#ffffff'
              }
            }}
          >
            Request New Meeting
          </Button>
        </Box>
      </Box>

      {/* AI Walk-through Component */}
      <WalkThrough open={showWalkThrough} onClose={() => setShowWalkThrough(false)} />

      {/* Payment Success Alert */}
      <Collapse in={showPaymentSuccess}>
        <Alert 
          severity="success" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #10b981',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            '& .MuiAlert-message': {
              width: '100%'
            },
            '& .MuiAlert-icon': {
              color: '#10b981'
            }
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowPaymentSuccess(false)}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
          icon={<CheckCircle fontSize="inherit" />}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, color: '#111827' }}>
                Payment Successful!
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                Your subscription is now active and ready to use.
              </Typography>
            </Box>
          </Box>
        </Alert>
      </Collapse>

      {/* Onboarding Alert */}
      {showOnboardingAlert && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 4,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #f59e0b',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            '& .MuiAlert-message': {
              width: '100%'
            },
            '& .MuiAlert-icon': {
              color: '#f59e0b'
            }
          }}
          action={
            <Button 
              variant="contained"
              onClick={() => window.location.href = "/onboarding?step=2"}
              sx={{
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: 500,
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#2563eb'
                }
              }}
            >
              Continue Setup
            </Button>
          }
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, color: '#111827' }}>
                Complete Your Setup
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                Finish your onboarding to unlock your first free consultation meeting
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mr: 2, color: '#374151' }}>
                  Progress: {onboardingPercentage}%
                </Typography>
                <Box sx={{ width: 100, mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={onboardingPercentage} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: '#f59e0b'
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Alert>
      )}

      {/* Active Meeting Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              height: '100%', 
              borderRadius: 2, 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }} 
            data-tour="active-meeting"
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box 
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white' }}>🎥</Typography>
                </Box>
                <Typography 
                  variant="h5" 
                  fontWeight={600}
                  sx={{ color: '#111827' }}
                >
                  Active Meeting
                </Typography>
              </Box>
              <ActiveMeeting />
            </CardContent>
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Meetings Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'white' }}>📅</Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={600}
                    sx={{ color: '#111827' }}
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
                    backgroundColor: '#3b82f6',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      backgroundColor: '#2563eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    },
                    '&:disabled': {
                      backgroundColor: '#9ca3af',
                      color: '#ffffff'
                    }
                  }}
                >
                  New Meeting
                </Button>
              </Box>
              <Divider sx={{ mb: 3, backgroundColor: '#e5e7eb' }} />
              <MeetingsList filter="upcoming" />
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Past Meetings Section */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }} 
            data-tour="past-meetings"
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box 
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white' }}>📚</Typography>
                </Box>
                <Typography 
                  variant="h6" 
                  fontWeight={600}
                  sx={{ color: '#111827' }}
                >
                  Meeting History
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, backgroundColor: '#e5e7eb' }} />
              <MeetingsList filter="past" showActions={false} />
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
      
      {/* New Meeting Dialog */}
      <Dialog 
        open={openNewMeetingDialog} 
        onClose={() => !loading && setOpenNewMeetingDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 4, 
          pb: 2,
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <Typography variant="h6" sx={{ color: 'white' }}>📅</Typography>
            </Box>
            <Typography variant="h5" fontWeight={600} sx={{ color: '#111827' }}>
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
                borderRadius: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #ef4444',
                '& .MuiAlert-icon': {
                  color: '#ef4444'
                }
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
                borderRadius: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #f59e0b',
                '& .MuiAlert-icon': {
                  color: '#f59e0b'
                }
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
                borderRadius: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #10b981',
                '& .MuiAlert-icon': {
                  color: '#10b981'
                }
              }}
            >
              Meeting scheduled successfully!
            </Alert>
          )}
          
          {limits && !limits.can_create && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #f59e0b',
                '& .MuiAlert-icon': {
                  color: '#f59e0b'
                }
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
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#3b82f6'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6'
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
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#3b82f6'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6'
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
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#3b82f6'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6'
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
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#3b82f6'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6'
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
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateMeeting}
            disabled={!!(loading || !!doubleBookingWarning || success || (limits && !limits.can_create))}
            sx={{
              backgroundColor: '#3b82f6',
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: '#2563eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
