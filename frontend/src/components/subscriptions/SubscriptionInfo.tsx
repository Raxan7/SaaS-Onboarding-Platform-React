import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Button, 
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import { useSubscription } from '../../hooks/useSubscription';
import { format } from 'date-fns';

interface SubscriptionInfoProps {
  showManageButton?: boolean;
}

const SubscriptionInfo = ({ showManageButton = true }: SubscriptionInfoProps) => {
  const { subscription, loading, error, hasCompletedPayment } = useSubscription();

  if (loading) {
    return (
      <Card sx={{ mb: 3, height: '100%' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress size={24} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Subscription Status</Typography>
          <Divider sx={{ mb: 2 }} />
          
          {hasCompletedPayment ? (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Your payment has been processed, but there might be an issue with your subscription record. Please contact support.
              </Alert>
              <Button variant="contained" color="primary">
                Contact Support
              </Button>
            </>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                You don't have an active subscription. Please upgrade to access all features.
              </Alert>
              <Button variant="contained" color="primary" href="/pricing">
                View Plans
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  const { plan, status, current_period_end, days_remaining } = subscription;
  const formattedEndDate = format(new Date(current_period_end), 'MMMM d, yyyy');

  return (
    <Card sx={{ mb: 3, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6">Subscription Status</Typography>
          <Chip 
            label={status === 'active' ? 'Active' : status} 
            color={status === 'active' ? 'success' : 'default'}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Plan
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
            {plan.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            ${plan.price}/{plan.interval}
          </Typography>
        </Box>
        
        {status === 'active' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Next Billing Date
            </Typography>
            <Typography variant="body1">
              {formattedEndDate} ({days_remaining} days remaining)
            </Typography>
          </Box>
        )}
        
        {showManageButton && (
          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth
            sx={{ mt: 2 }}
          >
            Manage Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionInfo;