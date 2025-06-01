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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import { Meeting } from '../../types/meeting';
import { useApiClient } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { useMeetingActions } from '../../hooks/useMeetingActions';
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
  const [error, setError] = useState<string | null>(null);
  const [availabilityChecking] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const apiClient = useApiClient();
  const { userType } = useAuth();
  
  // Fetch meetings function
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/api/meetings/');
      setMeetings(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  // Handle meeting updates from actions
  const handleMeetingUpdate = (updatedMeeting: Meeting) => {
    setMeetings(prevMeetings => 
      prevMeetings.map(m => m.id === updatedMeeting.id ? updatedMeeting : m)
    );
  };

  const {
    updateMeetingStatus,
    startMeeting,
    endMeeting,
    rescheduleMeeting,
    checkAvailability,
    loading: actionLoading,
    error: actionError,
    success: actionSuccess
  } = useMeetingActions(handleMeetingUpdate, fetchMeetings);

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Handle success messages from meeting actions
  useEffect(() => {
    if (actionSuccess) {
      setSuccessMessage(actionSuccess);
      setError(null);
    }
  }, [actionSuccess]);

  // Handle errors from meeting actions
  useEffect(() => {
    if (actionError) {
      setError(actionError);
      setSuccessMessage(null);
    }
  }, [actionError]);

  // Auto-completion detection for started meetings
  useEffect(() => {
    const checkMeetingCompletion = () => {
      const startedMeetings = meetings.filter(meeting => meeting.status === 'started');
      
      startedMeetings.forEach(meeting => {
        const meetingStart = new Date(meeting.scheduled_at);
        const now = new Date();
        const meetingDuration = meeting.duration || 60; // Default 60 minutes
        const expectedEndTime = new Date(meetingStart.getTime() + (meetingDuration * 60 * 1000));
        
        // Auto-complete meetings that have exceeded their expected duration by 15 minutes
        const graceEndTime = new Date(expectedEndTime.getTime() + (15 * 60 * 1000));
        
        if (now > graceEndTime) {
          console.log(`Auto-completing meeting ${meeting.id} as it has exceeded expected duration`);
          handleEndMeeting(meeting.id!).catch(console.error);
        }
      });
    };

    // Check every 5 minutes for meetings that need auto-completion
    const interval = setInterval(checkMeetingCompletion, 5 * 60 * 1000);
    
    // Initial check
    checkMeetingCompletion();
    
    return () => clearInterval(interval);
  }, [meetings]);

  // Enhanced meeting tab opening utility
  const openMeetingTab = (meetingUrl: string) => {
    const newTab = window.open(meetingUrl, '_blank');
    
    if (newTab) {
      setSuccessMessage('Meeting opened successfully in new tab!');
      return newTab;
    } else {
      setError('Failed to open meeting. Please allow popups or try again.');
      return null;
    }
  };

  // Filter meetings based on the filter prop
  const filteredMeetings = meetings.filter(meeting => {
    const now = new Date();
    const meetingDate = new Date(meeting.scheduled_at);
    
    if (filter === 'upcoming') {
      // Only show active/future meetings that haven't been terminated
      return meetingDate > now && 
             !['cancelled', 'completed', 'expired'].includes(meeting.status);
    }
    if (filter === 'past') {
      // Show past meetings OR any terminated meetings (completed, cancelled, expired)
      return meetingDate <= now || 
             ['completed', 'cancelled', 'expired'].includes(meeting.status);
    }
    return true;
  });

  const handleStatusUpdate = async (meetingId: number | undefined, status: string) => {
    if (!meetingId) {
      console.error('Invalid meeting ID:', meetingId);
      return;
    }

    try {
      setError(null);
      await updateMeetingStatus(meetingId, status);
      
      // Show success message briefly, then reload page to refresh UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
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
    const isAvailable = await checkAvailability(
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
      await rescheduleMeeting(selectedMeeting.id, {
        scheduled_at: newTime,
        timezone: timezone || selectedMeeting.timezone || 'UTC'
      });
      
      // Close the dialog and show success message briefly
      setRescheduleDialogOpen(false);
      setSelectedMeeting(null);
      setNewTime('');
      
      // Reload page to refresh UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      console.error('Error rescheduling meeting:', err);
      setError('Failed to reschedule meeting');
    }
  };

  const handleEndMeeting = async (meetingId: number) => {
    try {
      setError(null);
      await endMeeting(meetingId);

      setSuccessMessage('Meeting ended successfully!');
      
      // Show success message briefly, then reload page to refresh UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      console.error('Error ending meeting:', err);
      setError('Failed to end meeting');
    }
  };



  const handleStartMeetingFromConfirmed = async (meeting: Meeting) => {
    try {
      setError(null);
      
      // For confirmed meetings, try to start the meeting first
      const updatedMeeting = await startMeeting(meeting.id!);
      
      if (updatedMeeting && updatedMeeting.meeting_url) {
        // Open meeting in new tab instead of modal
        const newTab = window.open(updatedMeeting.meeting_url, '_blank');
        if (!newTab) {
          setError('Failed to open meeting. Please allow popups or try again.');
        } else {
          setSuccessMessage('Meeting started successfully! Opening in new tab...');
        }
      } else if (meeting.meeting_url) {
        // If meeting already has URL, use it directly
        const newTab = window.open(meeting.meeting_url, '_blank');
        if (!newTab) {
          setError('Failed to open meeting. Please allow popups or try again.');
        } else {
          setSuccessMessage('Meeting opened successfully in new tab!');
        }
      } else {
        setError('Meeting URL not available. Please try again.');
      }
      
    } catch (err) {
      console.error('Error starting meeting:', err);
      // Fallback to opening in new tab if available
      if (meeting.meeting_url) {
        const newTab = window.open(meeting.meeting_url, '_blank');
        if (!newTab) {
          setError('Failed to open meeting. Please allow popups or try again.');
        } else {
          setSuccessMessage('Meeting opened successfully in new tab!');
        }
      } else {
        setError('Failed to start meeting');
      }
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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress 
        sx={{ 
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }} 
      />
    </Box>
  );

  return (
    <Box>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            background: 'rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          {error}
        </Alert>
      )}
      
      {filteredMeetings.length === 0 ? (
        <Box 
          sx={{
            textAlign: 'center',
            py: 6,
            background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.1) 0%, rgba(196, 181, 253, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(147, 197, 253, 0.2)'
          }}
        >
          <Box 
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
            }}
          >
            <Typography variant="h4" sx={{ color: 'white' }}>📅</Typography>
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No meetings found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'upcoming' ? 'You have no upcoming meetings scheduled.' :
             filter === 'past' ? 'No past meetings to display.' :
             'No meetings to display.'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {filteredMeetings.map((meeting) => (
            console.log(meeting),
            <Card 
              key={meeting.id} 
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {meeting.title || (() => {
                        // Handle case where host/user might be just IDs instead of objects
                        if (userType === 'client') {
                          // Client sees the host name
                          if (typeof meeting.host === 'object' && meeting.host?.first_name) {
                            return `Meeting with ${meeting.host.first_name}`;
                          } else if (typeof meeting.host === 'object' && meeting.host?.email) {
                            return `Meeting with ${meeting.host.email}`;
                          } else {
                            return `Meeting with Host ${meeting.host || 'Unknown'}`;
                          }
                        } else {
                          // Host sees the client/user name
                          if (typeof meeting.user === 'object' && meeting.user?.first_name) {
                            return `Meeting with ${meeting.user.first_name}`;
                          } else if (typeof meeting.user === 'object' && meeting.user?.email) {
                            return `Meeting with ${meeting.user.email}`;
                          } else {
                            return `Meeting with Client ${meeting.user || 'Unknown'}`;
                          }
                        }
                      })()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatMeetingDateTime(meeting.scheduled_at, meeting.timezone)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {meeting.duration} minutes
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={meeting.status} 
                    color={
                      meeting.status === 'confirmed' ? 'success' :
                      meeting.status === 'started' ? 'primary' :
                      meeting.status === 'completed' ? 'info' :
                      meeting.status === 'cancelled' ? 'error' :
                      'default'
                    }
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                
                {meeting.notes && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Notes:</strong> {meeting.notes}
                    </Typography>
                  </>
                )}

                {showActions && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {meeting.status === 'pending' && (
                        <>
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => handleStatusUpdate(meeting.id, 'confirmed')}
                            disabled={actionLoading}
                            sx={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Confirm
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setRescheduleDialogOpen(true);
                            }}
                            disabled={actionLoading}
                            sx={{
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleStatusUpdate(meeting.id, 'cancelled')}
                            disabled={actionLoading}
                            sx={{
                              '&:hover': {
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {meeting.status === 'confirmed' && (
                        <>
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => handleStartMeetingFromConfirmed(meeting)}
                            disabled={actionLoading}
                            sx={{
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            {userType === 'client' ? 'Join Meeting' : 'Start Meeting'}
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setRescheduleDialogOpen(true);
                            }}
                            disabled={actionLoading}
                            sx={{
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleStatusUpdate(meeting.id, 'cancelled')}
                            disabled={actionLoading}
                            sx={{
                              '&:hover': {
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {meeting.status === 'started' && (
                        <>
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => openMeetingTab(meeting.meeting_url || '')}
                            disabled={!meeting.meeting_url}
                            sx={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Join Meeting
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleEndMeeting(meeting.id!)}
                            disabled={actionLoading}
                            sx={{
                              '&:hover': {
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            End Meeting
                          </Button>
                        </>
                      )}

                      {meeting.status === 'cancelled' && (
                        <Typography variant="body2" color="error" sx={{ fontStyle: 'italic' }}>
                          This meeting was cancelled
                        </Typography>
                      )}

                      {meeting.status === 'completed' && (
                        <Typography variant="body2" color="success.main" sx={{ fontStyle: 'italic' }}>
                          Meeting completed
                        </Typography>
                      )}
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Reschedule Dialog */}
      <Dialog 
        open={rescheduleDialogOpen} 
        onClose={() => setRescheduleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Reschedule Meeting
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <DateTimePicker
                label="New Meeting Time"
                value={newTime ? new Date(newTime) : null}
                onChange={(newValue) => {
                  if (newValue) {
                    setNewTime(newValue.toISOString());
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)'
                  }
                }}
              />
              
              <TimezonePicker
                value={timezone || selectedMeeting?.timezone || 'UTC'}
                onChange={(newTimezone) => setTimezone(newTimezone)}
                label="Timezone"
              />
              
              {availabilityChecking && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Checking availability...
                  </Typography>
                </Box>
              )}
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setRescheduleDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule}
            variant="contained"
            disabled={!newTime || actionLoading}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
              }
            }}
          >
            {actionLoading ? 'Rescheduling...' : 'Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage(null)} 
          severity="success"
          sx={{
            borderRadius: 2,
            background: 'rgba(16, 185, 129, 0.9)',
            backdropFilter: 'blur(10px)',
            color: 'white'
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeetingsList;
