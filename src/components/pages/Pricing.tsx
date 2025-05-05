import { Box, Container, Typography, Grid, Paper } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { PricingPlanCard } from '../features/PricingPlanCard'

const Pricing = () => {
  const plans = [
    {
      name: 'Basic',
      price: '$29',
      period: '/month',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 10 users',
        'Basic onboarding flows',
        'Email support',
        'Analytics dashboard',
      ],
      cta: 'Get Started',
      featured: false,
    },
    {
      name: 'Pro',
      price: '$99',
      period: '/month',
      description: 'For growing businesses with more needs',
      features: [
        'Up to 50 users',
        'Advanced onboarding',
        'Priority support',
        'AI-powered workflows',
        'First meeting guarantee',
      ],
      cta: 'Start Free Trial',
      featured: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations with complex needs',
      features: [
        'Unlimited users',
        'Dedicated account manager',
        'Custom workflows',
        'API access',
        'Premium support',
      ],
      cta: 'Contact Sales',
      featured: false,
    },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={8}>
        <Typography variant="h2" gutterBottom>
          Simple, Transparent Pricing
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Start with a 14-day free trial. No credit card required.
        </Typography>
      </Box>

      <Grid container spacing={4} alignItems="center">
        {plans.map((plan) => (
          <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }} key={plan.name}>
            <PricingPlanCard {...plan} />
          </Grid>
        ))}
      </Grid>

      {/* Comparison Table */}
      <Box mt={10}>
        <Typography variant="h4" align="center" gutterBottom>
          Plan Comparison
        </Typography>
        <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
          <Grid container>
            {/* Table headers */}
            <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
              <Typography fontWeight="bold">Features</Typography>
            </Grid>
            {plans.map((plan) => (
              <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }} key={`header-${plan.name}`}>
                <Typography fontWeight="bold">{plan.name}</Typography>
              </Grid>
            ))}

            {/* Table rows */}
            {[
              'Number of users',
              'Onboarding workflows',
              'Support',
              'AI features',
              'Meeting guarantee',
            ].map((feature) => (
              <Grid
                container
                key={feature}
                sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
                  <Typography>{feature}</Typography>
                </Grid>
                {plans.map((plan) => (
                  <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }} key={`${plan.name}-${feature}`}>
                    {plan.features.includes(feature) ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Box sx={{ width: 24, height: 24 }} />
                    )}
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Container>
  )
}

export default Pricing