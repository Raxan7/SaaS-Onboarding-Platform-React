import { Box, Container, Typography, Grid, Link, Divider, useTheme, Stack, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useAuth } from '../contexts/AuthContext';

export default function Footer() {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'light' 
          ? 'rgba(232, 236, 255, 0.35)' 
          : 'rgba(0, 0, 0, 0.1)',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(108, 99, 255, 0.08) 0%, transparent 70%), radial-gradient(circle at 80% 80%, rgba(0, 123, 255, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 4 }}>
            <Box mb={2}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #007BFF 0%, #6C63FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                SaaS Onboarding Platform
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '95%' }}>
                The complete solution for optimizing your customer onboarding process and guaranteeing your first qualified meeting.
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                <IconButton 
                  size="small" 
                  aria-label="LinkedIn"
                  sx={{ 
                    color: '#0A66C2',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)' }
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  aria-label="Twitter"
                  sx={{ 
                    color: '#1DA1F2',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)' }
                  }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  aria-label="Facebook"
                  sx={{ 
                    color: '#4267B2',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)' }
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  aria-label="GitHub"
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#fff' : '#24292e',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)' }
                  }}
                >
                  <GitHubIcon />
                </IconButton>
              </Stack>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2.5 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Quick Links
            </Typography>
            <Link 
              component={RouterLink} 
              to="/" 
              variant="body2" 
              color="text.secondary" 
              sx={{
                display: 'block', 
                mb: 1.5,
                transition: 'all 0.2s',
                '&:hover': { 
                  color: theme.palette.primary.main,
                  transform: 'translateX(3px)'
                }
              }}
            >
              Home
            </Link>
            {!isAuthenticated && (
              <>
                <Link 
                  component={RouterLink} 
                  to="/pricing" 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{
                    display: 'block', 
                    mb: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      color: theme.palette.primary.main,
                      transform: 'translateX(3px)'
                    }
                  }}
                >
                  Pricing
                </Link>
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{
                    display: 'block', 
                    mb: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      color: theme.palette.primary.main,
                      transform: 'translateX(3px)'
                    }
                  }}
                >
                  Login
                </Link>
              </>
            )}
          </Grid>
          <Grid size={{ xs: 6, md: 2.5 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Actions
            </Typography>
            <Link 
              component={RouterLink} 
              to="/schedule-meeting" 
              variant="body2" 
              color="text.secondary" 
              sx={{
                display: 'block', 
                mb: 1.5,
                transition: 'all 0.2s',
                '&:hover': { 
                  color: theme.palette.primary.main,
                  transform: 'translateX(3px)'
                }
              }}
            >
              Schedule a Meeting
            </Link>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Legal
            </Typography>
            <Link 
              href="#" 
              variant="body2" 
              color="text.secondary" 
              sx={{
                display: 'block', 
                mb: 1.5,
                transition: 'all 0.2s',
                '&:hover': { 
                  color: theme.palette.primary.main,
                  transform: 'translateX(3px)'
                }
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="#" 
              variant="body2" 
              color="text.secondary" 
              sx={{
                display: 'block', 
                mb: 1.5,
                transition: 'all 0.2s',
                '&:hover': { 
                  color: theme.palette.primary.main,
                  transform: 'translateX(3px)'
                }
              }}
            >
              Terms of Service
            </Link>
            <Link 
              href="#" 
              variant="body2" 
              color="text.secondary" 
              sx={{
                display: 'block', 
                mb: 1.5,
                transition: 'all 0.2s',
                '&:hover': { 
                  color: theme.palette.primary.main,
                  transform: 'translateX(3px)'
                }
              }}
            >
              Cookie Policy
            </Link>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            © {new Date().getFullYear()} SaaS Onboarding Platform. All rights reserved.
          </Typography>
          <Box 
            sx={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: 'primary.main',
              display: { xs: 'none', sm: 'block' },
              opacity: 0.6,
              mx: 1
            }} 
          />
          <Typography variant="body2" color="text.secondary">
            Made with ❤️ for better meetings
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}