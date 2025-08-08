import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { recommendationAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useProgress } from './ProgressContext';

// Initial state
const initialState = {
  recommendations: [],
  isLoading: false,
  error: null,
  lastGenerated: null,
  userPreferences: {
    preferredDifficulty: 'medium',
    preferredContentTypes: ['video', 'quiz'],
    learningGoals: [],
    timeAvailable: 45, // minutes per session
    subjectPriorities: {}
  },
  recommendationHistory: [],
  feedbackData: {},
  analytics: {
    recommendationsViewed: 0,
    recommendationsCompleted: 0,
    averageRating: 0,
    topPerformingReasons: [],
    conversionRate: 0
  }
};

// Action types
const RECOMMENDATION_ACTIONS = {
  GENERATE_START: 'GENERATE_START',
  GENERATE_SUCCESS: 'GENERATE_SUCCESS',
  GENERATE_FAILURE: 'GENERATE_FAILURE',
  TRACK_INTERACTION: 'TRACK_INTERACTION',
  PROVIDE_FEEDBACK: 'PROVIDE_FEEDBACK',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  CLEAR_RECOMMENDATIONS: 'CLEAR_RECOMMENDATIONS',
  MARK_AS_COMPLETED: 'MARK_AS_COMPLETED',
  DISMISS_RECOMMENDATION: 'DISMISS_RECOMMENDATION',
  UPDATE_ANALYTICS: 'UPDATE_ANALYTICS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const recommendationReducer = (state, action) => {
  switch (action.type) {
    case RECOMMENDATION_ACTIONS.GENERATE_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case RECOMMENDATION_ACTIONS.GENERATE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        recommendations: action.payload,
        lastGenerated: new Date().toISOString(),
        error: null
      };

    case RECOMMENDATION_ACTIONS.GENERATE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case RECOMMENDATION_ACTIONS.TRACK_INTERACTION:
      const { recommendationId, action: interactionAction } = action.payload;
      
      return {
        ...state,
        recommendations: state.recommendations.map(rec =>
          rec._id === recommendationId
            ? {
                ...rec,
                interactions: [...(rec.interactions || []), {
                  action: interactionAction,
                  timestamp: new Date().toISOString()
                }]
              }
            : rec
        ),
        recommendationHistory: [
          ...state.recommendationHistory,
          {
            recommendationId,
            action: interactionAction,
            timestamp: new Date().toISOString()
          }
        ]
      };

    case RECOMMENDATION_ACTIONS.PROVIDE_FEEDBACK:
      return {
        ...state,
        feedbackData: {
          ...state.feedbackData,
          [action.payload.recommendationId]: action.payload.feedback
        }
      };

    case RECOMMENDATION_ACTIONS.UPDATE_PREFERENCES:
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      };

    case RECOMMENDATION_ACTIONS.CLEAR_RECOMMENDATIONS:
      return {
        ...state,
        recommendations: []
      };

    case RECOMMENDATION_ACTIONS.MARK_AS_COMPLETED:
      return {
        ...state,
        recommendations: state.recommendations.map(rec =>
          rec._id === action.payload.recommendationId
            ? { ...rec, status: 'completed', completedAt: new Date().toISOString() }
            : rec
        )
      };

    case RECOMMENDATION_ACTIONS.DISMISS_RECOMMENDATION:
      return {
        ...state,
        recommendations: state.recommendations.filter(rec => 
          rec._id !== action.payload.recommendationId
        )
      };

    case RECOMMENDATION_ACTIONS.UPDATE_ANALYTICS:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.payload
        }
      };

    case RECOMMENDATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const RecommendationContext = createContext();

