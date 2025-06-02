import { Box, Typography, Grid, Card, CardContent, IconButton } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import { keyframes } from '@emotion/react';

// Animation keyframes
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

interface UseCase {
  title: string;
  description: string;
  icon: string;
}

interface VideoDemoWithUseCasesProps {
  useCases?: UseCase[];
}

const defaultUseCases: UseCase[] = [
  {
    title: 'Instant Expert Matching',
    description: 'Our AI analyzes your needs and connects you with the perfect expert in seconds—no browsing, no guesswork, just results.',
    icon: '🎯',
  },
  {
    title: 'One-Click Consultations',
    description: 'Book game-changing sessions with world-class experts instantly. Skip the back-and-forth emails and lengthy scheduling.',
    icon: '⚡',
  },
  {
    title: 'Breakthrough Results Guaranteed',
    description: 'Get actionable insights that transform your business. If you don\'t see measurable progress, we\'ll refund your session.',
    icon: '🚀',
  },
  {
    title: 'Elite Expert Network',
    description: 'Access exclusive consultations with industry leaders, Fortune 500 advisors, and proven entrepreneurs who\'ve built billion-dollar companies.',
    icon: '💎',
  },
  {
    title: 'Smart Calendar Integration',
    description: 'Seamlessly syncs with your calendar and automatically finds the perfect time slots for maximum productivity and convenience.',
    icon: '📅',
  },
  {
    title: 'ROI-Driven Sessions',
    description: 'Every consultation is optimized for maximum value. Get strategies that pay for themselves within 30 days or get your money back.',
    icon: '💰',
  },
];

const VideoDemoWithUseCases = ({ useCases = defaultUseCases }: VideoDemoWithUseCasesProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const controls = useAnimation();

  const handlePlayPause = () => {
    const videoElement = document.getElementById('demoVideo') as HTMLVideoElement;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (isHovered) {
      controls.start({
        scale: 1.02,
        transition: { duration: 0.3 }
      });
    } else {
      controls.start({
        scale: 1,
        transition: { duration: 0.3 }
      });
    }
  }, [isHovered, controls]);

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '1200px',
      mx: 'auto',
      px: { xs: 2, sm: 3 }
    }}>
      {/* Video Section */}
      <Box sx={{ mb: 6 }}>
        <motion.div
          animate={controls}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          style={{ position: 'relative' }}
        >
          <Box sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            aspectRatio: '16/9',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backgroundImage: 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(108,99,255,0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video
              src="/demo_video.mp4"
              controls
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              id="demoVideo"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            />
            {isHovered && (
              <IconButton
                sx={{
                  position: 'absolute',
                  color: 'white',
                  backgroundColor: 'primary.main',
                  width: { xs: 64, sm: 80 },
                  height: { xs: 64, sm: 80 },
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    animation: `${pulseAnimation} 2s infinite`,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <PauseCircleFilledIcon sx={{ fontSize: { xs: 36, sm: 48 } }} />
                ) : (
                  <PlayCircleFilledWhiteIcon sx={{ fontSize: { xs: 36, sm: 48 } }} />
                )}
              </IconButton>
            )}
            <Typography variant="body1" sx={{ 
              position: 'absolute',
              bottom: 16,
              left: 16,
              color: 'white',
              fontWeight: 500,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              Watch product demo (2:34)
            </Typography>
          </Box>
        </motion.div>
      </Box>
      
      {/* Use Cases Section */}
      <Box id="features">
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          mb: 4,
          color: 'white',
          textAlign: 'center'
        }}>
          🌟 Why Successful Leaders Choose Our Platform
        </Typography>
        
        <Typography variant="body1" sx={{ 
          mb: 6,
          color: 'rgba(255,255,255,0.9)',
          fontSize: '1.1rem',
          lineHeight: 1.7,
          textAlign: 'center',
          maxWidth: '800px',
          mx: 'auto',
          px: { xs: 2, sm: 0 }
        }}>
          Join thousands of entrepreneurs, executives, and visionaries who've transformed their businesses with our revolutionary expert consultation platform. Here's what makes us different:
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {useCases.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ y: -5 }}
              >
                <Card sx={{
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
                    backgroundSize: '300% 100%',
                    animation: 'gradient-shift 3s ease infinite',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 30px rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  },
                  '@keyframes gradient-shift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                  }
                }}>
                  <CardContent sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                    height: '100%'
                  }}>
                    <Box sx={{ 
                      fontSize: '3rem',
                      mb: 3,
                      lineHeight: 1,
                      animation: `${floatAnimation} 4s ease-in-out infinite`,
                      animationDelay: `${index * 0.5}s`,
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                    }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: 'white',
                        mb: 2,
                        fontSize: '1.2rem',
                        lineHeight: 1.3
                      }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.85)',
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                      }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default VideoDemoWithUseCases;