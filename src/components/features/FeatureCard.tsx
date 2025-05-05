import { Card, CardContent, Typography, Box } from '@mui/material'

interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

export const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ fontSize: '2.5rem', mb: 2 }}>{icon}</Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </CardContent>
    </Card>
  )
}