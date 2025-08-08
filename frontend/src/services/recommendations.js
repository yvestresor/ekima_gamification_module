// Recommendations service - handles AI-powered learning recommendations

import { apiClient } from './api';
import { generateRecommendations } from '../utils/recommendationAlgorithm';
import { ANALYTICS_EVENTS } from '../utils/constants';

/**
 * Recommendations Service for managing personalized learning suggestions
 */
class RecommendationsService {
  constructor() {
    this.cachedRecommendations = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    this.feedbackQueue = [];
  }

  // ============================================================================
  // RECOMMENDATION GENERATION
  // ============================================================================

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId, options = {}) {
    try {
      const cacheKey = `${userId}_${JSON.stringify(options)}`;
      
      // Check cache first
      if (this.isCacheValid(cacheKey)) {
        const cached = this.cachedRecommendations.get(cacheKey);
        this.trackRecommendationEvent('recommendations_cache_hit', { userId });
        return cached.data;
      }

      // Fetch from API
      const response = await apiClient.get(`/recommendations/${userId}`, {
        params: options
      });

      // Cache the results
      this.cacheRecommendations(cacheKey, response.data);
      
      this.trackRecommendationEvent('recommendations_generated', {
        userId,
        count: response.data.length,
        source: 'api'
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to local generation if API fails
      return this.generateLocalRecommendations(userId, options);
    }
  }

  /**
   * Generate recommendations locally using the algorithm
   */
  async generateLocalRecommendations(userId, options = {}) {
    try {
      // This would typically fetch user data, progress, etc.
      // For now, using mock data - replace with actual API calls
      const [userData, progressData, topicsData] = await Promise.all([
        this.getUserData(userId),
        this.getUserProgress(userId),
        this.getAvailableTopics(options)
      ]);

      const recommendations = generateRecommendations(
        userData,
        progressData.progress,
        progressData.quizAttempts,
        topicsData,
        options.subjects || []
      );

      this.trackRecommendationEvent('recommendations_generated', {
        userId,
        count: recommendations.length,
        source: 'local_algorithm'
      });

      return recommendations;
    } catch (error) {
      console.error('Error generating local recommendations:', error);
      return [];
    }
  }

  /**
   * Force refresh recommendations (bypass cache)
   */
  async refreshRecommendations(userId, options = {}) {
    try {
      const cacheKey = `${userId}_${JSON.stringify(options)}`;
      this.cachedRecommendations.delete(cacheKey);
      
      const response = await apiClient.post(`/recommendations/generate/${userId}`, options);
      
      this.cacheRecommendations(cacheKey, response.data);
      
      this.trackRecommendationEvent('recommendations_refreshed', {
        userId,
        count: response.data.length
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      throw error;
    }
  }

  // ============================================================================
  // RECOMMENDATION INTERACTION TRACKING
  // ============================================================================

  /**
   * Track when a user views recommendations
   */
  async trackRecommendationView(recommendationId, userId, metadata = {}) {
    try {
      await apiClient.post('/recommendations/track', {
        recommendationId,
        userId,
        action: 'viewed',
        metadata,
        timestamp: new Date().toISOString()
      });

      this.trackRecommendationEvent('recommendation_viewed', {
        recommendationId,
        userId,
        ...metadata
      });
    } catch (error) {
      console.error('Error tracking recommendation view:', error);
    }
  }

  /**
   * Track when a user clicks on a recommendation
   */
  async trackRecommendationClick(recommendationId, userId, metadata = {}) {
    try {
      await apiClient.post('/recommendations/track', {
        recommendationId,
        userId,
        action: 'clicked',
        metadata,
        timestamp: new Date().toISOString()
      });

      this.trackRecommendationEvent('recommendation_clicked', {
        recommendationId,
        userId,
        ...metadata
      });
    } catch (error) {
      console.error('Error tracking recommendation click:', error);
    }
  }

  /**
   * Track when a user completes a recommended topic
   */
  async trackRecommendationCompletion(recommendationId, userId, completionData = {}) {
    try {
      await apiClient.post('/recommendations/track', {
        recommendationId,
        userId,
        action: 'completed',
        metadata: completionData,
        timestamp: new Date().toISOString()
      });

      this.trackRecommendationEvent('recommendation_completed', {
        recommendationId,
        userId,
        ...completionData
      });
    } catch (error) {
      console.error('Error tracking recommendation completion:', error);
    }
  }

  /**
   * Track when a user dismisses a recommendation
   */
  async trackRecommendationDismissal(recommendationId, userId, reason = null) {
    try {
      await apiClient.post('/recommendations/track', {
        recommendationId,
        userId,
        action: 'dismissed',
        metadata: { reason },
        timestamp: new Date().toISOString()
      });

      this.trackRecommendationEvent('recommendation_dismissed', {
        recommendationId,
        userId,
        reason
      });
    } catch (error) {
      console.error('Error tracking recommendation dismissal:', error);
    }
  }

  // ============================================================================
  // FEEDBACK MANAGEMENT
  // ============================================================================

  /**
   * Submit feedback on a recommendation
   */
  async submitRecommendationFeedback(recommendationId, userId, feedback) {
    try {
      const feedbackData = {
        recommendationId,
        userId,
        feedback: {
          ...feedback,
          timestamp: new Date().toISOString()
        }
      };

      await apiClient.post('/recommendations/feedback', feedbackData);

      this.trackRecommendationEvent('recommendation_feedback', {
        recommendationId,
        userId,
        rating: feedback.rating,
        helpful: feedback.helpful
      });

      return feedbackData;
    } catch (error) {
      console.error('Error submitting recommendation feedback:', error);
      // Queue for later submission if API is down
      this.queueFeedback(recommendationId, userId, feedback);
      throw error;
    }
  }

  /**
   * Queue feedback for later submission
   */
  queueFeedback(recommendationId, userId, feedback) {
    this.feedbackQueue.push({
      recommendationId,
      userId,
      feedback: {
        ...feedback,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Process queued feedback
   */
  async processQueuedFeedback() {
    if (this.feedbackQueue.length === 0) return;

    try {
      await apiClient.post('/recommendations/feedback/batch', {
        feedback: this.feedbackQueue
      });

      this.feedbackQueue = [];
    } catch (error) {
      console.error('Error processing queued feedback:', error);
    }
  }

  // ============================================================================
  // RECOMMENDATION ANALYTICS
  // ============================================================================

  /**
   * Get recommendation analytics for a user
   */
  async getRecommendationAnalytics(userId, timeframe = '30d') {
    try {
      const response = await apiClient.get(`/recommendations/analytics/${userId}`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendation analytics:', error);
      throw error;
    }
  }

  /**
   * Get recommendation effectiveness metrics
   */
  async getRecommendationEffectiveness(userId) {
    try {
      const response = await apiClient.get(`/recommendations/effectiveness/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendation effectiveness:', error);
      return {
        clickThroughRate: 0,
        completionRate: 0,
        averageRating: 0,
        totalRecommendations: 0,
        totalClicks: 0,
        totalCompletions: 0
      };
    }
  }

  // ============================================================================
  // SMART RECOMMENDATIONS
  // ============================================================================

  /**
   * Get contextual recommendations based on current activity
   */
  async getContextualRecommendations(userId, context) {
    try {
      const response = await apiClient.post(`/recommendations/contextual/${userId}`, {
        context: {
          ...context,
          timestamp: new Date().toISOString()
        }
      });

      this.trackRecommendationEvent('contextual_recommendations_requested', {
        userId,
        context: context.type
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching contextual recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendations for learning path continuation
   */
  async getPathRecommendations(userId, currentTopicId) {
    try {
      const response = await apiClient.get(`/recommendations/path/${userId}`, {
        params: { currentTopicId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching path recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendations based on peer learning patterns
   */
  async getPeerBasedRecommendations(userId, options = {}) {
    try {
      const response = await apiClient.get(`/recommendations/peer/${userId}`, {
        params: options
      });

      this.trackRecommendationEvent('peer_recommendations_requested', {
        userId,
        options
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching peer-based recommendations:', error);
      return [];
    }
  }

  // ============================================================================
  // RECOMMENDATION SCHEDULING
  // ============================================================================

  /**
   * Get scheduled recommendations based on user's learning schedule
   */
  async getScheduledRecommendations(userId, timeSlot) {
    try {
      const response = await apiClient.get(`/recommendations/scheduled/${userId}`, {
        params: { timeSlot }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled recommendations:', error);
      return [];
    }
  }

  /**
   * Update user's recommendation preferences
   */
  async updateRecommendationPreferences(userId, preferences) {
    try {
      const response = await apiClient.put(`/recommendations/preferences/${userId}`, preferences);
      
      // Clear cache to force refresh with new preferences
      this.clearUserCache(userId);
      
      this.trackRecommendationEvent('preferences_updated', {
        userId,
        preferences
      });

      return response.data;
    } catch (error) {
      console.error('Error updating recommendation preferences:', error);
      throw error;
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Check if cached data is still valid
   */
  isCacheValid(cacheKey) {
    const cached = this.cachedRecommendations.get(cacheKey);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < this.cacheExpiry;
  }

  /**
   * Cache recommendations data
   */
  cacheRecommendations(cacheKey, data) {
    this.cachedRecommendations.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache for a specific user
   */
  clearUserCache(userId) {
    const keysToDelete = [];
    for (const [key] of this.cachedRecommendations) {
      if (key.startsWith(userId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cachedRecommendations.delete(key));
  }

  /**
   * Clear all cached recommendations
   */
  clearAllCache() {
    this.cachedRecommendations.clear();
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get user data for recommendations
   */
  async getUserData(userId) {
    // This would fetch from your user API
    // For now, returning mock data
    return {
      _id: userId,
      level: 'O-Level',
      preferences: {},
      learningStyle: 'visual'
    };
  }

  /**
   * Get user progress data
   */
  async getUserProgress(userId) {
    // This would fetch from your progress API
    // For now, returning mock data
    return {
      progress: [],
      quizAttempts: []
    };
  }

  /**
   * Get available topics for recommendations
   */
  async getAvailableTopics(options) {
    // This would fetch from your content API
    // For now, returning mock data
    return [];
  }

  /**
   * Track recommendation-related analytics events
   */
  trackRecommendationEvent(eventName, properties = {}) {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        source: 'recommendations_service'
      });
    }

    console.log(`Recommendation Event: ${eventName}`, properties);
  }

  /**
   * Calculate recommendation confidence score
   */
  calculateConfidence(recommendation, userProfile) {
    // Implementation of confidence calculation
    // This would consider various factors like user performance, preferences, etc.
    let confidence = 0.5; // Base confidence

    // Adjust based on user performance in subject
    if (userProfile.subjectPerformance?.[recommendation.subject] >= 80) {
      confidence += 0.2;
    }

    // Adjust based on difficulty match
    if (recommendation.difficulty === userProfile.preferredDifficulty) {
      confidence += 0.15;
    }

    // Adjust based on time availability
    const estimatedMinutes = parseInt(recommendation.estimatedTime) || 45;
    if (estimatedMinutes <= userProfile.avgSessionTime) {
      confidence += 0.1;
    }

    return Math.min(confidence, 0.95); // Cap at 95%
  }
}

// Create and export a singleton instance
const recommendationsService = new RecommendationsService();
export default recommendationsService;