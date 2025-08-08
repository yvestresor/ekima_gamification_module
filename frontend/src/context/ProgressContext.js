import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { progressAPI, quizAttemptAPI, questionAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  progress: [],
  quizAttempts: [],
  currentChapter: null,
  learningSession: null,
  isLoading: false,
  error: null,
  analytics: {
    totalTimeSpent: 0,
    averageScore: 0,
    completionRate: 0,
    streakDays: 0,
    weakAreas: [],
    strongAreas: [],
    learningVelocity: 0
  }
};

// Action types
const PROGRESS_ACTIONS = {
  LOAD_PROGRESS_START: 'LOAD_PROGRESS_START',
  LOAD_PROGRESS_SUCCESS: 'LOAD_PROGRESS_SUCCESS',
  LOAD_PROGRESS_FAILURE: 'LOAD_PROGRESS_FAILURE',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  ADD_QUIZ_ATTEMPT: 'ADD_QUIZ_ATTEMPT',
  START_LEARNING_SESSION: 'START_LEARNING_SESSION',
  UPDATE_LEARNING_SESSION: 'UPDATE_LEARNING_SESSION',
  END_LEARNING_SESSION: 'END_LEARNING_SESSION',
  COMPLETE_CHAPTER: 'COMPLETE_CHAPTER',
  UPDATE_ANALYTICS: 'UPDATE_ANALYTICS',
  SET_CURRENT_CHAPTER: 'SET_CURRENT_CHAPTER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const progressReducer = (state, action) => {
  switch (action.type) {
    case PROGRESS_ACTIONS.LOAD_PROGRESS_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case PROGRESS_ACTIONS.LOAD_PROGRESS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        progress: action.payload.progress,
        quizAttempts: action.payload.quizAttempts,
        analytics: action.payload.analytics || state.analytics,
        error: null
      };

    case PROGRESS_ACTIONS.LOAD_PROGRESS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case PROGRESS_ACTIONS.UPDATE_PROGRESS:
      const updatedProgress = state.progress.map(p => 
        p.chapterId === action.payload.chapterId 
          ? { ...p, ...action.payload }
          : p
      );
      
      // If progress doesn't exist, add it
      if (!updatedProgress.find(p => p.chapterId === action.payload.chapterId)) {
        updatedProgress.push(action.payload);
      }

      return {
        ...state,
        progress: updatedProgress
      };

    case PROGRESS_ACTIONS.ADD_QUIZ_ATTEMPT:
      return {
        ...state,
        quizAttempts: [action.payload, ...state.quizAttempts]
      };

    case PROGRESS_ACTIONS.START_LEARNING_SESSION:
      return {
        ...state,
        learningSession: {
          ...action.payload,
          startTime: new Date().toISOString(),
          interactions: [],
          timeSpent: 0
        }
      };

    case PROGRESS_ACTIONS.UPDATE_LEARNING_SESSION:
      return {
        ...state,
        learningSession: state.learningSession ? {
          ...state.learningSession,
          ...action.payload,
          timeSpent: Date.now() - new Date(state.learningSession.startTime).getTime()
        } : null
      };

    case PROGRESS_ACTIONS.END_LEARNING_SESSION:
      return {
        ...state,
        learningSession: null
      };

    case PROGRESS_ACTIONS.COMPLETE_CHAPTER:
      return {
        ...state,
        progress: state.progress.map(p => 
          p.chapterId === action.payload.chapterId 
            ? { 
                ...p, 
                isCompleted: true, 
                completedAt: new Date().toISOString(),
                overallProgress: 100
              }
            : p
        )
      };

    case PROGRESS_ACTIONS.UPDATE_ANALYTICS:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.payload
        }
      };

    case PROGRESS_ACTIONS.SET_CURRENT_CHAPTER:
      return {
        ...state,
        currentChapter: action.payload
      };

    case PROGRESS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const ProgressContext = createContext();

