// components/meetings/LiveKitRoom.tsx
import { useEffect, useState } from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert, 
  AlertTitle, 
  Button, 
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  OpenInNew as OpenInNewIcon,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  ScreenShare,
  CallEnd,
  Settings,
  Fullscreen,
  FullscreenExit,
  People,
  Chat
} from '@mui/icons-material';
import { useApiClient } from '../../utils/apiClient';

// Import LiveKit Components for direct integration
import {
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
  useLocalParticipant,
  useParticipants,
  FocusLayout,
  CarouselLayout,
  useConnectionState,
  ConnectionStateToast,
  Chat as LiveKitChat,
  useChat,
  MediaDeviceMenu,
  TrackToggle
} from '@livekit/components-react';
import { Room, Track, ConnectionState, RoomEvent } from 'livekit-client';
import '@livekit/components-styles';

// Types
interface LiveKitRoomProps {
  meetingUrl: string;
  meetingId: number;
  height?: string | number;
  onError?: (error: string) => void;
  onMeetingEnd?: () => void;
}

interface TokenResponse {
  token: string;
  room: string;
  server_url: string;
  is_host: boolean;
  user_name: string;
}

// Professional Meeting Header Component
function MeetingHeader({ 
  roomName, 
  participantCount, 
  connectionState, 
  onFullscreen, 
  isFullscreen,
  onEndMeeting 
}: { 
  roomName: string;
  participantCount: number;
  connectionState: ConnectionState;
  onFullscreen: () => void;
  isFullscreen: boolean;
  onEndMeeting: () => void;
}) {
  const theme = useTheme();
  
  const getConnectionIcon = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return (
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: 'success.main',
              animation: 'pulse 2s infinite'
            }} 
          />
        );
      case ConnectionState.Connecting:
        return <CircularProgress size={8} sx={{ color: 'warning.main' }} />;
      default:
        return (
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: 'error.main' 
            }} 
          />
        );
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
        background: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          {getConnectionIcon()}
          <Typography variant="h6" fontWeight={600}>
            {roomName || 'Meeting Room'}
          </Typography>
        </Stack>
        
        <Chip 
          icon={<People fontSize="small" />}
          label={`${participantCount} participant${participantCount !== 1 ? 's' : ''}`}
          size="small"
          variant="outlined"
          sx={{ 
            borderColor: 'primary.main',
            color: 'primary.main',
            '& .MuiChip-icon': { color: 'primary.main' }
          }}
        />
      </Stack>

      <Stack direction="row" spacing={1}>
        <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
          <IconButton 
            onClick={onFullscreen}
            sx={{ 
              bgcolor: alpha(theme.palette.background.default, 0.8),
              '&:hover': { bgcolor: alpha(theme.palette.background.default, 1) }
            }}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="End Meeting">
          <IconButton 
            onClick={onEndMeeting}
            sx={{ 
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
              '&:hover': { 
                bgcolor: alpha(theme.palette.error.main, 0.2) 
              }
            }}
          >
            <CallEnd />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

// Professional Control Bar
function ProfessionalControlBar({ onEndMeeting }: { onEndMeeting: () => void }) {
  const theme = useTheme();
  const { localParticipant } = useLocalParticipant();
  
  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        p: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Microphone Toggle */}
        <TrackToggle 
          source={Track.Source.Microphone}
          captureOptions={{ audio: true }}
        >
          <Tooltip title={localParticipant.isMicrophoneEnabled ? 'Mute' : 'Unmute'}>
            <IconButton
              sx={{
                bgcolor: localParticipant.isMicrophoneEnabled 
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.error.main, 0.1),
                color: localParticipant.isMicrophoneEnabled 
                  ? 'success.main' 
                  : 'error.main',
                '&:hover': {
                  bgcolor: localParticipant.isMicrophoneEnabled 
                    ? alpha(theme.palette.success.main, 0.2)
                    : alpha(theme.palette.error.main, 0.2)
                }
              }}
            >
              {localParticipant.isMicrophoneEnabled ? <Mic /> : <MicOff />}
            </IconButton>
          </Tooltip>
        </TrackToggle>

        {/* Camera Toggle */}
        <TrackToggle 
          source={Track.Source.Camera}
          captureOptions={{ video: true }}
        >
          <Tooltip title={localParticipant.isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}>
            <IconButton
              sx={{
                bgcolor: localParticipant.isCameraEnabled 
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.error.main, 0.1),
                color: localParticipant.isCameraEnabled 
                  ? 'success.main' 
                  : 'error.main',
                '&:hover': {
                  bgcolor: localParticipant.isCameraEnabled 
                    ? alpha(theme.palette.success.main, 0.2)
                    : alpha(theme.palette.error.main, 0.2)
                }
              }}
            >
              {localParticipant.isCameraEnabled ? <Videocam /> : <VideocamOff />}
            </IconButton>
          </Tooltip>
        </TrackToggle>

        {/* Screen Share Toggle */}
        <TrackToggle source={Track.Source.ScreenShare}>
          <Tooltip title="Share screen">
            <IconButton
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: 'info.main',
                '&:hover': {
                  bgcolor: alpha(theme.palette.info.main, 0.2)
                }
              }}
            >
              <ScreenShare />
            </IconButton>
          </Tooltip>
        </TrackToggle>

        {/* Settings Menu */}
        <MediaDeviceMenu>
          <Tooltip title="Settings">
            <IconButton
              sx={{
                bgcolor: alpha(theme.palette.text.secondary, 0.1),
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: alpha(theme.palette.text.secondary, 0.2)
                }
              }}
            >
              <Settings />
            </IconButton>
          </Tooltip>
        </MediaDeviceMenu>

        {/* End Meeting Button */}
        <Tooltip title="End meeting">
          <IconButton
            onClick={onEndMeeting}
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.2)
              }
            }}
          >
            <CallEnd />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

