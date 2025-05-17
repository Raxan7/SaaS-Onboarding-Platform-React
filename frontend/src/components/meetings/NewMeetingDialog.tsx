import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  Grid,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TimezonePicker from './TimezonePicker';
import { useApiClient } from '../../utils/apiClient';
import { PickerValue } from '@mui/x-date-pickers/internals';

interface NewMeetingDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewMeetingDialog({ open, onClose, onSuccess }: NewMeetingDialogProps) {
  const apiClient = useApiClient();
  
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
      if (open && newMeeting.scheduled_at && newMeeting.timezone) {
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
  }, [newMeeting.scheduled_at, newMeeting.duration, newMeeting.timezone, open, apiClient]);

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
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form after closing
      setTimeout(() => {
        setNewMeeting({
          title: 'Consultation Meeting',
          goals: '',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30,
          timezone: '',
          host_id: ''
        });
        setSuccess(false);
        setError('');
      }, 300);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
          onClick={handleClose} 
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
  );
}
