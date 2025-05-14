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
  TextField,
  MenuItem
} from '@mui/material';
import { Meeting } from '../../types/meeting';
import { useApiClient } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { DateTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

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
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [embeddedMeetingUrl, setEmbeddedMeetingUrl] = useState<string | null>(null);
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

  const handleStatusUpdate = async (meetingId: number | undefined, status: string, newTime?: string) => {
    if (!meetingId) {
      console.error('Invalid meeting ID:', meetingId);
      return;
    }

    try {
      const payload: any = { meetingId, status };
      if (newTime) payload.scheduled_at = newTime;
      
      const updatedMeeting = await apiClient.put(`/api/meetings/${meetingId}/`, payload);
      
      setMeetings(meetings.map(m => 
        m.id === meetingId ? updatedMeeting : m
      ));
      
      setRescheduleDialogOpen(false);
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const statusOptions = [
    { value: 'confirmed', label: 'Confirm' },
    { value: 'rescheduled', label: 'Reschedule' },
    { value: 'cancelled', label: 'Cancel' },
    { value: 'completed', label: 'Mark as Completed' }
  ];

  if (loading) return <CircularProgress />;

  return (
    <Box>
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
                      {format(new Date(meeting.scheduled_at), 'PPPpp')}
                    </Typography>
                    {meeting.duration && (
                      <Typography variant="body2" color="text.secondary">
                        Duration: {meeting.duration} minutes
                      </Typography>
                    )}
                  </Box>
                  
                  {console.log('Meeting object:', meeting)}
                  {meeting?.status ? (
                    <Chip 
                      label={meeting.status.toUpperCase()} 
                      color={
                        meeting.status === 'confirmed' ? 'success' :
                        meeting.status === 'pending' ? 'warning' :
                        meeting.status === 'cancelled' ? 'error' : 'info'
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
                          {console.log('Rendering meeting:', meeting)}
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => handleStatusUpdate(meeting.id, 'confirmed')}
                          >
                            Confirm
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => {
                              const newTime = prompt('Enter new meeting time (YYYY-MM-DD HH:MM)');
                              if (newTime) handleStatusUpdate(meeting.id, 'rescheduled', newTime);
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
                          {meeting.status === 'confirmed' && meeting.meeting_url && (
                            <Button 
                              variant="contained" 
                              color="primary"
                              size="small"
                              onClick={() => setEmbeddedMeetingUrl(meeting.meeting_url)}
                            >
                              Start Meeting
                            </Button>
                          )}
                        </Box>
                      )}

                      {userType === 'client' && meeting.status === 'pending' && (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedMeeting(meeting);
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

                      {meeting.meeting_url && (
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

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Change Meeting Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mt: 1 }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          
          {newStatus === 'rescheduled' && selectedMeeting && (
            <DateTimePicker
              label="New Meeting Time"
              value={newTime || selectedMeeting.scheduled_at}
              onChange={(newValue) => setNewTime(newValue?.toISOString() || '')}
              sx={{ mt: 2, width: '100%' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              if (newStatus === 'rescheduled') {
                handleStatusUpdate(selectedMeeting?.id, newStatus, newTime);
              } else {
                handleStatusUpdate(selectedMeeting?.id, newStatus);
              }
            }}
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onClose={() => setRescheduleDialogOpen(false)}>
        <DialogTitle>Reschedule Meeting</DialogTitle>
        <DialogContent>
          {selectedMeeting && (
            <DateTimePicker
              label="New Meeting Time"
              value={newTime || selectedMeeting.scheduled_at}
              onChange={(newValue) => setNewTime(newValue?.toISOString() || '')}
              sx={{ mt: 2, width: '100%' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleStatusUpdate(selectedMeeting?.id, 'pending', newTime)}
            variant="contained"
          >
            Reschedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingsList;