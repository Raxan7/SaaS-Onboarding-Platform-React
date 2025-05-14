// pages/HostDashboard.tsx
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';
import DashboardHeader from '../components/DashboardHeader';
import MeetingsList from '../components/meetings/MeetingsList';
import ActiveMeeting from '../components/meetings/ActiveMeeting';
import { useApiClient } from '../utils/apiClient';
import { useEffect, useState } from 'react';

const HostDashboard = () => {
  const apiClient = useApiClient();
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const meetings = await apiClient.get('/api/meetings/');
        const now = new Date();
        
        setStats({
          totalMeetings: meetings.length,
          upcomingMeetings: meetings.filter((m: any) => 
            new Date(m.scheduled_at) > now && m.status !== 'cancelled'
          ).length,
          completedMeetings: meetings.filter((m: any) => 
            new Date(m.scheduled_at) <= now || m.status === 'completed'
          ).length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <DashboardHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Host Dashboard
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Meetings
                </Typography>
                <Typography variant="h3" sx={{ mt: 1 }}>
                  {stats.totalMeetings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Upcoming Meetings
                </Typography>
                <Typography variant="h3" sx={{ mt: 1 }}>
                  {stats.upcomingMeetings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Completed Meetings
                </Typography>
                <Typography variant="h3" sx={{ mt: 1 }}>
                  {stats.completedMeetings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Meeting
            </Typography>
            <ActiveMeeting />
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Meeting Requests
            </Typography>
            <MeetingsList filter="upcoming" />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Meeting History
            </Typography>
            <MeetingsList filter="past" showActions={false} />
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Scheduled Meetings
            </Typography>
            <MeetingsList filter="all" showActions={false} />
          </CardContent>
        </Card>
      </Container>

      {embeddedMeetingUrl && (
        <Box
          sx={{
            position: 'fixed',
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            zIndex: 1300,
            width: '80%',
            height: '70%',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: 24,
            overflow: 'hidden',
          }}
        >
          <iframe
            src={embeddedMeetingUrl}
            style={{ width: '100%', height: '100%', border: 0 }}
            allow="camera; microphone; fullscreen; display-capture"
            title="Embedded Meeting"
          />
        </Box>
      )}
    </>
  );
};

export default HostDashboard;