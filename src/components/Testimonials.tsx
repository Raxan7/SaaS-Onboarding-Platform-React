import { Box, Typography, Avatar, Card, CardContent, IconButton, useMediaQuery } from '@mui/material';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Head of Growth, TechCorp',
    content: 'This platform reduced our onboarding time by 70% and increased activation rates significantly. The first meeting guarantee was a game-changer for our sales team.',
    avatar: '/avatars/1.jpg',
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager, SaaSify',
    content: 'The AI-powered onboarding wizard helped us personalize the experience for different user segments. Our customer satisfaction scores went up by 40%.',
    avatar: '/avatars/2.jpg',
  },
  {
    name: 'David Rodriguez',
    role: 'CEO, StartUpX',
    content: 'As a lean startup, we needed quick wins. The qualified meeting guarantee gave us immediate ROI during our trial period. Highly recommended!',
    avatar: '/avatars/3.jpg',
  },
  {
    name: 'Emily Wilson',
    role: 'CMO, GrowthHack',
    content: 'The seamless integration with our existing tools made adoption effortless. Our team was up and running in minutes, not days.',
    avatar: '/avatars/4.jpg',
  },
  {
    name: 'James Peterson',
    role: 'Director of Sales, EnterpriseCo',
    content: 'We saw a 3x increase in qualified meetings within the first month. The platform pays for itself many times over.',
    avatar: '/avatars/5.jpg',
  },
];

export default function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const controls = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [autoSlide, setAutoSlide] = useState(true);
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');
  
  // Determine items per view based on screen size
  const itemsPerView = isMobile ? 1 : isTablet ? 2 : 3;

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [autoSlide, currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => 
      prev >= testimonials.length - itemsPerView ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => 
      prev <= 0 ? testimonials.length - itemsPerView : prev - 1
    );
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex, 
    currentIndex + itemsPerView
  );

  // Fill with testimonials from start if we reach the end
  const displayTestimonials = [
    ...visibleTestimonials,
    ...(visibleTestimonials.length < itemsPerView 
      ? testimonials.slice(0, itemsPerView - visibleTestimonials.length) 
      : [])
  ];

  return (
    <Box 
      ref={ref}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 4, md: 6 },
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.9) 100%)',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(0,123,255,0.03) 0%, transparent 70%)',
          zIndex: 0
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography 
          variant={isMobile ? 'h4' : 'h3'} 
          textAlign="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: 'primary.dark',
            mb: 2,
            px: 2
          }}
        >
          Trusted by Industry Leaders
        </Typography>
        <Typography 
          variant={isMobile ? 'body1' : 'h6'} 
          textAlign="center" 
          color="text.secondary" 
          sx={{ 
            mb: { xs: 4, md: 8 }, 
            maxWidth: 600, 
            mx: 'auto',
            px: 2
          }}
        >
          Don't just take our word for it
        </Typography>

        <Box 
          sx={{ 
            position: 'relative',
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: 0, sm: 4 },
            height: { xs: 'auto', md: '400px' },
            minHeight: { xs: '350px', md: 'auto' }
          }}
          onMouseEnter={() => setAutoSlide(false)}
          onMouseLeave={() => setAutoSlide(true)}
          onTouchStart={() => setAutoSlide(false)}
        >
          {!isMobile && (
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: { xs: 0, sm: -40 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: 'primary.main',
                backgroundColor: 'background.paper',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'common.white'
                }
              }}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
          )}

          <Box sx={{
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            position: 'relative',
            overflowX: 'hidden',
            mx: { xs: 2, sm: 0 }
          }}>
            <AnimatePresence custom={direction}>
              {displayTestimonials.map((testimonial, index) => (
                <motion.div
                  key={`${testimonial.name}-${currentIndex}`}
                  custom={direction}
                  initial={{ 
                    opacity: 0,
                    x: direction > 0 ? (isMobile ? 50 : 100) : (isMobile ? -50 : -100)
                  }}
                  animate={{ 
                    opacity: 1,
                    x: 0,
                    transition: { 
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1]
                    }
                  }}
                  exit={{
                    opacity: 0,
                    x: direction > 0 ? (isMobile ? -50 : -100) : (isMobile ? 50 : 100),
                    transition: { 
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1]
                    }
                  }}
                  style={{
                    position: isMobile ? 'relative' : 'absolute',
                    width: isMobile ? '100%' : `calc(${100 / itemsPerView}% - 32px)`,
                    left: isMobile ? 0 : `${index * (100 / itemsPerView)}%`,
                    padding: isMobile ? '0 8px' : '0 16px',
                    flexShrink: 0
                  }}
                >
                  <Card sx={{ 
                    height: { xs: '320px', md: '300px' },
                    borderRadius: 3,
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    mb: { xs: 2, md: 0 },
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 40px rgba(0, 107, 194, 0.15)'
                    }
                  }}>
                    <CardContent sx={{ 
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'linear-gradient(to bottom right, rgba(0,123,255,0.03) 0%, rgba(108,99,255,0.03) 100%)'
                    }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 3, 
                          fontStyle: 'italic',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.6,
                          flexGrow: 1
                        }}
                      >
                        "{testimonial.content}"
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mt: 'auto'
                      }}>
                        <Avatar 
                          src={testimonial.avatar} 
                          sx={{ 
                            width: { xs: 48, md: 56 }, 
                            height: { xs: 48, md: 56 }, 
                            mr: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }} 
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>

          {!isMobile && (
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: { xs: 0, sm: -40 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: 'primary.main',
                backgroundColor: 'background.paper',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'common.white'
                }
              }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          )}
        </Box>

        {/* Mobile navigation arrows */}
        {isMobile && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mt: 2
          }}>
            <IconButton
              onClick={handlePrev}
              sx={{
                color: 'primary.main',
                backgroundColor: 'background.paper',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'common.white'
                }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                color: 'primary.main',
                backgroundColor: 'background.paper',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'common.white'
                }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}

        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: { xs: 3, md: 4 },
          gap: 1,
          flexWrap: 'wrap'
        }}>
          {Array.from({ length: Math.ceil(testimonials.length / itemsPerView) }).map((_, index) => (
            <Box
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index * itemsPerView);
              }}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: currentIndex === index * itemsPerView ? 'primary.main' : 'divider',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'primary.light'
                }
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}