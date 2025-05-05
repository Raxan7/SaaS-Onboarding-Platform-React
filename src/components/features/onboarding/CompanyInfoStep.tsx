import { Box, TextField, MenuItem } from '@mui/material'
import { useFormikContext } from 'formik'

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees',
]

export const CompanyInfoStep = () => {
  const { values, handleChange, touched, errors } = useFormikContext<{
    company: string
    jobTitle: string
    companySize: string
  }>()

  return (
    <Box>
      <TextField
        fullWidth
        name="company"
        label="Company Name"
        value={values.company}
        onChange={handleChange}
        error={touched.company && Boolean(errors.company)}
        helperText={touched.company && errors.company}
        margin="normal"
      />
      <TextField
        fullWidth
        name="jobTitle"
        label="Job Title"
        value={values.jobTitle}
        onChange={handleChange}
        error={touched.jobTitle && Boolean(errors.jobTitle)}
        helperText={touched.jobTitle && errors.jobTitle}
        margin="normal"
      />
      <TextField
        select
        fullWidth
        name="companySize"
        label="Company Size"
        value={values.companySize}
        onChange={handleChange}
        error={touched.companySize && Boolean(errors.companySize)}
        helperText={touched.companySize && errors.companySize}
        margin="normal"
      >
        {companySizes.map((size) => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}