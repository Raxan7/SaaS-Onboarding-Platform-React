import { Box, TextField } from '@mui/material'
import { useFormikContext } from 'formik'

export const PersonalInfoStep = () => {
  const { values, handleChange, touched, errors } = useFormikContext<{
    firstName: string
    lastName: string
    email: string
  }>()

  return (
    <Box>
      <TextField
        fullWidth
        name="firstName"
        label="First Name"
        value={values.firstName}
        onChange={handleChange}
        error={touched.firstName && Boolean(errors.firstName)}
        helperText={touched.firstName && errors.firstName}
        margin="normal"
      />
      <TextField
        fullWidth
        name="lastName"
        label="Last Name"
        value={values.lastName}
        onChange={handleChange}
        error={touched.lastName && Boolean(errors.lastName)}
        helperText={touched.lastName && errors.lastName}
        margin="normal"
      />
      <TextField
        fullWidth
        name="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={touched.email && Boolean(errors.email)}
        helperText={touched.email && errors.email}
        margin="normal"
      />
    </Box>
  )
}