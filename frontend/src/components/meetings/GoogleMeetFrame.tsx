// components/meetings/GoogleMeetFrame.tsx
import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert, AlertTitle, Button, Stack } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';

interface GoogleMeetFrameProps {
  meetingUrl: string;
  height?: string | number;
  onError?: (error: string) => void;
}

/**
 * A component that displays a Google Meet iframe with additional controls
 * and handles meeting lifecycle.
 */
const GoogleMeetFrame = ({ 
  meetingUrl, 
  height = '400px',
  onError
}: GoogleMeetFrameProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Validate the meeting URL
    if (!meetingUrl) {
      setError('No meeting URL provided');
      setLoading(false);
      if (onError) onError('No meeting URL provided');
      return;
    }
    
    try {
      const url = new URL(meetingUrl);
      
      // Check if it's a Google Meet URL
      const isGoogleMeet = url.hostname === 'meet.google.com' || 
                          url.hostname.endsWith('.meet.google.com');
      
      if (!isGoogleMeet) {
        console.warn('URL is not a standard Google Meet URL:', meetingUrl);
        // We'll still try to load it, but with a warning in the console
      }
      
      // Check for various Google Meet endpoints
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const isNewMeeting = pathSegments.length > 0 && pathSegments[0] === 'new';
      const isLookupEndpoint = pathSegments.length > 0 && pathSegments[0] === 'lookup';
      
      // Instead of automatically opening in a new window, show a message with a button
      if (isNewMeeting || isLookupEndpoint) {
        const urlType = isNewMeeting ? "creation" : "lookup-based";
        console.log(`Detected Google Meet ${urlType} URL`);
        
        // Show an information message with a button to open in new window
        setError(`This is a Google Meet ${urlType} URL that works best in a dedicated browser tab.`);
        setLoading(false);
        return;
      }
      
      // For standard meeting codes, validate the format
      if (!isNewMeeting && !isLookupEndpoint && pathSegments.length > 0) {
        const meetingCode = pathSegments[0];
        // Check if the code matches the expected pattern for existing meetings
        const isValidCode = /^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/.test(meetingCode);
        if (!isValidCode) {
          console.warn('Meeting code does not match the expected format:', meetingCode);
        }
      }
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error('Invalid meeting URL:', err);
      setError('Invalid meeting URL');
      if (onError) onError('Invalid meeting URL');
    }
    
    // Set a timeout to hide the loading indicator after a few seconds
    // even if the iframe doesn't trigger onLoad
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [meetingUrl, onError]);
  
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  const handleOpenInNewWindow = () => {
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
  };
  
  if (error) {
    // Detect the type of message to show appropriate UI
    const isGoogleMeetUrl = meetingUrl?.includes('meet.google.com/new') || 
                           meetingUrl?.includes('meet.google.com/lookup');
    
    return (
      <Alert 
        severity={isGoogleMeetUrl ? "info" : "error"} 
        sx={{ height: height }}
      >
        <AlertTitle>
          {isGoogleMeetUrl ? "Google Meet Session" : "Error Loading Meeting"}
        </AlertTitle>
        
        {error}
        
        {isGoogleMeetUrl && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Google Meet sessions require a dedicated browser tab to work properly.
          </Typography>
        )}
        
        <Box mt={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button 
              variant="contained" 
              color={isGoogleMeetUrl ? "primary" : "error"}
              onClick={handleOpenInNewWindow}
              startIcon={<OpenInNew />}
              fullWidth
            >
              {isGoogleMeetUrl ? "Open Google Meet in New Tab" : "Try in New Window"}
            </Button>
            
            {isGoogleMeetUrl && (
              <Button 
                variant="outlined"
                onClick={() => {
                  // Clear error and try to load in iframe
                  setError(null);
                  setLoading(true);
                }}
                fullWidth
              >
                Try in Embedded Frame
              </Button>
            )}
          </Stack>
          
          {isGoogleMeetUrl && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Note: Google Meet works best in a dedicated browser tab where you can grant camera/microphone permissions.
            </Typography>
          )}
        </Box>
      </Alert>
    );
  }
  
  // Check if this is a Google Meet URL that might need special handling
  const isGoogleMeetNewUrl = meetingUrl?.includes('meet.google.com/new');
  const isGoogleMeetLookupUrl = meetingUrl?.includes('meet.google.com/lookup');
  
  return (
    <Box sx={{ height: height, position: 'relative' }}>
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'background.paper',
            zIndex: 1
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {isGoogleMeetNewUrl || isGoogleMeetLookupUrl ? 
                'Setting up Google Meet session...' : 
                'Loading meeting...'}
            </Typography>
            {(isGoogleMeetNewUrl || isGoogleMeetLookupUrl) && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<OpenInNew />}
                onClick={handleOpenInNewWindow}
              >
                Open in New Tab Instead
              </Button>
            )}
          </Stack>
        </Box>
      )}
      <iframe
        src={meetingUrl}
        style={{ width: '100%', height: '100%', border: 0 }}
        allow="camera; microphone; fullscreen; display-capture"
        title="Meeting"
        onLoad={handleIframeLoad}
      />
    </Box>
  );
};

export default GoogleMeetFrame;
