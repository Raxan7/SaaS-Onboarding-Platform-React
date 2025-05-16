// pages/HostDashboard.tsx
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
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
  SelectChangeEvent
} from '@mui/material';
import DashboardHeader from '../components/DashboardHeader';
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
  
  const [embeddedMeetingUrl, setEmbeddedMeetingUrl] = useState<string | null>(null);
  
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
    <>
      <DashboardHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Host Dashboard
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setOpenNewMeetingDialog(true)}
          >
            Schedule New Meeting
          </Button>
        </Box>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Meetings
                </Typography>
                <Typography variant="h3" sx={{ mt: 1 }}>
                  {stats.totalMeetings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Upcoming Meetings
                </Typography>
                <Typography variant="h3" sx={{ mt: 1 }}>
                  {stats.upcomingMeetings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Requests
                </Typography>
                <Typography variant="h3" sx={{ mt: 1 }}>
                  {stats.pendingMeetings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Completed Meetings
                </Typography>
                <Typography variant="h3" sx={{ mt: 1 }}>
                  {stats.completedMeetings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Meeting
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ActiveMeeting />
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Meeting Requests
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <MeetingsList filter="upcoming" />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Meeting History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <MeetingsList filter="past" showActions={false} />
          </CardContent>
        </Card>
      </Container>

      {embeddedMeetingUrl && (
        <Box
          sx={{
            position: 'fixed',
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            zIndex: 1300,
            width: '80%',
            height: '70%',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: 24,
            overflow: 'hidden',
          }}
        >
          <iframe
            src={embeddedMeetingUrl}
            style={{ width: '100%', height: '100%', border: 0 }}
            allow="camera; microphone; fullscreen; display-capture"
            title="Embedded Meeting"
          />
          <Button 
            variant="contained" 
            color="primary"
            sx={{ position: 'absolute', top: 10, right: 10 }}
            onClick={() => setEmbeddedMeetingUrl(null)}
          >
            Close
          </Button>
        </Box>
      )}
      
      {/* New Meeting Dialog */}
      <Dialog 
        open={openNewMeetingDialog} 
        onClose={() => !loading && setOpenNewMeetingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schedule New Meeting with Client</DialogTitle>
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
              
              <FormControl fullWidth margin="normal" disabled={loading || success}>
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
    </>
  );
};

export default HostDashboard;