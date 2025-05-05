import { Box, LinearProgress, Typography } from '@mui/material'

export const OnboardingProgress = () => {
  const progress = 65 // Would come from backend in real app

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1">Onboarding Progress</Typography>
        <Typography variant="body1">{progress}%</Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
    </Box>
  )
}