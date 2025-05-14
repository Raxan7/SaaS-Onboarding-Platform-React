import { Container, Typography, Box, Button, useMediaQuery, useTheme } from '@mui/material';
import PricingTiers from '../components/PricingTiers';
import { useEffect, useState } from 'react';
import { keyframes } from '@emotion/react';

// Create keyframes for gradient animation
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export default function Pricing() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        linear-gradient(
          135deg, 
          rgba(0, 102, 204, 0.08) 0%, 
          rgba(90, 82, 204, 0.08) 30%, 
          rgba(255, 255, 255, 0.8) 70%
        ),
        linear-gradient(
          to right,
          rgba(255, 255, 255, 0.9) 0%,
          rgba(255, 255, 255, 0.9) 100%
        )
      `,
      backgroundSize: '400% 400%',
      animation: `${gradientAnimation} 15s ease infinite`,
      position: 'relative',
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        background: `
          radial-gradient(
            circle at ${scrollPosition * 0.05}% ${50 + scrollPosition * 0.01}%,
            rgba(0, 107, 194, 0.05) 0%,
            transparent 70%
          )
        `,
        zIndex: 0
      }
    }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { xs: 6, sm: 8, md: 10 },
          px: { xs: 3, sm: 4 },
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header Section */}
        <Box textAlign="center" sx={{ 
          mb: { xs: 6, sm: 8 },
          maxWidth: 800,
          mx: 'auto',
          position: 'relative'
        }}>
          <Typography 
            variant={isMobile ? 'h3' : isTablet ? 'h2' : 'h1'} 
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.dark,
              lineHeight: 1.2,
              mb: 3,
              textShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            color="text.secondary"
            sx={{
              fontWeight: 400,
              opacity: 0.9,
              lineHeight: 1.5
            }}
          >
            Start with a free trial that includes your first qualified meeting
          </Typography>
        </Box>

        {/* Pricing Tiers */}
        <Box sx={{
          mb: { xs: 6, sm: 8 },
          '& > *': {
            mx: 'auto'
          },
          position: 'relative'
        }}>
          <PricingTiers />
        </Box>

        {/* CTA Section */}
        <Box textAlign="center" sx={{ 
          mt: { xs: 6, sm: 8 },
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          maxWidth: 600,
          mx: 'auto',
          border: '1px solid rgba(0, 107, 194, 0.1)',
          position: 'relative',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 107, 194, 0.1)'
          },
          transition: 'all 0.3s ease'
        }}>
          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            gutterBottom
            sx={{
              mb: 3,
              fontWeight: 500,
              color: theme.palette.text.primary
            }}
          >
            Not sure which plan is right for you?
          </Typography>
          <Button 
            variant="contained" 
            size={isMobile ? 'medium' : 'large'}
            color="primary"
            sx={{
              px: 4,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0, 107, 194, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0, 107, 194, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Contact Sales
          </Button>
        </Box>
      </Container>
    </Box>
  );
}