import { Container, Typography, Box } from '@mui/material';
import OnboardingWizard from '../components/OnboardingWizard';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingPage = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check both host status and onboarding completion status
    const checkAccessStatus = async () => {
      // Redirect host users to the host dashboard
      if (isAuthenticated && userType === 'host') {
        navigate('/host-dashboard');
        return;
      }
      
      // For authenticated client users, check if onboarding is already complete
      if (isAuthenticated && userType === 'client') {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/onboarding/user-onboarding-status/`, {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const statusData = await response.json();
            
            // If onboarding is complete, redirect to client dashboard
            if (statusData.is_complete) {
              navigate('/client-dashboard');
              return;
            }
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAccessStatus();
  }, [isAuthenticated, userType, navigate]);

  // Show loading indicator while checks are happening
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }
  
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