// components/meetings/MeetingNotification.tsx
import { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Button, 
  Stack
} from '@mui/material';
import { useApiClient } from '../../utils/apiClient';
import { Meeting } from '../../types/meeting';

const NOTIFICATION_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

interface MeetingNotificationProps {
  onJoinMeeting: (meetingId: number, url: string) => void;
}

const MeetingNotification = ({ onJoinMeeting }: MeetingNotificationProps) => {
  const [openNotification, setOpenNotification] = useState(false);
  const [startedMeeting, setStartedMeeting] = useState<Meeting | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState<number>(Date.now());
  const apiClient = useApiClient();
  
  useEffect(() => {
    // Function to check for newly started meetings
    const checkForStartedMeetings = async () => {
      try {
        const meetings = await apiClient.get('/api/meetings/active/');
        
        if (!meetings || !Array.isArray(meetings)) return;
        
        // Look for meetings that have been started since our last check
        const nowTime = Date.now();
        const newlyStartedMeeting = meetings.find(meeting => 
          meeting.status === 'started' && 
          new Date(meeting.updated_at).getTime() > lastCheckedTime
        );
        
        if (newlyStartedMeeting) {
          setStartedMeeting(newlyStartedMeeting);
          setOpenNotification(true);
        }
        
        setLastCheckedTime(nowTime);
      } catch (err) {
        console.error('Error checking for started meetings:', err);
      }
    };
    
    // Check on mount
    checkForStartedMeetings();
    
    // Set up interval for checking
    const intervalId = setInterval(checkForStartedMeetings, NOTIFICATION_CHECK_INTERVAL);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [apiClient, lastCheckedTime]);
  
  const handleCloseNotification = () => {
    setOpenNotification(false);
  };
  
  const handleJoinMeeting = () => {
    if (startedMeeting && startedMeeting.meeting_url) {
      onJoinMeeting(startedMeeting.id, startedMeeting.meeting_url);
      setOpenNotification(false);
    }
  };
  
  return (
    <Snackbar
      open={openNotification}
      autoHideDuration={null} // Don't auto-hide - user must take action
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        severity="info" 
        variant="filled" 
        onClose={handleCloseNotification}
        sx={{ width: '100%' }}
      >
        <Stack spacing={1}>
          {startedMeeting ? (
            <>
              The meeting "{startedMeeting.title}" is now in progress.
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleJoinMeeting}
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              >
                Join Now
              </Button>
            </>
          ) : 'A meeting has been started.'}
        </Stack>
      </Alert>
    </Snackbar>
  );
};

export default MeetingNotification;
