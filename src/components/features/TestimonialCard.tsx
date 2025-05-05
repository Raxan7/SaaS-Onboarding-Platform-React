import { Card, CardContent, Typography, Box, Avatar } from '@mui/material'

interface TestimonialCardProps {
  name: string
  role: string
  quote: string
  avatar: string
}

export const TestimonialCard = ({
  name,
  role,
  quote,
  avatar,
}: TestimonialCardProps) => {
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 3 }}>
          "{quote}"
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={avatar} alt={name} sx={{ mr: 2 }} />
          <Box>
            <Typography fontWeight="bold">{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {role}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}