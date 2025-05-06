import { Container, Typography, Box, Grid } from '@mui/material';
import OnboardingWizard from '../components/OnboardingWizard';

export default function Onboarding() {
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom>
          Start Your Free Trial
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Get your first qualified meeting guaranteed
        </Typography>
      </Box>

      <Grid container justifyContent="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <OnboardingWizard />
        </Grid>
      </Grid>
    </Container>
  );
}