import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Stepper, 
  Step, 
  StepLabel, 
  Paper, 
  useTheme, 
  IconButton,
  Portal,
  Fade,
  Backdrop
} from '@mui/material';
import { Close, ArrowBack, ArrowForward } from '@mui/icons-material';

interface WalkThroughProps {
  open: boolean;
  onClose: () => void;
}

interface StepTarget {
  selector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const WalkThrough = ({ open, onClose }: WalkThroughProps) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [contentPosition, setContentPosition] = useState({ top: 0, left: 0 });

  // Define walk-through steps with their target elements and content
  const steps: StepTarget[] = [
    {
      selector: 'h1', // Welcome heading
      title: 'Welcome to your Dashboard',
      description: 'This is your central hub for all your meeting activities. Here you\'ll find your upcoming meetings, active sessions, and access to all platform features.',
      position: 'bottom'
    },
    {
      selector: '[data-tour="active-meeting"]',
      title: 'Active Meeting',
      description: 'This shows your current or next upcoming meeting. You can join directly from here when it\'s time.',
      position: 'left'
    },
    {
      selector: '[data-tour="new-meeting-button"]',
      title: 'Schedule New Meetings',
      description: 'Click here to schedule new meetings with your clients or team members.',
      position: 'bottom'
    },
    {
      selector: '[data-tour="meeting-usage"]',
      title: 'Meeting Usage',
      description: 'Track your monthly meeting usage based on your subscription plan.',
      position: 'left'
    },
    {
      selector: '[data-tour="past-meetings"]',
      title: 'Meeting History',
      description: 'View your past meetings and their details here.',
      position: 'top'
    },
    {
      selector: 'a[href="/subscription"]',
      title: 'Subscription & Onboarding',
      description: 'Visit your Subscription page to manage your plan and track your onboarding progress.',
      position: 'right'
    }
  ];

  const findTargetElement = (selector: string) => {
    return document.querySelector(selector);
  };

  const calculatePositions = () => {
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Set highlight position
    setHighlightPosition({
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height
    });

    // Calculate content position based on specified position
    const position = steps[activeStep].position;
    const buffer = 20; // Space between target and content

    let contentTop = 0;
    let contentLeft = 0;

    switch (position) {
      case 'top':
        contentTop = rect.top + scrollY - buffer;
        contentLeft = rect.left + scrollX + rect.width / 2;
        break;
      case 'bottom':
        contentTop = rect.bottom + scrollY + buffer;
        contentLeft = rect.left + scrollX + rect.width / 2;
        break;
      case 'left':
        contentTop = rect.top + scrollY + rect.height / 2;
        contentLeft = rect.left + scrollX - buffer;
        break;
      case 'right':
        contentTop = rect.top + scrollY + rect.height / 2;
        contentLeft = rect.right + scrollX + buffer;
        break;
      case 'center':
        contentTop = rect.top + scrollY + rect.height / 2;
        contentLeft = rect.left + scrollX + rect.width / 2;
        break;
    }

    setContentPosition({ top: contentTop, left: contentLeft });

    // Scroll to make sure the element is visible
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };

  useEffect(() => {
    if (!open) return;

    const currentSelector = steps[activeStep].selector;
    const element = findTargetElement(currentSelector);
    
    if (!element) {
      console.warn(`Element with selector "${currentSelector}" not found. This might be on another page.`);
      
      // For selector that references elements on other pages, we'll show a message
      // The element will be null, so the UI will adjust accordingly
    }
    
    setTargetElement(element);
  }, [activeStep, open]);

  useEffect(() => {
    if (targetElement) {
      calculatePositions();
      
      // Recalculate on window resize
      const handleResize = () => calculatePositions();
      window.addEventListener('resize', handleResize);
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [targetElement]);

  const handleNext = () => {
    setActiveStep((prevStep) => {
      const nextStep = prevStep + 1;
      return nextStep < steps.length ? nextStep : prevStep;
    });
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleFinish = () => {
    // Save to localStorage that the walk-through has been completed
    localStorage.setItem('walkThroughCompleted', 'true');
    onClose();
  };

  if (!open) return null;

  return (
    <Portal>
      <>
        <Backdrop
          open={open}
          sx={{
            zIndex: 9998,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          onClick={onClose}
        />
        
        {/* Highlight box around target element */}
        {targetElement && (
          <Box
            sx={{
              position: 'absolute',
              top: highlightPosition.top,
              left: highlightPosition.left,
              width: highlightPosition.width,
              height: highlightPosition.height,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              borderRadius: 2,
              zIndex: 9999,
              pointerEvents: 'none',
              border: `2px solid ${theme.palette.primary.main}`,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 0 ${theme.palette.primary.main}`,
                },
                '70%': {
                  boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 10px rgba(0, 0, 0, 0)`,
                },
                '100%': {
                  boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 0 ${theme.palette.primary.main}`,
                }
              }
            }}
          />
        )}
        
        {/* Content box */}
        <Fade in={true}>
          <Paper
            elevation={5}
            sx={{
              position: 'absolute',
              zIndex: 10000,
              p: 3,
              maxWidth: 350,
              borderRadius: 2,
              transform: targetElement 
                ? `translate(${steps[activeStep].position === 'left' ? -100 : steps[activeStep].position === 'right' ? 20 : -50}%, ${steps[activeStep].position === 'top' ? -100 : steps[activeStep].position === 'bottom' ? 20 : -50}%)`
                : 'translate(-50%, -50%)',
              top: targetElement ? contentPosition.top : '50%',
              left: targetElement ? contentPosition.left : '50%',
              backgroundColor: 'white',
              boxShadow: theme.shadows[10]
            }}
          >
            <IconButton 
              size="small" 
              onClick={onClose}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <Close fontSize="small" />
            </IconButton>
            
            <Typography variant="h6" gutterBottom color="primary">
              {steps[activeStep].title}
            </Typography>
            
            <Typography variant="body2" paragraph sx={{ mb: 3 }}>
              {!targetElement && steps[activeStep].selector === 'a[href="/subscription"]' 
                ? "Navigate to the Subscription page via the sidebar to see your onboarding progress and manage your subscription."
                : steps[activeStep].description}
            </Typography>
            
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2, '& .MuiStepLabel-root': { fontSize: '0.875rem' }, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }}>
              {steps.map((_, index) => (
                <Step key={index}>
                  <StepLabel />
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleFinish}
                >
                  Finish
                </Button>
              ) : (
                <>
                  {!targetElement && steps[activeStep].selector === 'a[href="/subscription"]' ? (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => window.location.href = "/subscription"}
                    >
                      Go to Subscription
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleNext}
                      endIcon={<ArrowForward />}
                    >
                      Next
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Fade>
      </>
    </Portal>
  );
};

export default WalkThrough;
