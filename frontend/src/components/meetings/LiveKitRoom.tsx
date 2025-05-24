// components/meetings/LiveKitRoom.tsx
import { useEffect, useState } from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert, 
  AlertTitle, 
  Button, 
  Stack 
} from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { useApiClient } from '../../utils/apiClient';

// Import LiveKit Components for direct integration
import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from '@livekit/components-react';
import { Room, Track, ConnectionState, RoomEvent } from 'livekit-client';
import '@livekit/components-styles';

// Types
interface LiveKitRoomProps {
  meetingUrl: string;
  meetingId: number;
  height?: string | number;
  onError?: (error: string) => void;
}

interface TokenResponse {
  token: string;
  room: string;
  server_url: string;
  is_host: boolean;
  user_name: string;
}

// VideoConference component that displays participants
function VideoConference() {
  // Get all camera and screen share tracks
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <GridLayout 
        tracks={tracks} 
        style={{ height: 'calc(100% - var(--lk-control-bar-height))' }}
      >
        <ParticipantTile />
      </GridLayout>
      <ControlBar />
    </Box>
  );
}

/**
 * A component that connects to and displays a LiveKit room
 * Using direct Room connection approach for more reliable connection
 */
const LiveKitRoom = ({
  meetingUrl,
  meetingId,
  height = '600px',
  onError
}: LiveKitRoomProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);

  // Create a Room instance directly for more control
  const [room] = useState(() => new Room({
    // Optimize video quality for each participant's screen
    adaptiveStream: true,
    // Enable automatic audio/video quality optimization
    dynacast: true,
    // Set higher video quality
    videoCaptureDefaults: {
      resolution: { width: 640, height: 480 },
    },
  }));
  const apiClient = useApiClient();
  
  console.log('[LiveKitRoom] Component initialized with props:', { meetingUrl, meetingId, height });

  // Handle room connection state changes
  useEffect(() => {
    if (!room) return;

    const handleConnectionStateChanged = (state: ConnectionState) => {
      console.log('[LiveKitRoom] Connection state changed:', state);
      
      if (state === ConnectionState.Connected) {
        console.log('[LiveKitRoom] Successfully connected to room:', room.name);
      }
    };

    // Add room event listeners
    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
    room.on(RoomEvent.Disconnected, () => {
      console.log('[LiveKitRoom] Disconnected from room');
    });
    room.on(RoomEvent.SignalConnected, () => {
      console.log('[LiveKitRoom] Signal connected, publishing media');
      // Automatically publish user's camera and microphone when connection is established
      Promise.all([
        room.localParticipant.enableCameraAndMicrophone(),
        room.localParticipant.setMicrophoneEnabled(true),
        room.localParticipant.setCameraEnabled(true)
      ]).catch(error => {
        console.warn('[LiveKitRoom] Error enabling media:', error);
      });
    });
    
    // General error handler for unexpected issues
    room.on(RoomEvent.RoomMetadataChanged, (metadata) => {
      console.log('[LiveKitRoom] Room metadata:', metadata);
    });

    return () => {
      // Clean up listeners when the component unmounts
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
      
      // Also disconnect from the room if we're connected
      if (room.state === ConnectionState.Connected) {
        room.disconnect().catch(error => {
          console.warn('[LiveKitRoom] Error during room disconnect:', error);
        });
      }
    };
  }, [room, onError]);

  // Fetch token and connect to the room
  useEffect(() => {
    console.log('[LiveKitRoom] useEffect triggered with meetingId:', meetingId);
    
    // Check for cached token in session storage to avoid unnecessary API calls
    const getCachedTokenData = () => {
      const cachedData = sessionStorage.getItem(`livekit_token_${meetingId}`);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          const expiryTime = parsed.expiryTime;
          
          // Check if token is still valid (with 5 minute buffer)
          if (expiryTime && expiryTime > Date.now() + 5 * 60 * 1000) {
            console.log('[LiveKitRoom] Using cached token');
            return parsed.tokenData;
          }
          
          // Token expired or expiring soon
          console.log('[LiveKitRoom] Cached token expired or expiring soon');
          sessionStorage.removeItem(`livekit_token_${meetingId}`);
        } catch (e) {
          console.error('[LiveKitRoom] Error parsing cached token:', e);
          sessionStorage.removeItem(`livekit_token_${meetingId}`);
        }
      }
      return null;
    };

    // Function to parse a JWT token and extract expiry time
    const getTokenExpiry = (token: string) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        return payload.exp * 1000; // Convert to milliseconds
      } catch (e) {
        console.error('[LiveKitRoom] Error parsing token:', e);
        // Default to 2 hours from now if we can't parse
        return Date.now() + 2 * 60 * 60 * 1000;
      }
    };

    // Separate function to connect to room
    const connectToRoom = async (tokenData: TokenResponse) => {
      if (room && tokenData.token && tokenData.server_url) {
        console.log('[LiveKitRoom] Connecting to LiveKit room:', {
          url: tokenData.server_url,
          token: tokenData.token.substring(0, 15) + '...',
        });
        
        try {
          // Use more robust connection options
          const connectionOptions = {
            autoSubscribe: true,
            maxRetries: 3
          };
          
          await room.connect(tokenData.server_url, tokenData.token, connectionOptions);
          console.log('[LiveKitRoom] Room connection initiated');
          return true;
        } catch (connErr) {
          console.error('[LiveKitRoom] Failed to connect to room:', connErr);
          throw new Error(`Failed to connect to LiveKit room: ${connErr}`);
        }
      }
      return false;
    };

    const fetchTokenAndConnect = async () => {
      if (!meetingId) {
        console.error('[LiveKitRoom] No meeting ID provided');
        setError('No meeting ID provided');
        setLoading(false);
        if (onError) onError('No meeting ID provided');
        return;
      }
      
      // Try to use cached token first
      const cachedToken = getCachedTokenData();
      if (cachedToken) {
        console.log('[LiveKitRoom] Using cached token data');
        setTokenData(cachedToken);
        setLoading(false);
        
        // Connect using cached token
        try {
          await connectToRoom(cachedToken);
        } catch (err) {
          console.error('[LiveKitRoom] Error connecting with cached token:', err);
          // If we fail with cached token, clear it and try with a new one
          sessionStorage.removeItem(`livekit_token_${meetingId}`);
          // Continue to fetch a new token below
        }
        return;
      }

      try {
        console.log('[LiveKitRoom] No valid cached token, fetching new token');
        
        // Get the token from the API
        const apiResponse = await apiClient.get(`/api/meetings/livekit-token/${meetingId}/`);
        
        console.log('[LiveKitRoom] Token API response:', apiResponse);
        
        // Validate the response data contains necessary fields
        if (!apiResponse || !apiResponse.token || !apiResponse.server_url || !apiResponse.room) {
          console.error('[LiveKitRoom] Invalid token data:', apiResponse);
          throw new Error('Invalid token response format');
        }
        
        // Check for placeholder or invalid LiveKit URL
        if (apiResponse.server_url.includes('your-livekit-instance') || 
            apiResponse.server_url.includes('example.livekit.cloud')) {
          console.error('[LiveKitRoom] Invalid LiveKit server URL (using placeholder):', apiResponse.server_url);
          throw new Error('The LiveKit server is not properly configured. Please contact support.');
        }
        
        console.log('[LiveKitRoom] Setting token data with valid response');
        
        // Save token to session storage with expiry time
        const expiryTime = getTokenExpiry(apiResponse.token);
        const cacheData = {
          tokenData: apiResponse,
          expiryTime: expiryTime
        };
        
        // Only cache valid tokens
        sessionStorage.setItem(`livekit_token_${meetingId}`, JSON.stringify(cacheData));
        
        setTokenData(apiResponse);
        
        // Connect to the room with the new token
        await connectToRoom(apiResponse);
        setLoading(false);
      } catch (err) {
        console.error('[LiveKitRoom] Error in fetchTokenAndConnect:', err);
        
        // Extract detailed error information
        const errorMessage = err instanceof Error 
          ? `Failed to connect to meeting: ${err.message}`
          : 'Failed to connect to meeting';
        
        console.error('[LiveKitRoom] Setting error state with:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        if (onError) onError(errorMessage);
      }
    };

    fetchTokenAndConnect();
    
    // Cleanup function
    return () => {
      console.log('[LiveKitRoom] Component cleanup/unmount');
      // Room disconnection is handled in the room effect cleanup
    };
  }, [meetingId, apiClient, room, onError]);

  const handleOpenInNewWindow = () => {
    console.log('[LiveKitRoom] Opening meeting in new window with URL:', meetingUrl);
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
  };

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height,
          bgcolor: 'background.paper',
          borderRadius: 1
        }}
      >
        <CircularProgress />
        <Typography mt={2} variant="body2" color="text.secondary">
          Connecting to meeting...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error || !tokenData) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height,
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 2
        }}
      >
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          <AlertTitle>Connection Error</AlertTitle>
          <div>
            <p>{error || 'Unable to connect to the meeting'}</p>
            <details>
              <summary>Debug Information</summary>
              <code style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                {JSON.stringify({
                  meetingId,
                  meetingUrl,
                  timestamp: new Date().toISOString(),
                  tokenData: tokenData || 'No token data received'
                }, null, 2)}
              </code>
            </details>
          </div>
        </Alert>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<OpenInNewIcon />}
          onClick={handleOpenInNewWindow}
        >
          Try Opening in New Window
        </Button>
      </Box>
    );
  }

  // Connected state - show the video conference UI
  return (
    <Box
      sx={{
        height,
        borderRadius: 1,
        overflow: 'hidden',
        '& .lk-video-conference': {
          borderRadius: 1,
          height: '100%'
        }
      }}
    >
      {/* Use RoomContext.Provider to provide the room instance to all LiveKit components */}
      <RoomContext.Provider value={room}>
        {/* Render all audio elements for participants */}
        <RoomAudioRenderer />
        
        {/* Main video conferencing component with grid layout and control bar */}
        <VideoConference />
      </RoomContext.Provider>
      
      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
        <Button
          size="small"
          startIcon={<OpenInNewIcon />}
          onClick={handleOpenInNewWindow}
        >
          Open in New Window
        </Button>
      </Stack>
    </Box>
  );
};

export default LiveKitRoom;
