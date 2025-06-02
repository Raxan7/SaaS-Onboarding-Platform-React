import { Container, Typography, Button, Box, useTheme, useMediaQuery, Chip, Modal, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import FeatureShowcase from '../components/FeatureShowcase';
import Testimonials from '../components/Testimonials';
import MeetingGuarantee from '../components/MeetingGuarantee';
import VideoDemoWithUseCases from '../components/VideoDemoWithUseCases';
import LiveChat from '../components/LiveChat';

// Revolutionary animations
const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.4), 0 0 40px rgba(118, 75, 162, 0.2); 
  }
  50% { 
    box-shadow: 0 0 40px rgba(102, 126, 234, 0.8), 0 0 80px rgba(118, 75, 162, 0.4); 
  }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Revolutionary hero content with emojis and power words
const heroContent = [
  {
    headline: "🚀 Unleash Revolutionary Expert Connections",
    subhead: "Experience the future of professional consultations. AI-powered matching meets human excellence in our groundbreaking platform.",
    ctaPrimary: "🌟 Transform Your Business",
    ctaSecondary: "⚡ See Magic Happen",
    accent: "🔥 Most Revolutionary"
  },
  {
    headline: "💎 Book Life-Changing Sessions in Seconds",
    subhead: "No more endless searching. Our quantum-speed matching algorithm connects you with world-class experts instantly.",
    ctaPrimary: "🎯 Find Your Expert",
    ctaSecondary: "🎪 Watch Demo",
    accent: "⚡ Lightning Fast"
  },
  {
    headline: "🏆 Your Success, Supercharged by Genius",
    subhead: "From startup scaling to personal breakthroughs, unlock exponential growth with our elite expert network.",
    ctaPrimary: "🚀 Start Evolution",
    ctaSecondary: "📈 Success Stories",
    accent: "💫 Game Changer"
  }
];

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  
  // Interactive mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [0, window.innerHeight], [5, -5]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-5, 5]);
  
  // Spring animations for smooth interactions
  const springConfig = { stiffness: 300, damping: 30 };
  const heroScale = useSpring(1, springConfig);
  const glowIntensity = useSpring(0.4, springConfig);

  // Handle mouse movement for interactive effects
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isMobile) {
      const { clientX, clientY } = event;
      setMousePosition({ x: clientX, y: clientY });
      mouseX.set(clientX);
      mouseY.set(clientY);
    }
  };

  // Auto-rotate hero content with smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % heroContent.length);
    }, 6000); // Longer duration for better reading experience
    
    return () => clearInterval(interval);
  }, []);

  // Hero hover effects
  const handleHeroHover = () => {
    if (!isMobile) {
      heroScale.set(1.02);
      glowIntensity.set(0.8);
    }
  };

  const handleHeroLeave = () => {
    heroScale.set(1);
    glowIntensity.set(0.4);
  };

  // Scroll to testimonials function
  const scrollToTestimonials = () => {
    const testimonialsSection = document.getElementById('testimonials');
    if (testimonialsSection) {
      testimonialsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Video modal handlers
  const handleVideoModalOpen = () => {
    setVideoModalOpen(true);
  };

  const handleVideoModalClose = () => {
    setVideoModalOpen(false);
    // Pause the video when modal closes
    const modalVideo = document.getElementById('modalDemoVideo') as HTMLVideoElement;
    if (modalVideo) {
      modalVideo.pause();
    }
  };

  return (
    <Box 
      sx={{ position: 'relative', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
    >
      {/* Revolutionary Animated Background System */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        background: `
          radial-gradient(circle at ${mousePosition.x * 0.1}% ${mousePosition.y * 0.1}%, 
            rgba(102, 126, 234, 0.15) 0%, transparent 70%),
          linear-gradient(135deg, 
            rgba(15, 23, 42, 0.95) 0%, 
            rgba(30, 41, 59, 0.9) 50%,
            rgba(51, 65, 85, 0.85) 100%)
        `,
      }}>
        {/* Floating geometric elements */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              borderRadius: Math.random() > 0.5 ? '50%' : '20%',
              background: `linear-gradient(45deg, 
                rgba(102, 126, 234, ${0.1 + Math.random() * 0.2}), 
                rgba(118, 75, 162, ${0.1 + Math.random() * 0.2}))`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(40px)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, -10, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
        
        {/* Particle system */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.6)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </Box>

      {/* Revolutionary Hero Section */}
      <motion.div
        style={{
          scale: heroScale,
          rotateX,
          rotateY,
          perspective: 1000,
        }}
        onHoverStart={handleHeroHover}
        onHoverEnd={handleHeroLeave}
      >
        <Box sx={{
          minHeight: '100vh',
          background: `
            linear-gradient(135deg, 
              rgba(102, 126, 234, 0.9) 0%, 
              rgba(118, 75, 162, 0.8) 50%,
              rgba(96, 165, 250, 0.9) 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>')
          `,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: '80px', sm: '90px' },
          pb: { xs: 8, md: 12 },
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)
            `,
            zIndex: 1,
          },
          '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)',
            zIndex: 1,
          }
        }}>
          <Container maxWidth="lg" sx={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            px: { xs: 3, sm: 4 },
            height: '100%',
          }}>
            {/* Revolutionary Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            >
              <Chip
                label={heroContent[currentIndex].accent}
                sx={{
                  mb: 4,
                  px: 3,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  animation: `${pulseGlow} 3s ease-in-out infinite`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
              />
            </motion.div>

            {/* Dynamic Hero Content */}
            <Box sx={{
              width: '100%',
              maxWidth: '900px',
              mb: { xs: 6, md: 8 },
            }}>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={`headline-${currentIndex}`}
                  initial={{ opacity: 0, y: 50, rotateX: -10 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -30, rotateX: 10 }}
                  transition={{ 
                    duration: 0.8, 
                    type: "spring", 
                    stiffness: 100,
                    damping: 15 
                  }}
                >
                  <Typography 
                    variant={isMobile ? 'h3' : isTablet ? 'h2' : 'h1'} 
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1.1,
                      mb: { xs: 3, sm: 4 },
                      textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      letterSpacing: '-0.02em',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${shimmer} 4s ease-in-out infinite`,
                      filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.3))',
                    }}
                  >
                    {heroContent[currentIndex].headline}
                  </Typography>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode='wait'>
                <motion.div
                  key={`subhead-${currentIndex}`}
                  initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.2,
                    type: "spring", 
                    stiffness: 120 
                  }}
                >
                  <Typography 
                    variant={isMobile ? 'h6' : 'h5'} 
                    sx={{
                      mb: { xs: 4, sm: 6 },
                      opacity: 0.95,
                      fontWeight: 400,
                      lineHeight: 1.6,
                      letterSpacing: '0.01em',
                      textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      maxWidth: '85%',
                      mx: 'auto',
                      color: 'rgba(255,255,255,0.9)',
                    }}
                  >
                    {heroContent[currentIndex].subhead}
                  </Typography>
                </motion.div>
              </AnimatePresence>

              {/* Revolutionary CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 150,
                  damping: 15,
                  delay: 0.4 
                }}
              >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 3,
                  mt: 2
                }}>
                  <Link to="/onboarding" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="contained"
                      size={isMobile ? 'large' : 'large'}
                      sx={{
                        px: { xs: 4, sm: 6 },
                        py: { xs: 1.5, sm: 2 },
                        fontWeight: 800,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
                        borderRadius: '16px',
                        textTransform: 'none',
                        letterSpacing: '0.02em',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                          transition: 'left 0.6s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 12px 40px rgba(245, 158, 11, 0.6)',
                          background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                          '&:before': {
                            left: '100%',
                          },
                        },
                        '&:active': {
                          transform: 'translateY(-1px) scale(0.98)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {heroContent[currentIndex].ctaPrimary}
                    </Button>
                  </Link>
                  
                  {heroContent[currentIndex].ctaSecondary === "📈 Success Stories" ? (
                    <Button
                      variant="outlined"
                      size={isMobile ? 'large' : 'large'}
                      onClick={scrollToTestimonials}
                      sx={{
                        px: { xs: 4, sm: 6 },
                        py: { xs: 1.5, sm: 2 },
                        fontWeight: 700,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.4)',
                        color: 'white',
                        backdropFilter: 'blur(20px)',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        textTransform: 'none',
                        letterSpacing: '0.02em',
                        position: 'relative',
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: 'rgba(255,255,255,0.8)',
                          background: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 8px 32px rgba(255,255,255,0.2)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {heroContent[currentIndex].ctaSecondary}
                    </Button>
                  ) : heroContent[currentIndex].ctaSecondary === "🎪 Watch Demo" ? (
                    <Button
                      variant="outlined"
                      size={isMobile ? 'large' : 'large'}
                      onClick={handleVideoModalOpen}
                      sx={{
                        px: { xs: 4, sm: 6 },
                        py: { xs: 1.5, sm: 2 },
                        fontWeight: 700,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.4)',
                        color: 'white',
                        backdropFilter: 'blur(20px)',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        textTransform: 'none',
                        letterSpacing: '0.02em',
                        position: 'relative',
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: 'rgba(255,255,255,0.8)',
                          background: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 8px 32px rgba(255,255,255,0.2)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {heroContent[currentIndex].ctaSecondary}
                    </Button>
                  ) : (
                    <Link to="/pricing" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="outlined"
                        size={isMobile ? 'large' : 'large'}
                        sx={{
                          px: { xs: 4, sm: 6 },
                          py: { xs: 1.5, sm: 2 },
                          fontWeight: 700,
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          borderWidth: 2,
                          borderColor: 'rgba(255,255,255,0.4)',
                          color: 'white',
                          backdropFilter: 'blur(20px)',
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          textTransform: 'none',
                          letterSpacing: '0.02em',
                          position: 'relative',
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: 'rgba(255,255,255,0.8)',
                            background: 'rgba(255,255,255,0.2)',
                            transform: 'translateY(-3px) scale(1.02)',
                            boxShadow: '0 8px 32px rgba(255,255,255,0.2)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        {heroContent[currentIndex].ctaSecondary}
                      </Button>
                    </Link>
                  )}
                </Box>
              </motion.div>
            </Box>

            {/* Revolutionary Video Demo Section */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{ width: '100%' }}
            >
              <Box sx={{
                width: '100%',
                maxWidth: '800px',
                mx: 'auto',
                position: 'relative',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  right: -20,
                  bottom: -20,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.1))',
                  borderRadius: '24px',
                  filter: 'blur(20px)',
                  zIndex: -1,
                },
              }}>
                <VideoDemoWithUseCases />
              </Box>
            </motion.div>
          </Container>
        </Box>
      </motion.div>

      {/* Rest of your components remain the same */}
      <Box sx={{
        position: 'relative',
        backgroundColor: 'background.default',
        zIndex: 2
      }}>
        <LiveChat />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <FeatureShowcase />
        </motion.div>

        {/* Visual separator between sections */}
        <Box sx={{ 
          height: '2px', 
          background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)',
          my: 4 
        }} />

        <Box 
          id="testimonials"
          sx={{
          backgroundColor: 'background.paper',
          py: { xs: 10, sm: 12, md: 16 },
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: '600px', md: '700px' },
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `
              radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%),
              linear-gradient(135deg, ${theme.palette.background.default} 0%, rgba(102, 126, 234, 0.05) 100%)
            `,
            zIndex: -1
          },
          '&:after': {
            content: '""',
            position: 'absolute',
            top: '-2px',
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.6) 25%, rgba(118, 75, 162, 0.6) 75%, transparent 100%)',
            zIndex: 1
          }
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Testimonials />
          </motion.div>
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

      {/* Video Modal */}
      <Modal
        open={videoModalOpen}
        onClose={handleVideoModalClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: 'relative',
            outline: 'none',
            width: '90%',
            maxWidth: '800px',
            height: 'auto',
            maxHeight: '90vh',
          }}
        >
          <Box sx={{
            position: 'relative',
            backgroundColor: 'rgba(20, 25, 35, 0.95)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
          }}>
            {/* Close Button */}
            <IconButton
              onClick={handleVideoModalClose}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Video Container */}
            <Box sx={{
              position: 'relative',
              paddingTop: '56.25%', // 16:9 aspect ratio
              width: '100%',
              background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            }}>
              {/* Actual Demo Video */}
              <video
                src="/demo_video.mp4"
                controls
                autoPlay
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
                id="modalDemoVideo"
              />
            </Box>

            {/* Video Info */}
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                color: 'white', 
                fontWeight: 700,
                mb: 1
              }}>
                🚀 See Our Platform in Action
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.6
              }}>
                Watch how our AI-powered matching system connects you with world-class experts in seconds. 
                From instant booking to breakthrough results, see why successful leaders choose our platform.
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Modal>
    </Box>
  );
}