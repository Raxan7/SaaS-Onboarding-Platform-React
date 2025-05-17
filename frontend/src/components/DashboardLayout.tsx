import { useState, ReactNode } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <DashboardHeader onMobileDrawerToggle={handleDrawerToggle} />
      
      {/* Sidebar - permanent on desktop, temporary on mobile */}
      <Sidebar
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
      />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          pt: { xs: 2, sm: 3 },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {/* Page content */}
        {children}
      </Box>
    </Box>
  );
}