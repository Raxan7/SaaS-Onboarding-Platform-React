import { Container, Typography, Button, Box, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import FeatureShowcase from '../components/FeatureShowcase';
import Testimonials from '../components/Testimonials';
import MeetingGuarantee from '../components/MeetingGuarantee';
import VideoDemoWithUseCases from '../components/VideoDemoWithUseCases';
import LiveChat from '../components/LiveChat';

// Floating background animation
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-20px) translateX(10px); }
`;

// Dynamic hero content
const heroContent = [
  {
    headline: "Revolutionize Your SaaS Onboarding",
    subhead: "AI-driven workflows that increase conversions by 300%",
    ctaPrimary: "Start Free Trial",
    ctaSecondary: "See Demo"
  },
  {
    headline: "Guaranteed Qualified Meetings",
    subhead: "We deliver or extend your trial - risk free",
    ctaPrimary: "Get Started",
    ctaSecondary: "View Plans"
  },
  {
    headline: "The Future of User Onboarding",
    subhead: "Personalized journeys that boost retention & revenue",
    ctaPrimary: "Book Demo",
    ctaSecondary: "Learn More"
  }
];

// Enhanced text animation variants
const textVariants = {
  hidden: { 
    y: 40,
    opacity: 0,
    filter: 'blur(4px)'
  },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      mass: 0.5
    }
  },
  exit: {
    y: -40,
    opacity: 0,
    filter: 'blur(4px)',
    transition: {
      ease: "easeIn",
      duration: 0.5
    }
  }
};

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle scroll and text rotation
  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % heroContent.length);
    }, 5000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <Box sx={{
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        '& > *': {
          position: 'absolute',
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0.1,
          animation: `${floatAnimation} 18s ease-in-out infinite`,
        }
      }}>
        <Box sx={{
          width: 600,
          height: 600,
          bgcolor: 'primary.main',
          top: '15%',
          left: '-15%',
          animationDelay: '0s'
        }} />
        <Box sx={{
          width: 800,
          height: 800,
          bgcolor: 'secondary.main',
          top: '35%',
          right: '-20%',
          animationDelay: '3s'
        }} />
        <Box sx={{
          width: 500,
          height: 500,
          bgcolor: 'warning.main',
          bottom: '-15%',
          left: '25%',
          animationDelay: '6s'
        }} />
      </Box>

      {/* Hero Section */}
      <Box sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', // Add this to center horizontally
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: '64px', sm: '72px' },
        pb: { xs: 6, md: 10 },
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${scrollPosition * 0.05}% ${50 + scrollPosition * 0.01}%, 
            rgba(255,255,255,0.15) 0%, transparent 70%)`,
          zIndex: 1
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 100%)',
          zIndex: 1
        }
      }}>
        <Container maxWidth="lg" sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', // Ensure vertical centering
          alignItems: 'center', // Ensure horizontal centering
          textAlign: 'center',
          px: { xs: 3, sm: 4 },
          height: '100%', // Take full height of parent
          width: '100%', // Take full width of parent
          my: 'auto', // Add automatic margin for vertical centering
        }}>
          {/* Hero Content */}
          <Box sx={{
            width: '100%',
            maxWidth: '800px',
            mb: { xs: 4, md: 6 },
            mx: 'auto', // Center horizontally
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // Center vertically
            flex: 1, // Take available space
          }}>
            <AnimatePresence mode='wait'>
              <motion.div
                key={`headline-${currentIndex}`}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Typography 
                  variant={isMobile ? 'h3' : isTablet ? 'h2' : 'h1'} 
                  gutterBottom
                  sx={{
                    fontWeight: 900, // More authoritative weight
                    lineHeight: 1.1, // Tighter line height for impact
                    mb: { xs: 2, sm: 3 },
                    textShadow: '0 4px 12px rgba(0,0,0,0.3)', // Deeper shadow
                    minHeight: { xs: '3.5em', sm: '2.5em' },
                    letterSpacing: '-0.03em', // Slightly tighter letter spacing
                    fontFamily: theme.typography.fontFamily, // Ensure consistent font
                    background: 'linear-gradient(90deg, #ffffff, #e0e0e0)', // Gradient text
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    px: 1, // Small padding to prevent text clipping
                  }}
                >
                  {heroContent[currentIndex].headline}
                </Typography>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode='wait'>
              <motion.div
                key={`subhead-${currentIndex}`}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 0.15 }} // Slightly longer delay for better sequencing
              >
                <Typography 
                  variant={isMobile ? 'h6' : 'h5'} 
                  gutterBottom
                  sx={{
                    mb: { xs: 3, sm: 4 },
                    opacity: 0.95, // Slightly more visible
                    fontWeight: 400,
                    minHeight: { xs: '4em', sm: '3em' },
                    lineHeight: 1.5,
                    letterSpacing: '0.01em',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    maxWidth: '90%',
                    mx: 'auto',
                    color: 'rgba(255,255,255,0.9)'
                  }}
                >
                  {heroContent[currentIndex].subhead}
                </Typography>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.3 // More natural delay after text appears
              }}
            >
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mt: 4
              }}>
                <Button
                  component={Link}
                  to="/onboarding"
                  variant="contained"
                  color="warning"
                  size={isMobile ? 'medium' : 'large'}
                  sx={{
                    px: 4,
                    fontWeight: 700, // Bolder weight
                    boxShadow: '0 4px 20px rgba(242, 153, 74, 0.4)',
                    '&:hover': {
                      boxShadow: '0 6px 24px rgba(242, 153, 74, 0.5)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '12px', // Modern rounded corners
                    textTransform: 'none', // More professional casing
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  {heroContent[currentIndex].ctaPrimary}
                </Button>
                <Button
                  component={Link}
                  to="/pricing"
                  variant="outlined"
                  color="inherit"
                  size={isMobile ? 'medium' : 'large'}
                  sx={{
                    px: 4,
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    letterSpacing: '0.02em',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {heroContent[currentIndex].ctaSecondary}
                </Button>
              </Box>
            </motion.div>
          </Box>

          {/* Video Demo Section */}
          <Box sx={{ 
            width: '100%', 
            mt: 'auto', // Push to bottom of container
            mb: { xs: 4, md: 6 } 
          }}>
            <VideoDemoWithUseCases />
          </Box>
        </Container>
      </Box>

      {/* Rest of your components remain the same */}
      <Box sx={{
        position: 'relative',
        backgroundColor: 'background.default',
        zIndex: 2
      }}>
        <LiveChat />
        <Container maxWidth="lg" sx={{
          py: { xs: 8, sm: 10, md: 12 },
          position: 'relative'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <FeatureShowcase />
          </motion.div>
        </Container>

        <Box sx={{
          backgroundColor: 'background.paper',
          py: { xs: 8, sm: 10, md: 12 },
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `linear-gradient(to bottom, ${theme.palette.background.default} 0%, transparent 100%)`,
            opacity: 0.1,
            zIndex: -1
          }
        }}>
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Testimonials />
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{
          py: { xs: 8, sm: 10, md: 12 },
          position: 'relative'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <MeetingGuarantee />
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}