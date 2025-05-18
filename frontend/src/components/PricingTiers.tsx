import { Card, CardContent, Typography, Box, Button, List, ListItem, ListItemIcon, Grid, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { motion } from 'framer-motion';

const tiers = [
  {
    title: 'Basic',
    price: '$29',
    period: '/month',
    description: 'Perfect for individuals or small teams exploring structured onboarding',
    features: [
      '2 qualified meetings included (Free Trial)',
      'Access to AI-powered onboarding wizard',
      'Personalized welcome guide',
      'Secure account dashboard with real-time tracking',
      'Enhanced onboarding use cases & video tutorials',
      'Email support during extended business hours',
      'Access to comprehensive FAQs & knowledge base',
      'Basic analytics and meeting insights'
    ],
    cta: 'Start Free Trial',
    highlight: false,
    color: 'success'
  },
  {
    title: 'Pro',
    price: '$99',
    period: '/month',
    description: 'Ideal for growing teams that need advanced onboarding workflows and analytics',
    features: [
      'Up to 10 qualified meetings per month',
      'Advanced meeting tracking dashboard',
      'Full feature walkthrough with real-time AI insights',
      'Customizable onboarding workflows per client',
      'Priority email & live chat support',
      'Stripe billing integration & plan auto-upgrade',
      'Customer testimonials management access',
      'Enhanced analytics with custom reporting'
    ],
    cta: 'Start Free Trial',
    highlight: true,
    color: 'primary'
  },
  {
    title: 'Enterprise',
    price: '$499',
    period: '/month',
    description: 'Designed for organizations with complex onboarding needs and white-glove support',
    features: [
      'Unlimited qualified meetings',
      'Dedicated success manager',
      'Full API access & enterprise integrations (CRM, ERP)',
      'Custom roles with granular permission controls',
      '24/7 SLA-backed premium support & live onboarding',
      'Comprehensive analytics with customizable exports',
      'Advanced branding customization and white-labeling',
      'SSO authentication & enhanced security features'
    ],
    cta: 'Contact Sales',
    highlight: false,
    color: 'default'
  },
];

export default function PricingTiers() {
  return (
    <Grid container spacing={4} alignItems="flex-end">
      {tiers.map((tier) => (
        <Grid size={{ xs: 12, md: 4 }} key={tier.title}>
          <motion.div whileHover={{ y: -10 }}>
            <Card
              sx={{
                border: tier.highlight ? '2px solid #6C63FF' : tier.color === 'success' ? '2px solid #4caf50' : tier.color === 'default' ? '2px solid #333' : 'none',
                transform: tier.highlight ? 'scale(1.03)' : 'none',
                borderRadius: 2,
                height: '100%',
                boxShadow: tier.highlight ? '0 8px 24px rgba(108, 99, 255, 0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {tier.color === 'success' && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: -12, 
                  left: 0, 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'center' 
                }}>
                  <Chip 
                    label="Most Popular for Beginners" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#4caf50', 
                      color: 'white',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
              )}
              {tier.highlight && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: -12, 
                  left: 0, 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'center' 
                }}>
                  <Chip 
                    label="Most Popular" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#6C63FF', 
                      color: 'white',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
              )}
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {tier.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {tier.price}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {tier.period}
                  </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {tier.description}
                </Typography>
                <List>
                  {tier.features.map((feature) => (
                    <ListItem key={feature} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <Typography>{feature}</Typography>
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant={tier.highlight || tier.color === 'success' ? 'contained' : 'outlined'}
                  color={tier.color === 'success' ? 'success' : tier.highlight ? 'primary' : 'inherit'}
                  size="large"
                  sx={{ 
                    mt: 3,
                    py: 1.5,
                    fontSize: '0.95rem',
                    fontWeight: 'medium',
                    ...(tier.color === 'default' && {
                      color: 'text.primary',
                      borderColor: 'text.primary',
                      '&:hover': {
                        borderColor: 'text.primary',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    })
                  }}
                >
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
}