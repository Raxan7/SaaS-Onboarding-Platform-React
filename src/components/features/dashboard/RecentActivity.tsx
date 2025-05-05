import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material'
import { FiberManualRecord } from '@mui/icons-material'

const activities = [
  { id: 1, text: 'Completed company profile', time: '2 hours ago' },
  { id: 2, text: 'Connected CRM integration', time: '1 day ago' },
  { id: 3, text: 'Started onboarding wizard', time: '2 days ago' },
]

export const RecentActivity = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {activities.map((activity) => (
            <ListItem key={activity.id} disableGutters>
              <FiberManualRecord color="primary" sx={{ fontSize: '0.5rem', mr: 2 }} />
              <ListItemText
                primary={activity.text}
                secondary={activity.time}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}