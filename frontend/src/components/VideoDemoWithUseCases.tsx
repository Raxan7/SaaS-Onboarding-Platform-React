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
    title: 'Enterprise Sales',
    description: 'Streamline complex sales cycles with automated qualification',
    icon: '🏢',
  },
  {
    title: 'SMB Onboarding',
    description: 'Get small businesses up and running in minutes',
    icon: '🚀',
  },
  {
    title: 'E-commerce Integration',
    description: 'Seamless connection with popular e-commerce platforms',
    icon: '🛒',
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
      <Box>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          mb: 4,
          color: 'white',
          textAlign: 'center'
        }}>
          See How It Works
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
          Discover how our platform transforms onboarding experiences across industries with these common use cases.
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {useCases.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.title}>
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
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    p: 3
                  }}>
                    <Box sx={{ 
                      fontSize: '2.5rem',
                      mr: 2,
                      lineHeight: 1,
                      animation: `${floatAnimation} 4s ease-in-out infinite`,
                      animationDelay: `${index * 0.5}s`
                    }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 600,
                        color: 'white',
                        mb: 1
                      }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.8)'
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