import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, useTheme, Typography } from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  CreditCard as PaymentIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  SupportAgent as SupportIcon,
  Article as DocumentIcon
} from '@mui/icons-material';
import { useLocation, Link } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: "permanent" | "persistent" | "temporary";
}

const drawerWidth = 240;
const headerHeight = 72;

export default function Sidebar({ open, onClose, variant }: SidebarProps) {
  const theme = useTheme();
  const location = useLocation();
  const { subscription } = useSubscription();
  const { userType } = useAuth();
  
  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: userType === 'host' ? '/host-dashboard' : '/client-dashboard' },
    { text: 'Meetings', icon: <CalendarIcon />, path: '/meetings' },
    { text: 'Subscription', icon: <PaymentIcon />, path: '/subscription' },
    { text: 'Support', icon: <SupportIcon />, path: '/support' },
    { text: 'Knowledge Base', icon: <DocumentIcon />, path: '/knowledge-base' },
  ];

  const secondaryItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpIcon />, path: '/help' },
  ];

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      pt: variant === 'permanent' ? `${headerHeight}px` : 2,
      bgcolor: 'background.paper',
    }}>
      {/* Logo section for temporary sidebar */}
      {variant === 'temporary' && (
        <Box sx={{ px: 3, pb: 2, borderBottom: `1px solid ${theme.palette.divider}`, mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(90deg, #007BFF 0%, #6C63FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SaaS Platform
          </Typography>
        </Box>
      )}

      <Box sx={{ flexGrow: 1, px: 2, py: variant === 'permanent' ? 3 : 1 }}>
        <List component="nav" disablePadding>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link as any}
                to={item.path}
                selected={isPathActive(item.path)}
                onClick={variant === 'temporary' ? onClose : undefined}
                sx={{
                  borderRadius: '12px',
                  margin: '2px 8px',
                  mb: 0.5,
                  minHeight: 48,
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 0,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    transition: 'width 0.3s ease',
                    zIndex: 0,
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      boxShadow: `0 6px 16px ${theme.palette.primary.main}50`,
                    },
                    '&::before': {
                      width: '4px',
                    },
                  },
                  '&:hover': {
                    backgroundColor: isPathActive(item.path) ? theme.palette.primary.dark : theme.palette.action.hover,
                    transform: 'translateX(4px)',
                    '&::before': {
                      width: isPathActive(item.path) ? '4px' : '2px',
                    },
                  },
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    position: 'relative',
                    zIndex: 1,
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: isPathActive(item.path) ? 'inherit' : 'text.secondary',
                    transition: 'color 0.2s ease-in-out',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isPathActive(item.path) ? 600 : 500,
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2, mx: 2 }} />

        <List component="nav" disablePadding>
          {secondaryItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link as any}
                to={item.path}
                selected={isPathActive(item.path)}
                onClick={variant === 'temporary' ? onClose : undefined}
                sx={{
                  borderRadius: '12px',
                  margin: '2px 8px',
                  mb: 0.5,
                  minHeight: 48,
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 0,
                    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                    transition: 'width 0.3s ease',
                    zIndex: 0,
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.secondary.main,
                    color: 'white',
                    boxShadow: `0 4px 12px ${theme.palette.secondary.main}40`,
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.dark,
                      boxShadow: `0 6px 16px ${theme.palette.secondary.main}50`,
                    },
                    '&::before': {
                      width: '4px',
                    },
                  },
                  '&:hover': {
                    backgroundColor: isPathActive(item.path) ? theme.palette.secondary.dark : theme.palette.action.hover,
                    transform: 'translateX(4px)',
                    '&::before': {
                      width: isPathActive(item.path) ? '4px' : '2px',
                    },
                  },
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    position: 'relative',
                    zIndex: 1,
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: isPathActive(item.path) ? 'inherit' : 'text.secondary',
                    transition: 'color 0.2s ease-in-out',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{ 
                    fontWeight: isPathActive(item.path) ? 600 : 500,
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Enhanced Subscription Status */}
      {subscription && (
        <Box 
          sx={{ 
            m: 2,
            p: 2, 
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
            border: `1px solid ${theme.palette.divider}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: subscription.status === 'active' 
                ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                : `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box 
              sx={{ 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1,
                bgcolor: subscription.status === 'active' ? 'success.main' : 'warning.main',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {subscription.status === 'active' ? 'Active' : 'Expiring'}
            </Box>
            <Box sx={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: 'text.secondary',
              backgroundColor: theme.palette.background.paper,
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}>
              {subscription.days_remaining}d left
            </Box>
          </Box>
          <Box sx={{ 
            fontSize: '0.875rem', 
            fontWeight: 600,
            color: 'text.primary',
            mb: 0.5
          }}>
            {subscription.plan.name}
          </Box>
          <Box sx={{ 
            fontSize: '0.75rem', 
            color: 'text.secondary',
            opacity: 0.8
          }}>
            Manage your subscription
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: variant === 'permanent' ? 'block' : 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
          boxShadow: variant === 'temporary' ? theme.shadows[8] : `inset -1px 0 0 ${theme.palette.divider}`,
          backgroundImage: variant === 'permanent' 
            ? `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
            : 'none',
          // Ensure sidebar has proper z-index and doesn't interfere with footer
          zIndex: variant === 'permanent' ? theme.zIndex.drawer : theme.zIndex.modal,
          // Add subtle texture and depth
          '&::before': variant === 'permanent' ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}05, transparent 50%, ${theme.palette.secondary.main}05)`,
            pointerEvents: 'none',
          } : {},
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
