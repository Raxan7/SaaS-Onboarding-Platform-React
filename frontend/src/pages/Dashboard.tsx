import { Container, Typography, Box, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { CheckCircle, People, TrendingUp, CalendarToday } from '@mui/icons-material';
import DashboardHeader from '../components/DashboardHeader';

export default function Dashboard() {
  const metrics = [
    { title: 'Onboarding Progress', value: '78%', icon: <TrendingUp fontSize="large" color="primary" /> },
    { title: 'Scheduled Meeting', value: 'May 15', icon: <CalendarToday fontSize="large" color="secondary" /> },
    { title: 'Users Activated', value: '24/50', icon: <People fontSize="large" color="warning" /> },
    { title: 'Guarantee Status', value: 'Confirmed', icon: <CheckCircle fontSize="large" color="success" /> },
  ];

  const tasks = [
    { name: 'Complete Profile Setup', progress: 90 },
    { name: 'Connect Your CRM', progress: 45 },
    { name: 'Invite Team Members', progress: 20 },
    { name: 'Schedule Demo Call', progress: 100 },
  ];

  return (
    <>
      <DashboardHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Welcome to Your Dashboard
        </Typography>

        {/* Metrics Cards */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {metrics.map((metric) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={metric.title}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {metric.title}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {metric.value}
                      </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: 'action.hover', p: 2, borderRadius: '50%' }}>
                      {metric.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Onboarding Progress */}
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Onboarding Tasks
            </Typography>
            <Box sx={{ mt: 2 }}>
              {tasks.map((task) => (
                <Box key={task.name} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{task.name}</Typography>
                    <Typography variant="body2">{task.progress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={task.progress} 
                    color={task.progress === 100 ? 'success' : 'primary'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Meeting Guarantee Status */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your First Qualified Meeting
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'success.light', 
              p: 3, 
              borderRadius: 2,
              mt: 2
            }}>
              <CheckCircle sx={{ mr: 2, color: 'success.main', fontSize: '2rem' }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Meeting Confirmed
                </Typography>
                <Typography variant="body2">
                  Your first qualified meeting with Acme Corp is scheduled for May 15 at 2:00 PM EST
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}