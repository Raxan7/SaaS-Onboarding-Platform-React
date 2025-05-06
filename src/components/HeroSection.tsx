import { Box, Typography, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

function HeroSection({ }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.background.default})`,
        color: theme.palette.primary.contrastText,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Our Platform
        </Typography>
        <Typography variant="h5" gutterBottom>
          Simplify your onboarding process with our tools.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ mt: 3 }}
        >
          Get Started
        </Button>
      </motion.div>
    </Box>
  );
}

HeroSection.propTypes = {
  scrollPosition: PropTypes.number.isRequired,
};

export default HeroSection;