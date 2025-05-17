// components/meetings/MeetingsList.tsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  CircularProgress,
  Stack,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Meeting } from '../../types/meeting';
import { useApiClient } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import TimezonePicker from './TimezonePicker';

interface MeetingsListProps {
  filter?: 'upcoming' | 'past' | 'all';
  showActions?: boolean;
}

const MeetingsList = ({ filter = 'all', showActions = true }: MeetingsListProps) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [newTime, setNewTime] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [embeddedMeetingUrl, setEmbeddedMeetingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const apiClient = useApiClient();
  const { userType } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get('/api/meetings/');
        setMeetings(data);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setError('Failed to load meetings');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const filteredMeetings = meetings.filter(meeting => {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduled_at);
    
    if (filter === 'upcoming') return meetingDate > now && meeting.status !== 'cancelled';
    if (filter === 'past') return meetingDate <= now || meeting.status === 'completed';
    return true;
  });

  const checkTimeSlotAvailability = async (scheduledAt: string, timezone: string, duration: number) => {
    try {
      setAvailabilityChecking(true);
      const response = await apiClient.post('/api/meetings/check-availability/', {
        scheduled_at: scheduledAt,
        timezone,
        duration
      });
      
      return response.available;
    } catch (err) {
      console.error('Error checking time slot availability:', err);
      return true; // Default to allowing, but show an error
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const handleStatusUpdate = async (meetingId: number | undefined, status: string) => {
    if (!meetingId) {
      console.error('Invalid meeting ID:', meetingId);
      return;
    }

    try {
      setError(null);
      const payload: any = { status };
      
      const updatedMeeting = await apiClient.put(`/api/meetings/${meetingId}/`, payload);
      
      setMeetings(meetings.map(m => 
        m.id === meetingId ? updatedMeeting : m
      ));
      
      // Reload the page when a meeting is confirmed to reflect the layout changes
      if (status === 'confirmed') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      setError('Failed to update meeting status');
    }
  };

  const handleReschedule = async () => {
    if (!selectedMeeting?.id || !newTime) {
      setError('Please select a valid meeting time');
      return;
    }

    // First check if the time slot is available
    const isAvailable = await checkTimeSlotAvailability(
      newTime,
      timezone || selectedMeeting.timezone || 'UTC',
      selectedMeeting.duration
    );

    if (!isAvailable) {
      setError('You already have a meeting scheduled at this time. Please choose another time.');
      return;
    }

    try {
      setError(null);
      const updatedMeeting = await apiClient.put(`/api/meetings/${selectedMeeting.id}/`, {
        scheduled_at: newTime,
        status: 'rescheduled',
        timezone: timezone || selectedMeeting.timezone || 'UTC'
      });
      
      // Update the meeting in the list
      setMeetings(meetings.map(m => 
        m.id === selectedMeeting.id ? updatedMeeting : m
      ));
      
      // Close the dialog
      setRescheduleDialogOpen(false);
      
      // Refresh the page to get latest data
      window.location.reload();
    } catch (err) {
      console.error('Error rescheduling meeting:', err);
      setError('Failed to reschedule meeting');
    }
  };


  // Format the date considering the timezone
  const formatMeetingDateTime = (scheduledAt: string, _timezone: string = 'UTC') => {
    try {
      const date = new Date(scheduledAt);
      return format(date, 'PPP') + ' at ' + format(date, 'p');
    } catch (err) {
      return scheduledAt;
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {filteredMeetings.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No meetings found
        </Typography>
      ) : (
        <Stack spacing={2}>
          {filteredMeetings.map(meeting => (
            <Card 
              key={`meeting-${meeting.id}`} 
              sx={{ 
                borderLeft: `4px solid ${
                  meeting.status === 'confirmed' ? theme.palette.success.main :
                  meeting.status === 'pending' ? theme.palette.warning.main :
                  meeting.status === 'cancelled' ? theme.palette.error.main : 
                  theme.palette.info.main
                }`,
                boxShadow: theme.shadows[1]
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {meeting.title || 'Consultation Meeting'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatMeetingDateTime(meeting.scheduled_at, meeting.timezone)}
                    </Typography>
                    
                    {/* Display timezone information */}
                    <Chip 
                      label={meeting.timezone || 'UTC'} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mt: 0.5, mr: 1 }}
                    />
                    
                    {meeting.duration && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Duration: {meeting.duration} minutes
                      </Typography>
                    )}
                  </Box>
                  
                  {meeting?.status ? (
                    <Chip 
                      label={meeting.status === 'rescheduled' ? 'RESCHEDULED & CONFIRMED' : meeting.status.toUpperCase()} 
                      color={
                        meeting.status === 'confirmed' ? 'success' :
                        meeting.status === 'pending' ? 'warning' :
                        meeting.status === 'cancelled' ? 'error' : 
                        meeting.status === 'rescheduled' ? 'success' : 'info'
                      }
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Typography color="error">Status not available</Typography>
                  )}
                </Box>
                
                {meeting.goals && (
                  <Box mt={1.5}>
                    <Typography variant="body2" fontWeight={500}>
                      Meeting Goals:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.goals}
                    </Typography>
                  </Box>
                )}
                
                {showActions && (
                  <Box mt={3}>
                    <Divider sx={{ mb: 2 }} />
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {userType === 'host' && meeting?.id && (
                        <Box mt={2} display="flex" gap={1}>
                          {meeting.status === 'pending' && (
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={() => handleStatusUpdate(meeting.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {['pending', 'confirmed', 'rescheduled'].includes(meeting.status) && (
                            <>
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => {
                                  setSelectedMeeting(meeting);
                                  setTimezone(meeting.timezone || 'UTC');
                                  setRescheduleDialogOpen(true);
                                }}
                              >
                                Reschedule
                              </Button>
                              <Button 
                                variant="outlined" 
                                color="error"
                                size="small"
                                onClick={() => handleStatusUpdate(meeting.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {(meeting.status === 'confirmed' || meeting.status === 'rescheduled') && meeting.meeting_url && (
                            <Button 
                              variant="contained" 
                              color="primary"
                              size="medium"
                              onClick={() => setEmbeddedMeetingUrl(meeting.meeting_url || null)}
                              sx={{
                                background: 'linear-gradient(45deg, #6C63FF 30%, #5046e4 90%)',
                                boxShadow: '0 4px 8px 2px rgba(108, 99, 255, .3)',
                                fontWeight: 'bold',
                                padding: '8px 20px',
                                fontSize: '0.9rem',
                                letterSpacing: '0.5px',
                                transition: 'all 0.25s ease-in-out',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  background: 'linear-gradient(45deg, #5046e4 30%, #403ab3 90%)',
                                  boxShadow: '0 6px 10px 2px rgba(108, 99, 255, .4)',
                                }
                              }}
                              startIcon={<Box 
                                component="span" 
                                sx={{ 
                                  width: '14px', 
                                  height: '14px', 
                                  borderRadius: '50%', 
                                  backgroundColor: '#F2994A', 
                                  display: 'inline-block',
                                  boxShadow: '0 0 0 rgba(242, 153, 74, 0.4)',
                                  animation: 'pulse 1.5s infinite',
                                  '@keyframes pulse': {
                                    '0%': {
                                      boxShadow: '0 0 0 0 rgba(242, 153, 74, 0.4)',
                                    },
                                    '70%': {
                                      boxShadow: '0 0 0 10px rgba(242, 153, 74, 0)',
                                    },
                                    '100%': {
                                      boxShadow: '0 0 0 0 rgba(242, 153, 74, 0)',
                                    },
                                  },
                                }} 
                              />}
                            >
                              Start Meeting
                            </Button>
                          )}
                        </Box>
                      )}

                      {userType === 'client' && ['pending', 'confirmed', 'rescheduled'].includes(meeting.status) && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setTimezone(meeting.timezone || 'UTC');
                              setRescheduleDialogOpen(true);
                            }}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleStatusUpdate(meeting.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {meeting.meeting_url && (meeting.status === 'confirmed' || meeting.status === 'rescheduled') && userType === 'client' && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => window.open(meeting.meeting_url, '_blank')}
                        >
                          Join Meeting
                        </Button>
                      )}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {embeddedMeetingUrl && (
        <Box mt={2} sx={{ height: '500px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
          <iframe
            src={embeddedMeetingUrl}
            style={{ width: '100%', height: '100%', border: 0 }}
            allow="camera; microphone; fullscreen; display-capture"
            title="Embedded Meeting"
          />
        </Box>
      )}

      {/* Reschedule Dialog with TimezonePicker */}
      <Dialog open={rescheduleDialogOpen} onClose={() => setRescheduleDialogOpen(false)}>
        <DialogTitle>Reschedule Meeting</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {selectedMeeting && (
            <Box sx={{ mt: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="New Meeting Time"
                  value={newTime ? new Date(newTime) : new Date(selectedMeeting.scheduled_at)}
                  onChange={(newValue) => setNewTime(newValue?.toISOString() || '')}
                  sx={{ width: '100%', mb: 2 }}
                />
              </LocalizationProvider>
              
              <TimezonePicker
                value={timezone || selectedMeeting.timezone || 'UTC'}
                onChange={setTimezone}
                label="Meeting Timezone"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReschedule} 
            variant="contained" 
            color="primary" 
            disabled={availabilityChecking}
          >
            {availabilityChecking ? 'Checking Availability...' : 'Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingsList;