import { Box, Typography, Avatar, CardContent, IconButton, useMediaQuery, Rating, Chip, styled } from '@mui/material';
import { motion, useAnimation, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState, useRef } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Revolutionary styled components with 3D effects
const StyledCard = styled(motion.div)<{ gradient: string }>(({ gradient }) => ({
  height: '340px', // Even further reduced height to eliminate all extra space
  borderRadius: '24px',
  background: `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)`,
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.3)',
  position: 'relative',
  overflow: 'hidden', // Prevents any scroll
  cursor: 'pointer',
  transformStyle: 'preserve-3d',
  perspective: '1000px',
  display: 'flex',
  flexDirection: 'column',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: gradient,
    opacity: 0.1,
    borderRadius: '24px',
    zIndex: 0,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
    zIndex: 1,
  },
  '&:hover::after': {
    transform: 'translateX(100%)',
  },
  '&:hover': {
    transform: 'translateY(-10px) rotateX(5deg) rotateY(5deg)',
    boxShadow: `
      0 25px 50px rgba(0,0,0,0.15),
      0 0 0 1px rgba(255,255,255,0.5),
      inset 0 1px 0 rgba(255,255,255,0.9)
    `,
  },
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
}));

const FloatingElement = styled(motion.div)({
  position: 'absolute',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
  filter: 'blur(1px)',
  zIndex: 0,
});

const PremiumBadge = styled(Box)<{ gradient: string }>(({ gradient }) => ({
  background: gradient,
  borderRadius: '50px',
  padding: '4px 12px',
  color: 'white',
  fontSize: '0.75rem',
  fontWeight: 600,
  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Head of Growth',
    company: 'TechCorp',
    content: 'This platform reduced our onboarding time by 70% and increased activation rates significantly. The first meeting guarantee was a game-changer for our sales team.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    revenue: '$2.4M ARR',
    highlight: 'Increased conversion by 340%',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    stats: { growth: '+340%', timeframe: '3 months' },
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'SaaSify',
    content: 'The AI-powered onboarding wizard helped us personalize the experience for different user segments. Our customer satisfaction scores went up by 40%.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    revenue: '$1.8M ARR',
    highlight: 'Customer satisfaction +40%',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    stats: { growth: '+40%', timeframe: '2 months' },
  },
  {
    name: 'David Rodriguez',
    role: 'CEO',
    company: 'StartUpX',
    content: 'As a lean startup, we needed quick wins. The qualified meeting guarantee gave us immediate ROI during our trial period. Highly recommended!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    revenue: '$850K ARR',
    highlight: 'ROI within 30 days',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    stats: { growth: '+180%', timeframe: '1 month' },
  },
  {
    name: 'Emily Wilson',
    role: 'CMO',
    company: 'GrowthHack',
    content: 'The seamless integration with our existing tools made adoption effortless. Our team was up and running in minutes, not days.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    revenue: '$3.2M ARR',
    highlight: 'Setup in under 5 minutes',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    stats: { growth: '+220%', timeframe: '1 week' },
  },
  {
    name: 'James Peterson',
    role: 'Director of Sales',
    company: 'EnterpriseCo',
    content: 'We saw a 3x increase in qualified meetings within the first month. The platform pays for itself many times over.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    revenue: '$5.1M ARR',
    highlight: '3x more qualified meetings',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    stats: { growth: '+300%', timeframe: '1 month' },
  },
  {
    name: 'Lisa Thompson',
    role: 'VP of Marketing',
    company: 'ScaleUp',
    content: 'The analytics and insights helped us understand our customer journey better. We optimized our funnel and saw immediate results.',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    revenue: '$1.5M ARR',
    highlight: 'Funnel optimization +200%',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    stats: { growth: '+200%', timeframe: '6 weeks' },
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');
  
  // Mouse tracking for 3D effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Determine items per view based on screen size
  const itemsPerView = isMobile ? 1 : isTablet ? 2 : 3;

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || hoveredCard !== null) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [autoSlide, currentIndex, hoveredCard]);

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

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);
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
        py: { xs: 6, md: 10 },
        background: `
          radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0,
        }
      }}
    >
      {/* Floating background elements */}
      {Array.from({ length: 8 }).map((_, i) => (
        <FloatingElement
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          sx={{
            width: { xs: 40, md: 80 },
            height: { xs: 40, md: 80 },
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
          }}
        />
      ))}

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
          }}
        >
          <Typography 
            variant={isMobile ? 'h3' : 'h2'} 
            textAlign="center" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              px: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Trusted by Industry Leaders
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            textAlign="center" 
            color="text.secondary" 
            sx={{ 
              mb: { xs: 6, md: 10 }, 
              maxWidth: 700, 
              mx: 'auto',
              px: 2,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Join thousands of companies who've transformed their growth with our platform
          </Typography>
        </motion.div>

        <Box 
          ref={containerRef}
          sx={{ 
            position: 'relative',
            maxWidth: '1400px',
            mx: 'auto',
            px: { xs: 4, sm: 6, md: 8, lg: 12 }, // Increased left and right padding
            height: { xs: 'auto', md: '340px' }, // Updated to match new card height
            minHeight: { xs: '340px', md: 'auto' } // Reduced min height for mobile
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setAutoSlide(false)}
          onMouseLeave={() => {
            setAutoSlide(true);
            setHoveredCard(null);
          }}
        >
          {!isMobile && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
              }}
            >
              <IconButton
                onClick={handlePrev}
                sx={{
                  width: 50,
                  height: 50,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'primary.main',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <ChevronLeftIcon fontSize="medium" />
              </IconButton>
            </motion.div>
          )}

          <Box sx={{
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            position: 'relative',
            overflowX: 'hidden',
          }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.23, 1, 0.32, 1]
                }}
                style={{
                  display: 'flex',
                  gap: isMobile ? 16 : 24,
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                }}
              >
                {displayTestimonials.map((testimonial, index) => {
                  const cardMouseX = useSpring(0, { stiffness: 500, damping: 100 });
                  const cardMouseY = useSpring(0, { stiffness: 500, damping: 100 });
                  
                  const rotateX = useTransform(cardMouseY, [-100, 100], [10, -10]);
                  const rotateY = useTransform(cardMouseX, [-100, 100], [-10, 10]);

                  return (
                    <motion.div
                      key={`${testimonial.name}-${currentIndex}`}
                      style={{
                        flex: isMobile ? '0 0 100%' : `0 0 calc(${100 / itemsPerView}% - 16px)`,
                        height: '100%',
                      }}
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { 
                          delay: index * 0.1,
                          duration: 0.6,
                          ease: [0.23, 1, 0.32, 1]
                        }
                      }}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left - rect.width / 2;
                        const y = e.clientY - rect.top - rect.height / 2;
                        cardMouseX.set(x);
                        cardMouseY.set(y);
                      }}
                      onMouseLeave={() => {
                        cardMouseX.set(0);
                        cardMouseY.set(0);
                      }}
                    >
                      <StyledCard
                        gradient={testimonial.gradient}
                        style={{
                          rotateX: hoveredCard === index ? rotateX : 0,
                          rotateY: hoveredCard === index ? rotateY : 0,
                          scale: hoveredCard === index ? 1.02 : 1,
                        }}
                        whileHover={{
                          transition: { duration: 0.3 }
                        }}
                      >
                        <CardContent sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          zIndex: 2,
                          p: { xs: 1.5, md: 2 }, // Further reduced padding for better fit
                          justifyContent: 'space-between', // Distribute content evenly
                        }}>
                          {/* Header with rating and quote icon */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            mb: 1  
                          }}>
                            <Rating 
                              value={testimonial.rating} 
                              readOnly 
                              size="small"
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: '#FFD700',
                                  filter: 'drop-shadow(0 2px 4px rgba(255,215,0,0.3))',
                                }
                              }}
                            />
                            <FormatQuoteIcon 
                              sx={{ 
                                color: 'primary.main', 
                                opacity: 0.3,
                                fontSize: '2rem',
                                transform: 'rotate(180deg)',
                              }} 
                            />
                          </Box>

                          {/* Testimonial content */}
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 1,  
                              fontStyle: 'italic',
                              fontSize: { xs: '0.9rem', md: '0.95rem' }, // Even smaller font
                              lineHeight: 1.4, // More compact line height
                              flexGrow: 1,
                              color: 'text.primary',
                              fontWeight: 400,
                              // Removed scroll functionality - content fits within card height
                            }}
                          >
                            "{testimonial.content}"
                          </Typography>

                          {/* Stats and highlight */}
                          <Box sx={{ mb: 1.5 }}>  
                            <PremiumBadge gradient={testimonial.gradient}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TrendingUpIcon sx={{ fontSize: '0.8rem' }} />
                                {testimonial.highlight}
                              </Box>
                            </PremiumBadge>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block',
                                mt: 1,
                                fontWeight: 600,
                                color: 'primary.main'
                              }}
                            >
                              {testimonial.stats.growth} growth in {testimonial.stats.timeframe}
                            </Typography>
                          </Box>

                          {/* User info */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: 'auto'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <Avatar 
                                  src={testimonial.avatar} 
                                  sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    mr: 2,
                                    border: '3px solid rgba(255,255,255,0.8)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                  }} 
                                />
                              </motion.div>
                              <Box>
                                <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
                                  {testimonial.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  {testimonial.role}
                                </Typography>
                                <Typography variant="body2" color="primary.main" fontWeight={600}>
                                  {testimonial.company}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={testimonial.revenue}
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                boxShadow: '0 4px 15px rgba(67,233,123,0.3)',
                              }}
                            />
                          </Box>
                        </CardContent>
                      </StyledCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </Box>

          {!isMobile && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
              }}
            >
              <IconButton
                onClick={handleNext}
                sx={{
                  width: 50,
                  height: 50,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'primary.main',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <ChevronRightIcon fontSize="medium" />
              </IconButton>
            </motion.div>
          )}
        </Box>

        {/* Mobile navigation */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              mt: 4
            }}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <IconButton
                  onClick={handlePrev}
                  sx={{
                    width: 50,
                    height: 50,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'primary.main',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    width: 50,
                    height: 50,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'primary.main',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </motion.div>
            </Box>
          </motion.div>
        )}

        {/* Enhanced pagination dots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: { xs: 4, md: 6 },
            gap: 1,
            flexWrap: 'wrap'
          }}>
            {Array.from({ length: Math.ceil(testimonials.length / itemsPerView) }).map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Box
                  onClick={() => {
                    setDirection(index > Math.floor(currentIndex / itemsPerView) ? 1 : -1);
                    setCurrentIndex(index * itemsPerView);
                  }}
                  sx={{
                    width: Math.floor(currentIndex / itemsPerView) === index ? 24 : 12,
                    height: 12,
                    borderRadius: 6,
                    background: Math.floor(currentIndex / itemsPerView) === index 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                    boxShadow: Math.floor(currentIndex / itemsPerView) === index 
                      ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                      : 'none',
                    '&:hover': {
                      background: Math.floor(currentIndex / itemsPerView) === index 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'rgba(102, 126, 234, 0.3)',
                    }
                  }}
                />
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}