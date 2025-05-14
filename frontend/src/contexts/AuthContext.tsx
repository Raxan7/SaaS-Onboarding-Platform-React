// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'client' | 'host';
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  userType: 'client' | 'host' | null;
  partialToken: string | null; // For registration flow
  login: (token: string, userType: 'client' | 'host', user: User) => Promise<{ isComplete: boolean }>;
  setPartialAuth: (token: string) => void; // For registration flow
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | {};
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [partialToken, setPartialToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'client' | 'host' | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false); // Track initialization

  useEffect(() => {
    // Initialize token, userType, and user from localStorage if available
    const storedToken = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType') as 'client' | 'host' | null;
    const storedUser = localStorage.getItem('user');
    console.log('Token during initialization:', storedToken); // Debugging log
    console.log('UserType during initialization:', storedUserType); // Debugging log
    console.log('User during initialization:', storedUser); // Debugging log
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUserType) {
      setUserType(storedUserType);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user'); // Clear invalid data
      }
    }
    setIsAuthInitialized(true); // Mark initialization as complete
  }, []);

  const setPartialAuth = (token: string) => {
    setPartialToken(token);
  };

  const login = async (newToken: string, newUserType: 'client' | 'host', data: any): Promise<{ isComplete: boolean }> => {
    if (!data) {
      console.error('Login response did not include user data:', data);
      throw new Error('User data is missing in the login response.');
    }

    const user = {
      id: data.user_id, // Correctly map user_id to id
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      user_type: data.user_type
    };

    console.log('Constructed user object:', user); // Debugging log

    localStorage.setItem('token', newToken);
    localStorage.setItem('userType', newUserType);
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data in localStorage:', error);
    }
    setToken(newToken);
    setUserType(newUserType);
    setUser(user);
    setPartialToken(null);

    // Simulate checking if onboarding is complete
    const isComplete = true; // Replace with actual logic if needed
    return { isComplete };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType'); // Remove user type
    localStorage.removeItem('user'); // Remove user data
    setToken(null);
    setUserType(null);
    setUser(null); // Clear user data
    setPartialToken(null);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` }; // Ensure correct format
    }
    console.warn('No token found in localStorage');
    return {}; // Return an empty object if no token is found
  };

  if (!isAuthInitialized) {
    return null; // Prevent rendering until auth is initialized
  }

  return (
    <AuthContext.Provider value={{
      token,
      isAuthenticated: !!token,
      user,
      userType,
      partialToken, // Add this
      login,
      setPartialAuth, // Add this
      logout,
      getAuthHeader
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};