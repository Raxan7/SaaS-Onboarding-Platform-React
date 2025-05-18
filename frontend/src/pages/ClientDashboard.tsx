// pages/ClientDashboard.tsx
import { 
  Typography, 
  Box, 
  Grid, 
  CardContent, 
  LinearProgress, 
  Alert,
  Chip,
  Divider,
  useTheme,
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
  Paper
} from '@mui/material';
import MeetingsList from '../components/meetings/MeetingsList';
import ActiveMeeting from '../components/meetings/ActiveMeeting';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { CheckCircle, RadioButtonUnchecked, Close, Add as AddIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TimezonePicker from '../components/meetings/TimezonePicker';
import { useApiClient } from '../utils/apiClient';
import { PickerValue } from '@mui/x-date-pickers/internals';
import SubscriptionInfo from '../components/subscriptions/SubscriptionInfo';
import DashboardLayout from '../components/DashboardLayout';

const onboardingSteps = [
  { name: 'Account Setup', completed: true },
  { name: 'Company Info', completed: false },
  { name: 'Meeting Scheduling', completed: false },
  { name: 'Payment', completed: false },
];

const ClientDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();
  const apiClient = useApiClient();
  
  const [onboardingStatus, setOnboardingStatus] = useState({
    completedSteps: 1,
    totalSteps: 4,
  });
  const [showOnboardingAlert, setShowOnboardingAlert] = useState(true);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  
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
  
  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | PickerValue) => {
    setNewMeeting(prev => ({ ...prev, [field]: value }));
  };
  
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
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Upcoming Meetings
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setOpenNewMeetingDialog(true)}
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 8 }}
                >
                  New Meeting
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <MeetingsList filter="upcoming" />
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <SubscriptionInfo />
        </Grid>
      </Grid>
      
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Past Meetings
              </Typography>
              <Divider sx={{ mb: 3 }} />
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
      >
        <DialogTitle>Schedule New Meeting</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {doubleBookingWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {doubleBookingWarning}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Meeting scheduled successfully!
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
              />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DateTimePicker
                    label="Meeting Date & Time"
                    value={newMeeting.scheduled_at}
                    onChange={(newValue) => handleInputChange('scheduled_at', newValue)}
                    disablePast
                    sx={{ width: '100%' }}
                    disabled={loading || success}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth disabled={loading || success}>
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
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenNewMeetingDialog(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateMeeting}
            disabled={loading || !!doubleBookingWarning || success}
          >
            {loading ? <CircularProgress size={24} /> : 'Schedule Meeting'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClientDashboard;
