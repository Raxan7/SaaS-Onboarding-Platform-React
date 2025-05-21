// components/ProtectedRouteWithUserType.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface ProtectedRouteWithUserTypeProps {
  requiredUserType: 'client' | 'host';
  redirectPath: string;
}

const ProtectedRouteWithUserType = ({ 
  requiredUserType, 
  redirectPath 
}: ProtectedRouteWithUserTypeProps) => {
  const { isAuthenticated, userType } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/onboarding/user-onboarding-status/`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const statusData = await response.json();
          setIsOnboardingComplete(statusData.is_complete || false);
        } else {
          console.error('Failed to fetch onboarding status');
          setIsOnboardingComplete(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated]);

  if (isLoading) {
    // You could show a loading spinner here
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType !== requiredUserType) {
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated but onboarding isn't complete, redirect to onboarding
  // Only enforce onboarding completion for client users
  if (!isOnboardingComplete && userType === 'client' && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRouteWithUserType;