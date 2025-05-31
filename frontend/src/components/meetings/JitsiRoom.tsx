// components/meetings/JitsiRoom.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert, 
  AlertTitle, 
  Button, 
  Stack
} from '@mui/material';
import { 
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useApiClient } from '../../utils/apiClient';

// Types
interface JitsiRoomProps {
  meetingUrl: string;
  meetingId: number;
  height?: string | number;
  onError?: (error: string) => void;
  onMeetingEnd?: () => void;
  onMeetingJoined?: () => void;
}

interface JitsiConfig {
  jitsi_config: {
    domain: string;
    room: string;
    userInfo: {
      displayName: string;
      email?: string;
    };
    configOverwrite: Record<string, any>;
    interfaceConfigOverwrite: Record<string, any>;
    jwt?: string;
  };
  meeting_url: string;
  is_moderator: boolean;
  user_name: string;
  meeting_title: string;
}

// Declare global Jitsi Meet API
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

/**
 * A component that embeds Jitsi Meet for video conferencing
 * Fixed version with proper state management to prevent infinite loading and excessive API requests
 */
const JitsiRoom = ({
  meetingUrl,
  meetingId,
  height = '600px',
  onError,
  onMeetingEnd,
  onMeetingJoined
}: JitsiRoomProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jitsiConfig, setJitsiConfig] = useState<JitsiConfig | null>(null);
  const [jitsiAPI, setJitsiAPI] = useState<any>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'failed' | 'disconnected'>('connecting');
  const [participantCount, setParticipantCount] = useState(0);
  const [initialized, setInitialized] = useState(false); // Key fix: prevent duplicate initialization
  
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiClient = useApiClient();
  const mountedRef = useRef(true);

  // Cleanup on unmount - critical for preventing memory leaks
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupJitsi();
    };
  }, []);

  const cleanupJitsi = useCallback(() => {
    if (jitsiAPI) {
      try {
        console.log('Disposing Jitsi API');
        jitsiAPI.dispose();
      } catch (err) {
        console.error('Error disposing Jitsi API:', err);
      }
      setJitsiAPI(null);
    }
  }, [jitsiAPI]);

  // Load Jitsi Meet External API script - with duplicate prevention
  const loadJitsiScript = useCallback((): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // Check if script is already loaded
      if (window.JitsiMeetExternalAPI) {
        console.log('Jitsi External API already loaded');
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="external_api.js"]');
      if (existingScript) {
        console.log('Jitsi script already being loaded, waiting...');
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Jitsi Meet External API')));
        return;
      }

      console.log('Loading Jitsi External API script...');
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        console.log('Jitsi External API loaded successfully');
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Jitsi Meet External API'));
      document.head.appendChild(script);
    });
  }, []);

  // Fetch Jitsi configuration from backend
  const fetchJitsiConfig = useCallback(async (): Promise<JitsiConfig> => {
    console.log(`Fetching Jitsi config for meeting ${meetingId}...`);
    try {
      const response = await apiClient.get(`/api/meetings/jitsi-config/${meetingId}/`);
      console.log('Jitsi config received:', response);
      return response;
    } catch (err: any) {
      console.error('Error fetching Jitsi config:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load meeting configuration';
      throw new Error(errorMessage);
    }
  }, [apiClient, meetingId]);

  // Initialize Jitsi Meet instance
  const initializeJitsi = useCallback((config: JitsiConfig) => {
    if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI || !mountedRef.current) {
      console.log('Cannot initialize Jitsi: missing requirements');
      return;
    }

    try {
      console.log('Initializing Jitsi with config:', config);
      
      // Clear any existing Jitsi instance
      cleanupJitsi();

      // Clear the container
      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = '';
      }

      setConnectionState('connecting');

      // Prepare options according to Jitsi External API documentation
      const options: any = {
        roomName: config.jitsi_config.room,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: config.jitsi_config.userInfo.displayName,
          email: config.jitsi_config.userInfo.email || undefined
        },
        configOverwrite: {
          // Meeting behavior
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          enableClosePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          
          // Performance optimizations
          disableAudioLevels: false,
          channelLastN: -1,
          
          // Additional configurations
          enableInsecureRoomNameWarning: false,
          enableEmailInStats: false,
          enableDisplayNameInStats: false,
          
          ...config.jitsi_config.configOverwrite
        },
        interfaceConfigOverwrite: {
          // Branding
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          APP_NAME: 'SaaS Platform Meeting',
          NATIVE_APP_NAME: 'SaaS Platform Meeting',
          PROVIDER_NAME: 'SaaS Platform',
          
          // Toolbar buttons
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
          ],
          
          ...config.jitsi_config.interfaceConfigOverwrite
        }
      };

      // Add JWT token if available
      if (config.jitsi_config.jwt) {
        options.jwt = config.jitsi_config.jwt;
        console.log('Using JWT authentication');
      }

      console.log('Creating Jitsi Meet instance with options:', options);

      // Create new Jitsi Meet instance
      const api = new window.JitsiMeetExternalAPI(config.jitsi_config.domain, options);
      
      if (!mountedRef.current) return;
      
      setJitsiAPI(api);

      // Set up event listeners with proper mounting checks
      api.addEventListener('videoConferenceJoined', (participant: any) => {
        console.log('User joined the conference:', participant);
        if (!mountedRef.current) return;
        
        setLoading(false);
        setError(null);
        setConnectionState('connected');
        if (onMeetingJoined) {
          onMeetingJoined();
        }
      });

      api.addEventListener('videoConferenceLeft', () => {
        console.log('User left the conference');
        if (!mountedRef.current) return;
        
        setConnectionState('disconnected');
        if (onMeetingEnd) {
          onMeetingEnd();
        }
      });

      api.addEventListener('participantJoined', (participant: any) => {
        console.log('Participant joined:', participant);
        if (!mountedRef.current) return;
        
        setParticipantCount(prev => prev + 1);
      });

      api.addEventListener('participantLeft', (participant: any) => {
        console.log('Participant left:', participant);
        if (!mountedRef.current) return;
        
        setParticipantCount(prev => Math.max(0, prev - 1));
      });

      api.addEventListener('readyToClose', () => {
        console.log('Jitsi is ready to close');
        if (!mountedRef.current) return;
        
        setConnectionState('disconnected');
        if (onMeetingEnd) {
          onMeetingEnd();
        }
      });

      api.addEventListener('errorOccurred', (error: any) => {
        console.error('Jitsi error:', error);
        if (!mountedRef.current) return;
        
        setConnectionState('failed');
        const errorMsg = `Meeting error: ${error.message || error.type || 'Unknown error'}`;
        setError(errorMsg);
        setLoading(false);
        if (onError) onError(errorMsg);
      });

      // Set display name after initialization
      setTimeout(() => {
        if (api && mountedRef.current) {
          try {
            api.executeCommand('displayName', config.jitsi_config.userInfo.displayName);
            console.log('Display name set to:', config.jitsi_config.userInfo.displayName);
          } catch (err) {
            console.warn('Could not set display name:', err);
          }
        }
      }, 1000);

    } catch (err) {
      console.error('Error initializing Jitsi:', err);
      if (!mountedRef.current) return;
      
      setConnectionState('failed');
      const errorMsg = 'Failed to initialize video conference';
      setError(errorMsg);
      setLoading(false);
      if (onError) onError(errorMsg);
    }
  }, [cleanupJitsi, onMeetingEnd, onMeetingJoined, onError]);

  // Main initialization effect - CRITICAL FIX: proper dependency management
  useEffect(() => {
    // Prevent duplicate initialization
    if (initialized || !meetingId) {
      return;
    }

    let mounted = true;

    const initializeMeeting = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Load Jitsi script
        await loadJitsiScript();
        
        if (!mounted) return;
        
        // Step 2: Fetch configuration
        const config = await fetchJitsiConfig();
        
        if (!mounted) return;
        
        setJitsiConfig(config);
        
        // Step 3: Initialize Jitsi
        initializeJitsi(config);
        setInitialized(true); // Mark as initialized to prevent re-runs
        
      } catch (err: any) {
        console.error('Error in initialization:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
          if (onError) onError(err.message);
        }
      }
    };

    initializeMeeting();

    return () => {
      mounted = false;
    };
  }, [meetingId, initialized, loadJitsiScript, fetchJitsiConfig, initializeJitsi, onError]);

  // Retry function
  const handleRetry = useCallback(() => {
    console.log('Retrying connection...');
    setInitialized(false); // Reset initialization flag
    setError(null);
    setLoading(true);
    setConnectionState('connecting');
    cleanupJitsi();
  }, [cleanupJitsi]);

  const handleOpenInNewWindow = useCallback(() => {
    if (jitsiConfig) {
      const newWindowUrl = `https://${jitsiConfig.jitsi_config.domain}/${jitsiConfig.jitsi_config.room}`;
      window.open(newWindowUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(meetingUrl, '_blank', 'noopener,noreferrer');
    }
  }, [jitsiConfig, meetingUrl]);

  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'success';
      case 'connecting': return 'info';
      case 'failed': return 'error';
      case 'disconnected': return 'warning';
      default: return 'info';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'connected': return `Connected${participantCount > 0 ? ` (${participantCount} participants)` : ''}`;
      case 'connecting': return 'Connecting...';
      case 'failed': return 'Connection failed';
      case 'disconnected': return 'Disconnected';
      default: return 'Initializing...';
    }
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
          borderRadius: 2,
          border: 1,
          borderColor: 'divider'
        }}
      >
        <CircularProgress size={60} />
        <Typography mt={2} variant="h6" color="text.primary">
          {getConnectionStatusText()}
        </Typography>
        <Typography mt={1} variant="body2" color="text.secondary">
          Please wait while we connect you to the meeting...
        </Typography>
        {jitsiConfig && (
          <Typography mt={1} variant="caption" color="text.secondary">
            Meeting: {jitsiConfig.meeting_title}
          </Typography>
        )}
      </Box>
    );
  }

  // Show error state with comprehensive troubleshooting
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: 1,
          borderColor: 'error.main',
          p: 3
        }}
      >
        <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
          <AlertTitle>Meeting Connection Error</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
          
          {/* Troubleshooting suggestions */}
          <details>
            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
              <strong>Troubleshooting Tips</strong>
            </summary>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Check your internet connection</li>
              <li>Ensure your browser allows camera and microphone access</li>
              <li>Try refreshing the page</li>
              <li>Use a different browser (Chrome, Firefox, Safari)</li>
              <li>Disable browser extensions that might block video calls</li>
            </ul>
          </details>
          
          {/* Debug information (collapsed by default) */}
          <details style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer' }}>
              <strong>Technical Details</strong>
            </summary>
            <code style={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: '0.75rem',
              display: 'block',
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px'
            }}>
              {JSON.stringify({
                meetingId,
                meetingUrl,
                connectionState,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                jitsiConfig: jitsiConfig ? {
                  domain: jitsiConfig.jitsi_config.domain,
                  room: jitsiConfig.jitsi_config.room,
                  hasJWT: !!jitsiConfig.jitsi_config.jwt
                } : 'No config received'
              }, null, 2)}
            </code>
          </details>
        </Alert>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
          >
            Retry Connection
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenInNewWindow}
          >
            Open in New Window
          </Button>
        </Stack>
      </Box>
    );
  }

  // Main Jitsi interface
  return (
    <Box
      sx={{
        height,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: 'background.default',
        boxShadow: (theme) => theme.shadows[8],
        border: 1,
        borderColor: 'divider'
      }}
    >
      {/* Connection status indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 100,
          bgcolor: 'background.paper',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          boxShadow: 1,
          opacity: 0.9
        }}
      >
        <Typography
          variant="caption"
          color={`${getConnectionStatusColor()}.main`}
          sx={{ fontWeight: 'medium' }}
        >
          {getConnectionStatusText()}
        </Typography>
      </Box>

      {/* Jitsi container */}
      <div 
        ref={jitsiContainerRef}
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000'
        }} 
      />
      
      {/* Additional Controls */}
      <Stack 
        direction="row" 
        spacing={1} 
        justifyContent="flex-start" 
        alignItems="center" 
        sx={{ 
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 100,
        }}
      >
        <Button
          size="small"
          variant="contained"
          startIcon={<OpenInNewIcon />}
          onClick={handleOpenInNewWindow}
          sx={{
            bgcolor: (theme) => theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              bgcolor: (theme) => theme.palette.primary.dark,
            },
            boxShadow: 2
          }}
        >
          New Window
        </Button>
      </Stack>
    </Box>
  );
};

export default JitsiRoom;
