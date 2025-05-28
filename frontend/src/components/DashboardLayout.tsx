import { useState, ReactNode } from 'react';
import { Box, useMediaQuery, useTheme, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import ProtectedFooter from './ProtectedFooter';
import MeetingNotification from './meetings/MeetingNotification';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;
const headerHeight = 72;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { userType } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleJoinMeeting = (_meetingId: number, meetingUrl: string) => {
    // Only show for clients - hosts start the meetings themselves
    if (userType === 'client') {
      window.open(meetingUrl, '_blank');
      navigate('/meetings');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      {/* Fixed Header */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
        }}
      >
        <DashboardHeader onMobileDrawerToggle={handleDrawerToggle} />
      </Box>
      
      {/* Main Layout Container */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        pt: `${headerHeight}px`,
        position: 'relative'
      }}>
        {/* Sidebar */}
        <Sidebar
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
        />
        
        {/* Meeting notifications for clients */}
        {userType === 'client' && (
          <MeetingNotification onJoinMeeting={handleJoinMeeting} />
        )}
        
        {/* Main content area with footer */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: { 
              xs: '100%',
              md: `calc(100% - ${drawerWidth}px)` 
            },
            ml: { md: `${drawerWidth}px` },
            minHeight: `calc(100vh - ${headerHeight}px)`,
            position: 'relative',
          }}
        >
          {/* Scrollable content area */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: { xs: 2, sm: 3 },
              pb: 0, // Remove bottom padding to let footer handle spacing
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.divider,
                borderRadius: '3px',
                '&:hover': {
                  background: theme.palette.text.secondary,
                },
              },
            }}
          >
            <Fade in timeout={300}>
              <Box>{children}</Box>
            </Fade>
          </Box>
          
          {/* Protected Footer integrated into layout */}
          <ProtectedFooter />
        </Box>
      </Box>
    </Box>
  );
}