// Enhanced Video Conference Layout
function ProfessionalVideoConference() {
  const theme = useTheme();
  const [layout, setLayout] = useState<'grid' | 'focus' | 'carousel'>('grid');
  const [showChat, setShowChat] = useState(false);
  
  // Get all tracks
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  
  const participants = useParticipants();
  const { chatMessages } = useChat();
  
  // Responsive layout based on participant count
  const shouldUseGridLayout = participants.length <= 4;
  const effectiveLayout = shouldUseGridLayout ? 'grid' : layout;
  
  const renderLayout = () => {
    const commonProps = {
      tracks,
      style: { 
        height: '100%',
        borderRadius: theme.shape.borderRadius
      }
    };
    
    switch (effectiveLayout) {
      case 'focus':
        return (
          <FocusLayout {...commonProps}>
            <ParticipantTile />
          </FocusLayout>
        );
      case 'carousel':
        return (
          <CarouselLayout {...commonProps}>
            <ParticipantTile />
          </CarouselLayout>
        );
      default:
        return (
          <GridLayout {...commonProps}>
            <ParticipantTile />
          </GridLayout>
        );
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%',
      bgcolor: alpha(theme.palette.background.default, 0.5),
      borderRadius: 2,
      position: 'relative'
    }}>
      {/* Main video area */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        p: 2,
        pt: 10, // Account for header
        pb: 10  // Account for control bar
      }}>
        {renderLayout()}
        
        {/* Layout Controls */}
        {!shouldUseGridLayout && (
          <Paper
            sx={{
              position: 'absolute',
              top: 80,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 1
            }}
          >
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant={layout === 'grid' ? 'contained' : 'outlined'}
                onClick={() => setLayout('grid')}
              >
                Grid
              </Button>
              <Button
                size="small"
                variant={layout === 'focus' ? 'contained' : 'outlined'}
                onClick={() => setLayout('focus')}
              >
                Focus
              </Button>
              <Button
                size="small"
                variant={layout === 'carousel' ? 'contained' : 'outlined'}
                onClick={() => setLayout('carousel')}
              >
                Carousel
              </Button>
            </Stack>
          </Paper>
        )}
      </Box>
      
      {/* Chat Sidebar */}
      {showChat && (
        <Paper
          sx={{
            width: 320,
            height: '100%',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeft: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" fontWeight={600}>
              Chat
            </Typography>
            <Badge badgeContent={chatMessages.length} color="primary">
              <Chat />
            </Badge>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <LiveKitChat 
              style={{ 
                height: '100%',
                background: 'transparent'
              }}
            />
          </Box>
        </Paper>
      )}
      
      {/* Chat Toggle Button */}
      <Tooltip title={showChat ? 'Hide Chat' : 'Show Chat'}>
        <IconButton
          onClick={() => setShowChat(!showChat)}
          sx={{
            position: 'absolute',
            top: '50%',
            right: showChat ? 336 : 16,
            transform: 'translateY(-50%)',
            zIndex: 1000,
            bgcolor: alpha(theme.palette.primary.main, 0.9),
            color: 'white',
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            },
            transition: 'right 0.3s ease-in-out'
          }}
        >
          <Badge badgeContent={chatMessages.length > 0 ? chatMessages.length : undefined} color="error">
            <Chat />
          </Badge>
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// VideoConference component that displays participants
function VideoConference({ onMeetingEnd }: { onMeetingEnd?: () => void }) {
  const connectionState = useConnectionState();
  const participants = useParticipants();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Professional Meeting Layout */}
      <ProfessionalVideoConference />
      
      {/* Meeting Header */}
      <MeetingHeader
        roomName="Meeting Room"
        participantCount={participants.length}
        connectionState={connectionState}
        onFullscreen={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
        }}
        isFullscreen={!!document.fullscreenElement}
        onEndMeeting={() => onMeetingEnd?.()}
      />
      
      {/* Professional Control Bar */}
      <ProfessionalControlBar 
        onEndMeeting={() => onMeetingEnd?.()}
      />
      
      {/* Connection State Toast */}
      <ConnectionStateToast />
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
  onError,
  onMeetingEnd
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

    const handleMediaDeviceError = (error: Error) => {
      console.error('[LiveKitRoom] Media device error:', error);
      // Don't set as a critical error as the user may still be able to join without camera/mic
      console.warn(`Media device error: ${error.name}: ${error.message}`);
    };

    // Add room event listeners
    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
    room.on(RoomEvent.MediaDevicesError, handleMediaDeviceError);
    room.on(RoomEvent.Disconnected, () => {
      console.log('[LiveKitRoom] Disconnected from room');
      // Call the onMeetingEnd callback when the room disconnects
      if (onMeetingEnd) {
        onMeetingEnd();
      }
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
      room.off(RoomEvent.MediaDevicesError, handleMediaDeviceError);
      
      // Also disconnect from the room if we're connected
      if (room.state === ConnectionState.Connected) {
        room.disconnect().catch(error => {
          console.warn('[LiveKitRoom] Error during room disconnect:', error);
        });
      }
    };
  }, [room, onError, onMeetingEnd]);

  // Fetch token and connect to the room
  useEffect(() => {
    console.log('[LiveKitRoom] useEffect triggered with meetingId:', meetingId);
    
    const fetchTokenAndConnect = async () => {
      if (!meetingId) {
        console.error('[LiveKitRoom] No meeting ID provided');
        setError('No meeting ID provided');
        setLoading(false);
        if (onError) onError('No meeting ID provided');
        return;
      }

      try {
        console.log('[LiveKitRoom] Fetching LiveKit token for meeting ID:', meetingId);
        
        // Get the token from the API
        const apiResponse = await apiClient.get(`/api/meetings/livekit-token/${meetingId}/`);
        
        console.log('[LiveKitRoom] Token API response:', apiResponse);
        
        // Validate the response data contains necessary fields
        if (!apiResponse || !apiResponse.token || !apiResponse.server_url || !apiResponse.room) {
          console.error('[LiveKitRoom] Invalid token data:', apiResponse);
          throw new Error('Invalid token response format');
        }
        
        console.log('[LiveKitRoom] Setting token data with valid response');
        setTokenData(apiResponse);
        
        // Connect to the room now that we have the token
        if (room && apiResponse.token && apiResponse.server_url) {
          console.log('[LiveKitRoom] Connecting to LiveKit room:', {
            url: apiResponse.server_url,
            token: apiResponse.token.substring(0, 15) + '...',
          });
          
          try {
            await room.connect(apiResponse.server_url, apiResponse.token);
            console.log('[LiveKitRoom] Room connection initiated');
          } catch (connErr) {
            console.error('[LiveKitRoom] Failed to connect to room:', connErr);
            throw new Error(`Failed to connect to LiveKit room: ${connErr}`);
          }
        }
        
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

  // Connected state - show the professional video conference UI
  return (
    <Box
      sx={{
        height,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: 'background.default',
        boxShadow: (theme) => theme.shadows[8],
        '& .lk-video-conference': {
          borderRadius: 2,
          height: '100%'
        }
      }}
    >
      {/* Use RoomContext.Provider to provide the room instance to all LiveKit components */}
      <RoomContext.Provider value={room}>
        {/* Render all audio elements for participants */}
        <RoomAudioRenderer />
        
        {/* Professional video conferencing component with enhanced UI */}
        <VideoConference onMeetingEnd={onMeetingEnd} />
      </RoomContext.Provider>
      
      {/* Additional Controls */}
      <Stack 
        direction="row" 
        spacing={1} 
        justifyContent="center" 
        alignItems="center" 
        sx={{ 
          position: 'absolute',
          bottom: 8,
          left: 8,
          zIndex: 50,
        }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          onClick={handleOpenInNewWindow}
          sx={{
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.background.paper, 1),
            }
          }}
        >
          Open in New Window
        </Button>
      </Stack>
    </Box>
  );
};

export default LiveKitRoom;
