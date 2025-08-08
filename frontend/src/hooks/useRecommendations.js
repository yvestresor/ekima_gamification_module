// useRecommendations hook - Custom hook for recommendation management
// This is a re-export of the RecommendationContext for easier import

import { useContext } from 'react';
import RecommendationContext from '../context/RecommendationContext';

/**
 * Custom hook to use the Recommendation context
 * Provides access to recommendation state and methods
 */
export const useRecommendations = () => {
  const context = useContext(RecommendationContext);
  
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }
  
  return context;
};

export default useRecommendations;