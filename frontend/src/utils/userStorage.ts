/**
 * Utilities for safely handling user data in localStorage
 */

import { User } from "../types/user";

/**
 * Safely gets the user data from localStorage
 * @returns User object or null if not found or corrupted
 */
export const getSafeUserData = (): User | null => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    // Handle any non-object or malformed data
    if (userData === 'undefined' || userData === 'null') {
      localStorage.removeItem('user');
      return null;
    }
    
    const parsedUser = JSON.parse(userData);
    
    // Validate the user object structure with defaults for missing properties
    if (parsedUser && typeof parsedUser === 'object') {
      return {
        id: parsedUser.id || 0,
        email: parsedUser.email || '',
        first_name: parsedUser.first_name || '',
        last_name: parsedUser.last_name || '',
        user_type: parsedUser.user_type || 'client',
        company_name: parsedUser.company_name || ''
      };
    }
    
    // Invalid structure, clean up
    localStorage.removeItem('user');
    return null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    localStorage.removeItem('user');
    return null;
  }
};

/**
 * Safely stores user data in localStorage
 * @param user User object to store
 * @returns boolean indicating success
 */
export const setSafeUserData = (user: User): boolean => {
  try {
    if (!user || typeof user !== 'object') {
      return false;
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error storing user data in localStorage:', error);
    return false;
  }
};
