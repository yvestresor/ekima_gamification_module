// useAuth hook - Custom hook for authentication management
// This is a re-export of the AuthContext for easier import

import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Custom hook to use the Auth context
 * Provides access to authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;