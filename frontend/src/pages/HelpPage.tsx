import { Typography, Box, Paper, Accordion, AccordionSummary, AccordionDetails, Button, Link, useTheme } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, VideoLibrary as VideoIcon, Chat as ChatIcon, Book as GuideIcon } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';

const HelpPage = () => {
  const theme = useTheme();

  const faqItems = [
    {
      question: 'How do I schedule a meeting?',
      answer: 'To schedule a meeting, navigate to the Meetings page and click on "New Meeting" button. Fill in the meeting details including title, date, time, and goals. Once submitted, the meeting will be added to your calendar and the other participant will receive an invitation.'
    },
    {
      question: 'How do I update my subscription?',
      answer: 'You can update your subscription by going to the Subscription page. There you will find your current plan and options to upgrade, downgrade, or cancel your subscription. Changes to your subscription will take effect at the beginning of your next billing cycle.'
    },
    {
      question: 'Can I integrate with my existing calendar?',
      answer: 'Yes, our platform integrates with popular calendar services including Google Calendar, Microsoft Outlook, and Apple Calendar. To set up integration, go to the Settings page and navigate to the Integrations tab where you can connect your preferred calendar service.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the login page and click on "Forgot Password". Enter your email address and you will receive a password reset link. Alternatively, you can also change your password in the Settings page under the Security tab by providing your current password and new password.'
    },
    {
      question: 'What happens if I miss a scheduled meeting?',
      answer: 'If you miss a scheduled meeting, it will be marked as "Missed" in your meetings history. We recommend rescheduling the meeting as soon as possible. You can easily do this by finding the missed meeting in your meetings list and clicking the "Reschedule" option.'
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Help Center
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Find answers to common questions and learn how to use our platform
        </Typography>
      </Box>

      {/* Quick Help Options */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, 
          gap: 3,
          mb: 4 
        }}
      >
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 2, 
            p: 3, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.light',
              color: 'primary.main',
              width: 60,
              height: 60,
              borderRadius: '50%',
              mb: 2
            }}
          >
            <VideoIcon fontSize="large" />
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Video Tutorials
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ flex: 1 }}>
            Watch step-by-step video guides on how to use all features of our platform.
          </Typography>
          <Button variant="outlined" color="primary">
            View Tutorials
          </Button>
        </Paper>
        
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 2, 
            p: 3, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'secondary.light',
              color: 'secondary.main',
              width: 60,
              height: 60,
              borderRadius: '50%',
              mb: 2
            }}
          >
            <GuideIcon fontSize="large" />
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            User Guides
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ flex: 1 }}>
            Comprehensive documentation and guides to help you get the most out of our platform.
          </Typography>
          <Button variant="outlined" color="secondary">
            Read Guides
          </Button>
        </Paper>
        
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 2, 
            p: 3, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            bgcolor: theme.palette.primary.main,
            color: 'white'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: 60,
              height: 60,
              borderRadius: '50%',
              mb: 2
            }}
          >
            <ChatIcon fontSize="large" />
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Live Support
          </Typography>
          <Typography variant="body2" paragraph sx={{ flex: 1 }}>
            Get immediate help from our support team during business hours.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.8)'
              }
            }}
          >
            Contact Support
          </Button>
        </Paper>
      </Box>

      {/* Frequently Asked Questions */}
      <Paper elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600}>
            Frequently Asked Questions
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          {faqItems.map((faq, index) => (
            <Accordion 
              key={index} 
              disableGutters 
              elevation={0}
              sx={{ 
                border: 'none', 
                '&:before': { display: 'none' },
                '&:not(:last-child)': { 
                  borderBottom: `1px solid ${theme.palette.divider}` 
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  px: { xs: 2, sm: 3 }, 
                  py: 1.5,
                  '&.Mui-expanded': {
                    minHeight: 'unset'
                  },
                }}
              >
                <Typography variant="body1" fontWeight={500}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, py: 1, pb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>
      
      {/* Additional Resources */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600}>
            Additional Resources
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            Check out these additional resources to learn more about our platform:
          </Typography>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: 2 
            }}
          >
            <Link href="#" underline="none">
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[3],
                    bgcolor: 'rgba(0, 0, 0, 0.01)'
                  }
                }}
              >
                <Typography variant="body1" fontWeight={500}>
                  Getting Started Guide
                </Typography>
              </Paper>
            </Link>
            <Link href="#" underline="none">
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[3],
                    bgcolor: 'rgba(0, 0, 0, 0.01)'
                  }
                }}
              >
                <Typography variant="body1" fontWeight={500}>
                  API Documentation
                </Typography>
              </Paper>
            </Link>
            <Link href="#" underline="none">
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[3],
                    bgcolor: 'rgba(0, 0, 0, 0.01)'
                  }
                }}
              >
                <Typography variant="body1" fontWeight={500}>
                  Integration Guides
                </Typography>
              </Paper>
            </Link>
            <Link href="#" underline="none">
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[3],
                    bgcolor: 'rgba(0, 0, 0, 0.01)'
                  }
                }}
              >
                <Typography variant="body1" fontWeight={500}>
                  Release Notes
                </Typography>
              </Paper>
            </Link>
          </Box>
        </Box>
      </Paper>
    </DashboardLayout>
  );
};

export default HelpPage;
