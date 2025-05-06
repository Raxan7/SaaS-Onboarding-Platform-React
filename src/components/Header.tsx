import { AppBar, Toolbar, Container, Button, Box, useScrollTrigger, Typography, styled, Menu, MenuItem, IconButton } from '@mui/material';
import { Link, LinkProps } from 'react-router-dom';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import logo from './logo.jpg'; // Correctly import the logo

// Define props for the styled buttons
interface StyledButtonProps {
  component?: React.ElementType;
  to?: string;
}

// Styled button with animation
const AnimatedButton = styled(Button)<StyledButtonProps>(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
}));

const NavButton = styled(Button)<StyledButtonProps>(({ theme }) => ({
  fontWeight: 500,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '0%',
    height: '2px',
    bottom: '6px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s ease',
  },
  '&:hover:after': {
    width: '70%',
  },
}));

export default function Header() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={trigger ? 4 : 0}
      sx={{
        backgroundColor: trigger ? 'background.paper' : 'transparent',
        color: trigger ? 'text.primary' : 'common.white',
        transition: 'all 0.3s ease',
        py: 1,
        backdropFilter: trigger ? 'none' : 'blur(10px)',
        background: trigger ? '' : 'rgba(0, 0, 0, 0.2)',
        borderBottom: trigger ? `1px solid` : 'none',
        borderColor: trigger ? 'divider' : 'transparent',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, sm: 2 } }}>
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={logo} 
                alt="Logo" 
                height="40" 
                style={{
                  transition: 'filter 0.3s ease',
                }}
              />
              {!trigger && (
                <Typography 
                  variant="h6" 
                  component="span" 
                  sx={{ 
                    ml: 2, 
                    fontWeight: 700,
                    display: { xs: 'none', md: 'inline' }
                  }}
                >
                  SaaS
                </Typography>
              )}
            </motion.div>
          </Box>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: { xs: 1, sm: 2 } }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <NavButton 
                component={Link as React.ElementType}
                to="/pricing" 
                color="inherit"
                sx={{
                  color: trigger ? 'text.primary' : 'common.white',
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
              >
                Pricing
              </NavButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <AnimatedButton
                component={Link as React.ElementType}
                to="/onboarding"
                variant={trigger ? "contained" : "outlined"}
                color={trigger ? "primary" : "inherit"}
                sx={{
                  color: trigger ? '' : 'common.white',
                  borderColor: trigger ? '' : 'rgba(255,255,255,0.5)',
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: trigger ? '' : 'common.white',
                  }
                }}
              >
                Start Free Trial
              </AnimatedButton>
            </motion.div>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleMenuClose} component={Link} to="/pricing">Pricing</MenuItem>
              <MenuItem onClick={handleMenuClose} component={Link} to="/onboarding">Start Free Trial</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}