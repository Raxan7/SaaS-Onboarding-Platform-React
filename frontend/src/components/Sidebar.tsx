// filepath: /home/saidi/Projects/HighEndProjects/SaasPlatform/saas-onboarding-platform/frontend/src/components/Sidebar.tsx
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, useTheme } from '@mui/material';
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

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: "permanent" | "persistent" | "temporary";
}

const drawerWidth = 240;

export default function Sidebar({ open, onClose, variant }: SidebarProps) {
  const theme = useTheme();
  const location = useLocation();
  const { subscription } = useSubscription();
  
  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, px: 2, py: 3 }}>
        <List component="nav" disablePadding>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link as any}
                to={item.path}
                selected={isPathActive(item.path)}
                onClick={variant === 'temporary' ? onClose : undefined}
                sx={{
                  borderRadius: '8px',
                  margin: '4px 8px',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: isPathActive(item.path) ? 'primary.main' : 'text.secondary' 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isPathActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <List component="nav" disablePadding>
          {secondaryItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link as any}
                to={item.path}
                selected={isPathActive(item.path)}
                onClick={variant === 'temporary' ? onClose : undefined}
                sx={{
                  borderRadius: '8px',
                  margin: '4px 8px',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: isPathActive(item.path) ? 'primary.main' : 'text.secondary' 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{ 
                    fontWeight: isPathActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Subscription Status */}
      {subscription && (
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'background.default',
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box 
              sx={{ 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1,
                bgcolor: subscription.status === 'active' ? 'success.light' : 'warning.light',
                color: subscription.status === 'active' ? 'success.dark' : 'warning.dark',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {subscription.status === 'active' ? 'Active Plan' : 'Plan Expiring'}
            </Box>
            <Box sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
              {subscription.days_remaining} days left
            </Box>
          </Box>
          <Box sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {subscription.plan.name}
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
          boxShadow: variant === 'temporary' ? theme.shadows[8] : 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
