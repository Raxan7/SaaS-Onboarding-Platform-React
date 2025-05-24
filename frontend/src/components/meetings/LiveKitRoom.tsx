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
  CallEnd,
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
import { Room, Track, ConnectionState, RoomEvent, DisconnectReason } from 'livekit-client';
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
  onEndMeeting,
  isEnding
}: { 
  roomName: string;
  participantCount: number;
  connectionState: ConnectionState;
  onFullscreen: () => void;
  isFullscreen: boolean;
  onEndMeeting: () => void;
  isEnding: boolean;
}) {
  const theme = useTheme();
  
  const getConnectionIcon = () => {
    if (isEnding) {
      return <CircularProgress size={8} sx={{ color: 'warning.main' }} />;
    }
    
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

  const getConnectionText = () => {
    if (isEnding) return 'Ending meeting...';
    
    switch (connectionState) {
      case ConnectionState.Connected:
        return roomName || 'Meeting Room';
      case ConnectionState.Connecting:
        return 'Connecting...';
      case ConnectionState.Reconnecting:
        return 'Reconnecting...';
      default:
        return 'Disconnected';
    }
  };

  const isDisconnectedOrEnding = connectionState === ConnectionState.Disconnected || isEnding;

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
            {getConnectionText()}
          </Typography>
        </Stack>
        
        {!isDisconnectedOrEnding && (
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
        )}
      </Stack>

      <Stack direction="row" spacing={1}>
        <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
          <IconButton 
            onClick={onFullscreen}
            disabled={isDisconnectedOrEnding}
            sx={{ 
              bgcolor: alpha(theme.palette.background.default, 0.8),
              '&:hover': { bgcolor: alpha(theme.palette.background.default, 1) },
              '&:disabled': { opacity: 0.5 }
            }}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title={isEnding ? 'Ending meeting...' : 'End Meeting'}>
          <IconButton 
            onClick={onEndMeeting}
            disabled={isDisconnectedOrEnding}
            sx={{ 
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
              '&:hover': { 
                bgcolor: alpha(theme.palette.error.main, 0.2) 
              },
              '&:disabled': { 
                opacity: 0.5,
                color: 'text.disabled',
                bgcolor: alpha(theme.palette.action.disabled, 0.1)
              }
            }}
          >
            {isEnding ? <CircularProgress size={20} /> : <CallEnd />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

// Professional Control Bar
function ProfessionalControlBar({ onEndMeeting, isEnding, connectionState }: { 
  onEndMeeting: () => void;
  isEnding: boolean;
  connectionState: ConnectionState;
}) {
  const theme = useTheme();
  
  const isDisconnectedOrEnding = connectionState === ConnectionState.Disconnected || isEnding;
  
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
        {/* Microphone Toggle - LiveKit's TrackToggle handles its own button */}
        <TrackToggle 
          source={Track.Source.Microphone}
          captureOptions={{ audio: true }}
        />

        {/* Camera Toggle - LiveKit's TrackToggle handles its own button */}
        <TrackToggle 
          source={Track.Source.Camera}
          captureOptions={{ video: true }}
        />

        {/* Screen Share Toggle - LiveKit's TrackToggle handles its own button */}
        <TrackToggle source={Track.Source.ScreenShare} />

        {/* Settings Menu - MediaDeviceMenu handles its own button */}
        <MediaDeviceMenu />

        {/* End Meeting Button - Custom button for meeting termination */}
        <Tooltip title={isEnding ? 'Ending meeting...' : 'End meeting'}>
          <IconButton
            onClick={onEndMeeting}
            disabled={isDisconnectedOrEnding}
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.2)
              },
              '&:disabled': { 
                opacity: 0.5,
                color: 'text.disabled',
                bgcolor: alpha(theme.palette.action.disabled, 0.1)
              }
            }}
          >
            {isEnding ? <CircularProgress size={20} /> : <CallEnd />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
// 1:39:03

// Enhanced Video Conference Layout with LiveKit event monitoring
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
function VideoConference({ 
  onMeetingEnd, 
  isEnding,
  onMeetingEndChange 
}: { 
  onMeetingEnd?: () => void;
  isEnding: boolean;
  onMeetingEndChange: (ending: boolean) => void;
}) {
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle meeting end with state management
  const handleMeetingEnd = async () => {
    if (isEnding) return; // Prevent duplicate calls
    
    onMeetingEndChange(true);
    try {
      await onMeetingEnd?.();
    } catch (error) {
      console.error('Error ending meeting:', error);
      onMeetingEndChange(false); // Reset state on error
    }
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Professional Meeting Layout */}
      <ProfessionalVideoConference />
      
      {/* Meeting Header */}
      <MeetingHeader
        roomName="Meeting Room"
        participantCount={participants.length}
        connectionState={connectionState}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
        onEndMeeting={handleMeetingEnd}
        isEnding={isEnding}
      />
      
      {/* Professional Control Bar */}
      <ProfessionalControlBar 
        onEndMeeting={handleMeetingEnd}
        isEnding={isEnding}
        connectionState={connectionState}
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
  const [isEnding, setIsEnding] = useState(false);
  const [hasHandledDisconnect, setHasHandledDisconnect] = useState(false);

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

  // Handle seamless meeting end from custom controls
  const handleMeetingEnd = async () => {
    if (isEnding || hasHandledDisconnect) return;
    
    console.log('[LiveKitRoom] Handling meeting end from custom controls');
    setIsEnding(true);
    setHasHandledDisconnect(true);
    
    try {
      // Disconnect from LiveKit room first
      if (room && room.state === ConnectionState.Connected) {
        console.log('[LiveKitRoom] Disconnecting from LiveKit room');
        await room.disconnect();
      }
      
      // Call the parent's onMeetingEnd callback
      if (onMeetingEnd) {
        console.log('[LiveKitRoom] Calling parent onMeetingEnd callback');
        await onMeetingEnd();
      }
    } catch (error) {
      console.error('[LiveKitRoom] Error during meeting end:', error);
      setIsEnding(false);
      setHasHandledDisconnect(false);
    }
  };

  // Reset state if connection is restored (for edge cases)
  useEffect(() => {
    if (room && room.state === ConnectionState.Connected && hasHandledDisconnect && !isEnding) {
      console.log('[LiveKitRoom] Connection restored, resetting disconnect flag');
      setHasHandledDisconnect(false);
    }
  }, [room?.state, hasHandledDisconnect, isEnding]);

  // Handle room connection state changes
  useEffect(() => {
    if (!room) return;

    const handleConnectionStateChanged = (state: ConnectionState) => {
      console.log('[LiveKitRoom] Connection state changed:', state);
      
      if (state === ConnectionState.Connected) {
        console.log('[LiveKitRoom] Successfully connected to room:', room.name);
        // Reset disconnect flag when successfully connected
        setHasHandledDisconnect(false);
      }
    };

    const handleMediaDeviceError = (error: Error) => {
      console.error('[LiveKitRoom] Media device error:', error);
      // Don't set as a critical error as the user may still be able to join without camera/mic
      console.warn(`Media device error: ${error.name}: ${error.message}`);
    };

    const handleDisconnected = (reason?: DisconnectReason) => {
      console.log('[LiveKitRoom] Disconnected from room, reason:', reason);
      
      // Only handle disconnect if we haven't already handled it and we're not in the process of ending
      if (!hasHandledDisconnect && !isEnding) {
        console.log('[LiveKitRoom] Handling LiveKit disconnect event');
        setHasHandledDisconnect(true);
        
        // Handle different disconnect reasons - only end meeting for intentional actions
        switch (reason) {
          case DisconnectReason.CLIENT_INITIATED:
            console.log('[LiveKitRoom] Client initiated disconnect (user clicked LiveKit end button)');
            // Only end meeting if user explicitly clicked end button
            if (onMeetingEnd) {
              console.log('[LiveKitRoom] Calling onMeetingEnd due to client initiated disconnect');
              onMeetingEnd();
            }
            break;
          case DisconnectReason.SERVER_SHUTDOWN:
            console.log('[LiveKitRoom] Server shutdown - this is likely temporary');
            // Don't end meeting, just log the event
            break;
          case DisconnectReason.PARTICIPANT_REMOVED:
            console.log('[LiveKitRoom] Participant was removed from meeting');
            if (onMeetingEnd) {
              console.log('[LiveKitRoom] Calling onMeetingEnd due to participant removal');
              onMeetingEnd();
            }
            break;
          case DisconnectReason.ROOM_DELETED:
            console.log('[LiveKitRoom] Room was deleted');
            if (onMeetingEnd) {
              console.log('[LiveKitRoom] Calling onMeetingEnd due to room deletion');
              onMeetingEnd();
            }
            break;
          case DisconnectReason.STATE_MISMATCH:
            console.log('[LiveKitRoom] State mismatch, will attempt reconnection');
            // Don't end meeting, allow reconnection
            setHasHandledDisconnect(false); // Allow reconnection attempts
            break;
          case DisconnectReason.JOIN_FAILURE:
            console.log('[LiveKitRoom] Failed to join room');
            // Don't end meeting, this might be a temporary network issue
            setHasHandledDisconnect(false); // Allow retry
            break;
          default:
            console.log('[LiveKitRoom] Unknown disconnect reason:', reason, '- will not end meeting');
            // For unknown reasons, don't end the meeting
            setHasHandledDisconnect(false); // Allow reconnection
        }
      }
    };

    // Add more comprehensive room event listeners
    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
    room.on(RoomEvent.MediaDevicesError, handleMediaDeviceError);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    
    // Monitor participant events to detect LiveKit built-in control usage
    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log('[LiveKitRoom] Participant disconnected:', participant.identity);
      
      // If the local participant disconnected and we haven't handled it yet
      if (participant.identity === room.localParticipant.identity && !hasHandledDisconnect && !isEnding) {
        console.log('[LiveKitRoom] Local participant disconnected via LiveKit controls');
        setHasHandledDisconnect(true);
        
        // Only call onMeetingEnd if this was an intentional disconnect
        // Check if the room state indicates an intentional disconnect
        if (room.state === ConnectionState.Disconnected) {
          console.log('[LiveKitRoom] Room is fully disconnected, calling onMeetingEnd');
          if (onMeetingEnd) {
            onMeetingEnd();
          }
        } else {
          console.log('[LiveKitRoom] Room still connected, may be temporary disconnect');
          // Reset flag to allow reconnection
          setTimeout(() => setHasHandledDisconnect(false), 5000);
        }
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
    
    // Handle reconnection events
    room.on(RoomEvent.Reconnecting, () => {
      console.log('[LiveKitRoom] Attempting to reconnect...');
      // Reset disconnect flag during reconnection attempts
      setHasHandledDisconnect(false);
    });
    
    room.on(RoomEvent.Reconnected, () => {
      console.log('[LiveKitRoom] Successfully reconnected');
      setHasHandledDisconnect(false); // Reset disconnect flag on successful reconnection
    });
    
    // General error handler for unexpected issues
    room.on(RoomEvent.RoomMetadataChanged, (metadata) => {
      console.log('[LiveKitRoom] Room metadata:', metadata);
    });

    return () => {
      // Clean up all listeners when the component unmounts
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
      room.off(RoomEvent.MediaDevicesError, handleMediaDeviceError);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.removeAllListeners(RoomEvent.ParticipantDisconnected);
      room.removeAllListeners(RoomEvent.Reconnecting);
      room.removeAllListeners(RoomEvent.Reconnected);
      room.removeAllListeners(RoomEvent.RoomMetadataChanged);
      room.removeAllListeners(RoomEvent.SignalConnected);
      
      // Also disconnect from the room if we're connected and haven't already handled disconnect
      if (room.state === ConnectionState.Connected && !hasHandledDisconnect) {
        console.log('[LiveKitRoom] Cleanup: Disconnecting from room');
        setHasHandledDisconnect(true); // Prevent duplicate calls during cleanup
        room.disconnect().catch(error => {
          console.warn('[LiveKitRoom] Error during room disconnect in cleanup:', error);
        });
      }
    };
  }, [room, onError, onMeetingEnd, hasHandledDisconnect, isEnding]);

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
        <VideoConference 
          onMeetingEnd={handleMeetingEnd}
          isEnding={isEnding}
          onMeetingEndChange={setIsEnding}
        />
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
          disabled={isEnding}
          sx={{
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.background.paper, 1),
            },
            '&:disabled': {
              opacity: 0.5
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
