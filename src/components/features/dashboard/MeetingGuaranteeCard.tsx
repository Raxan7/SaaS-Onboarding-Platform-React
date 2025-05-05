import { Card, CardContent, Typography, Button, Box } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'

export const MeetingGuaranteeCard = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckCircle color="success" sx={{ mr: 1 }} />
          <Typography variant="h6">First Meeting Guarantee</Typography>
        </Box>
        <Typography sx={{ mb: 2 }}>
          Your first qualified meeting is guaranteed within 14 days of onboarding.
        </Typography>
        <Button variant="contained" color="primary">
          Schedule Your Meeting
        </Button>
      </CardContent>
    </Card>
  )
}