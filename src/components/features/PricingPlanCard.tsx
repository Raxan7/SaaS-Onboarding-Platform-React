import { Card, CardContent, Typography, Box, Button, List, ListItem, ListItemIcon } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'

interface PricingPlanCardProps {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  featured: boolean
}

export const PricingPlanCard = ({
  name,
  price,
  period,
  description,
  features,
  cta,
  featured,
}: PricingPlanCardProps) => {
  return (
    <Card
      elevation={featured ? 6 : 3}
      sx={{
        height: '100%',
        border: featured ? '2px solid' : undefined,
        borderColor: featured ? 'primary.main' : undefined,
        transform: featured ? 'scale(1.05)' : undefined,
        zIndex: featured ? 1 : 0,
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
          <Typography variant="h3">{price}</Typography>
          <Typography color="text.secondary">{period}</Typography>
        </Box>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
        <List>
          {features.map((feature) => (
            <ListItem key={feature} disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle color="success" />
              </ListItemIcon>
              <Typography variant="body2">{feature}</Typography>
            </ListItem>
          ))}
        </List>
        <Button
          fullWidth
          variant={featured ? 'contained' : 'outlined'}
          size="large"
          sx={{ mt: 3 }}
        >
          {cta}
        </Button>
      </CardContent>
    </Card>
  )
}