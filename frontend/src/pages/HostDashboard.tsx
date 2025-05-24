// pages/HostDashboard.tsx
import { 
  Typography, 
  Box, 
  Grid, 
  CardContent, 
  Divider,
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
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Paper
} from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import MeetingsList from '../components/meetings/MeetingsList';
import ActiveMeeting from '../components/meetings/ActiveMeeting';
import { useApiClient } from '../utils/apiClient';
import { useEffect, useState } from 'react';
import { useMeetings } from '../contexts/MeetingContext';
import { useAuth } from '../contexts/AuthContext';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TimezonePicker from '../components/meetings/TimezonePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickerValue } from '@mui/x-date-pickers/internals';

const HostDashboard = () => {
  const apiClient = useApiClient();
  const { user } = useAuth();
  const { meetings } = useMeetings();
  
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    pendingMeetings: 0
  });
  
  // New Meeting Dialog State
  const [openNewMeetingDialog, setOpenNewMeetingDialog] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: 'Host Scheduled Meeting',
    goals: '',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 30,
    timezone: '',
    client_id: ''
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [doubleBookingWarning, setDoubleBookingWarning] = useState('');

  // Calculate statistics based on meetings
  useEffect(() => {
    if (meetings.length > 0) {
      const now = new Date();
      
      setStats({
        totalMeetings: meetings.length,
        upcomingMeetings: meetings.filter(m => 
          new Date(m.scheduled_at) > now && m.status !== 'cancelled'
        ).length,
        completedMeetings: meetings.filter(m => 
          m.status === 'completed'
        ).length,
        pendingMeetings: meetings.filter(m => 
          m.status === 'pending'
        ).length
      });
    }
  }, [meetings]);
  
  // Fetch clients when the dialog opens
  useEffect(() => {
    if (openNewMeetingDialog) {
      fetchClients();
    }
  }, [openNewMeetingDialog]);
  
  const fetchClients = async () => {
    try {
      const response = await apiClient.get('/api/accounts/clients/');
      setClients(response);
      // Set default client if available
      if (response.length > 0) {
        setNewMeeting(prev => ({ ...prev, client_id: response[0].id }));
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load available clients');
    }
  };
  
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
  }, [newMeeting.scheduled_at, newMeeting.duration, newMeeting.timezone, openNewMeetingDialog]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | PickerValue) => {
    setNewMeeting(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle meeting creation by host
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
    
    if (!newMeeting.client_id) {
      setError('Please select a client');
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
        user_id: newMeeting.client_id, // Client ID becomes the user
        host: user?.id, // Current host
        status: 'confirmed' // Directly confirmed since host is creating it
      });
      
      // Meeting created successfully
      setSuccess(true);
      
      // Show success message briefly, then reload page to refresh the UI
      setTimeout(() => {
        console.log('[HostDashboard] Meeting created successfully, reloading page');
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Professional Host Dashboard Header */}
      <Box sx={{ 
        mb: 4,
        p: 4,
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={600} sx={{ color: '#111827' }}>
              Host Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280' }}>
              Manage your meetings and connect with clients
            </Typography>
          </Box>
          <Button 
            variant="contained"
            onClick={() => setOpenNewMeetingDialog(true)}
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
              }
            }}
          >
            Schedule New Meeting
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              p: 3,
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Typography variant="body2" gutterBottom sx={{ color: '#6b7280', fontWeight: 500 }}>
              Total Meetings
            </Typography>
            <Typography variant="h3" fontWeight={600} sx={{ color: '#111827' }}>
              {stats.totalMeetings}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              p: 3,
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Typography variant="body2" gutterBottom sx={{ color: '#6b7280', fontWeight: 500 }}>
              Upcoming Meetings
            </Typography>
            <Typography variant="h3" fontWeight={600} sx={{ color: '#059669' }}>
              {stats.upcomingMeetings}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              p: 3,
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Typography variant="body2" gutterBottom sx={{ color: '#6b7280', fontWeight: 500 }}>
              Pending Requests
            </Typography>
            <Typography variant="h3" fontWeight={600} sx={{ color: '#d97706' }}>
              {stats.pendingMeetings}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              p: 3,
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Typography variant="body2" gutterBottom sx={{ color: '#6b7280', fontWeight: 500 }}>
              Completed Meetings
            </Typography>
            <Typography variant="h3" fontWeight={600} sx={{ color: '#3b82f6' }}>
              {stats.completedMeetings}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Active Meeting Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4,
          borderRadius: 2, 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ color: '#111827' }}>
            Active Meeting
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: '#e5e7eb' }} />
          <ActiveMeeting />
        </CardContent>
      </Paper>

      {/* Pending Requests Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4,
          borderRadius: 2, 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ color: '#111827' }}>
            Pending Meeting Requests
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: '#e5e7eb' }} />
          <MeetingsList filter="upcoming" />
        </CardContent>
      </Paper>

      {/* Meeting History Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ color: '#111827' }}>
            Meeting History
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: '#e5e7eb' }} />
          <MeetingsList filter="past" showActions={false} />
        </CardContent>
      </Paper>

      {/* Enhanced New Meeting Dialog */}
      <Dialog 
        open={openNewMeetingDialog} 
        onClose={() => !loading && setOpenNewMeetingDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
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
          <Typography variant="h5" fontWeight={600} sx={{ color: '#111827' }}>
            Schedule New Meeting
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
            Create a new meeting with your client
          </Typography>
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
              
              <FormControl 
                fullWidth 
                margin="normal" 
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
                <InputLabel>Select Client</InputLabel>
                <Select
                  value={newMeeting.client_id}
                  label="Select Client"
                  onChange={(e) => handleInputChange('client_id', e.target.value)}
                >
                  {clients.length > 0 ? (
                    clients.map((client: any) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name} ({client.email})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Loading clients...</MenuItem>
                  )}
                </Select>
              </FormControl>
              
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
            disabled={loading || !!doubleBookingWarning || success}
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

export default HostDashboard;