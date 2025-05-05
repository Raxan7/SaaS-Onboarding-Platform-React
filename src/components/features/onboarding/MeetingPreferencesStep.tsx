import { Box, TextField, Typography, Checkbox, FormControlLabel } from '@mui/material'
import { useFormikContext } from 'formik'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export const MeetingPreferencesStep = () => {
  const { values, setFieldValue, touched, errors } = useFormikContext<{
    meetingDays: string[]
    meetingTime: string
    timezone: string
  }>()

  const handleDayToggle = (day: string) => {
    const newDays = values.meetingDays.includes(day)
      ? values.meetingDays.filter((d) => d !== day)
      : [...values.meetingDays, day]
    setFieldValue('meetingDays', newDays)
  }

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        Preferred meeting days:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
        {daysOfWeek.map((day) => (
          <FormControlLabel
            key={day}
            control={
              <Checkbox
                checked={values.meetingDays.includes(day)}
                onChange={() => handleDayToggle(day)}
              />
            }
            label={day}
          />
        ))}
      </Box>
      {touched.meetingDays && errors.meetingDays && (
        <Typography color="error" variant="body2">
          {errors.meetingDays}
        </Typography>
      )}

      <TextField
        fullWidth
        select
        name="meetingTime"
        label="Preferred Meeting Time"
        value={values.meetingTime}
        onChange={(e) => setFieldValue('meetingTime', e.target.value)}
        error={touched.meetingTime && Boolean(errors.meetingTime)}
        helperText={touched.meetingTime && errors.meetingTime}
        margin="normal"
        SelectProps={{
          native: true,
        }}
      >
        <option value=""></option>
        <option value="morning">Morning (9am-12pm)</option>
        <option value="afternoon">Afternoon (1pm-5pm)</option>
        <option value="evening">Evening (5pm-8pm)</option>
      </TextField>

      <TextField
        fullWidth
        select
        name="timezone"
        label="Timezone"
        value={values.timezone}
        onChange={(e) => setFieldValue('timezone', e.target.value)}
        error={touched.timezone && Boolean(errors.timezone)}
        helperText={touched.timezone && errors.timezone}
        margin="normal"
        SelectProps={{
          native: true,
        }}
      >
        <option value=""></option>
        <option value="ET">Eastern Time (ET)</option>
        <option value="CT">Central Time (CT)</option>
        <option value="MT">Mountain Time (MT)</option>
        <option value="PT">Pacific Time (PT)</option>
        <option value="GMT">GMT/UTC</option>
      </TextField>
    </Box>
  )
}