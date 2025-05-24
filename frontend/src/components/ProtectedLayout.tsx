import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import ProtectedFooter from './ProtectedFooter';

interface ProtectedLayoutProps {
  children?: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh' 
      }}
    >
      <Box sx={{ flex: 1 }}>
        {children || <Outlet />}
      </Box>
      <ProtectedFooter />
    </Box>
  );
}
