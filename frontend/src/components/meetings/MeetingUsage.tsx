import { 
  Box, 
  Paper, 
  CardContent, 
  Typography, 
  LinearProgress,
  Button,
  Chip
} from '@mui/material';
import { useMeetingLimits } from '../../hooks/useMeetingLimits';
import { useNavigate } from 'react-router-dom';

const MeetingUsage = () => {
  const { limits, loading, error } = useMeetingLimits();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Meeting Usage
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 2, pb: 2 }}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        </CardContent>
      </Paper>
    );
  }

  if (error || !limits) {
    return (
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Meeting Usage
          </Typography>
          <Typography color="error" variant="body2">
            {error || 'Unable to load meeting usage information'}
          </Typography>
        </CardContent>
      </Paper>
    );
  }

  // Calculate progress percentage for the progress bar
  const progressPercentage = limits.is_unlimited 
    ? 0 
    : Math.min(100, (limits.current_count / (limits.limit as number)) * 100);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Meeting Usage
          </Typography>
          <Chip 
            label={limits.plan_name} 
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Monthly Meetings
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {limits.current_count} / {limits.is_unlimited ? '∞' : limits.limit}
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage}
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: theme => theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 5
              }
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {limits.is_unlimited 
                ? 'Unlimited remaining' 
                : `${limits.remaining} meeting${limits.remaining !== 1 ? 's' : ''} remaining this month`}
            </Typography>
          </Box>
        </Box>

        {!limits.is_unlimited && Number(limits.remaining) <= 1 && (
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleUpgrade}
            sx={{ mt: 2 }}
          >
            Upgrade Plan
          </Button>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Meeting Limits
          </Typography>
          <Typography variant="body1">
            • Basic Plan: 2 meetings per month
          </Typography>
          <Typography variant="body1">
            • Pro Plan: 11 meetings per month
          </Typography>
          <Typography variant="body1">
            • Enterprise Plan: Unlimited meetings
          </Typography>
        </Box>
      </CardContent>
    </Paper>
  );
};

export default MeetingUsage;
