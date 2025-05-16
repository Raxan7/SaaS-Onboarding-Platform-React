// components/meetings/ActiveMeeting.tsx
import { 
    Box, 
    Typography, 
    Button, 
    CircularProgress,
    Card,
    CardContent,
    useTheme,
    Stack,
    Chip,
    Alert
  } from '@mui/material';
  import { AccessTime } from '@mui/icons-material';
  import { useEffect, useState } from 'react';
  import { useApiClient } from '../../utils/apiClient';
  import { Meeting } from '../../types/meeting';
  import { format, differenceInMinutes } from 'date-fns';
  
  const ActiveMeeting = () => {
    const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [starting, setStarting] = useState(false);
    const [timeUntilMeeting, setTimeUntilMeeting] = useState<string>('');
    const apiClient = useApiClient();
    const theme = useTheme();
  
    // Fetch active meeting data (next upcoming confirmed meeting)
    useEffect(() => {
      const fetchActiveMeeting = async () => {
        try {
          setLoading(true);
          const meetings = await apiClient.get('/api/meetings/');
          
          // Find the next upcoming meeting that is confirmed
          const now = new Date();
          const upcomingMeetings = meetings.filter((m: Meeting) => 
            new Date(m.scheduled_at) > now && m.status === 'confirmed'
          );
          
          if (upcomingMeetings.length > 0) {
            // Sort by date ascending to get the closest upcoming meeting
            upcomingMeetings.sort((a: Meeting, b: Meeting) => 
              new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
            );
            
            setActiveMeeting(upcomingMeetings[0]);
            updateTimeUntilMeeting(upcomingMeetings[0].scheduled_at);
          } else {
            setActiveMeeting(null);
          }
        } catch (err) {
          console.error('Error fetching active meeting:', err);
          setError('Could not load your active meeting');
        } finally {
          setLoading(false);
        }
      };
  
      fetchActiveMeeting();
      
      // Set up an interval to refresh the active meeting status
      const intervalId = setInterval(fetchActiveMeeting, 60000); // Refresh every minute
      
      return () => {
        clearInterval(intervalId);
      };
    }, [apiClient]);
    
    // Update time until meeting with an interval
    useEffect(() => {
      if (!activeMeeting) return;
      
      const updateTimeDisplay = () => {
        updateTimeUntilMeeting(activeMeeting.scheduled_at);
      };
      
      updateTimeDisplay(); // Initial update
      
      const intervalId = setInterval(updateTimeDisplay, 60000); // Update time every minute
      
      return () => {
        clearInterval(intervalId);
      };
    }, [activeMeeting]);
  
    const updateTimeUntilMeeting = (scheduledAt: string) => {
      const meetingTime = new Date(scheduledAt);
      const now = new Date();
      
      if (meetingTime <= now) {
        setTimeUntilMeeting('Meeting in progress');
        return;
      }
      
      const minutesUntil = differenceInMinutes(meetingTime, now);
      
      if (minutesUntil < 60) {
        setTimeUntilMeeting(`Starts in ${minutesUntil} minutes`);
      } else if (minutesUntil < 24 * 60) {
        const hours = Math.floor(minutesUntil / 60);
        const mins = minutesUntil % 60;
        setTimeUntilMeeting(`Starts in ${hours} hour${hours !== 1 ? 's' : ''} ${mins > 0 ? `and ${mins} minute${mins !== 1 ? 's' : ''}` : ''}`);
      } else {
        const days = Math.floor(minutesUntil / (24 * 60));
        setTimeUntilMeeting(`Starts in ${days} day${days !== 1 ? 's' : ''}`);
      }
    };
  
    const handleStartMeeting = async () => {
        console.log('Starting meeting:', activeMeeting);
      if (!activeMeeting?.id) return;
      try {
        setStarting(true);
        const updatedMeeting = await apiClient.put(`/api/meetings/${activeMeeting.id}/start/`, {});
        setActiveMeeting(updatedMeeting);
      } catch (error) {
        console.error('Error starting meeting:', error);
      } finally {
        setStarting(false);
      }
    };
  
    if (loading) return <CircularProgress />;
    
    if (error) return <Alert severity="error">{error}</Alert>;
    
    if (!activeMeeting) {
      return (
        <Alert severity="info">
          You have no active meetings. Schedule a meeting to get started.
        </Alert>
      );
    }
  
    return (
      <Card sx={{ boxShadow: theme.shadows[2] }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {activeMeeting.title || 'Consultation Meeting'}
            </Typography>
            
            <Chip 
              label={timeUntilMeeting} 
              color="primary" 
              size="small"
              icon={<AccessTime />}
            />
          </Box>
          
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip 
              label={format(new Date(activeMeeting.scheduled_at), 'PPP p')} 
              size="small" 
              variant="outlined"
            />
            
            <Chip 
              label={activeMeeting.timezone || 'UTC'} 
              size="small" 
              variant="outlined" 
            />
            
            {activeMeeting.duration && (
              <Chip 
                label={`${activeMeeting.duration} min`} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Stack>
          
          {activeMeeting.goals && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {activeMeeting.goals}
            </Typography>
          )}
          
          {activeMeeting.meeting_url ? (
            <>
              <Box sx={{ 
                height: '400px', 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2, 
                overflow: 'hidden',
                mb: 2
              }}>
                <iframe
                  src={activeMeeting.meeting_url}
                  style={{ width: '100%', height: '100%', border: 0 }}
                  allow="camera; microphone; fullscreen; display-capture"
                  title="Meeting"
                />
              </Box>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => window.open(activeMeeting.meeting_url, '_blank')}
                  fullWidth
                >
                  Open in New Window
                </Button>
              </Stack>
            </>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" mb={2}>
                This meeting hasn't started yet
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleStartMeeting}
                disabled={starting}
              >
                {starting ? 'Starting...' : 'Start Meeting'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };
  
  export default ActiveMeeting;