import { Box, Container, Typography, Button, Grid } from '@mui/material'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FeatureCard } from '../features/FeatureCard'
import { TestimonialCard } from '../features/TestimonialCard'
import { VideoDemo } from '../features/VideoDemo'

const HomePage = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const features = [
    {
      title: 'AI-Powered Onboarding',
      description: 'Our intelligent wizard guides you through setup in minutes.',
      icon: '🧠',
    },
    {
      title: 'First Meeting Guarantee',
      description: 'We guarantee your first qualified meeting or your money back.',
      icon: '🤝',
    },
    {
      title: 'Seamless Integration',
      description: 'Connect with your existing tools and workflows effortlessly.',
      icon: '🔌',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director, TechCorp',
      quote: 'This platform helped us streamline our onboarding process by 70%.',
      avatar: '',
    },
    {
      name: 'Michael Chen',
      role: 'CEO, Startup Inc',
      quote: 'The first meeting guarantee was a game-changer for our sales team.',
      avatar: '',
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Typography variant="h2" component="h1" gutterBottom>
                Accelerate Your Customer Onboarding
              </Typography>
              <Typography variant="h5" sx={{ mb: 4 }}>
                The smartest way to onboard new customers with AI-powered workflows.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                href="/onboarding"
              >
                Start Free Trial
              </Button>
            </Grid>
            <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <VideoDemo src="/demo-video.mp4" />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }} ref={ref}>
        <Typography variant="h3" align="center" gutterBottom>
          Powerful Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }} key={feature.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'background.default', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Trusted by Industry Leaders
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {testimonials.map((testimonial) => (
              <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} key={testimonial.name}>
                <TestimonialCard {...testimonial} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage