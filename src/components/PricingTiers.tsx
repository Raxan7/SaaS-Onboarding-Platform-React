import { Card, CardContent, Typography, Box, Button, List, ListItem, ListItemIcon, Grid } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { motion } from 'framer-motion';

const tiers = [
  {
    title: 'Basic',
    price: '$29',
    period: '/month',
    description: 'For small teams getting started',
    features: [
      'Up to 100 users',
      'Basic onboarding flows',
      'Email support',
      'Standard integrations',
    ],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    title: 'Pro',
    price: '$99',
    period: '/month',
    description: 'For growing businesses',
    features: [
      'Up to 500 users',
      'Advanced onboarding',
      'Priority support',
      'API access',
      'Custom workflows',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Unlimited users',
      'Dedicated account manager',
      '24/7 support',
      'SSO & advanced security',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    highlight: false,
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
                border: tier.highlight ? '2px solid #6C63FF' : 'none',
                transform: tier.highlight ? 'scale(1.03)' : 'none',
              }}
            >
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
                  variant={tier.highlight ? 'contained' : 'outlined'}
                  color={tier.highlight ? 'secondary' : 'primary'}
                  size="large"
                  sx={{ mt: 3 }}
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