import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              SaaS Onboarding Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The complete solution for optimizing your customer onboarding process and guaranteeing your first qualified meeting.
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Product
            </Typography>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Features
            </Link>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Pricing
            </Link>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Integrations
            </Link>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Resources
            </Typography>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Documentation
            </Link>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Guides
            </Link>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Blog
            </Link>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Company
            </Typography>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              About
            </Link>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Careers
            </Link>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Contact
            </Link>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Legal
            </Typography>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Privacy
            </Link>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Terms
            </Link>
            <Link href="#" variant="body2" color="text.secondary" display="block" gutterBottom>
              Cookies
            </Link>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          © {new Date().getFullYear()} SaaS Onboarding Platform. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}