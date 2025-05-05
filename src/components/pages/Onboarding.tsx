import { useState } from 'react'
import { Box, Stepper, Step, StepLabel, Button, Typography } from '@mui/material'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { PersonalInfoStep } from '../features/onboarding/PersonalInfoStep';
import { CompanyInfoStep } from '../features/onboarding/CompanyInfoStep';
import { GoalsStep } from '../features/onboarding/GoalsStep';
import { MeetingPreferencesStep } from '../features/onboarding/MeetingPreferencesStep';
import { PaymentStep } from '../features/onboarding/PaymentStep';

const steps = [
  'Personal Information',
  'Company Details',
  'Your Goals',
  'Meeting Preferences',
  'Payment',
]

const Onboarding = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [completed, setCompleted] = useState<Record<number, boolean>>({})

  const handleNext = () => {
    setCompleted((prev) => ({ ...prev, [activeStep]: true }))
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    companySize: '',
    industry: '',
    primaryGoal: '',
    secondaryGoal: '',
    meetingDays: [],
    meetingTime: '',
    timezone: '',
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  }

  const validationSchemas = [
    Yup.object().shape({
      firstName: Yup.string().required('Required'),
      lastName: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
    }),
    Yup.object().shape({
      company: Yup.string().required('Required'),
      jobTitle: Yup.string().required('Required'),
      companySize: Yup.string().required('Required'),
    }),
    Yup.object().shape({
      primaryGoal: Yup.string().required('Required'),
    }),
    Yup.object().shape({
      meetingDays: Yup.array().min(1, 'Select at least one day'),
      meetingTime: Yup.string().required('Required'),
      timezone: Yup.string().required('Required'),
    }),
    Yup.object().shape({
      paymentMethod: Yup.string().required('Required'),
      cardNumber: Yup.string().when('paymentMethod', {
        is: (value: string) => value === 'card',
        then: (schema) => schema.required('Required').matches(/^\d{16}$/, 'Invalid card number'),
      }),
    }),
  ]

  const currentValidationSchema = validationSchemas[activeStep]

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <PersonalInfoStep />
      case 1:
        return <CompanyInfoStep />
      case 2:
        return <GoalsStep />
      case 3:
        return <MeetingPreferencesStep />
      case 4:
        return <PaymentStep />
      default:
        return <div>Not Found</div>
    }
  }

  return (
    <Box sx={{ width: '100%', py: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Formik
        initialValues={initialValues}
        validationSchema={currentValidationSchema}
        onSubmit={(values, actions) => {
          if (activeStep === steps.length - 1) {
            console.log('Form submitted', values)
            // Submit to backend
          } else {
            handleNext()
            actions.setTouched({})
            actions.setSubmitting(false)
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      {activeStep === steps.length && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h5" gutterBottom>
            Onboarding Complete!
          </Typography>
          <Typography>
            Your account is being set up. You'll be redirected to your dashboard shortly.
          </Typography>
          <Typography sx={{ mt: 2 }} color="success.main">
            Remember: Your first qualified meeting is guaranteed!
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default Onboarding