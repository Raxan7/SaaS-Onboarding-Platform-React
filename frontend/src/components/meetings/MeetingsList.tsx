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
import LiveKitRoom from './LiveKitRoom';
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
  const [embeddedMeetingUrl, setEmbeddedMeetingUrl] = useState<string | null>(null);
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

      // Clear the embedded meeting URL if this meeting was being displayed
      if (embeddedMeetingUrl && selectedMeeting?.id === meetingId) {
        setEmbeddedMeetingUrl(null);
        setSelectedMeeting(null);
      }
      
      // Show success message briefly, then reload page to refresh UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      console.error('Error ending meeting:', err);
      setError('Failed to end meeting');
    }
  };

  const handleStartMeeting = async (meetingId: number) => {
    try {
      setError(null);
      const updatedMeeting = await startMeeting(meetingId);
      
      if (updatedMeeting && updatedMeeting.meeting_url) {
        setEmbeddedMeetingUrl(updatedMeeting.meeting_url);
        setSelectedMeeting(updatedMeeting);
      }
      
    } catch (err) {
      console.error('Error starting meeting:', err);
      setError('Failed to start meeting');
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
          {filteredMeetings.map(meeting => (
            <Card 
              key={`meeting-${meeting.id}`} 
              sx={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderLeft: `4px solid ${
                  meeting.status === 'confirmed' || meeting.status === 'rescheduled' ? '#4ade80' :
                  meeting.status === 'pending' ? '#f59e0b' :
                  meeting.status === 'started' ? '#3b82f6' :
                  meeting.status === 'cancelled' ? '#ef4444' : 
                  '#6b7280'
                }`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    {/* Enhanced meeting header with gradient title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box 
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${
                            meeting.status === 'confirmed' || meeting.status === 'rescheduled' ? '#4ade80, #22c55e' :
                            meeting.status === 'pending' ? '#f59e0b, #d97706' :
                            meeting.status === 'started' ? '#3b82f6, #1d4ed8' :
                            meeting.status === 'cancelled' ? '#ef4444, #dc2626' : 
                            meeting.status === 'expired' ? '#94a3b8, #64748b' :
                            '#6b7280, #4b5563'
                          })`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          boxShadow: `0 4px 12px ${
                            meeting.status === 'confirmed' || meeting.status === 'rescheduled' ? 'rgba(74, 222, 128, 0.3)' :
                            meeting.status === 'pending' ? 'rgba(245, 158, 11, 0.3)' :
                            meeting.status === 'started' ? 'rgba(59, 130, 246, 0.3)' :
                            meeting.status === 'cancelled' ? 'rgba(239, 68, 68, 0.3)' : 
                            meeting.status === 'expired' ? 'rgba(148, 163, 184, 0.3)' :
                            'rgba(107, 114, 128, 0.3)'
                          }`
                        }}
                      >
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {meeting.status === 'confirmed' || meeting.status === 'rescheduled' ? '✅' :
                           meeting.status === 'pending' ? '⏳' :
                           meeting.status === 'started' ? '🔴' :
                           meeting.status === 'cancelled' ? '❌' : 
                           meeting.status === 'expired' ? '⏰' : '📅'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography 
                          variant="h6" 
                          fontWeight={700}
                          sx={{ 
                            background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {meeting.title || 'Consultation Meeting'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {formatMeetingDateTime(meeting.scheduled_at, meeting.timezone)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Enhanced timezone and duration info */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={meeting.timezone || 'UTC'} 
                        size="small" 
                        sx={{
                          background: 'rgba(255, 255, 255, 0.7)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                      
                      {meeting.duration && (
                        <Chip 
                          label={`${meeting.duration} minutes`}
                          size="small" 
                          sx={{
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                  
                  {/* Enhanced status chip */}
                  {meeting?.status ? (
                    <Chip 
                      label={
                        meeting.status === 'rescheduled' ? 'RESCHEDULED & CONFIRMED' : 
                        meeting.status === 'started' ? 'IN PROGRESS' : 
                        meeting.status.toUpperCase()
                      } 
                      sx={{
                        background: `linear-gradient(135deg, ${
                          meeting.status === 'confirmed' || meeting.status === 'rescheduled' ? '#4ade80, #22c55e' :
                          meeting.status === 'pending' ? '#f59e0b, #d97706' :
                          meeting.status === 'started' ? '#3b82f6, #1d4ed8' :
                          meeting.status === 'cancelled' ? '#ef4444, #dc2626' : 
                          meeting.status === 'expired' ? '#94a3b8, #64748b' :
                          '#6b7280, #4b5563'
                        })`,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 2,
                        boxShadow: `0 4px 12px ${
                          meeting.status === 'confirmed' || meeting.status === 'rescheduled' ? 'rgba(74, 222, 128, 0.3)' :
                          meeting.status === 'pending' ? 'rgba(245, 158, 11, 0.3)' :
                          meeting.status === 'started' ? 'rgba(59, 130, 246, 0.3)' :
                          meeting.status === 'cancelled' ? 'rgba(239, 68, 68, 0.3)' : 
                          meeting.status === 'expired' ? 'rgba(148, 163, 184, 0.3)' :
                          'rgba(107, 114, 128, 0.3)'
                        }`
                      }}
                      size="small"
                    />
                  ) : (
                    <Typography color="error">Status not available</Typography>
                  )}
                </Box>
                
                {meeting.goals && (
                  <Box 
                    sx={{
                      mt: 2,
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Meeting Goals:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {meeting.goals}
                    </Typography>
                  </Box>
                )}
                
                {showActions && (
                  <Box mt={3}>
                    <Divider sx={{ 
                      mb: 2,
                      background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)'
                    }} />
                    
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      {userType === 'host' && meeting?.id && (
                        <>
                          {meeting.status === 'pending' && (
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={() => handleStatusUpdate(meeting.id, 'confirmed')}
                              sx={{
                                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                textTransform: 'none',
                                boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 25px rgba(74, 222, 128, 0.4)',
                                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                }
                              }}
                            >
                              ✅ Confirm
                            </Button>
                          )}
                          
                          {['pending', 'confirmed', 'rescheduled'].includes(meeting.status) && meeting.status !== 'expired' && (
                            <>
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => {
                                  setSelectedMeeting(meeting);
                                  setTimezone(meeting.timezone || 'UTC');
                                  setRescheduleDialogOpen(true);
                                }}
                                sx={{
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  backdropFilter: 'blur(10px)',
                                  borderRadius: 2,
                                  px: 3,
                                  py: 1,
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  textTransform: 'none',
                                  border: '1px solid rgba(102, 126, 234, 0.3)',
                                  color: '#667eea',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                    borderColor: '#667eea',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                                  }
                                }}
                              >
                                📅 Reschedule
                              </Button>
                              
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => handleStatusUpdate(meeting.id, 'cancelled')}
                                sx={{
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  backdropFilter: 'blur(10px)',
                                  borderRadius: 2,
                                  px: 3,
                                  py: 1,
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  textTransform: 'none',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#ef4444',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                                    borderColor: '#ef4444',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
                                  }
                                }}
                              >
                                ❌ Cancel
                              </Button>
                            </>
                          )}
                          
                          {(meeting.status === 'confirmed' || meeting.status === 'rescheduled') && (
                            <Button 
                              variant="contained" 
                              size="medium"
                              disabled={actionLoading}
                              onClick={() => handleStartMeeting(meeting.id!)}
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                textTransform: 'none',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-3px)',
                                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)',
                                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                                },
                                '&:disabled': {
                                  background: 'rgba(102, 126, 234, 0.5)',
                                  transform: 'none',
                                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                                }
                              }}
                              startIcon={actionLoading ? (
                                <CircularProgress size={16} sx={{ color: 'white' }} />
                              ) : (
                                <Box 
                                  component="span" 
                                  sx={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#f59e0b', 
                                    display: 'inline-block',
                                    boxShadow: '0 0 0 rgba(245, 158, 11, 0.4)',
                                    animation: 'pulse 1.5s infinite',
                                    '@keyframes pulse': {
                                      '0%': {
                                        boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)',
                                      },
                                      '70%': {
                                        boxShadow: '0 0 0 8px rgba(245, 158, 11, 0)',
                                      },
                                      '100%': {
                                        boxShadow: '0 0 0 0 rgba(245, 158, 11, 0)',
                                      },
                                    },
                                  }} 
                                />
                              )}
                            >
                              {actionLoading ? 'Starting...' : 'Start Meeting'}
                            </Button>
                          )}
                          
                          {meeting.status === 'started' && meeting.meeting_url && (
                            <>
                              <Button 
                                variant="contained" 
                                size="medium"
                                onClick={() => setEmbeddedMeetingUrl(meeting.meeting_url || null)}
                                sx={{
                                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                  backdropFilter: 'blur(10px)',
                                  borderRadius: 2,
                                  px: 4,
                                  py: 1.5,
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  textTransform: 'none',
                                  boxShadow: '0 6px 20px rgba(74, 222, 128, 0.4)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 10px 30px rgba(74, 222, 128, 0.5)',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                  }
                                }}
                              >
                                🎥 Join Meeting
                              </Button>
                              
                              <Button 
                                variant="outlined" 
                                size="medium"
                                disabled={actionLoading}
                                onClick={() => handleEndMeeting(meeting.id!)}
                                sx={{
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  backdropFilter: 'blur(10px)',
                                  borderRadius: 2,
                                  px: 4,
                                  py: 1.5,
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  textTransform: 'none',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#ef4444',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                                    borderColor: '#ef4444',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
                                  },
                                  '&:disabled': {
                                    background: 'rgba(239, 68, 68, 0.3)',
                                    borderColor: 'rgba(239, 68, 68, 0.2)',
                                    color: 'rgba(239, 68, 68, 0.6)',
                                    transform: 'none',
                                    boxShadow: 'none'
                                  }
                                }}
                                startIcon={actionLoading ? (
                                  <CircularProgress size={16} sx={{ color: 'rgba(239, 68, 68, 0.6)' }} />
                                ) : null}
                              >
                                {actionLoading ? 'Ending...' : '🛑 End Meeting'}
                              </Button>
                            </>
                          )}
                        </>
                      )}

                      {userType === 'client' && ['pending', 'confirmed', 'rescheduled'].includes(meeting.status) && meeting.status !== 'expired' && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setTimezone(meeting.timezone || 'UTC');
                              setRescheduleDialogOpen(true);
                            }}
                            sx={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              textTransform: 'none',
                              border: '1px solid rgba(102, 126, 234, 0.3)',
                              color: '#667eea',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                borderColor: '#667eea',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                              }
                            }}
                          >
                            📅 Reschedule
                          </Button>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleStatusUpdate(meeting.id, 'cancelled')}
                            sx={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              textTransform: 'none',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                                borderColor: '#ef4444',
                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
                              }
                            }}
                          >
                            ❌ Cancel
                          </Button>
                        </>
                      )}

                      {meeting.meeting_url && meeting.status === 'started' && userType === 'client' && (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => window.open(meeting.meeting_url, '_blank')}
                            sx={{
                              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              textTransform: 'none',
                              boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(74, 222, 128, 0.4)',
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                              }
                            }}
                          >
                            🎥 Join Meeting
                          </Button>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            disabled={actionLoading}
                            onClick={() => handleEndMeeting(meeting.id!)}
                            sx={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              textTransform: 'none',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                                borderColor: '#ef4444',
                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
                              },
                              '&:disabled': {
                                background: 'rgba(239, 68, 68, 0.3)',
                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                color: 'rgba(239, 68, 68, 0.6)',
                                transform: 'none',
                                boxShadow: 'none'
                              }
                            }}
                            startIcon={actionLoading ? (
                              <CircularProgress size={14} sx={{ color: 'rgba(239, 68, 68, 0.6)' }} />
                            ) : null}
                          >
                            {actionLoading ? 'Ending...' : '🛑 End Meeting'}
                          </Button>
                        </>
                      )}
                      
                      {(meeting.status === 'confirmed' || meeting.status === 'rescheduled') && userType === 'client' && (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={true}
                          sx={{
                            background: 'rgba(102, 126, 234, 0.3)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            color: 'rgba(102, 126, 234, 0.8)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            '&.Mui-disabled': {
                              color: 'rgba(102, 126, 234, 0.6)',
                              background: 'rgba(102, 126, 234, 0.2)'
                            }
                          }}
                        >
                          ⏳ Waiting for host...
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

      {embeddedMeetingUrl && selectedMeeting && (
        <Box mt={2} sx={{ height: '500px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
          <LiveKitRoom
            meetingUrl={embeddedMeetingUrl}
            meetingId={selectedMeeting.id}
            height="100%"
            onError={(errorMsg: string) => setError(errorMsg)}
            onMeetingEnd={() => handleEndMeeting(selectedMeeting.id)}
          />
        </Box>
      )}

      {/* Enhanced Reschedule Dialog with Modern Design */}
      <Dialog 
        open={rescheduleDialogOpen} 
        onClose={() => setRescheduleDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            minWidth: 400
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontSize: '1.5rem',
            pb: 1,
            borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
          }}
        >
          📅 Reschedule Meeting
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}
          
          {selectedMeeting && (
            <Box sx={{ mt: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="New Meeting Time"
                  value={newTime ? new Date(newTime) : new Date(selectedMeeting.scheduled_at)}
                  onChange={(newValue) => setNewTime(newValue?.toISOString() || '')}
                  sx={{ 
                    width: '100%', 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      '&:hover': {
                        border: '1px solid rgba(102, 126, 234, 0.4)'
                      },
                      '&.Mui-focused': {
                        border: '1px solid #667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                      }
                    }
                  }}
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
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setRescheduleDialogOpen(false)}
            sx={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              color: '#6b7280',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%)',
                borderColor: '#6b7280',
                boxShadow: '0 4px 15px rgba(107, 114, 128, 0.2)'
              }
            }}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleReschedule} 
            variant="contained"
            disabled={availabilityChecking}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              px: 4,
              py: 1,
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'none',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)',
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
              },
              '&:disabled': {
                background: 'rgba(102, 126, 234, 0.5)',
                transform: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
              }
            }}
            startIcon={availabilityChecking ? (
              <CircularProgress size={16} sx={{ color: 'white' }} />
            ) : null}
          >
            {availabilityChecking ? 'Checking...' : '📅 Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage(null)} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.9) 0%, rgba(34, 197, 94, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeetingsList;