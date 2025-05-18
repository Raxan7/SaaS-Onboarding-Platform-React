import { AppBar, Toolbar, Container, Box, Avatar, Typography, IconButton, Menu, MenuItem, Badge, useMediaQuery, useTheme } from '@mui/material';
import { Notifications, HelpOutline, Settings, Logout, Menu as MenuIcon } from '@mui/icons-material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from './logo.jpg';
import { useAuth } from '../contexts/AuthContext';

interface DashboardHeaderProps {
  onMobileDrawerToggle?: () => void;
}

export default function DashboardHeader({ onMobileDrawerToggle }: DashboardHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const { logout } = useAuth();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%'
        }}
      >
        <Container maxWidth={false}>
          <Toolbar sx={{ 
            justifyContent: 'space-between', 
            px: { xs: 2, sm: 3 },
            minHeight: { xs: 64, sm: 72 }
          }}>
            {/* Logo and Dashboard Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={onMobileDrawerToggle}
                  sx={{ mr: 1, color: 'text.secondary' }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Box 
                component={Link} 
                to="/dashboard" 
                sx={{ 
                  textDecoration: 'none', 
                  display: 'flex', 
                  alignItems: 'center',
                }}
              >
                <img 
                  src={logo} 
                  alt="Logo" 
                  height={isMobile ? 32 : 36}
                />
                <Typography 
                  variant="h6" 
                  component="span" 
                  sx={{ 
                    ml: 2, 
                    fontWeight: 700,
                    display: { xs: 'none', sm: 'inline' },
                    color: theme.palette.primary.main,
                  }}
                >
                  SaaS
                </Typography>
              </Box>
              <Typography 
                variant="h6" 
                component="h1"
                sx={{
                  fontWeight: 500,
                  color: 'text.secondary',
                  display: { xs: 'none', md: 'block' }
                }}
              >
                Dashboard
              </Typography>
            </Box>

            {/* User Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton color="inherit" sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              
              <IconButton color="inherit" sx={{ color: 'text.secondary' }}>
                <HelpOutline />
              </IconButton>
              
              <IconButton 
                color="inherit" 
                sx={{ color: 'text.secondary' }}
                onClick={handleMenuOpen}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: theme.palette.primary.main,
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  JD
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                  '& .MuiPaper-root': {
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: theme.shadows[3],
                    mt: 1,
                  },
                  '& .MuiMenuItem-root': {
                    py: 1.5,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 123, 255, 0.08)',
                    }
                  }
                }}
              >
                <MenuItem onClick={handleMenuClose}>
                  <Settings sx={{ mr: 2, color: 'text.secondary' }} />
                  Settings
                </MenuItem>
                <MenuItem 
                  onClick={() => {
                    logout();
                    handleMenuClose();
                  }} 
                  component={Link} 
                  to="/"
                  sx={{ color: theme.palette.error.main }}
                >
                  <Logout sx={{ mr: 2 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box sx={{ height: { xs: '64px', sm: '72px' } }} />
    </>
  );
}