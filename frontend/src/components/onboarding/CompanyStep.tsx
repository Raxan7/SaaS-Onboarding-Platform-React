// components/onboarding/CompanyStep.tsx
import { Box, TextField, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useApiClient } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';

const CompanyStep = ({ onComplete }: { onComplete: () => void }) => {
  const { data, setData } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiClient = useApiClient();
  const { isAuthenticated, token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [name]: value
      }
    }));
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.warn('User is not authenticated or token is missing. Delaying API calls.');
      return;
    }
    // Removed auto-save logic to prevent unnecessary server requests
  }, [isAuthenticated, token]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.post('/api/onboarding/company/', {
        company_name: data.company.companyName,
        job_title: data.company.jobTitle,
        industry: data.company.industry
      });

      if (response.status === 403) {
        throw new Error('Forbidden: Authentication token is missing or invalid.');
      }

      // Mark the step as complete only when the user clicks next
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save company info');
    } finally {
      setLoading(false);
    }
  };

  if (data.companyStepCompleted) {
    console.log('Company Step Completed:', data.companyStepCompleted); // Debugging log
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="success.main">
          ✓ Company step completed successfully
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Please proceed to the Meeting step.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <TextField
        name="companyName"
        label="Company Name"
        value={data.company.companyName}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        name="jobTitle"
        label="Job Title"
        value={data.company.jobTitle}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        inputProps={{ type: 'text' }}
      />
      <TextField
        name="industry"
        label="Industry"
        value={data.company.industry}
        onChange={handleChange}
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
        sx={{ mt: 2, display: 'block', mx: 'auto' }} // Center the button
      >
        {loading ? 'Saving...' : 'Save and Proceed to the Next Step'}
      </Button>
    </Box>
  );
};

export default CompanyStep;
