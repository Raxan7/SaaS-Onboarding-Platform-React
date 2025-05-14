// components/onboarding/MeetingStep.tsx
import { Box, TextField, Typography, Button } from '@mui/material';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useEffect, useState } from 'react';
import { useApiClient } from '../../utils/apiClient';

const MeetingStep = () => {
  const { data, setData } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiClient = useApiClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      meeting: {
        ...prev.meeting,
        [name]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Format the date properly for the backend
      const formattedDate = new Date(data.meeting.meetingDate).toISOString(); // Use ISO format for scheduled_at

      await apiClient.post('/api/onboarding/user-onboarding/meeting/', {
        scheduled_at: formattedDate, // Correct field name
        meeting_goals: data.meeting.meetingGoals || '' // Handle empty goals
      });

      // Proceed to next step or show success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meeting details');
    } finally {
      setLoading(false);
    }
  };

  // Set default meeting date to tomorrow
  useEffect(() => {
    if (!data.meeting.meetingDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedDate = tomorrow.toISOString().split('T')[0];
      setData(prev => ({
        ...prev,
        meeting: {
          ...prev.meeting,
          meetingDate: formattedDate
        }
      }));
    }
  }, [data.meeting.meetingDate, setData]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        When would you like your first qualified meeting?
      </Typography>
      <TextField
        name="meetingDate"
        type="date"
        value={data.meeting.meetingDate}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        name="meetingGoals"
        label="Meeting Goals (Optional)"
        value={data.meeting.meetingGoals}
        onChange={handleChange}
        multiline
        rows={4}
        fullWidth
        margin="normal"
      />
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? 'Saving...' : 'Save Meeting Details'}
      </Button>
    </Box>
  );
};

export default MeetingStep;