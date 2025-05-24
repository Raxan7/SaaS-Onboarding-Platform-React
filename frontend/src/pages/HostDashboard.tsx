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
  const { meetings, fetchMeetings } = useMeetings();
  
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
      
      // Close the dialog and reset form after a short delay
      setTimeout(() => {
        setOpenNewMeetingDialog(false);
        setNewMeeting({
          title: 'Host Scheduled Meeting',
          goals: '',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 30,
          timezone: '',
          client_id: ''
        });
        setSuccess(false);
        
        // Refresh meetings list
        fetchMeetings();
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
      {/* Enhanced Host Dashboard Header */}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h3" gutterBottom fontWeight={700}>
              🎯 Host Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your meetings and connect with clients
            </Typography>
          </Box>
          <Button 
            variant="contained"
            onClick={() => setOpenNewMeetingDialog(true)}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            📅 Schedule New Meeting
          </Button>
        </Box>
      </Box>

      {/* Enhanced Statistics Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                📊 Total Meetings
              </Typography>
              <Typography variant="h2" fontWeight={700}>
                {stats.totalMeetings}
              </Typography>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(74, 222, 128, 0.3)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                🗓️ Upcoming Meetings
              </Typography>
              <Typography variant="h2" fontWeight={700}>
                {stats.upcomingMeetings}
              </Typography>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(245, 158, 11, 0.3)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                ⏳ Pending Requests
              </Typography>
              <Typography variant="h2" fontWeight={700}>
                {stats.pendingMeetings}
              </Typography>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(59, 130, 246, 0.3)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                ✅ Completed Meetings
              </Typography>
              <Typography variant="h2" fontWeight={700}>
                {stats.completedMeetings}
              </Typography>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>

      {/* Enhanced Active Meeting Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 6,
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
          <Typography variant="h5" gutterBottom fontWeight={700} sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎥 Active Meeting
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: 'rgba(102, 126, 234, 0.1)' }} />
          <ActiveMeeting />
        </CardContent>
      </Paper>

      {/* Enhanced Pending Requests Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 6,
          borderRadius: 4, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #f59e0b 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(245, 158, 11, 0.2)'
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={700} sx={{ color: '#92400e' }}>
            ⏳ Pending Meeting Requests
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: 'rgba(245, 158, 11, 0.3)' }} />
          <MeetingsList filter="upcoming" />
        </CardContent>
      </Paper>

      {/* Enhanced Meeting History Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)'
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={700} sx={{ color: '#3730a3' }}>
            📚 Meeting History
          </Typography>
          <Divider sx={{ mb: 3, bgcolor: 'rgba(102, 126, 234, 0.2)' }} />
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
              <Typography variant="h6">👥</Typography>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Schedule New Meeting with Client
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

export default HostDashboard;