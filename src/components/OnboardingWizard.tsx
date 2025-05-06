import { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

const steps = ['Account Information', 'Company Details', 'Meeting Preferences', 'Payment Method'];

export default function OnboardingWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = (data: any) => {
    console.log(data);
    handleNext();
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Controller
              name="fullName"
              control={control}
              defaultValue=""
              rules={{ required: 'Full name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  margin="normal"
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message as string}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              defaultValue=""
              rules={{ 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message as string}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              defaultValue=""
              rules={{ 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="password"
                  label="Password"
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message as string}
                />
              )}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <Controller
              name="companyName"
              control={control}
              defaultValue=""
              rules={{ required: 'Company name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Company Name"
                  fullWidth
                  margin="normal"
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message as string}
                />
              )}
            />
            <Controller
              name="jobTitle"
              control={control}
              defaultValue=""
              rules={{ required: 'Job title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job Title"
                  fullWidth
                  margin="normal"
                  error={!!errors.jobTitle}
                  helperText={errors.jobTitle?.message as string}
                />
              )}
            />
            <Controller
              name="industry"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Industry"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              When would you like your first qualified meeting?
            </Typography>
            <Controller
              name="meetingDate"
              control={control}
              defaultValue=""
              rules={{ required: 'Meeting date is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.meetingDate}
                  helperText={errors.meetingDate?.message as string}
                />
              )}
            />
            <Controller
              name="meetingGoals"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Meeting Goals (Optional)"
                  multiline
                  rows={4}
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Enter your payment details (won't be charged until trial ends)
            </Typography>
            {/* In a real app, you would use Stripe Elements here */}
            <TextField
              label="Card Number"
              fullWidth
              margin="normal"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Expiry Date"
                fullWidth
                margin="normal"
              />
              <TextField
                label="CVC"
                fullWidth
                margin="normal"
              />
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Thank you for signing up!
          </Typography>
          <Typography>
            Your account has been created and your first meeting has been scheduled.
            Check your email for confirmation and next steps.
          </Typography>
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              type={activeStep === steps.length - 1 ? 'submit' : 'button'}
              onClick={activeStep === steps.length - 1 ? undefined : handleNext}
            >
              {activeStep === steps.length - 1 ? 'Complete Onboarding' : 'Next'}
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
}