// src/components/recommendations/RecommendationEngine.js

import React from 'react';
import { useRecommendations } from '../../context/RecommendationContext';

/**
 * RecommendationEngine component that displays backend-driven recommendations
 */
const RecommendationEngine = ({
  maxRecommendations = 6,
  showExplanations = true,
  onRecommendationClick = null,
  onFeedback = null,
  className = ''
}) => {
  const { recommendations, isLoading } = useRecommendations();
  // Only render recommendations from context/backend
  if (isLoading) return <div>Loading recommendations...</div>;
  if (!recommendations || recommendations.length === 0) return <div>No recommendations available.</div>;
  return (
    <div className={`recommendation-engine ${className}`}>
      {recommendations.slice(0, maxRecommendations).map(rec => (
        <div key={rec._id || rec.id} className="recommendation-card">
          <h4>{rec.title}</h4>
          <p>{rec.description}</p>
          {showExplanations && rec.reasoning && <small>{rec.reasoning}</small>}
          {/* Add more fields as needed */}
        </div>
      ))}
    </div>
  );
};

export default RecommendationEngine;