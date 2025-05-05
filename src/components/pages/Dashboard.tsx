import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { MeetingGuaranteeCard } from '../features/dashboard/MeetingGuaranteeCard';
import { OnboardingProgress } from '../features/dashboard/OnboardingProgress';
import { RecentActivity } from '../features/dashboard/RecentActivity';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to Your Dashboard
      </Typography>

      <Box sx={{ mb: 4 }}>
        <OnboardingProgress />
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <MeetingGuaranteeCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RecentActivity />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;