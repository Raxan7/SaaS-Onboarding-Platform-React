import { Button, Box, useScrollTrigger, Typography, IconButton, useMediaQuery, useTheme, Chip, Backdrop, styled, Container } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import logo from './logo.jpg';
import { useAuth } from '../contexts/AuthContext';
import { keyframes } from '@emotion/react';

// Revolutionary animations
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.4); }
  50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.8), 0 0 60px rgba(102, 126, 234, 0.4); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Smooth scroll utility function
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const offsetTop = element.offsetTop - 100; // Account for fixed header
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
};

// Ultra-modern styled components
const UltraButton = styled(Button)(() => ({
  position: 'relative',
  overflow: 'hidden',
  fontWeight: 700,
  letterSpacing: '0.5px',
  borderRadius: '16px',
  padding: '12px 32px',
  textTransform: 'none',
  fontSize: '0.95rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  backdropFilter: 'blur(20px)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    '&:before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(-2px) scale(0.98)',
  }
}));

const GlowNavButton = styled(Button)(() => ({
  fontWeight: 600,
  position: 'relative',
  letterSpacing: '0.5px',
  borderRadius: '12px',
  padding: '8px 24px',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'transparent',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    padding: '1px',
    background: 'linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.3), transparent)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'xor',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '0%',
    height: '2px',
    bottom: '4px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    borderRadius: '2px',
    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
    '&:before': {
      opacity: 1,
    },
    '&:after': {
      width: '90%',
    },
  },
}));

