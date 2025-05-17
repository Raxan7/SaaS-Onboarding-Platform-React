// pages/ClientDashboard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new Dashboard page
    navigate('/dashboard');
  }, [navigate]);

  return null;
};

export default ClientDashboard;
