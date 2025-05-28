import { Typography, Box, Paper, Button, TextField, Grid, MenuItem, useTheme } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import { useState } from 'react';

const SupportPage = () => {
  const theme = useTheme();
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    category: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setSupportTicket(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to create a support ticket
    setSubmitted(true);
    
    // Reset form after submission
    setTimeout(() => {
      setSupportTicket({
        subject: '',
        category: '',
        message: '',
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Support Center
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Get help with any aspect of our platform
        </Typography>
      </Box>

      {/* Support Ticket Form */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="h6" fontWeight={600}>
            Create Support Ticket
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Subject"
                  fullWidth
                  required
                  value={supportTicket.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  disabled={submitted}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  required
                  value={supportTicket.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={submitted}
                >
                  <MenuItem value="account">Account</MenuItem>
                  <MenuItem value="billing">Billing</MenuItem>
                  <MenuItem value="technical">Technical Issue</MenuItem>
                  <MenuItem value="feature">Feature Request</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Message"
                  fullWidth
                  required
                  multiline
                  rows={6}
                  value={supportTicket.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  disabled={submitted}
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color={submitted ? "success" : "primary"}
                  disabled={submitted}
                  endIcon={submitted ? null : <SendIcon />}
                >
                  {submitted ? "Ticket Submitted" : "Submit Ticket"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>
      
      {/* Knowledge Base Quick Access */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="h6" fontWeight={600}>
            Quick Help
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" paragraph>
            Browse our most common support topics:
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
            gap: 2 
          }}>
            {[
              "Getting Started Guide",
              "Scheduling Meetings",
              "Managing Your Subscription",
              "Billing FAQ",
              "Technical Requirements",
              "Security & Privacy"
            ].map((topic) => (
              <Button 
                key={topic}
                variant="outlined" 
                sx={{ 
                  justifyContent: 'flex-start',
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                {topic}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>
      
      {/* Live Chat Option */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          bgcolor: theme.palette.primary.light,
          color: theme.palette.primary.main
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Need Immediate Assistance?
          </Typography>
          <Typography variant="body1" paragraph>
            Our support team is available for live chat during business hours.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            sx={{ px: 4, py: 1.5, borderRadius: 8 }}
          >
            Start Live Chat
          </Button>
        </Box>
      </Paper>
    </DashboardLayout>
  );
};

export default SupportPage;
