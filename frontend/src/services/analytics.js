// src/services/analytics.js

/**
 * Analytics service for tracking user behavior, learning patterns, and performance metrics
 * Provides comprehensive analytics for the Ekima Learning Platform
 */

import { formatDate, getTimePeriod } from '../utils/dateUtils';

// Analytics event types
export const ANALYTICS_EVENTS = {
  // Learning Events
  CHAPTER_STARTED: 'chapter_started',
  CHAPTER_COMPLETED: 'chapter_completed',
  CHAPTER_ABANDONED: 'chapter_abandoned',
  
  // Quiz Events
  QUIZ_STARTED: 'quiz_started',
  QUIZ_COMPLETED: 'quiz_completed',
  QUIZ_ABANDONED: 'quiz_abandoned',
  QUESTION_ANSWERED: 'question_answered',
  
  // Content Interaction
  VIDEO_PLAYED: 'video_played',
  VIDEO_PAUSED: 'video_paused',
  VIDEO_COMPLETED: 'video_completed',
  EXPERIMENT_STARTED: 'experiment_started',
  EXPERIMENT_COMPLETED: 'experiment_completed',
  SIMULATION_STARTED: 'simulation_started',
  SIMULATION_COMPLETED: 'simulation_completed',
  
  // Navigation Events
  PAGE_VIEW: 'page_view',
  SUBJECT_VIEWED: 'subject_viewed',
  TOPIC_VIEWED: 'topic_viewed',
  
  // Engagement Events
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',
  SEARCH_PERFORMED: 'search_performed',
  HELP_ACCESSED: 'help_accessed',
  
  // Gamification Events
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  LEVEL_UP: 'level_up',
  STREAK_MILESTONE: 'streak_milestone',
  DAILY_GOAL_COMPLETED: 'daily_goal_completed',
  
  // Social Events
  PROFILE_VIEWED: 'profile_viewed',
  LEADERBOARD_VIEWED: 'leaderboard_viewed',
  
  // Technical Events
  ERROR_ENCOUNTERED: 'error_encountered',
  PERFORMANCE_METRIC: 'performance_metric'
};

// Analytics configuration
const ANALYTICS_CONFIG = {
  enabled: process.env.NODE_ENV === 'production',
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  storageKey: 'ekima_analytics_queue',
  maxStorageSize: 1000, // Maximum events to store locally
  retryAttempts: 3,
  retryDelay: 5000
};

class AnalyticsService {
  constructor() {
    this.eventQueue = [];
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.isOnline = navigator.onLine;
    this.flushTimer = null;
    
    // Initialize service
    this.init();
  }

