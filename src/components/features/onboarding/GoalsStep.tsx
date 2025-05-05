import { Box, TextField, Typography } from '@mui/material'
import { useFormikContext } from 'formik'

export const GoalsStep = () => {
  const { values, handleChange, touched, errors } = useFormikContext<{
    primaryGoal: string
    secondaryGoal: string
  }>()

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        What's your primary goal with our platform?
      </Typography>
      <TextField
        fullWidth
        name="primaryGoal"
        label="Primary Goal"
        value={values.primaryGoal}
        onChange={handleChange}
        error={touched.primaryGoal && Boolean(errors.primaryGoal)}
        helperText={touched.primaryGoal && errors.primaryGoal}
        margin="normal"
      />
      <TextField
        fullWidth
        name="secondaryGoal"
        label="Secondary Goal (Optional)"
        value={values.secondaryGoal}
        onChange={handleChange}
        margin="normal"
      />
    </Box>
  )
}