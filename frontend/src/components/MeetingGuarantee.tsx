import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';

export default function MeetingGuarantee() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, md: 8 },
        borderRadius: 6,
        background: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
        overflow: 'hidden',
      }}
    >
      <Grid container spacing={6} alignItems="center">
        {/* Text Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.2,
                }}
              >
                Get Your First Qualified Meeting — On Us
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  mb: 4,
                  maxWidth: 480,
                }}
              >
                We believe in results. That’s why we guarantee your first qualified meeting during your free trial.
              </Typography>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: '#F2994A',
                    fontWeight: 700,
                    px: 5,
                    py: 1.5,
                    borderRadius: '999px',
                    boxShadow: 3,
                    '&:hover': {
                      backgroundColor: '#fefefe',
                    },
                  }}
                  href="/onboarding"
                >
                  Start Your Free Trial
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Grid>

        {/* GIF Image Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Box
              component="img"
              src="/meeting-guarantee.gif" // your gif path
              alt="Meeting guarantee animation"
              sx={{
                width: '100%',
                maxWidth: 500,
                mx: 'auto',
                borderRadius: 6,
                boxShadow: 4,
              }}
            />
          </motion.div>
        </Grid>
      </Grid>
    </Paper>
  );
}
