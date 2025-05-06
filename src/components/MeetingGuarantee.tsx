import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';

export default function MeetingGuarantee() {
  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)' }}>
      <Grid container alignItems="center" spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h3" gutterBottom sx={{ color: 'white' }}>
            Your First Qualified Meeting Is On Us
          </Typography>
          <Typography variant="h5" sx={{ mb: 3, color: 'white' }}>
            We're so confident in our platform that we guarantee your first qualified meeting during your free trial.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ backgroundColor: 'white', color: '#F2994A', '&:hover': { backgroundColor: '#f5f5f5' } }}
          >
            Start Your Free Trial
          </Button>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Box
              component="img"
              src="/meeting-guarantee.svg"
              alt="Meeting guarantee"
              sx={{ width: '100%', maxWidth: 400 }}
            />
          </motion.div>
        </Grid>
      </Grid>
    </Paper>
  );
}