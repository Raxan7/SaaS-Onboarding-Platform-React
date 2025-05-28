// pages/ScheduleMeetingPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  SelectChangeEvent
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TimezonePicker from '../components/meetings/TimezonePicker';
import { useMeetings } from '../contexts/MeetingContext';
import { format } from 'date-fns';
import DashboardHeader from '../components/DashboardHeader';
import { PickerValue } from '@mui/x-date-pickers/internals';

// Simplified steps - removed host selection
const steps = ['Select Date & Time', 'Meeting Details', 'Review & Confirm'];

const ScheduleMeetingPage: React.FC = () => {
  const { createMeeting, checkTimeSlotAvailability } = useMeetings();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [doubleBookingWarning, setDoubleBookingWarning] = useState('');
  
  const [meetingData, setMeetingData] = useState({
    title: 'Consultation Meeting',
    goals: '',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 30,
    timezone: ''
    // Removed host_id field
  });
  
  // Check for availability when time, duration, or timezone changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (meetingData.scheduled_at && meetingData.timezone) {
        try {
          const isAvailable = await checkTimeSlotAvailability(
            meetingData.scheduled_at.toISOString(),
            meetingData.duration,
            meetingData.timezone
          );
          
          if (!isAvailable) {
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
  }, [meetingData.scheduled_at, meetingData.duration, meetingData.timezone, checkTimeSlotAvailability]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | PickerValue) => {
    setMeetingData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      if (!meetingData.scheduled_at) {
        setError('Please select a date and time');
        return;
      }
      
      if (!meetingData.timezone) {
        setError('Please select a timezone');
        return;
      }
      
      if (doubleBookingWarning) {
        setError('Please select a different time to avoid scheduling conflicts');
        return;
      }
    }
    
    if (activeStep === 1) {
      if (!meetingData.title) {
        setError('Meeting title is required');
        return;
      }
      
      if (!meetingData.goals) {
        setError('Meeting goals are required');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError('');
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const success = await createMeeting({
        title: meetingData.title,
        goals: meetingData.goals,
        scheduled_at: meetingData.scheduled_at.toISOString(),
        duration: meetingData.duration,
        timezone: meetingData.timezone,
        status: 'pending'
        // Host will be assigned when a host confirms the meeting
      });
      
      if (success) {
        setSuccess(true);
        // Show success message briefly, then reload page to refresh UI
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError('Failed to schedule meeting. Please try again.');
      }
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardHeader />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Schedule a Meeting
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {doubleBookingWarning && activeStep === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {doubleBookingWarning}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Meeting request submitted successfully! Available hosts will review your request.
              Redirecting to dashboard...
            </Alert>
          )}
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Select Date & Time
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DateTimePicker
                      label="Meeting Date & Time"
                      value={meetingData.scheduled_at}
                      onChange={(newValue) => handleInputChange('scheduled_at', newValue)}
                      disablePast
                      sx={{ width: '100%' }}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth disabled={loading}>
                      <InputLabel>Duration</InputLabel>
                      <Select
                        value={meetingData.duration.toString()}
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
                  
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mt: 2 }}>
                      <TimezonePicker
                        value={meetingData.timezone}
                        onChange={(value) => handleInputChange('timezone', value)}
                        label="Meeting Timezone"
                        required
                        disabled={loading}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Meeting Details
                </Typography>
                
                <TextField
                  label="Meeting Title"
                  value={meetingData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  disabled={loading}
                />
                
                <TextField
                  label="Meeting Goals"
                  value={meetingData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  required
                  placeholder="What would you like to discuss in this meeting?"
                  disabled={loading}
                />
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  Your meeting request will be matched with an available host who can assist you.
                </Alert>
              </Box>
            )}
            
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Review & Confirm
                </Typography>
                
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {meetingData.title}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Date & Time
                        </Typography>
                        <Typography variant="body1">
                          {format(meetingData.scheduled_at, 'PPpp')}
                        </Typography>
                      </Grid>
                      
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Timezone
                        </Typography>
                        <Typography variant="body1">
                          {meetingData.timezone}
                        </Typography>
                      </Grid>
                      
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1">
                          {meetingData.duration} minutes
                        </Typography>
                      </Grid>
                      
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Meeting Goals
                        </Typography>
                        <Typography variant="body1">
                          {meetingData.goals}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  By clicking "Schedule Meeting", you agree to our terms of service and privacy policy.
                  An available host will review and confirm your meeting request.
                </Typography>
              </Box>
            )}
          </LocalizationProvider>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading || success}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading || success}
                >
                  {loading ? <CircularProgress size={24} /> : 'Schedule Meeting'}
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  disabled={loading || success || !!doubleBookingWarning}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ScheduleMeetingPage;