// RecommendationProvider component
export const RecommendationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(recommendationReducer, initialState);
  const { user } = useAuth();
  const { progress, quizAttempts } = useProgress();

  // Auto-generate recommendations when user data changes
  useEffect(() => {
    if (user && progress.length > 0) {
      const timeSinceLastGeneration = state.lastGenerated 
        ? Date.now() - new Date(state.lastGenerated).getTime()
        : Infinity;
      // Regenerate recommendations every hour or if no recommendations exist
      if (timeSinceLastGeneration > 3600000 || state.recommendations.length === 0) {
        generateUserRecommendations();
      }
    }
  }, [user, progress, quizAttempts]);

  // Strictly backend-driven recommendation generation
  const generateUserRecommendations = async (forceRegenerate = false) => {
    if (!user) return;
    try {
      dispatch({ type: RECOMMENDATION_ACTIONS.GENERATE_START });
      // Always use backend API for recommendations
      if (forceRegenerate) {
        await recommendationAPI.generateRecommendations(user._id);
      }
      const res = await recommendationAPI.getRecommendations(user._id);
      dispatch({ type: RECOMMENDATION_ACTIONS.GENERATE_SUCCESS, payload: res.data });
    } catch (err) {
      dispatch({ type: RECOMMENDATION_ACTIONS.GENERATE_FAILURE, payload: err.message || 'Failed to generate recommendations' });
    }
  };

  // Track recommendation interaction
  const trackInteraction = async (recommendationId, action) => {
    try {
      // In real implementation: await recommendationAPI.trackRecommendationUsage(recommendationId, action);
      
      dispatch({
        type: RECOMMENDATION_ACTIONS.TRACK_INTERACTION,
        payload: { recommendationId, action }
      });

      // Update analytics based on action
      if (action === 'clicked') {
        updateAnalytics({
          recommendationsViewed: state.analytics.recommendationsViewed + 1
        });
      } else if (action === 'completed') {
        dispatch({
          type: RECOMMENDATION_ACTIONS.MARK_AS_COMPLETED,
          payload: { recommendationId }
        });
        updateAnalytics({
          recommendationsCompleted: state.analytics.recommendationsCompleted + 1
        });
      }

    } catch (error) {
      console.error('Failed to track recommendation interaction:', error);
    }
  };

  // Provide feedback on recommendation
  const provideFeedback = async (recommendationId, feedback) => {
    try {
      // In real implementation: await recommendationAPI.provideFeedback(recommendationId, feedback);
      
      dispatch({
        type: RECOMMENDATION_ACTIONS.PROVIDE_FEEDBACK,
        payload: { recommendationId, feedback }
      });

      // Update analytics with feedback
      const currentRatings = Object.values(state.feedbackData).filter(f => f.rating);
      const newAverageRating = currentRatings.length > 0 
        ? (currentRatings.reduce((sum, f) => sum + f.rating, 0) + feedback.rating) / (currentRatings.length + 1)
        : feedback.rating;

      updateAnalytics({
        averageRating: newAverageRating
      });

    } catch (error) {
      console.error('Failed to provide feedback:', error);
    }
  };

  // Update user preferences
  const updatePreferences = (preferences) => {
    dispatch({
      type: RECOMMENDATION_ACTIONS.UPDATE_PREFERENCES,
      payload: preferences
    });

    // Regenerate recommendations with new preferences
    setTimeout(() => {
      generateUserRecommendations(true);
    }, 500);
  };

  // Dismiss recommendation
  const dismissRecommendation = (recommendationId, reason = 'not_interested') => {
    trackInteraction(recommendationId, 'dismissed');
    
    dispatch({
      type: RECOMMENDATION_ACTIONS.DISMISS_RECOMMENDATION,
      payload: { recommendationId }
    });

    // Store dismissal reason for future improvement
    provideFeedback(recommendationId, {
      helpful: false,
      reason: reason,
      dismissedAt: new Date().toISOString()
    });
  };

  // Get recommendations by priority
  const getRecommendationsByPriority = () => {
    return [...state.recommendations]
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 5);
  };

  // Get recommendations by subject
  const getRecommendationsBySubject = (subjectId) => {
    return state.recommendations.filter(rec => rec.subject === subjectId);
  };

  // Get recommendations by difficulty
  const getRecommendationsByDifficulty = (difficulty) => {
    return state.recommendations.filter(rec => 
      rec.difficulty?.toLowerCase() === difficulty.toLowerCase()
    );
  };

  // Calculate recommendation effectiveness
  const getRecommendationEffectiveness = () => {
    const totalRecommendations = state.recommendationHistory.length;
    const completedRecommendations = state.recommendationHistory.filter(
      h => h.action === 'completed'
    ).length;
    const clickedRecommendations = state.recommendationHistory.filter(
      h => h.action === 'clicked'
    ).length;

    return {
      conversionRate: totalRecommendations > 0 ? (completedRecommendations / totalRecommendations) * 100 : 0,
      clickThroughRate: totalRecommendations > 0 ? (clickedRecommendations / totalRecommendations) * 100 : 0,
      totalGenerated: totalRecommendations,
      totalCompleted: completedRecommendations
    };
  };

  // Update analytics
  const updateAnalytics = (analyticsUpdate) => {
    dispatch({
      type: RECOMMENDATION_ACTIONS.UPDATE_ANALYTICS,
      payload: analyticsUpdate
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: RECOMMENDATION_ACTIONS.CLEAR_ERROR });
  };

  // Get personalized learning path
  const getPersonalizedLearningPath = () => {
    if (!user || state.recommendations.length === 0) return null;

    const prioritizedRecs = getRecommendationsByPriority();
    const userLevel = user.level || 'O-Level';
    
    return {
      currentLevel: userLevel,
      nextTopics: prioritizedRecs.slice(0, 3),
      suggestedSequence: prioritizedRecs.map(rec => ({
        topicId: rec._id,
        name: rec.name,
        estimatedTime: rec.estimatedTime,
        difficulty: rec.difficulty,
        prerequisites: rec.prerequisites || []
      })),
      totalEstimatedTime: prioritizedRecs.reduce((total, rec) => {
        const time = parseInt(rec.estimatedTime) || 45;
        return total + time;
      }, 0),
      completionTarget: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString() // 1 week from now
    };
  };

  // Smart scheduling based on user patterns
  const getSmartSchedule = () => {
    const timeSlots = {
      morning: { start: '08:00', end: '12:00', effectiveness: 0.85 },
      afternoon: { start: '13:00', end: '17:00', effectiveness: 0.75 },
      evening: { start: '18:00', end: '22:00', effectiveness: 0.90 }
    };

    const recommendations = getRecommendationsByPriority();
    const userPreferredTime = state.userPreferences.timeAvailable || 45;

    return recommendations.map(rec => {
      const estimatedMinutes = parseInt(rec.estimatedTime) || 45;
      const sessions = Math.ceil(estimatedMinutes / userPreferredTime);
      
      return {
        topicId: rec._id,
        name: rec.name,
        sessionsNeeded: sessions,
        sessionDuration: Math.min(estimatedMinutes, userPreferredTime),
        recommendedTimeSlot: estimatedMinutes > 60 ? 'evening' : 'afternoon',
        priority: rec.priority || 1
      };
    });
  };

  const value = {
    // State
    recommendations: state.recommendations,
    isLoading: state.isLoading,
    error: state.error,
    userPreferences: state.userPreferences,
    recommendationHistory: state.recommendationHistory,
    feedbackData: state.feedbackData,
    analytics: state.analytics,
    lastGenerated: state.lastGenerated,

    // Actions
    generateUserRecommendations,
    trackInteraction,
    provideFeedback,
    updatePreferences,
    dismissRecommendation,
    clearError,

    // Getters
    getRecommendationsByPriority,
    getRecommendationsBySubject,
    getRecommendationsByDifficulty,
    getRecommendationEffectiveness,
    getPersonalizedLearningPath,
    getSmartSchedule
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};

// Custom hook to use recommendation context
export const useRecommendations = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }

  // Add these methods to your existing context
  const getSmartRecommendations = async () => {
    // Implementation from SmartSuggestions component
  };
  
  const generateAdaptivePath = async (userProgress, levelInfo) => {
    // Implementation from LearningPath component
  };
  
  const recordSuggestionInteraction = async (suggestionId, action) => {
    // Track user interactions with suggestions
  };

  return {
    ...context,
    getSmartRecommendations,
    generateAdaptivePath,
    recordSuggestionInteraction
  };
};

export default RecommendationContext;