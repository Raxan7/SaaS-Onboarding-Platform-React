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

  // Local storage keys
  const ACTIVE_MEETING_CACHE_KEY = 'active-meeting-cache';
  const ACTIVE_MEETING_TIMESTAMP_KEY = 'active-meeting-timestamp';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Global state to prevent duplicate API calls from multiple components
  const pendingRequests: Record<string, boolean> = {};

  /**
   * Helper function for debouncing API calls
   */
  const debounceApiCall = async (key: string, apiCall: () => Promise<any>, timeout = 1000) => {
    if (pendingRequests[key]) {
      return null;
    }
    
    try {
      pendingRequests[key] = true;
      return await apiCall();
    } finally {
      // Clear the pending flag after a timeout to allow future calls
      setTimeout(() => {
        pendingRequests[key] = false;
      }, timeout);
    }
  };

  /**
   * Helper function to store meeting data in local storage
   */
  const cacheMeetingData = (meeting: Meeting | null) => {
    if (meeting) {
      localStorage.setItem(ACTIVE_MEETING_CACHE_KEY, JSON.stringify(meeting));
      localStorage.setItem(ACTIVE_MEETING_TIMESTAMP_KEY, Date.now().toString());
    }
  };

  /**
   * Helper function to retrieve cached meeting data from local storage
   */
  const getCachedMeetingData = (): { meeting: Meeting | null, timestamp: number } => {
    try {
      const cachedMeetingStr = localStorage.getItem(ACTIVE_MEETING_CACHE_KEY);
      const cachedTimestampStr = localStorage.getItem(ACTIVE_MEETING_TIMESTAMP_KEY);
      
      if (!cachedMeetingStr || !cachedTimestampStr) {
        return { meeting: null, timestamp: 0 };
      }
      
      const cachedMeeting = JSON.parse(cachedMeetingStr) as Meeting;
      const cachedTimestamp = parseInt(cachedTimestampStr, 10);
      
      // Validate the cached data and check if it's expired
      if (Date.now() - cachedTimestamp > CACHE_TTL) {
        // Cache expired, clear it
        localStorage.removeItem(ACTIVE_MEETING_CACHE_KEY);
        localStorage.removeItem(ACTIVE_MEETING_TIMESTAMP_KEY);
        return { meeting: null, timestamp: 0 };
      }
      
      return { meeting: cachedMeeting, timestamp: cachedTimestamp };
    } catch (error) {
      // Clear cache if there's any error parsing
      localStorage.removeItem(ACTIVE_MEETING_CACHE_KEY);
      localStorage.removeItem(ACTIVE_MEETING_TIMESTAMP_KEY);
      return { meeting: null, timestamp: 0 };
    }
  };
  
  const ActiveMeeting = () => {
    const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [starting, setStarting] = useState(false);
    const [timeUntilMeeting, setTimeUntilMeeting] = useState<string>('');
    const [isTabVisible, setIsTabVisible] = useState<boolean>(true);
    const apiClient = useApiClient();
    const theme = useTheme();
    
    // Track document visibility to reduce API calls when tab is not visible
    useEffect(() => {
      const handleVisibilityChange = () => {
        setIsTabVisible(!document.hidden);
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, []);
    
    // Initialize from cache if available
    useEffect(() => {
      const { meeting } = getCachedMeetingData();
      if (meeting) {
        setActiveMeeting(meeting);
        updateTimeUntilMeeting(meeting.scheduled_at);
        setLoading(false);
      }
    }, []);
  
    // Fetch active meeting data (next upcoming confirmed meeting)
    useEffect(() => {
      let intervalId: number | null = null;
      let lastFetchTime = 0;
      let lastMeetingId = activeMeeting?.id;
      let consecutiveNoChangeCount = 0;
      const MAX_NO_CHANGE_COUNT = 3; // After 3 consecutive fetches with no changes, extend the interval
      
      const fetchActiveMeeting = async (force = false) => {
        const now = Date.now();
        
        // Skip if tab is not visible and not forced
        if (!isTabVisible && !force) {
          return;
        }
        
        // Check cache first when not forced
        if (!force) {
          const { meeting, timestamp } = getCachedMeetingData();
          // If we have a cached meeting and it's recent enough, use it
          if (meeting && now - timestamp < CACHE_TTL) {
            // Only update if different from current
            if (!activeMeeting || activeMeeting.id !== meeting.id || 
                activeMeeting.status !== meeting.status || 
                activeMeeting.meeting_url !== meeting.meeting_url) {
              setActiveMeeting(meeting);
              updateTimeUntilMeeting(meeting.scheduled_at);
            }
            return;
          }
        }
        
        // If not forced, implement dynamic fetch intervals based on patterns
        if (!force) {
          // Skip fetching if it's been less than 5 minutes since the last fetch
          if (now - lastFetchTime < 5 * 60 * 1000) {
            return;
          }
          
          // If we have an active meeting that's not starting in the next hour, check less frequently
          if (activeMeeting) {
            const meetingTime = new Date(activeMeeting.scheduled_at);
            const currentTime = new Date();
            const minutesUntil = differenceInMinutes(meetingTime, currentTime);
            
            // If meeting is far in the future (>1 hour), and we've seen no changes in consecutive fetches,
            // we can skip this fetch unless forced
            if (minutesUntil > 60 && consecutiveNoChangeCount >= MAX_NO_CHANGE_COUNT && !force) {
              console.log('Skipping fetch - meeting is far in future and no recent changes');
              return;
            }
          }
        }
        
        try {
          if (!force && loading && !activeMeeting) {
            setLoading(true);
          }
          
          // Use debounce to prevent duplicate calls from multiple components
          const apiCall = () => apiClient.get('/api/meetings/active/');
          const meetings = await debounceApiCall('fetch-active-meetings', apiCall);
          
          // If null was returned, another request is in progress
          if (meetings === null) {
            return;
          }
          
          lastFetchTime = now;
          
          // Find the next upcoming meeting that is confirmed or rescheduled
          const currentTime = new Date();
          const upcomingMeetings = meetings.filter((m: Meeting) => 
            (new Date(m.scheduled_at) > currentTime && 
             (m.status === 'confirmed' || m.status === 'rescheduled')) ||
            // Include meetings that started in the last hour
            (differenceInMinutes(currentTime, new Date(m.scheduled_at)) <= 60 && 
             (m.status === 'confirmed' || m.status === 'rescheduled'))
          );
          
          // Track if we found changes
          let meetingChanged = false;
          
          if (upcomingMeetings.length > 0) {
            // Sort by date ascending to get the closest upcoming meeting
            upcomingMeetings.sort((a: Meeting, b: Meeting) => 
              new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
            );
            
            const nextMeeting = upcomingMeetings[0];
            
            // Only update the state if the meeting has changed or if it's a forced refresh
            if (force || 
                !activeMeeting || 
                activeMeeting.id !== nextMeeting.id || 
                activeMeeting.status !== nextMeeting.status ||
                activeMeeting.meeting_url !== nextMeeting.meeting_url) {
              
              setActiveMeeting(nextMeeting);
              updateTimeUntilMeeting(nextMeeting.scheduled_at);
              meetingChanged = true;
              
              // Cache the meeting data
              cacheMeetingData(nextMeeting);
            }
            
            // Track changes for our adaptive polling
            if (lastMeetingId !== nextMeeting.id) {
              lastMeetingId = nextMeeting.id;
              consecutiveNoChangeCount = 0;
            } else if (!meetingChanged) {
              consecutiveNoChangeCount++;
            } else {
              consecutiveNoChangeCount = 0;
            }
            
          } else if (activeMeeting) {
            setActiveMeeting(null);
            lastMeetingId = undefined;
            meetingChanged = true;
            consecutiveNoChangeCount = 0;
            
            // Clear cache if no active meeting
            localStorage.removeItem(ACTIVE_MEETING_CACHE_KEY);
            localStorage.removeItem(ACTIVE_MEETING_TIMESTAMP_KEY);
          }
        } catch (err) {
          console.error('Error fetching active meeting:', err);
          setError('Could not load your active meeting');
        } finally {
          setLoading(false);
        }
      };
  
      // Initial fetch
      fetchActiveMeeting(true);
      
      // Set up an interval to refresh the active meeting status less frequently
      // Start with 5 minutes, but this can be extended based on the adaptive logic
      intervalId = window.setInterval(() => fetchActiveMeeting(false), 300000);
      
      return () => {
        if (intervalId) window.clearInterval(intervalId);
      };
    }, [apiClient, isTabVisible]);
    
    // Update time until meeting with an interval
    useEffect(() => {
      if (!activeMeeting) return;
      
      let intervalId: ReturnType<typeof setInterval> | null = null;
      let lastFetchTriggered = 0;
      
      const updateTimeDisplay = async () => {
        const meetingTime = new Date(activeMeeting.scheduled_at);
        const now = new Date();
        const minutesUntil = differenceInMinutes(meetingTime, now);
        
        updateTimeUntilMeeting(activeMeeting.scheduled_at);
        
        // Only trigger data refresh when approaching meeting time
        // This reduces server load while ensuring data is fresh when it matters
        if (minutesUntil > 0 && minutesUntil <= 10) {
          // If meeting is starting soon, update the interval to check more frequently
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = setInterval(updateTimeDisplay, 30000); // Update every 30 seconds when close to meeting time
          }
          
          // Skip API call if tab is not visible
          if (!isTabVisible) {
            return;
          }
          
          // Only fetch if we haven't fetched in the last minute and we're close to meeting time
          const currentTime = Date.now();
          if (currentTime - lastFetchTriggered > 60000) { // Only trigger a refresh once per minute
            try {
              // Use debounce for real-time updates as well
              const apiCall = () => apiClient.get('/api/meetings/active/');
              const meetings = await debounceApiCall('update-active-meetings', apiCall, 5000);
              
              // If null was returned, another request is in progress
              if (meetings !== null && meetings.length > 0) {
                // Only update if meeting status or URL has changed
                if (meetings[0].status !== activeMeeting.status || 
                    meetings[0].meeting_url !== activeMeeting.meeting_url) {
                  setActiveMeeting(meetings[0]);
                  // Update cache when meeting data changes
                  cacheMeetingData(meetings[0]);
                }
              }
              lastFetchTriggered = currentTime;
            } catch (err) {
              console.error('Error refreshing meeting status:', err);
            }
          }
        }
      };
      
      updateTimeDisplay(); // Initial update
      
      // Use a more efficient interval - update time display every minute
      // This mostly just updates the UI timer, with conditional API calls
      intervalId = setInterval(updateTimeDisplay, 60000);
      
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [activeMeeting, apiClient, isTabVisible]);
  
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
      if (!activeMeeting?.id) return;
      try {
        setStarting(true);
        const updatedMeeting = await apiClient.put(`/api/meetings/${activeMeeting.id}/start/`, {});
        setActiveMeeting(updatedMeeting);
        
        // Update the cache with the latest meeting data
        cacheMeetingData(updatedMeeting);
      } catch (error) {
        console.error('Error starting meeting:', error);
      } finally {
        setStarting(false);
      }
    };
  
    if (loading && !activeMeeting) return <CircularProgress />;
  
  if (error && !activeMeeting) return <Alert severity="error">{error}</Alert>;
  
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