// components/meetings/ActiveMeeting.tsx
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useApiClient } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { Meeting } from '../../types/meeting';
import { format, differenceInMinutes } from 'date-fns';
import JitsiRoom from './JitsiRoom';
// import LiveKitRoom from './LiveKitRoom'; // Preserved for future use
import { useMeetingActions } from '../../hooks/useMeetingActions';

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
    const [ending, setEnding] = useState(false);
    const [timeUntilMeeting, setTimeUntilMeeting] = useState<string>('');
    const [isTabVisible, setIsTabVisible] = useState<boolean>(true);
    const apiClient = useApiClient();
    const { userType } = useAuth();
    
    // Handle meeting updates and refreshes
    const handleMeetingUpdate = (updatedMeeting: Meeting) => {
      setActiveMeeting(updatedMeeting);
      cacheMeetingData(updatedMeeting);
    };

    const fetchActiveMeetingData = async () => {
      try {
        const meetings = await apiClient.get('/api/meetings/active/');
        if (meetings.length > 0) {
          const meeting = meetings[0];
          setActiveMeeting(meeting);
          cacheMeetingData(meeting);
        } else {
          setActiveMeeting(null);
        }
      } catch (err) {
        console.error('Error fetching active meeting:', err);
        setError('Could not load your active meeting');
      }
    };

    const {
      startMeeting: startMeetingAction,
      endMeeting: endMeetingAction,
      loading: actionLoading,
      error: actionError
    } = useMeetingActions(handleMeetingUpdate, fetchActiveMeetingData);
    
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
          
          // Find the next upcoming meeting that is confirmed, rescheduled, or started
          const currentTime = new Date();
          const upcomingMeetings = meetings.filter((m: Meeting) => 
            (new Date(m.scheduled_at) > currentTime && 
             (m.status === 'confirmed' || m.status === 'rescheduled' || m.status === 'started')) ||
            // Include meetings that started in the last hour
            (differenceInMinutes(currentTime, new Date(m.scheduled_at)) <= 60 && 
             (m.status === 'confirmed' || m.status === 'rescheduled' || m.status === 'started'))
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
        const updatedMeeting = await startMeetingAction(activeMeeting.id);
        
        // Update the local state with the started meeting (contains meeting_url)
        if (updatedMeeting) {
          setActiveMeeting(updatedMeeting);
        }
        
      } catch (error) {
        console.error('Error starting meeting:', error);
        setError('Failed to start meeting. Please try again.');
      } finally {
        setStarting(false);
      }
    };

    const handleEndMeeting = async () => {
      if (!activeMeeting?.id) return;
      try {
        setEnding(true);
        await endMeetingAction(activeMeeting.id);
        // Show success message briefly, then reload page
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
      } catch (error) {
        console.error('Error ending meeting:', error);
        setError('Failed to end meeting. Please try again.');
        setEnding(false);
      }
    };
  
    // Handle action errors
    useEffect(() => {
      if (actionError) {
        setError(actionError);
      }
    }, [actionError]);

    if (loading && !activeMeeting) return <CircularProgress />;
  
  if (error && !activeMeeting) return <Alert severity="error">{error}</Alert>;
  
  if (!activeMeeting) {
    return (
      <Box 
        sx={{
          background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.1) 0%, rgba(196, 181, 253, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '1px solid rgba(147, 197, 253, 0.2)',
          p: 4,
          textAlign: 'center'
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
          No Active Meetings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You have no active meetings. Schedule a meeting to get started.
        </Typography>
      </Box>
    );
  }
  
    return (
      <Card 
        sx={{ 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(168, 237, 234, 0.1) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(102, 126, 234, 0.2)',
          borderTop: '3px solid',
          borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)'
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header with gradient icon and title */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                }}
              >
                <Typography variant="h6" sx={{ color: 'white' }}>📹</Typography>
              </Box>
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {activeMeeting.title || 'Consultation Meeting'}
                </Typography>
              </Box>
            </Box>
            
            <Chip 
              label={timeUntilMeeting} 
              sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                color: 'primary.main',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}
              size="small"
              icon={<AccessTime />}
            />
          </Box>
          
          {/* Enhanced meeting info chips */}
          <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label={format(new Date(activeMeeting.scheduled_at), 'PPP p')} 
              size="small" 
              sx={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                fontWeight: 500
              }}
            />
            
            <Chip 
              label={activeMeeting.timezone || 'UTC'} 
              size="small" 
              sx={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                fontWeight: 500
              }}
            />
            
            {activeMeeting.duration && (
              <Chip 
                label={`${activeMeeting.duration} min`} 
                size="small" 
                sx={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  fontWeight: 500
                }}
              />
            )}
          </Stack>
          
          {activeMeeting.goals && (
            <Box 
              sx={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 2,
                mb: 3,
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Meeting Goals:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeMeeting.goals}
              </Typography>
            </Box>
          )}
          
          {activeMeeting.status === 'started' && activeMeeting.meeting_url ? (
            <>
              <Box sx={{ 
                height: '400px', 
                border: '1px solid rgba(102, 126, 234, 0.2)', 
                borderRadius: 3, 
                overflow: 'hidden',
                mb: 3,
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.1)'
              }}>
                <JitsiRoom
                  meetingUrl={activeMeeting.meeting_url}
                  meetingId={activeMeeting.id}
                  height="100%"
                  onError={(errorMsg) => {
                    console.error('Meeting frame error:', errorMsg);
                    setError(`Meeting error: ${errorMsg}`);
                  }}
                  onMeetingEnd={handleEndMeeting}
                />
                {/* LiveKit preserved for future use:
                <LiveKitRoom
                  meetingUrl={activeMeeting.meeting_url}
                  meetingId={activeMeeting.id}
                  height="100%"
                  onError={(errorMsg) => {
                    console.error('Meeting frame error:', errorMsg);
                    setError(`Meeting error: ${errorMsg}`);
                  }}
                  onMeetingEnd={handleEndMeeting}
                />
                */}
              </Box>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  onClick={() => window.open(activeMeeting.meeting_url, '_blank')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    flex: 1,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5046e4 0%, #6B46C1 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  Open in New Window
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleEndMeeting}
                  disabled={ending || actionLoading}
                  sx={{
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    borderRadius: 2,
                    py: 1.5,
                    px: 3,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderColor: '#dc2626',
                      color: '#dc2626'
                    },
                    '&:disabled': {
                      borderColor: '#9ca3af',
                      color: '#9ca3af'
                    }
                  }}
                >
                  {ending || actionLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} sx={{ color: 'inherit' }} />
                      Ending...
                    </Box>
                  ) : 'End Meeting'}
                </Button>
              </Stack>
            </>
          ) : (
            <Box textAlign="center" py={4}>
              {(activeMeeting.status === 'confirmed' || activeMeeting.status === 'rescheduled') && (
                <>
                  {activeMeeting.host && activeMeeting.user && activeMeeting.host.id !== activeMeeting.user.id ? (
                    // For clients when the meeting is confirmed but not started
                    <>
                      <Box 
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          boxShadow: '0 8px 25px rgba(245, 87, 108, 0.3)'
                        }}
                      >
                        <Typography variant="h4" sx={{ color: 'white' }}>⏰</Typography>
                      </Box>
                      <Typography variant="body1" mb={2} fontWeight={600}>
                        Waiting for the host to start the meeting
                      </Typography>
                      <Button
                        variant="contained"
                        disabled={true}
                        sx={{
                          background: 'rgba(158, 158, 158, 0.5)',
                          borderRadius: 2,
                          py: 1.5,
                          px: 4,
                          fontWeight: 600,
                          textTransform: 'none'
                        }}
                      >
                        Join Meeting
                      </Button>
                    </>
                  ) : (
                    // For hosts when meeting is confirmed but not started
                    <>
                      <Box 
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          boxShadow: '0 8px 25px rgba(74, 222, 128, 0.3)'
                        }}
                      >
                        <Typography variant="h4" sx={{ color: 'white' }}>🚀</Typography>
                      </Box>
                      <Typography variant="body1" mb={2} fontWeight={600}>
                        This meeting is confirmed. Click below to start it.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={handleStartMeeting}
                        disabled={starting || actionLoading}
                        sx={{
                          background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                          borderRadius: 2,
                          py: 1.5,
                          px: 4,
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: '0 8px 25px rgba(74, 222, 128, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 30px rgba(74, 222, 128, 0.4)'
                          }
                        }}
                      >
                        {starting || actionLoading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} sx={{ color: 'white' }} />
                            Starting...
                          </Box>
                        ) : (userType === 'client' ? 'Join Meeting' : 'Start Meeting')}
                      </Button>
                    </>
                  )}
                </>
              )}

              {activeMeeting.status === 'started' && !activeMeeting.meeting_url && (
                <>
                  <Box 
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <Typography variant="h4" sx={{ color: 'white' }}>🔗</Typography>
                  </Box>
                  <Typography variant="body1" mb={2} fontWeight={600}>
                    This meeting has been started by the host
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleStartMeeting}
                    disabled={starting}
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      borderRadius: 2,
                      py: 1.5,
                      px: 4,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)'
                      }
                    }}
                  >
                    {starting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                        Connecting...
                      </Box>
                    ) : 'Join Meeting'}
                  </Button>
                </>
              )}

              {activeMeeting.status === 'pending' && (
                <>
                  <Box 
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <Typography variant="h4" sx={{ color: 'white' }}>⏳</Typography>
                  </Box>
                  <Typography variant="body1" mb={2} fontWeight={600}>
                    This meeting has not been confirmed yet
                  </Typography>
                </>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };
  
  export default ActiveMeeting;
