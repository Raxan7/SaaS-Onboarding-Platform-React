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
    Chip
  } from '@mui/material';
  import { useEffect, useState } from 'react';
  import { useApiClient } from '../../utils/apiClient';
  import { Meeting } from '../../types/meeting';
  import { format } from 'date-fns';
  
  const ActiveMeeting = () => {
    const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const apiClient = useApiClient();
    const theme = useTheme();
  
    const checkActiveMeetings = async () => {
      try {
        const [meeting] = await apiClient.get('/api/meetings/active/');
        setActiveMeeting(meeting || null);
      } catch (error) {
        console.error('Error checking active meetings:', error);
      } finally {
        setLoading(false);
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
  
    useEffect(() => {
      checkActiveMeetings();
      const interval = setInterval(checkActiveMeetings, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }, []);
  
    if (loading) return <CircularProgress />;
  
    return (
      <Card sx={{ boxShadow: theme.shadows[2] }}>
        <CardContent>
          {!activeMeeting ? (
            <Typography variant="body1">No active meetings at this time</Typography>
          ) : (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  {activeMeeting.title || 'Consultation Meeting'}
                </Typography>
                <Chip 
                  label={activeMeeting.status.toUpperCase()} 
                  color={activeMeeting.status === 'confirmed' ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Stack>
              
              <Typography variant="body2" color="text.secondary" mb={1}>
                Scheduled: {format(new Date(activeMeeting.scheduled_at), 'PPPpp')}
              </Typography>
              
              {activeMeeting.goals && (
                <Typography variant="body2" mb={2}>
                  <strong>Goals:</strong> {activeMeeting.goals}
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
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };
  
  export default ActiveMeeting;