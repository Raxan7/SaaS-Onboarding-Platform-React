import { Typography, Box, Paper, Button, Chip, useTheme } from '@mui/material';
import { CreditCard as PaymentIcon } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import SubscriptionInfo from '../components/subscriptions/SubscriptionInfo';
import { useSubscription } from '../hooks/useSubscription';

const SubscriptionPage = () => {
  const theme = useTheme();
  const { subscription } = useSubscription();

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Your Subscription
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your plan and billing information
        </Typography>
      </Box>

      {/* Main subscription content */}
      <Box sx={{ mb: 4 }}>
        <SubscriptionInfo />
      </Box>

      {/* Payment History */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight={600}>
            Payment History
          </Typography>
          <Button variant="outlined" startIcon={<PaymentIcon />}>
            View All
          </Button>
        </Box>
        <Box sx={{ p: 3 }}>
          {/* You can replace this with actual payment history data */}
          {subscription ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {subscription.plan.name} - Monthly
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString()} 
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1" fontWeight={600}>
                  ${typeof subscription.plan.price === 'number' 
                    ? subscription.plan.price.toFixed(2) 
                    : subscription.plan.price}
                </Typography>
                <Chip 
                  label="Paid" 
                  size="small" 
                  color="success" 
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No payment history available
            </Typography>
          )}
        </Box>
      </Paper>
      
      {/* Billing Information */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight={600}>
            Billing Information
          </Typography>
          <Button variant="outlined">
            Update
          </Button>
        </Box>
        <Box sx={{ p: 3 }}>
          {subscription ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  Visa ending in 4242
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Billing Address
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  123 Business Street, Suite 100
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  San Francisco, CA 94107
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No billing information available
            </Typography>
          )}
        </Box>
      </Paper>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
