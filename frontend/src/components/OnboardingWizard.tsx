// components/OnboardingWizard.tsx
import { useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import AccountStep from './onboarding/AccountStep';
import CompanyStep from './onboarding/CompanyStep';
import MeetingStep from './onboarding/MeetingStep';
import PaymentStep from './onboarding/PaymentStep';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Account', 'Company', 'Meeting', 'Payment'];

const OnboardingWizard = () => {
  const { currentStep, setCurrentStep, data, setData } = useOnboarding();
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Allow access to account step (step 0) for everyone
      if (currentStep === 0) return;

      // For other steps, require authentication
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      
      // If the user is a host, redirect them to the host dashboard
      // Hosts don't need to complete the onboarding process
      if (userType === 'host') {
        navigate('/host-dashboard');
        return;
      }

      try {
        const response = await fetch('/api/onboarding/user-onboarding-status/', {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const statusData = await response.json();
          
          // Check if onboarding is complete
          if (statusData.is_complete) {
            navigate('/client-dashboard');
            return;
          }
          
          // Update step completion status in context
          setData(prev => ({
            ...prev,
            companyStepCompleted: statusData.company_step_completed || false,
            meetingStepCompleted: statusData.meeting_step_completed || false
          }));
          
          // For authenticated users, check if they're trying to skip steps
          const backendStep = statusData.current_step || 1; // Default to step 1 if not set
          if (currentStep > backendStep) {
            // Redirect to the first incomplete step
            setCurrentStep(backendStep);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [currentStep, isAuthenticated, userType, navigate, setCurrentStep, setData]);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // For Company step, ensure it's marked as completed before proceeding
      if (currentStep === 1 && !data.companyStepCompleted) {
        // Company step is not completed yet
        alert("Please complete the company information before proceeding.");
        return;
      }
      
      // For Meeting step, ensure it's marked as completed before proceeding
      if (currentStep === 2 && !data.meetingStepCompleted) {
        alert("Please schedule your meeting before proceeding.");
        return;
      }
      
      setCurrentStep(currentStep + 1);
    } else {
      // When finishing onboarding, mark as complete and redirect
      try {
        await fetch('/api/onboarding/complete/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        navigate('/client-dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepComplete = () => {
    setCurrentStep(currentStep + 1);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2 }}>
        {currentStep === 0 && (
          !isAuthenticated ? (
            <AccountStep />
          ) : (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="success.main">
                ✓ Account step completed
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
                sx={{ mt: 2 }}
              >
                Proceed to Next Step
              </Button>
            </Box>
          )
        )}
        {currentStep === 1 && <CompanyStep onComplete={handleStepComplete} />}
        {currentStep === 2 && <MeetingStep />}
        {currentStep === 3 && <PaymentStep />}
      </Box>

      {currentStep > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 4 }}>
          <Button onClick={handleBack}>
            Back
          </Button>
          {/* Only show Next button if not on the final Payment step */}
          {currentStep < steps.length - 1 && (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default OnboardingWizard;