// ProgressProvider component
export const ProgressProvider = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const { user, addXP, updateTimeSpent } = useAuth();

  // Load progress when user changes
  useEffect(() => {
    if (user?._id) {
      loadUserProgress(user._id);
    }
  }, [user?._id]);

  // Load user progress
  const loadUserProgress = async (userId) => {
    try {
      dispatch({ type: PROGRESS_ACTIONS.LOAD_PROGRESS_START });

      // Fetch progress and quiz attempts from backend
      const [progressResponse, quizResponse] = await Promise.all([
        progressAPI.getUserProgress(userId),
        quizAttemptAPI.getByUser(userId)
      ]);

      // Calculate analytics
      const analytics = calculateAnalytics(progressResponse.data, quizResponse.data);

      dispatch({
        type: PROGRESS_ACTIONS.LOAD_PROGRESS_SUCCESS,
        payload: {
          progress: progressResponse.data,
          quizAttempts: quizResponse.data,
          analytics
        }
      });
    } catch (error) {
      dispatch({
        type: PROGRESS_ACTIONS.LOAD_PROGRESS_FAILURE,
        payload: error.message || 'Failed to load progress'
      });
    }
  };

  // Update progress for a chapter
  const updateProgress = async (progressData) => {
    try {
      // Save progress to backend
      await progressAPI.updateProgress(progressData);
      dispatch({
        type: PROGRESS_ACTIONS.UPDATE_PROGRESS,
        payload: {
          ...progressData,
          lastAccessedAt: new Date().toISOString()
        }
      });
      // Update analytics
      const newAnalytics = calculateAnalytics(state.progress, state.quizAttempts);
      dispatch({
        type: PROGRESS_ACTIONS.UPDATE_ANALYTICS,
        payload: newAnalytics
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  // Submit quiz attempt
  const submitQuizAttempt = async (attemptData) => {
    try {
      // Save quiz attempt to backend
      const response = await quizAttemptAPI.submitQuizAttempt(attemptData);
      const quizAttempt = response.data;
      dispatch({
        type: PROGRESS_ACTIONS.ADD_QUIZ_ATTEMPT,
        payload: quizAttempt
      });
      // Award XP based on score
      const xpGained = Math.round(attemptData.score * 0.5); // 0.5 XP per point
      addXP(xpGained);
      // Update chapter progress
      const chapterProgress = state.progress.find(p => p.chapterId === attemptData.chapterId);
      if (chapterProgress) {
        const newAverageScore = calculateNewAverageScore(
          chapterProgress.assessmentScoreAverage, 
          attemptData.score,
          state.quizAttempts.filter(qa => qa.chapterId === attemptData.chapterId).length
        );
        updateProgress({
          chapterId: attemptData.chapterId,
          assessmentScoreAverage: newAverageScore
        });
      }
      return { success: true, xpGained };
    } catch (error) {
      console.error('Failed to submit quiz attempt:', error);
      return { success: false, error: error.message };
    }
  };

  // Start learning session
  const startLearningSession = (sessionData) => {
    dispatch({
      type: PROGRESS_ACTIONS.START_LEARNING_SESSION,
      payload: sessionData
    });

    dispatch({
      type: PROGRESS_ACTIONS.SET_CURRENT_CHAPTER,
      payload: sessionData.chapterId
    });
  };

  // Update learning session
  const updateLearningSession = (updates) => {
    dispatch({
      type: PROGRESS_ACTIONS.UPDATE_LEARNING_SESSION,
      payload: updates
    });
  };

  // End learning session
  const endLearningSession = async () => {
    if (!state.learningSession) return;

    const session = state.learningSession;
    const totalTimeSpent = Date.now() - new Date(session.startTime).getTime();

    try {
      // Update progress with session data
      await updateProgress({
        chapterId: session.chapterId,
        timeSpent: (state.progress.find(p => p.chapterId === session.chapterId)?.timeSpent || 0) + totalTimeSpent,
        lastAccessedAt: new Date().toISOString(),
        interactionCount: (state.progress.find(p => p.chapterId === session.chapterId)?.interactionCount || 0) + session.interactions.length
      });

      // Update user's total time spent
      updateTimeSpent(totalTimeSpent);

      // Award XP for time spent (1 XP per minute)
      const minutesSpent = Math.floor(totalTimeSpent / 60000);
      if (minutesSpent > 0) {
        addXP(minutesSpent);
      }

      dispatch({ type: PROGRESS_ACTIONS.END_LEARNING_SESSION });
      dispatch({ type: PROGRESS_ACTIONS.SET_CURRENT_CHAPTER, payload: null });

      return {
        timeSpent: totalTimeSpent,
        xpGained: minutesSpent,
        interactions: session.interactions.length
      };
    } catch (error) {
      console.error('Failed to end learning session:', error);
      return null;
    }
  };

  // Complete chapter
  const completeChapter = async (chapterId) => {
    try {
      // In real implementation: await progressAPI.completeChapter(chapterId, user._id);
      
      dispatch({
        type: PROGRESS_ACTIONS.COMPLETE_CHAPTER,
        payload: { chapterId }
      });

      // Award completion XP
      const completionXP = 50;
      const result = addXP(completionXP);

      return { 
        success: true, 
        xpGained: completionXP,
        leveledUp: result.leveledUp 
      };
    } catch (error) {
      console.error('Failed to complete chapter:', error);
      return { success: false, error: error.message };
    }
  };

  // Get progress for specific chapter
  const getChapterProgress = (chapterId) => {
    return state.progress.find(p => p.chapterId === chapterId);
  };

  // Get quiz attempts for chapter
  const getChapterQuizAttempts = (chapterId) => {
    return state.quizAttempts.filter(qa => qa.chapterId === chapterId);
  };

  // Get overall progress statistics
  const getOverallStats = () => {
    const totalChapters = state.progress.length;
    const completedChapters = state.progress.filter(p => p.isCompleted).length;
    const totalTimeSpent = state.progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const averageProgress = totalChapters > 0 
      ? state.progress.reduce((sum, p) => sum + p.overallProgress, 0) / totalChapters 
      : 0;

    return {
      totalChapters,
      completedChapters,
      completionRate: totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0,
      totalTimeSpent,
      averageProgress,
      averageScore: state.analytics.averageScore
    };
  };

  // Calculate analytics
  const calculateAnalytics = (progressData, quizData) => {
    const totalTimeSpent = progressData.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const averageScore = quizData.length > 0 
      ? quizData.reduce((sum, q) => sum + q.score, 0) / quizData.length 
      : 0;
    
    const completedChapters = progressData.filter(p => p.isCompleted).length;
    const completionRate = progressData.length > 0 
      ? (completedChapters / progressData.length) * 100 
      : 0;

    // Identify weak and strong areas
    const subjectScores = {};
    quizData.forEach(quiz => {
      if (!subjectScores[quiz.subject]) {
        subjectScores[quiz.subject] = [];
      }
      subjectScores[quiz.subject].push(quiz.score);
    });

    const subjectAverages = Object.entries(subjectScores).map(([subject, scores]) => ({
      subject,
      average: scores.reduce((a, b) => a + b, 0) / scores.length
    }));

    const weakAreas = subjectAverages.filter(s => s.average < 60).map(s => s.subject);
    const strongAreas = subjectAverages.filter(s => s.average >= 80).map(s => s.subject);

    // Calculate learning velocity (chapters completed per week)
    const completedDates = progressData
      .filter(p => p.completedAt)
      .map(p => new Date(p.completedAt));
    
    const learningVelocity = completedDates.length > 0 
      ? calculateLearningVelocity(completedDates) 
      : 0;

    return {
      totalTimeSpent,
      averageScore,
      completionRate,
      streakDays: 0, // Would be calculated based on daily activity
      weakAreas,
      strongAreas,
      learningVelocity
    };
  };

  // Helper functions
  const calculateNewAverageScore = (currentAverage, newScore, attemptCount) => {
    if (attemptCount === 0) return newScore;
    return ((currentAverage * attemptCount) + newScore) / (attemptCount + 1);
  };

  const calculateLearningVelocity = (completedDates) => {
    if (completedDates.length < 2) return 0;
    
    const sortedDates = completedDates.sort((a, b) => a - b);
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];
    const weeksDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 7);
    
    return weeksDiff > 0 ? completedDates.length / weeksDiff : 0;
  };

  const value = {
    // State
    progress: state.progress,
    quizAttempts: state.quizAttempts,
    currentChapter: state.currentChapter,
    learningSession: state.learningSession,
    isLoading: state.isLoading,
    error: state.error,
    analytics: state.analytics,

    // Actions
    loadUserProgress,
    updateProgress,
    submitQuizAttempt,
    startLearningSession,
    updateLearningSession,
    endLearningSession,
    completeChapter,

    // Getters
    getChapterProgress,
    getChapterQuizAttempts,
    getOverallStats
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

// Custom hook to use progress context
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export default ProgressContext;