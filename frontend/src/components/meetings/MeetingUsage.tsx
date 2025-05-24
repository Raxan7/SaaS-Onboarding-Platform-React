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
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 4, 
        overflow: 'hidden', 
        height: '100%',
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        border: '1px solid rgba(168, 237, 234, 0.3)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(168, 237, 234, 0.2)'
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 8px 25px rgba(250, 112, 154, 0.3)'
              }}
            >
              <Typography variant="h6" sx={{ color: 'white' }}>📊</Typography>
            </Box>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Meeting Usage
            </Typography>
          </Box>
          <Chip 
            label={limits.plan_name} 
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              borderRadius: 2,
              px: 1
            }}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              Monthly Meetings
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary">
              {limits.current_count} / {limits.is_unlimited ? '∞' : limits.limit}
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage}
            sx={{ 
              height: 12, 
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 2px 10px rgba(102, 126, 234, 0.3)'
              }
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Chip
              label={limits.is_unlimited 
                ? '🚀 Unlimited remaining' 
                : `⏱️ ${limits.remaining} meeting${limits.remaining !== 1 ? 's' : ''} remaining this month`}
              sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                fontSize: '0.85rem',
                px: 2,
                py: 0.5
              }}
              size="medium"
            />
          </Box>
        </Box>

        {!limits.is_unlimited && Number(limits.remaining) <= 1 && (
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleUpgrade}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              mb: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            🚀 Upgrade Plan
          </Button>
        )}

        <Box 
          sx={{ 
            p: 3,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
            📋 Plan Comparison
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                🥉 Basic Plan:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1, color: '#888' }}>
                2 meetings/month
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                🥈 Pro Plan:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1, color: '#888' }}>
                11 meetings/month
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                🥇 Enterprise:
              </Typography>
              <Typography variant="body2" sx={{ ml: 1, color: '#888' }}>
                Unlimited meetings
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Paper>
  );
};

export default MeetingUsage;