// Create dynamic background based on scroll position
const getHeaderBackground = (scrolled: boolean, mouseX: number, mouseY: number) => {
  if (scrolled) {
    return {
      background: `linear-gradient(135deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(255, 255, 255, 0.98) 100%)`,
      backdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
    };
  }
  
  const xPercent = mouseX / window.innerWidth;
  const yPercent = mouseY / window.innerHeight;
  
  return {
    background: `
      radial-gradient(circle at ${xPercent * 100}% ${yPercent * 100}%, 
        rgba(102, 126, 234, 0.3) 0%, 
        rgba(118, 75, 162, 0.2) 35%, 
        rgba(15, 23, 42, 0.95) 70%),
      linear-gradient(135deg, 
        rgba(15, 23, 42, 0.9) 0%, 
        rgba(30, 41, 59, 0.85) 100%)`,
    backdropFilter: 'blur(16px) saturate(180%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };
};

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Revolutionary motion values for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const headerRotateX = useTransform(mouseY, [0, window.innerHeight], [2, -2]);
  const headerRotateY = useTransform(mouseX, [0, window.innerWidth], [-2, 2]);
  const logoScale = useSpring(1, { stiffness: 300, damping: 30 });

  const { isAuthenticated, logout, userType } = useAuth();
  const dashboardPath = userType === 'host' ? '/host-dashboard' : '/client-dashboard';

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle navigation with smooth scroll for same-page sections
  const handleNavigation = (item: typeof navigationItems[0]) => {
    if (item.isScroll && item.scrollTarget) {
      // If we're on the home page, just scroll to the section
      if (location.pathname === '/') {
        scrollToSection(item.scrollTarget);
      } else {
        // If we're on a different page, navigate to home first, then scroll
        navigate('/');
        // Use setTimeout to ensure navigation completes before scrolling
        setTimeout(() => {
          scrollToSection(item.scrollTarget);
        }, 100);
      }
    } else {
      // Regular navigation for non-scroll items
      navigate(item.path);
    }
  };

  // Track mouse movement for interactive effects
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isMobile) {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    }
  };

  // Logo hover effect
  const handleLogoHover = () => {
    logoScale.set(1.08);
  };

  const handleLogoLeave = () => {
    logoScale.set(1);
  };

  const navigationItems = [
    { label: '🚀 Features', path: '/features', icon: '🚀', isScroll: true, scrollTarget: 'features' },
    { label: '💎 Pricing', path: '/pricing', icon: '💎', isScroll: false },
    { label: '📞 Contact', path: '/contact', icon: '📞', isScroll: false },
  ];

  return (
    <>
      {/* Revolutionary Header with Interactive Background */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          rotateX: headerRotateX,
          rotateY: headerRotateY,
          perspective: 1000,
        }}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Box
          sx={{
            ...getHeaderBackground(trigger, mouseX.get(), mouseY.get()),
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            color: trigger ? 'text.primary' : 'common.white',
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: { xs: 1.5, sm: 2 },
                px: { xs: 2, sm: 3 },
                minHeight: { xs: 64, sm: 72 },
              }}
            >
              {/* Revolutionary Logo Section */}
              <motion.div
                style={{ scale: logoScale }}
                onHoverStart={handleLogoHover}
                onHoverEnd={handleLogoLeave}
              >
                <Box
                  component={Link}
                  to="/"
                  sx={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: -8,
                      left: -8,
                      right: -8,
                      bottom: -8,
                      background: 'linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
                      borderRadius: '16px',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      zIndex: -1,
                    },
                    '&:hover:before': {
                      opacity: 1,
                    },
                  }}
                >
                  <motion.img
                    src={logo}
                    alt="Revolutionary SaaS Platform"
                    style={{
                      height: isMobile ? 36 : 44,
                      filter: trigger ? 'none' : 'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
                      borderRadius: '8px',
                    }}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Typography
                      variant="h5"
                      component="span"
                      sx={{
                        ml: 2,
                        fontWeight: 800,
                        fontSize: { xs: '1.1rem', sm: '1.4rem' },
                        display: { xs: 'none', sm: 'inline' },
                        background: trigger 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: trigger ? 'none' : '0 0 30px rgba(255,255,255,0.5)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      SaaS Platform
                    </Typography>
                  </motion.div>
                </Box>
              </motion.div>

              {/* Desktop Navigation - Revolutionary Design */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                  >
                    <GlowNavButton
                      onClick={() => handleNavigation(item)}
                      sx={{
                        color: trigger ? 'text.primary' : 'common.white',
                        mx: 0.5,
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ marginRight: '8px' }}>{item.icon}</span>
                      {item.label.split(' ')[1]}
                    </GlowNavButton>
                  </motion.div>
                ))}

                {/* Authentication Buttons */}
                <Box sx={{ ml: 2, display: 'flex', gap: 1.5 }}>
                  {isAuthenticated ? (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Chip
                          label={`✨ ${userType === 'host' ? 'Host Mode' : 'Client Mode'}`}
                          sx={{
                            mr: 1,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
                            color: trigger ? 'text.primary' : 'common.white',
                            fontWeight: 600,
                            animation: `${pulseGlow} 3s ease-in-out infinite`,
                          }}
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link to={dashboardPath} style={{ textDecoration: 'none' }}>
                          <GlowNavButton
                            sx={{
                              color: trigger ? theme.palette.primary.main : 'common.white',
                              fontWeight: 700,
                            }}
                          >
                            🏠 Dashboard
                          </GlowNavButton>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Button
                          onClick={logout}
                          sx={{
                            color: trigger ? theme.palette.error.main : 'rgba(255,255,255,0.8)',
                            fontWeight: 600,
                            '&:hover': {
                              color: theme.palette.error.main,
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            },
                          }}
                        >
                          👋 Logout
                        </Button>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                          <GlowNavButton
                            sx={{
                              color: trigger ? 'text.primary' : 'common.white',
                            }}
                          >
                            🔐 Login
                          </GlowNavButton>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Link to="/onboarding" style={{ textDecoration: 'none' }}>
                          <UltraButton
                            sx={{
                              ml: 1,
                              animation: trigger ? 'none' : `${shimmer} 3s ease-in-out infinite`,
                              background: trigger 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                              color: trigger ? 'white' : 'white',
                              border: trigger ? 'none' : '1px solid rgba(255,255,255,0.3)',
                            }}
                          >
                            🚀 Start Free Trial
                          </UltraButton>
                        </Link>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </Box>
              </Box>

              {/* Tablet Navigation */}
              <Box sx={{ display: { xs: 'none', sm: 'flex', md: 'none' }, gap: 1 }}>
                {isAuthenticated ? (
                  <>
                    <Link to={dashboardPath} style={{ textDecoration: 'none' }}>
                      <GlowNavButton
                        sx={{
                          color: trigger ? theme.palette.primary.main : 'common.white',
                          fontSize: '0.85rem',
                        }}
                      >
                        Dashboard
                      </GlowNavButton>
                    </Link>
                    <Button
                      onClick={logout}
                      sx={{
                        color: trigger ? theme.palette.error.main : 'rgba(255,255,255,0.8)',
                        fontSize: '0.85rem',
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/pricing" style={{ textDecoration: 'none' }}>
                      <GlowNavButton
                        sx={{
                          color: trigger ? 'text.primary' : 'common.white',
                          fontSize: '0.85rem',
                        }}
                      >
                        💎 Pricing
                      </GlowNavButton>
                    </Link>
                    <Link to="/onboarding" style={{ textDecoration: 'none' }}>
                      <UltraButton
                        size="small"
                        sx={{
                          ml: 1,
                          fontSize: '0.8rem',
                          px: 2,
                          py: 1,
                        }}
                      >
                        🚀 Start Trial
                      </UltraButton>
                    </Link>
                  </>
                )}
              </Box>

              {/* Revolutionary Mobile Menu */}
              <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <IconButton
                    onClick={handleMobileMenuToggle}
                    sx={{
                      color: trigger ? 'text.primary' : 'common.white',
                      background: trigger 
                        ? 'rgba(102, 126, 234, 0.1)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: trigger 
                          ? 'rgba(102, 126, 234, 0.2)' 
                          : 'rgba(255, 255, 255, 0.2)',
                        transform: 'rotate(180deg)',
                      },
                    }}
                  >
                    <motion.div
                      animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </motion.div>
                  </IconButton>
                </motion.div>
              </Box>
            </Box>
          </Container>
        </Box>
      </motion.div>

      {/* Revolutionary Mobile Menu Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Backdrop
              open={mobileMenuOpen}
              onClick={handleMobileMenuToggle}
              sx={{
                zIndex: 1050,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(20px)',
              }}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ 
                type: 'spring',
                damping: 25,
                stiffness: 200,
                duration: 0.5 
              }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                height: '100vh',
                width: '80vw',
                maxWidth: '300px',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                zIndex: 1100,
                padding: '80px 20px 20px',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                  >
                    <Button
                      onClick={() => {
                        handleNavigation(item);
                        handleMobileMenuToggle();
                      }}
                      fullWidth
                      sx={{
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        py: 2,
                        px: 3,
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.2)',
                          transform: 'translateX(10px)',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                        },
                      }}
                    >
                      <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>{item.icon}</span>
                      {item.label}
                    </Button>
                  </motion.div>
                ))}

                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  {isAuthenticated ? (
                    <>
                      <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        <Link to={dashboardPath} style={{ textDecoration: 'none' }}>
                          <UltraButton
                            onClick={handleMobileMenuToggle}
                            fullWidth
                            sx={{ mb: 2, py: 1.5 }}
                          >
                            🏠 Go to Dashboard
                          </UltraButton>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <Button
                          onClick={() => {
                            handleMobileMenuToggle();
                            logout();
                          }}
                          fullWidth
                          sx={{
                            color: 'white',
                            border: '1px solid rgba(244, 67, 54, 0.5)',
                            py: 1.5,
                            '&:hover': {
                              background: 'rgba(244, 67, 54, 0.1)',
                              border: '1px solid rgba(244, 67, 54, 0.8)',
                            },
                          }}
                        >
                          👋 Logout
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                          <Button
                            onClick={handleMobileMenuToggle}
                            fullWidth
                            sx={{
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              py: 1.5,
                              mb: 2,
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)',
                              },
                            }}
                          >
                            🔐 Login
                          </Button>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <Link to="/onboarding" style={{ textDecoration: 'none' }}>
                          <UltraButton
                            onClick={handleMobileMenuToggle}
                            fullWidth
                            sx={{ py: 1.5 }}
                          >
                            🚀 Start Free Trial
                          </UltraButton>
                        </Link>
                      </motion.div>
                    </>
                  )}
                </Box>
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <Box sx={{ height: { xs: '64px', sm: '72px' } }} />
    </>
  );
}