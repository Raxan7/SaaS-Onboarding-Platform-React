import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Link, 
  Divider, 
  useTheme, 
  Stack,
  Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Support as SupportIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Book as BookIcon,
  VideoCall as VideoCallIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedFooter() {
  const theme = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'light' 
          ? 'rgba(248, 250, 252, 0.8)' 
          : 'rgba(0, 0, 0, 0.2)',
        py: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        mt: 'auto', // Push footer to bottom
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3} alignItems="flex-start">
          {/* Dashboard Navigation */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <DashboardIcon fontSize="small" />
              Dashboard
            </Typography>
            <Stack spacing={1}>
              <Link 
                component={RouterLink} 
                to={user?.user_type === 'host' ? '/host-dashboard' : '/client-dashboard'}
                variant="body2" 
                color="text.secondary" 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    color: theme.palette.primary.main,
                    transform: 'translateX(3px)'
                  }
                }}
              >
                <AccountIcon fontSize="small" />
                My Dashboard
              </Link>
              <Link 
                component={RouterLink} 
                to="/meetings" 
                variant="body2" 
                color="text.secondary" 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    color: theme.palette.primary.main,
                    transform: 'translateX(3px)'
                  }
                }}
              >
                <VideoCallIcon fontSize="small" />
                All Meetings
              </Link>
              <Link 
                component={RouterLink} 
                to="/subscription" 
                variant="body2" 
                color="text.secondary" 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    color: theme.palette.primary.main,
                    transform: 'translateX(3px)'
                  }
                }}
              >
                Subscription
              </Link>
            </Stack>
          </Grid>

          {/* Support & Help */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SupportIcon fontSize="small" />
              Support
            </Typography>
            <Stack spacing={1}>
              <Link 
                component={RouterLink} 
                to="/support" 
                variant="body2" 
                color="text.secondary" 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    color: theme.palette.primary.main,
                    transform: 'translateX(3px)'
                  }
                }}
              >
                <SupportIcon fontSize="small" />
                Get Support
              </Link>
              <Link 
                component={RouterLink} 
                to="/help" 
                variant="body2" 
                color="text.secondary" 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    color: theme.palette.primary.main,
                    transform: 'translateX(3px)'
                  }
                }}
              >
                <HelpIcon fontSize="small" />
                Help Center
              </Link>
              <Link 
                component={RouterLink} 
                to="/knowledge-base" 
                variant="body2" 
                color="text.secondary" 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    color: theme.palette.primary.main,
                    transform: 'translateX(3px)'
                  }
                }}
              >
                <BookIcon fontSize="small" />
                Knowledge Base
              </Link>
            </Stack>
          </Grid>

          {/* Account & Settings */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SettingsIcon fontSize="small" />
              Account
            </Typography>
            <Stack spacing={1}>
              <Link 
                component={RouterLink} 
                to="/settings" 
                variant="body2" 
                color="text.secondary" 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.2s',
                  '&:hover': { 
                    color: theme.palette.primary.main,
                    transform: 'translateX(3px)'
                  }
                }}
              >
                <SettingsIcon fontSize="small" />
                Settings
              </Link>
              <Link 
                component="button"
                onClick={handleLogout}
                variant="body2" 
                color="text.secondary" 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    color: theme.palette.error.main,
                    transform: 'translateX(3px)'
                  }
                }}
              >
                <LogoutIcon fontSize="small" />
                Sign Out
              </Link>
            </Stack>
          </Grid>

          {/* User Info & Status */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                mb: 2
              }}
            >
              Account Info
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Welcome back,
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {user?.first_name || user?.email}
                </Typography>
              </Box>
              <Box>
                <Chip 
                  label={user?.user_type === 'host' ? 'Host Account' : 'Client Account'}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: user?.user_type === 'host' ? 'success.main' : 'primary.main',
                    color: user?.user_type === 'host' ? 'success.main' : 'primary.main',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} SaaS Onboarding Platform
          </Typography>
          <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
            <Link 
              href="#" 
              variant="body2" 
              color="text.secondary"
              sx={{
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Privacy
            </Link>
            <Link 
              href="#" 
              variant="body2" 
              color="text.secondary"
              sx={{
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Terms
            </Link>
            <Typography variant="body2" color="text.secondary">
              Made with ❤️
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
