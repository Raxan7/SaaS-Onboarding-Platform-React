import { Box, Typography, Grid, Card, CardContent, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { keyframes } from '@emotion/react';

// Animation keyframes
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start({
        scale: 1.05,
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
      mt: { xs: 6, md: 10 },
      mb: { xs: 4, md: 0 },
      position: 'relative',
      zIndex: 2
    }}>
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, md: 6}}>
          <motion.div
            animate={controls}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            style={{ position: 'relative' }}
          >
            <Box sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              aspectRatio: '16/9',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              backgroundImage: 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(108,99,255,0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconButton
                sx={{
                  position: 'absolute',
                  color: 'white',
                  backgroundColor: 'primary.main',
                  width: 80,
                  height: 80,
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    animation: `${pulseAnimation} 2s infinite`
                  }
                }}
              >
                <PlayCircleFilledWhiteIcon sx={{ fontSize: 48 }} />
              </IconButton>
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
        </Grid>
        
        <Grid size={{ xs: 12, md: 6}}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            mb: 3,
            color: 'white'
          }}>
            See How It Works
          </Typography>
          
          <Typography variant="body1" sx={{ 
            mb: 4,
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            lineHeight: 1.7
          }}>
            Discover how our platform transforms onboarding experiences across industries with these common use cases.
          </Typography>
          
          <Grid container spacing={2}>
            {useCases.map((item, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={item.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{
                    height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    }
                  }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box sx={{ 
                        fontSize: '2rem',
                        mr: 2,
                        lineHeight: 1
                      }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 600,
                          color: 'white',
                          mb: 0.5
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default VideoDemoWithUseCases;