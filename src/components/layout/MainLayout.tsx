import { Box, CssBaseline, Toolbar } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { AppBar } from './AppBar';
import { Sidebar } from './Sidebar';
import { useState } from 'react'
import { ReactNode } from 'react';

interface MainLayoutProps {
  children?: ReactNode;
}

const drawerWidth = 240

const MainLayout = ({ children }: MainLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar handleDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
        <Outlet />
      </Box>
    </Box>
  )
}

export default MainLayout