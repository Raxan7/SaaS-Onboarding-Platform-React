import { AppBar as MuiAppBar, Toolbar, IconButton, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

interface AppBarProps {
  handleDrawerToggle: () => void
}

export const AppBar = ({ handleDrawerToggle }: AppBarProps) => {
  return (
    <MuiAppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          SaaS Onboarding Platform
        </Typography>
      </Toolbar>
    </MuiAppBar>
  )
}