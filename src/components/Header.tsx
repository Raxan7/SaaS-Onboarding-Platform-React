import { AppBar, Toolbar, Container, Button, Box, useScrollTrigger, Typography, styled, Menu, MenuItem, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import logo from './logo.jpg';

// Define props for the styled buttons
interface StyledButtonProps {
  component?: React.ElementType;
  to?: string;
}

// Styled button with animation
const AnimatedButton = styled(Button)<StyledButtonProps>(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    backgroundColor: theme.palette.primary.dark,
  },
}));

const NavButton = styled(Button)<StyledButtonProps>(({ theme }) => ({
  fontWeight: 600,
  position: 'relative',
  letterSpacing: '0.5px',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '0%',
    height: '2px',
    bottom: '6px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '&:hover:after': {
    width: '80%',
  },
}));

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: trigger ? 'none' : 'blur(12px)',
        background: trigger ? '' : 'rgba(15, 23, 42, 0.8)',
        borderBottom: trigger ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          px: { xs: 2, sm: 3 },
          minHeight: { xs: 64, sm: 72 }
        }}>
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.03)',
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
                height={isMobile ? 36 : 40}
                style={{
                  transition: 'all 0.3s ease',
                  filter: trigger ? 'none' : 'brightness(1)', // Ensure logo is always visible
                }}
              />
            </motion.div>
            <Typography 
              variant="h6" 
              component="span" 
              sx={{ 
                ml: 2, 
                fontWeight: 700,
                display: { xs: 'none', sm: 'inline' },
                color: trigger ? theme.palette.primary.main : 'common.white',
                transition: 'color 0.3s ease'
              }}
            >
              SaaS
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            gap: 3,
            alignItems: 'center'
          }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <NavButton 
                component={Link}
                to="/features" 
                color="inherit"
                sx={{
                  color: trigger ? 'text.primary' : 'common.white',
                }}
              >
                Features
              </NavButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <NavButton 
                component={Link}
                to="/pricing" 
                color="inherit"
                sx={{
                  color: trigger ? 'text.primary' : 'common.white',
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
                component={Link}
                to="/onboarding"
                variant={trigger ? "contained" : "outlined"}
                color={trigger ? "primary" : "inherit"}
                sx={{
                  color: trigger ? 'common.white' : 'common.white',
                  borderColor: trigger ? '' : 'rgba(255,255,255,0.3)',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: trigger ? '' : 'rgba(255,255,255,0.6)',
                    backgroundColor: trigger ? theme.palette.primary.dark : 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Start Free Trial
              </AnimatedButton>
            </motion.div>
          </Box>

          {/* Tablet Navigation (simplified) */}
          <Box sx={{ display: { xs: 'none', sm: 'flex', md: 'none' }, gap: 2 }}>
            <AnimatedButton
              component={Link}
              to="/pricing"
              color="inherit"
              sx={{
                color: trigger ? 'text.primary' : 'common.white',
                fontWeight: 600,
              }}
            >
              Pricing
            </AnimatedButton>
            <AnimatedButton
              component={Link}
              to="/onboarding"
              variant={trigger ? "contained" : "outlined"}
              color={trigger ? "primary" : "inherit"}
              sx={{
                color: trigger ? 'common.white' : 'common.white',
                borderColor: 'rgba(255,255,255,0.3)',
                px: 2,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Start Trial
            </AnimatedButton>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{
                p: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  mt: 1,
                },
                '& .MuiMenuItem-root': {
                  py: 1.5,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 107, 194, 0.08)',
                  }
                }
              }}
            >
              <MenuItem 
                onClick={handleMenuClose} 
                component={Link} 
                to="/features"
                sx={{
                  fontWeight: 500,
                }}
              >
                Features
              </MenuItem>
              <MenuItem 
                onClick={handleMenuClose} 
                component={Link} 
                to="/pricing"
                sx={{
                  fontWeight: 500,
                }}
              >
                Pricing
              </MenuItem>
              <MenuItem 
                onClick={handleMenuClose} 
                component={Link} 
                to="/onboarding"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }}
              >
                Start Free Trial
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}