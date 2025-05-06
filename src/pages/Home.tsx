import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import FeatureShowcase from '../components/FeatureShowcase';
import Testimonials from '../components/Testimonials';
import MeetingGuarantee from '../components/MeetingGuarantee';
import HeroSection from '../components/HeroSection';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Box sx={{
      position: 'relative',
      overflow: 'hidden',
    }}>
      <HeroSection scrollPosition={scrollPosition} />

      {/* Page Sections */}
      <Box sx={{
        position: 'relative',
        backgroundColor: 'background.default',
        zIndex: 2
      }}>
        {/* Feature Showcase */}
        <Container id="feature-showcase" maxWidth="lg" sx={{
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

        {/* Testimonials */}
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

        {/* Meeting Guarantee */}
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