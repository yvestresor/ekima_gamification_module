// useProgress hook - Custom hook for progress management
// This is a re-export of the ProgressContext for easier import

import { useContext } from 'react';
import ProgressContext from '../context/ProgressContext';

/**
 * Custom hook to use the Progress context
 * Provides access to learning progress state and methods
 */
export const useProgress = () => {
  const context = useContext(ProgressContext);
  
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  
  return context;
};

export default useProgress;