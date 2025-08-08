// Progress service - handles learning progress tracking

import { apiClient } from './api';
import { ANALYTICS_EVENTS } from '../utils/constants';

/**
 * Progress Service for tracking user learning progress
 */
class ProgressService {
  constructor() {
    this.activeSession = null;
    this.sessionStartTime = null;
  }

  // ============================================================================
  // PROGRESS RETRIEVAL
  // ============================================================================

  /**
   * Get user's overall progress across all subjects
   */
  async getUserProgress(userId) {
    try {
      const response = await apiClient.get(`/progress/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  /**
   * Get progress for a specific chapter
   */
  async getChapterProgress(userId, chapterId) {
    try {
      const response = await apiClient.get(`/progress/${userId}/chapter/${chapterId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapter progress:', error);
      throw error;
    }
  }

  /**
   * Get progress analytics for a user
   */
  async getProgressAnalytics(userId, timeframe = '30d') {
    try {
      const response = await apiClient.get(`/progress/${userId}/analytics`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching progress analytics:', error);
      throw error;
    }
  }

  // ============================================================================
  // PROGRESS UPDATES
  // ============================================================================

  /**
   * Update progress for a chapter
   */
  async updateChapterProgress(progressData) {
    try {
      const response = await apiClient.post('/progress', {
        ...progressData,
        lastAccessedAt: new Date().toISOString()
      });

      // Track analytics event
      this.trackProgressEvent('chapter_progress_update', {
        chapterId: progressData.chapterId,
        progress: progressData.overallProgress,
        timeSpent: progressData.timeSpent
      });

      return response.data;
    } catch (error) {
      console.error('Error updating chapter progress:', error);
      throw error;
    }
  }

  /**
   * Mark a chapter as completed
   */
  async completeChapter(userId, chapterId, completionData = {}) {
    try {
      const response = await apiClient.post('/progress/complete', {
        userId,
        chapterId,
        ...completionData,
        completedAt: new Date().toISOString()
      });

      // Track completion event
      this.trackProgressEvent('chapter_complete', {
        chapterId,
        userId,
        timeSpent: completionData.timeSpent || 0
      });

      return response.data;
    } catch (error) {
      console.error('Error marking chapter as completed:', error);
      throw error;
    }
  }

  /**
   * Update video progress
   */
  async updateVideoProgress(userId, chapterId, videoProgress, timeWatched) {
    try {
      const progressData = {
        userId,
        chapterId,
        videoProgress: Math.min(Math.max(videoProgress, 0), 100),
        timeSpent: timeWatched,
        lastAccessedAt: new Date().toISOString()
      };

      const response = await apiClient.put('/progress/video', progressData);

      // Track video progress
      if (videoProgress >= 100) {
        this.trackProgressEvent('video_complete', {
          chapterId,
          timeWatched
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error updating video progress:', error);
      throw error;
    }
  }

  /**
   * Update notes/reading progress
   */
  async updateNotesProgress(userId, chapterId, notesProgress, timeSpent) {
    try {
      const progressData = {
        userId,
        chapterId,
        notesProgress: Math.min(Math.max(notesProgress, 0), 100),
        timeSpent,
        lastAccessedAt: new Date().toISOString()
      };

      const response = await apiClient.put('/progress/notes', progressData);
      return response.data;
    } catch (error) {
      console.error('Error updating notes progress:', error);
      throw error;
    }
  }

  /**
   * Record experiment completion
   */
  async recordExperimentCompletion(userId, chapterId, experimentId, timeSpent) {
    try {
      const response = await apiClient.post('/progress/experiment', {
        userId,
        chapterId,
        experimentId,
        timeSpent,
        completedAt: new Date().toISOString()
      });

      this.trackProgressEvent('experiment_complete', {
        chapterId,
        experimentId,
        timeSpent
      });

      return response.data;
    } catch (error) {
      console.error('Error recording experiment completion:', error);
      throw error;
    }
  }

  // ============================================================================
  // LEARNING SESSIONS
  // ============================================================================

  /**
   * Start a learning session
   */
  startLearningSession(sessionData) {
    this.activeSession = {
      ...sessionData,
      startTime: new Date().toISOString(),
      interactions: [],
      events: []
    };
    this.sessionStartTime = Date.now();

    this.trackProgressEvent('session_start', {
      chapterId: sessionData.chapterId,
      topicId: sessionData.topicId,
      contentType: sessionData.contentType
    });

    return this.activeSession;
  }

  /**
   * Add interaction to current session
   */
  addSessionInteraction(interaction) {
    if (!this.activeSession) return;

    const sessionInteraction = {
      ...interaction,
      timestamp: new Date().toISOString(),
      sessionTime: Date.now() - this.sessionStartTime
    };

    this.activeSession.interactions.push(sessionInteraction);
    this.activeSession.events.push({
      type: 'interaction',
      data: sessionInteraction
    });
  }

  /**
   * End learning session and save progress
   */
  async endLearningSession() {
    if (!this.activeSession) return null;

    const sessionEndTime = Date.now();
    const totalSessionTime = sessionEndTime - this.sessionStartTime;

    const sessionSummary = {
      ...this.activeSession,
      endTime: new Date().toISOString(),
      totalTime: totalSessionTime,
      interactionCount: this.activeSession.interactions.length
    };

    try {
      // Save session data
      const response = await apiClient.post('/progress/session', sessionSummary);

      // Track session end event
      this.trackProgressEvent('session_end', {
        chapterId: this.activeSession.chapterId,
        duration: totalSessionTime,
        interactions: this.activeSession.interactions.length
      });

      // Clear active session
      this.activeSession = null;
      this.sessionStartTime = null;

      return response.data;
    } catch (error) {
      console.error('Error ending learning session:', error);
      throw error;
    }
  }

  /**
   * Get current session data
   */
  getCurrentSession() {
    if (!this.activeSession) return null;

    return {
      ...this.activeSession,
      currentTime: Date.now() - this.sessionStartTime
    };
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Sync multiple progress updates (for offline support)
   */
  async syncProgressBatch(progressUpdates) {
    try {
      const response = await apiClient.post('/progress/sync', {
        updates: progressUpdates,
        syncTimestamp: new Date().toISOString()
      });

      this.trackProgressEvent('progress_sync', {
        updateCount: progressUpdates.length
      });

      return response.data;
    } catch (error) {
      console.error('Error syncing progress batch:', error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYTICS AND INSIGHTS
  // ============================================================================

  /**
   * Get learning insights for a user
   */
  async getLearningInsights(userId) {
    try {
      const response = await apiClient.get(`/progress/${userId}/insights`);
      return response.data;
    } catch (error) {
      console.error('Error fetching learning insights:', error);
      throw error;
    }
  }

  /**
   * Get subject-wise progress summary
   */
  async getSubjectProgress(userId, subjectId) {
    try {
      const response = await apiClient.get(`/progress/${userId}/subject/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject progress:', error);
      throw error;
    }
  }

  /**
   * Calculate learning velocity (chapters per week)
   */
  calculateLearningVelocity(progressData) {
    const completedChapters = progressData.filter(p => p.isCompleted);
    if (completedChapters.length < 2) return 0;

    const sortedCompletions = completedChapters
      .map(p => new Date(p.completedAt))
      .sort((a, b) => a - b);

    const firstCompletion = sortedCompletions[0];
    const lastCompletion = sortedCompletions[sortedCompletions.length - 1];
    const weeksSpan = (lastCompletion - firstCompletion) / (1000 * 60 * 60 * 24 * 7);

    return weeksSpan > 0 ? completedChapters.length / weeksSpan : 0;
  }

  /**
   * Identify learning patterns
   */
  analyzeLearningPatterns(progressData) {
    const patterns = {
      preferredStudyTime: this.findPreferredStudyTime(progressData),
      avgSessionDuration: this.calculateAvgSessionDuration(progressData),
      contentTypePreference: this.analyzeContentPreferences(progressData),
      difficultyProgression: this.analyzeDifficultyProgression(progressData),
      consistencyScore: this.calculateConsistencyScore(progressData)
    };

    return patterns;
  }

  /**
   * Find preferred study time based on activity patterns
   */
  findPreferredStudyTime(progressData) {
    const hourCounts = {};
    
    progressData.forEach(progress => {
      if (progress.lastAccessedAt) {
        const hour = new Date(progress.lastAccessedAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const peakHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b
    );

    if (peakHour >= 6 && peakHour < 12) return 'morning';
    if (peakHour >= 12 && peakHour < 18) return 'afternoon';
    if (peakHour >= 18 && peakHour < 22) return 'evening';
    return 'night';
  }

  /**
   * Calculate average session duration
   */
  calculateAvgSessionDuration(progressData) {
    const sessionsWithTime = progressData.filter(p => p.timeSpent > 0);
    if (sessionsWithTime.length === 0) return 0;

    const totalTime = sessionsWithTime.reduce((sum, p) => sum + p.timeSpent, 0);
    return totalTime / sessionsWithTime.length;
  }

  /**
   * Analyze content type preferences
   */
  analyzeContentPreferences(progressData) {
    const preferences = {
      video: 0,
      notes: 0,
      experiments: 0
    };

    progressData.forEach(progress => {
      if (progress.videoProgress > 50) preferences.video++;
      if (progress.notesProgress > 50) preferences.notes++;
      if (progress.experimentsAttempted > 0) preferences.experiments++;
    });

    return preferences;
  }

  /**
   * Analyze difficulty progression
   */
  analyzeDifficultyProgression(progressData) {
    // This would analyze how user progresses through difficulty levels
    // Implementation depends on how difficulty is tracked in your data
    return {
      comfortZone: 'medium',
      improvementAreas: ['complex_problems'],
      strengths: ['basic_concepts']
    };
  }

  /**
   * Calculate consistency score (0-100)
   */
  calculateConsistencyScore(progressData) {
    // Calculate based on regular study patterns
    const studyDays = new Set();
    progressData.forEach(progress => {
      if (progress.lastAccessedAt) {
        const day = new Date(progress.lastAccessedAt).toDateString();
        studyDays.add(day);
      }
    });

    // Simple consistency calculation - can be made more sophisticated
    const daysInPeriod = 30; // Last 30 days
    const consistencyScore = Math.min((studyDays.size / daysInPeriod) * 100, 100);
    
    return Math.round(consistencyScore);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Track progress-related analytics events
   */
  trackProgressEvent(eventName, properties = {}) {
    // Track analytics event
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        source: 'progress_service'
      });
    }

    // Log for development
    console.log(`Progress Event: ${eventName}`, properties);
  }

  /**
   * Format time duration for display
   */
  formatDuration(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Calculate overall progress percentage
   */
  calculateOverallProgress(progressData) {
    if (!progressData || progressData.length === 0) return 0;
    
    const totalProgress = progressData.reduce((sum, p) => sum + (p.overallProgress || 0), 0);
    return Math.round(totalProgress / progressData.length);
  }

  /**
   * Get progress status based on percentage
   */
  getProgressStatus(percentage) {
    if (percentage === 0) return 'not_started';
    if (percentage < 100) return 'in_progress';
    return 'completed';
  }
}

// Create and export a singleton instance
const progressService = new ProgressService();
export default progressService;