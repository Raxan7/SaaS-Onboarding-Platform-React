import { Container, Typography, Box } from '@mui/material';
import OnboardingWizard from '../components/OnboardingWizard';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingPage = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  
  // Redirect host users to the host dashboard
  useEffect(() => {
    if (isAuthenticated && userType === 'host') {
      navigate('/host-dashboard');
    }
  }, [isAuthenticated, userType, navigate]);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Start Your Free Trial
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Get your first qualified meeting guaranteed
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}>
        <Box sx={{ 
          width: { xs: '100%', md: '83.333%', lg: '66.667%' },
          maxWidth: { lg: 1200 }
        }}>
          <OnboardingProvider>
            <OnboardingWizard />
          </OnboardingProvider>
        </Box>
      </Box>
    </Container>
  );
};

export default OnboardingPage;