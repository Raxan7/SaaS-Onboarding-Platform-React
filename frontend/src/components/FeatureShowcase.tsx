import { Grid, Typography, Box, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaRobot } from '@react-icons/all-files/fa/FaRobot';
import { FaHandshake } from '@react-icons/all-files/fa/FaHandshake';
import { FaPlug } from '@react-icons/all-files/fa/FaPlug';
import { FaChartLine } from '@react-icons/all-files/fa/FaChartLine';
import { FaCalendarAlt } from '@react-icons/all-files/fa/FaCalendarAlt';
import { FaVideo } from '@react-icons/all-files/fa/FaVideo';
import { FaUserCheck } from '@react-icons/all-files/fa/FaUserCheck';
import { useTheme } from '@mui/material/styles';

const features = [
  {
    title: 'Meet the Right Expert, Every Time',
    description: 'Our intelligent matching ensures you connect with the perfect specialist for your unique needs—no guesswork, no wasted time.',
    icon: <FaCalendarAlt />,
    color: 'primary',
  },
  {
    title: 'Instant Booking, Zero Hassle',
    description: 'Book a session in seconds. No back-and-forth emails, no confusion—just pick your time and go.',
    icon: <FaHandshake />,
    color: 'secondary',
  },
  {
    title: 'Crystal-Clear Video Consultations',
    description: 'Enjoy seamless, high-quality video meetings that make every conversation feel personal and productive.',
    icon: <FaVideo />,
    color: 'warning',
  },
  {
    title: 'Your Success, Our Promise',
    description: 'We guarantee satisfaction. If you don’t get the help you need, your next session is on us—no questions asked.',
    icon: <FaUserCheck />,
    color: 'success',
  },
];

export default function FeatureShowcase() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const theme = useTheme();

  const iconColors: Record<string, string> = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    warning: theme.palette.warning.main,
    success: theme.palette.success.main,
  };

  return (
    <Box ref={ref}>
      <Typography variant="h2" textAlign="center" gutterBottom sx={{ fontWeight: 700 }}>
        Why Choose Us?
      </Typography>
      <Typography variant="h5" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
        Experience the fastest, most trusted way to get expert help—trusted by thousands worldwide
      </Typography>
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={feature.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card sx={{ 
                height: '100%',
                border: 'none',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 40px rgba(0, 107, 194, 0.15)'
                }
              }}>
                <CardContent sx={{ 
                  textAlign: 'center',
                  px: 3,
                  py: 4
                }}>
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    mb: 3,
                    borderRadius: '50%',
                    backgroundColor: `${iconColors[feature.color as keyof typeof iconColors]}20`,
                    color: iconColors[feature.color as keyof typeof iconColors],
                    fontSize: '2rem',
                    '& svg': {
                      width: '1em',
                      height: '1em'
                    }
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '1rem' }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}