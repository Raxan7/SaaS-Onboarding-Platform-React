// components/ProtectedRouteWithUserType.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteWithUserTypeProps {
  requiredUserType: 'client' | 'host';
  redirectPath: string;
}

const ProtectedRouteWithUserType = ({ 
  requiredUserType, 
  redirectPath 
}: ProtectedRouteWithUserTypeProps) => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType !== requiredUserType) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRouteWithUserType;