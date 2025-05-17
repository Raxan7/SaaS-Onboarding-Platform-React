import { useState } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  CardContent,
  Button,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import MeetingsList from '../components/meetings/MeetingsList';
import ActiveMeeting from '../components/meetings/ActiveMeeting';
import NewMeetingDialog from '../components/meetings/NewMeetingDialog';
import DashboardLayout from '../components/DashboardLayout';

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
      id={`meetings-tabpanel-${index}`}
      aria-labelledby={`meetings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `meetings-tab-${index}`,
    'aria-controls': `meetings-tabpanel-${index}`,
  };
}

const MeetingsPage = () => {
  const [openNewMeetingDialog, setOpenNewMeetingDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSuccessfulMeetingCreation = () => {
    // Refresh the page to show the new meeting
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Your Meetings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Schedule, manage and track all your meetings in one place
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Active Meeting
              </Typography>
              <ActiveMeeting />
            </CardContent>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 3, 
          borderBottom: 1, 
          borderColor: 'divider' 
        }}>
          <Typography variant="h6" fontWeight={600}>
            Meeting Schedule
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpenNewMeetingDialog(true)}
            startIcon={<AddIcon />}
            sx={{ borderRadius: 8 }}
          >
            New Meeting
          </Button>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="meeting tabs"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
              }
            }}
          >
            <Tab label="Upcoming Meetings" {...a11yProps(0)} />
            <Tab label="Past Meetings" {...a11yProps(1)} />
            <Tab label="All Meetings" {...a11yProps(2)} />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <MeetingsList filter="upcoming" />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <MeetingsList filter="past" showActions={false} />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <MeetingsList filter="all" />
          </TabPanel>
        </Box>
      </Paper>
      
      {/* New Meeting Dialog */}
      <NewMeetingDialog 
        open={openNewMeetingDialog} 
        onClose={() => setOpenNewMeetingDialog(false)}
        onSuccess={handleSuccessfulMeetingCreation}
      />
    </DashboardLayout>
  );
};

export default MeetingsPage;