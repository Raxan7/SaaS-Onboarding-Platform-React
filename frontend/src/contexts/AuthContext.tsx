// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../utils/constants';
import axios from 'axios';
import { User } from '../types/user';
import { getSafeUserData } from '../utils/userStorage';

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  userType: string | null;
  user: User | null;
  token: string | null;
  login: (token: string, userType: string, user: User) => Promise<void>;
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | {};
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  getAuthHeader: () => ({}),
});

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      
      if (storedToken && storedUserType) {
        setToken(storedToken);
        setUserType(storedUserType);
        setIsAuthenticated(true);
        
        // Log state during initialization for debugging
        console.log('Token during initialization:', storedToken);
        console.log('UserType during initialization:', storedUserType);
        
        // Use our utility function to safely get user data
        const safeUser = getSafeUserData();
        if (safeUser) {
          console.log('User during initialization:', safeUser);
          setUser(safeUser);
        }
        
        // Also set the token in axios defaults
        axios.defaults.headers.common['Authorization'] = `Token ${storedToken}`;
      }
    } catch (error) {
      console.error('Error initializing auth from localStorage:', error);
      // Reset localStorage if there was a critical error
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
    }
  }, []);
  
  const login = async (newToken: string, newUserType: string, newUser: User): Promise<void> => {
    // Store in state
    setToken(newToken);
    setUserType(newUserType);
    setUser(newUser);
    setIsAuthenticated(true);
    
    try {
      // Store in localStorage with error handling
      localStorage.setItem('token', newToken);
      localStorage.setItem('userType', newUserType);
      
      // Store user data safely - making sure it's a valid object
      if (newUser && typeof newUser === 'object') {
        localStorage.setItem('user', JSON.stringify({
          id: newUser.id || 0,
          email: newUser.email || '',
          first_name: newUser.first_name || '',
          last_name: newUser.last_name || '',
          user_type: newUser.user_type || 'client',
          company_name: newUser.company_name || ''
        }));
      }
      
      // Set for all axios requests
      axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;
      
      console.log('Login successful:', { newToken, newUserType });
    } catch (error) {
      console.error('Error saving auth data to localStorage:', error);
    }
  };
  
  const logout = () => {
    // Attempt to logout on the server
    fetch(`${API_BASE_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Token ${token}` : '',
      },
      credentials: 'include',
    }).catch(err => {
      console.error('Error during logout:', err);
    }).finally(() => {
      // Clear state regardless of server response
      setToken(null);
      setUserType(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
    });
  };
  
  // Add getAuthHeader method to generate Authorization headers
  const getAuthHeader = () => {
    return token ? { Authorization: `Token ${token}` } : {};
  };
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userType, 
      user, 
      token, 
      login, 
      logout,
      getAuthHeader
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);