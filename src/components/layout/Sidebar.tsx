import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, ListItemButton } from '@mui/material'
import {
  Home as HomeIcon,
  AttachMoney as PricingIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material'
import { Link } from 'react-router-dom'

interface SidebarProps {
  mobileOpen: boolean
  handleDrawerToggle: () => void
}

const drawerWidth = 240

export const Sidebar = ({ mobileOpen, handleDrawerToggle }: SidebarProps) => {
  const drawer = (
    <div>
      <Toolbar />
      <List>
        {[
          { text: 'Home', icon: <HomeIcon />, path: '/' },
          { text: 'Pricing', icon: <PricingIcon />, path: '/pricing' },
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  )
}