import { Typography, Box, Paper, Tabs, Tab, TextField, Button, Switch, FormControlLabel, Divider, Avatar, useTheme } from '@mui/material';
import { UploadFile as UploadIcon, Save as SaveIcon } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import { SyntheticEvent, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    company: user?.company_name || '',
    phone: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    meetingReminders: true,
    marketingEmails: false,
    systemUpdates: true,
  });

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (setting: string) => {
    setNotificationSettings(prev => ({ 
      ...prev, 
      [setting]: !prev[setting as keyof typeof prev] 
    }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to update the profile
    console.log('Profile data submitted:', profileData);
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to update notification settings
    console.log('Notification settings submitted:', notificationSettings);
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Settings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTabs-indicator': {
              height: 3,
            }
          }}
        >
          <Tab label="Profile" />
          <Tab label="Notifications" />
          <Tab label="Security" />
          <Tab label="Integrations" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <form onSubmit={handleProfileSubmit}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: 4, gap: 3 }}>
                <Avatar 
                  sx={{ 
                    width: { xs: 80, sm: 100 }, 
                    height: { xs: 80, sm: 100 },
                    fontSize: '2rem',
                    bgcolor: theme.palette.primary.main
                  }}
                >
                  {profileData.firstName && profileData.lastName 
                    ? `${profileData.firstName[0]}${profileData.lastName[0]}`
                    : 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Profile Picture
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Upload a professional photo for your profile.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    component="label" 
                    startIcon={<UploadIcon />}
                    sx={{ mt: 1 }}
                  >
                    Upload New Picture
                    <input type="file" hidden accept="image/*" />
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Typography variant="h6" fontWeight={600} gutterBottom>
                Personal Information
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 4 }}>
                <TextField
                  label="First Name"
                  fullWidth
                  required
                  value={profileData.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                  value={profileData.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                />
                <TextField
                  label="Email Address"
                  fullWidth
                  required
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
                <TextField
                  label="Phone Number"
                  fullWidth
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                />
              </Box>

              <Typography variant="h6" fontWeight={600} gutterBottom>
                Company Information
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 4 }}>
                <TextField
                  label="Company Name"
                  fullWidth
                  value={profileData.company}
                  onChange={(e) => handleProfileChange('company', e.target.value)}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  startIcon={<SaveIcon />}
                >
                  Save Changes
                </Button>
              </Box>
            </form>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <form onSubmit={handleNotificationSubmit}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Email Notifications
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationSettings.emailNotifications} 
                      onChange={() => handleNotificationChange('emailNotifications')}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Receive email notifications for important account updates and activities.
                </Typography>

                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationSettings.meetingReminders} 
                      onChange={() => handleNotificationChange('meetingReminders')}
                      color="primary"
                    />
                  }
                  label="Meeting Reminders"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Receive reminders about upcoming meetings and events.
                </Typography>

                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationSettings.systemUpdates} 
                      onChange={() => handleNotificationChange('systemUpdates')}
                      color="primary"
                    />
                  }
                  label="System Updates"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Receive notifications about system updates and maintenance.
                </Typography>

                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationSettings.marketingEmails} 
                      onChange={() => handleNotificationChange('marketingEmails')}
                      color="primary"
                    />
                  }
                  label="Marketing Emails"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Receive marketing emails and promotional offers.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  startIcon={<SaveIcon />}
                >
                  Save Preferences
                </Button>
              </Box>
            </form>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Password
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 4 }}>
              <TextField
                label="Current Password"
                fullWidth
                type="password"
                required
              />
              <Box /> {/* Empty box for grid alignment */}
              <TextField
                label="New Password"
                fullWidth
                type="password"
                required
              />
              <TextField
                label="Confirm New Password"
                fullWidth
                type="password"
                required
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary"
              >
                Change Password
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Integrations Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Connected Services
            </Typography>
            
            <Typography variant="body1" paragraph>
              Connect third-party services to enhance your experience.
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              {['Google Calendar', 'Microsoft Outlook', 'Slack', 'Zoom'].map((service) => (
                <Paper
                  key={service}
                  elevation={1}
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    {service}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                  >
                    Connect
                  </Button>
                </Paper>
              ))}
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </DashboardLayout>
  );
};

export default SettingsPage;