  /**
   * Initialize analytics service
   */
  init() {
    // Load queued events from storage
    this.loadQueuedEvents();
    
    // Set up automatic flushing
    this.startAutoFlush();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Listen for page unload to flush remaining events
    window.addEventListener('beforeunload', () => {
      this.flushEvents(true);
    });
    
    // Track session start
    this.track(ANALYTICS_EVENTS.SESSION_STARTED, {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Track an analytics event
   */
  track(eventName, properties = {}, options = {}) {
    if (!ANALYTICS_CONFIG.enabled && !options.force) {
      console.log('Analytics event (dev mode):', eventName, properties);
      return;
    }

    const event = {
      id: this.generateEventId(),
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        sessionDuration: Date.now() - this.sessionStartTime
      },
      metadata: {
        tracked_at: new Date().toISOString(),
        version: '1.0.0',
        platform: 'web'
      }
    };

    // Add user context if available
    this.addUserContext(event);
    
    // Add to queue
    this.eventQueue.push(event);
    
    // Auto-flush if queue is full
    if (this.eventQueue.length >= ANALYTICS_CONFIG.batchSize) {
      this.flushEvents();
    }
    
    // Store in localStorage as backup
    this.saveQueuedEvents();
    
    console.log('Analytics event tracked:', eventName, properties);
  }

  /**
   * Add user context to event
   */
  addUserContext(event) {
    try {
      const user = JSON.parse(localStorage.getItem('ekima_user') || '{}');
      const gamification = JSON.parse(localStorage.getItem('ekima_gamification') || '{}');
      
      event.properties.user = {
        id: user.id,
        level: gamification.level || 1,
        totalXP: gamification.totalXP || 0,
        streak: gamification.streakData?.currentStreak || 0,
        joinedAt: user.joinedAt
      };
    } catch (error) {
      console.warn('Failed to add user context to analytics event:', error);
    }
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Flush events to server
   */
  async flushEvents(isSync = false) {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (isSync) {
        // Use sendBeacon for synchronous sending (page unload)
        this.sendEventsSync(eventsToSend);
      } else {
        await this.sendEventsAsync(eventsToSend);
      }
      
      // Clear stored events on successful send
      this.clearStoredEvents();
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      
      // Add events back to queue for retry
      this.eventQueue.unshift(...eventsToSend);
      this.saveQueuedEvents();
    }
  }

  /**
   * Send events asynchronously
   */
  async sendEventsAsync(events) {
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ events })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Send events synchronously using sendBeacon
   */
  sendEventsSync(events) {
    const data = JSON.stringify({ events });
    const blob = new Blob([data], { type: 'application/json' });
    
    navigator.sendBeacon('/api/analytics/events', blob);
  }

  /**
   * Get authentication token
   */
  getAuthToken() {
    return localStorage.getItem('ekima_auth_token') || '';
  }

  /**
   * Start automatic event flushing
   */
  startAutoFlush() {
    this.flushTimer = setInterval(() => {
      if (this.isOnline) {
        this.flushEvents();
      }
    }, ANALYTICS_CONFIG.flushInterval);
  }

  /**
   * Stop automatic event flushing
   */
  stopAutoFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Save queued events to localStorage
   */
  saveQueuedEvents() {
    try {
      const eventsToStore = this.eventQueue.slice(-ANALYTICS_CONFIG.maxStorageSize);
      localStorage.setItem(ANALYTICS_CONFIG.storageKey, JSON.stringify(eventsToStore));
    } catch (error) {
      console.warn('Failed to save analytics events to storage:', error);
    }
  }

  /**
   * Load queued events from localStorage
   */
  loadQueuedEvents() {
    try {
      const storedEvents = localStorage.getItem(ANALYTICS_CONFIG.storageKey);
      if (storedEvents) {
        this.eventQueue = JSON.parse(storedEvents);
      }
    } catch (error) {
      console.warn('Failed to load analytics events from storage:', error);
      this.eventQueue = [];
    }
  }

  /**
   * Clear stored events
   */
  clearStoredEvents() {
    localStorage.removeItem(ANALYTICS_CONFIG.storageKey);
  }

  /**
   * Track page view
   */
  trackPageView(pageName, properties = {}) {
    this.track(ANALYTICS_EVENTS.PAGE_VIEW, {
      page: pageName,
      title: document.title,
      ...properties
    });
  }

  /**
   * Track learning session
   */
  trackLearningSession(sessionData) {
    this.track(ANALYTICS_EVENTS.CHAPTER_STARTED, {
      chapterId: sessionData.chapterId,
      subjectId: sessionData.subjectId,
      topicId: sessionData.topicId,
      difficulty: sessionData.difficulty,
      estimatedTime: sessionData.estimatedTime
    });
  }

  /**
   * Track learning completion
   */
  trackLearningCompletion(completionData) {
    this.track(ANALYTICS_EVENTS.CHAPTER_COMPLETED, {
      chapterId: completionData.chapterId,
      subjectId: completionData.subjectId,
      topicId: completionData.topicId,
      timeSpent: completionData.timeSpent,
      score: completionData.score,
      xpEarned: completionData.xpEarned,
      attempts: completionData.attempts || 1
    });
  }

  /**
   * Track quiz performance
   */
  trackQuizPerformance(quizData) {
    this.track(ANALYTICS_EVENTS.QUIZ_COMPLETED, {
      quizId: quizData.quizId,
      subjectId: quizData.subjectId,
      topicId: quizData.topicId,
      score: quizData.score,
      totalQuestions: quizData.totalQuestions,
      correctAnswers: quizData.correctAnswers,
      timeSpent: quizData.timeSpent,
      difficulty: quizData.difficulty,
      attempts: quizData.attempts
    });
  }

  /**
   * Track content interaction
   */
  trackContentInteraction(interactionData) {
    this.track(interactionData.type, {
      contentId: interactionData.contentId,
      contentType: interactionData.contentType,
      duration: interactionData.duration,
      progress: interactionData.progress,
      completed: interactionData.completed,
      interactions: interactionData.interactions
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(engagementData) {
    this.track(ANALYTICS_EVENTS.SESSION_ENDED, {
      sessionDuration: Date.now() - this.sessionStartTime,
      pagesViewed: engagementData.pagesViewed,
      actionsPerformed: engagementData.actionsPerformed,
      timeActive: engagementData.timeActive,
      bounced: engagementData.bounced
    });
  }

  /**
   * Track search behavior
   */
  trackSearch(searchData) {
    this.track(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
      query: searchData.query,
      filters: searchData.filters,
      resultsCount: searchData.resultsCount,
      selectedResult: searchData.selectedResult,
      searchTime: searchData.searchTime
    });
  }

  /**
   * Track error events
   */
  trackError(errorData) {
    this.track(ANALYTICS_EVENTS.ERROR_ENCOUNTERED, {
      error: errorData.message,
      stack: errorData.stack,
      url: errorData.url,
      lineNumber: errorData.lineNumber,
      columnNumber: errorData.columnNumber,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metricData) {
    this.track(ANALYTICS_EVENTS.PERFORMANCE_METRIC, {
      metric: metricData.name,
      value: metricData.value,
      unit: metricData.unit,
      context: metricData.context
    });
  }

  /**
   * Track gamification events
   */
  trackGamification(gamificationData) {
    this.track(gamificationData.type, {
      achievementId: gamificationData.achievementId,
      level: gamificationData.level,
      xp: gamificationData.xp,
      streak: gamificationData.streak,
      milestone: gamificationData.milestone
    });
  }

  /**
   * Get analytics summary for a time period
   */
  getAnalyticsSummary(period = 'thisWeek') {
    const { start, end } = getTimePeriod(period);
    
    // This would typically fetch from server, but for demo we'll return mock data
    return {
      period,
      startDate: start,
      endDate: end,
      totalSessions: Math.floor(Math.random() * 50) + 10,
      averageSessionDuration: Math.floor(Math.random() * 30) + 15, // minutes
      totalXPEarned: Math.floor(Math.random() * 500) + 100,
      chaptersCompleted: Math.floor(Math.random() * 20) + 5,
      quizzesCompleted: Math.floor(Math.random() * 15) + 3,
      averageQuizScore: Math.floor(Math.random() * 20) + 75, // 75-95%
      streakDays: Math.floor(Math.random() * 7) + 1,
      topSubjects: [
        { name: 'Mathematics', time: Math.floor(Math.random() * 60) + 30 },
        { name: 'Physics', time: Math.floor(Math.random() * 45) + 20 },
        { name: 'Chemistry', time: Math.floor(Math.random() * 30) + 15 }
      ]
    };
  }

  /**
   * Get learning patterns analysis
   */
  getLearningPatterns() {
    // Mock learning patterns data
    return {
      preferredLearningTime: {
        morning: 25,
        afternoon: 35,
        evening: 40
      },
      preferredContentTypes: {
        videos: 45,
        experiments: 30,
        readings: 15,
        simulations: 10
      },
      learningSpeed: 'moderate', // slow, moderate, fast
      consistencyScore: 85, // 0-100
      focusAreas: [
        { subject: 'Mathematics', strength: 85 },
        { subject: 'Physics', strength: 70 },
        { subject: 'Chemistry', strength: 78 }
      ],
      improvementAreas: [
        { subject: 'Biology', score: 65, recommendation: 'More practice needed' }
      ]
    };
  }

  /**
   * Generate learning insights
   */
  generateInsights() {
    const patterns = this.getLearningPatterns();
    const summary = this.getAnalyticsSummary();
    
    const insights = [];
    
    // Time-based insights
    if (patterns.preferredLearningTime.evening > 50) {
      insights.push({
        type: 'learning_time',
        title: 'Evening Learner',
        description: 'You learn best in the evening. Consider scheduling your main study sessions after 6 PM.',
        actionable: true,
        action: 'Set evening reminders'
      });
    }
    
    // Content preference insights
    if (patterns.preferredContentTypes.videos > 40) {
      insights.push({
        type: 'content_preference',
        title: 'Visual Learner',
        description: 'You prefer video content. We recommend exploring more video lessons.',
        actionable: true,
        action: 'Browse video library'
      });
    }
    
    // Performance insights
    if (summary.averageQuizScore < 70) {
      insights.push({
        type: 'performance',
        title: 'Focus on Practice',
        description: 'Your quiz scores could improve. Try more practice questions before taking quizzes.',
        actionable: true,
        action: 'Access practice questions'
      });
    }
    
    // Consistency insights
    if (patterns.consistencyScore > 80) {
      insights.push({
        type: 'consistency',
        title: 'Great Consistency!',
        description: 'You have excellent learning consistency. Keep up the great work!',
        actionable: false
      });
    }
    
    return insights;
  }

  /**
   * Set user identification
   */
  identify(userId, traits = {}) {
    this.track('user_identified', {
      userId,
      traits,
      previousAnonymousId: this.sessionId
    });
  }

  /**
   * Clear all analytics data
   */
  reset() {
    this.eventQueue = [];
    this.clearStoredEvents();
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Helper functions for common tracking scenarios
export const trackPageView = (pageName, properties) => {
  analyticsService.trackPageView(pageName, properties);
};

export const trackLearningSession = (sessionData) => {
  analyticsService.trackLearningSession(sessionData);
};

export const trackLearningCompletion = (completionData) => {
  analyticsService.trackLearningCompletion(completionData);
};

export const trackQuizPerformance = (quizData) => {
  analyticsService.trackQuizPerformance(quizData);
};

export const trackContentInteraction = (interactionData) => {
  analyticsService.trackContentInteraction(interactionData);
};

export const trackSearch = (searchData) => {
  analyticsService.trackSearch(searchData);
};

export const trackError = (errorData) => {
  analyticsService.trackError(errorData);
};

export const trackGamification = (gamificationData) => {
  analyticsService.trackGamification(gamificationData);
};

export const getAnalyticsSummary = (period) => {
  return analyticsService.getAnalyticsSummary(period);
};

export const getLearningPatterns = () => {
  return analyticsService.getLearningPatterns();
};

export const generateInsights = () => {
  return analyticsService.generateInsights();
};

export default analyticsService;