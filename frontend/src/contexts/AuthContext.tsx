// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../utils/constants';
import axios from 'axios';

// Define the User type
type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
};

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  userType: string | null;
  user: User | null;
  token: string | null;
  login: (token: string, userType: string, user: User) => Promise<void>;
  logout: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
});

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUserType) {
      setToken(storedToken);
      setUserType(storedUserType);
      setIsAuthenticated(true);
      
      // Log state during initialization for debugging
      console.log('Token during initialization:', storedToken);
      console.log('UserType during initialization:', storedUserType);
      console.log('User during initialization:', storedUser ? JSON.parse(storedUser) : null);
      
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user', e);
        }
      }
      
      // Also set the token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Token ${storedToken}`;
    }
  }, []);
  
  const login = async (newToken: string, newUserType: string, newUser: User): Promise<void> => {
    // Store in state
    setToken(newToken);
    setUserType(newUserType);
    setUser(newUser);
    setIsAuthenticated(true);
    
    // Store in localStorage
    localStorage.setItem('token', newToken);
    localStorage.setItem('userType', newUserType);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Set for all axios requests
    axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;
    
    console.log('Login successful:', { newToken, newUserType, newUser });
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
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);