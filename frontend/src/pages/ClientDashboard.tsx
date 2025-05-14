// pages/ClientDashboard.tsx
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  LinearProgress, 
  Alert,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import DashboardHeader from '../components/DashboardHeader';
import MeetingsList from '../components/meetings/MeetingsList';
import ActiveMeeting from '../components/meetings/ActiveMeeting';
import { useAuth } from '../contexts/AuthContext';
import { useApiClient } from '../utils/apiClient';
import { useEffect, useState } from 'react';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

const onboardingSteps = [
  { name: 'Account Setup', completed: true },
  { name: 'Company Info', completed: false },
  { name: 'Meeting Scheduling', completed: false },
  { name: 'Payment', completed: false },
];

const ClientDashboard = () => {
  const { user } = useAuth();
  const apiClient = useApiClient();
  const theme = useTheme();
  const [onboardingStatus, setOnboardingStatus] = useState({
    completedSteps: 1,
    totalSteps: 4,
  });
  const [showOnboardingAlert, setShowOnboardingAlert] = useState(true);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        const status = await apiClient.get('/api/onboarding/user-onboarding-status/');
        if (status) {
          const completedSteps = status.is_complete ? 4 : status.current_step || 1;
          setOnboardingStatus({
            completedSteps,
            totalSteps: 4,
          });
          setShowOnboardingAlert(!status.is_complete);
        }
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
      }
    };

    fetchOnboardingStatus();
  }, []);

  const onboardingPercentage = Math.round(
    (onboardingStatus.completedSteps / onboardingStatus.totalSteps) * 100
  );

  return (
    <>
      <DashboardHeader />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
            Welcome back, {user?.first_name}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Here's what's happening with your account today
          </Typography>
        </Box>

        {showOnboardingAlert && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4,
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
            action={
              <Chip 
                label="Continue Onboarding" 
                onClick={() => window.location.href = "/onboarding?step=2"}
                color="warning"
                variant="outlined"
                clickable
              />
            }
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Typography variant="body1">
                Complete your onboarding to schedule your first free meeting
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {onboardingPercentage}% completed
              </Typography>
            </Box>
          </Alert>
        )}

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Onboarding Progress
                  </Typography>
                  <Chip 
                    label={`${onboardingStatus.completedSteps}/${onboardingStatus.totalSteps}`} 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={onboardingPercentage}
                  sx={{ 
                    height: 10, 
                    borderRadius: 5, 
                    mb: 3,
                    backgroundColor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5
                    }
                  }}
                />
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                  gap: 2 
                }}>
                  {onboardingSteps.map((step, index) => (
                    <Box 
                      key={step.name} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: index < onboardingStatus.completedSteps ? 
                          theme.palette.success.light : theme.palette.grey[100]
                      }}
                    >
                      {index < onboardingStatus.completedSteps ? (
                        <CheckCircle color="success" sx={{ mr: 2 }} />
                      ) : (
                        <RadioButtonUnchecked color="disabled" sx={{ mr: 2 }} />
                      )}
                      <Typography variant="body1" fontWeight={500}>
                        {step.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Active Meeting
                </Typography>
                <ActiveMeeting />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Upcoming Meetings
                  </Typography>
                  <Chip 
                    label="New Meeting" 
                    color="primary" 
                    onClick={() => window.location.href = "/schedule-meeting"}
                    clickable
                  />
                </Box>
                <Divider sx={{ mb: 3 }} />
                <MeetingsList filter="upcoming" />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Past Meetings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <MeetingsList filter="past" showActions={false} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ClientDashboard;