// Constants for Ekima Learning Platform

// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  };
  
  // User Types
  export const USER_TYPES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin',
    EDUCATION_STAKEHOLDER: 'education_stakeholder',
  };
  
  // Education Levels
  export const EDUCATION_LEVELS = {
    PRE_PRIMARY: 'Pre-Primary',
    PRIMARY: 'Primary',
    SECONDARY: 'Secondary',
    O_LEVEL: 'O-Level',
    A_LEVEL: 'A-Level',
    HIGHER: 'Higher',
    TEACHER_EDUCATION: 'Teacher Education',
  };
  
  // Subjects
  export const SUBJECTS = {
    MATHEMATICS: 'Mathematics',
    PHYSICS: 'Physics',
    CHEMISTRY: 'Chemistry',
    BIOLOGY: 'Biology',
    ENGLISH: 'English',
    KISWAHILI: 'Kiswahili',
    GEOGRAPHY: 'Geography',
    HISTORY: 'History',
    CIVICS: 'Civics',
  };
  
  // Content Types
  export const CONTENT_TYPES = {
    VIDEO: 'video',
    AUDIO: 'audio',
    TEXT: 'text',
    SIMULATION: 'simulation',
    EXPERIMENT: 'experiment',
    PROTOTYPE: '3d-model',
    QUIZ: 'quiz',
    NOTES: 'notes',
  };
  
  // Difficulty Levels
  export const DIFFICULTY_LEVELS = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
  };
  
  // Gamification Constants
  export const GAMIFICATION = {
    XP_PER_MINUTE: 1,
    XP_PER_QUIZ_POINT: 0.5,
    XP_CHAPTER_COMPLETION: 50,
    XP_TOPIC_COMPLETION: 100,
    XP_SUBJECT_COMPLETION: 500,
    XP_PER_LEVEL: 1000,
    
    // Streak Rewards
    STREAK_MILESTONES: [
      { days: 3, gems: 10, xp: 25, title: '3-Day Starter' },
      { days: 7, gems: 25, xp: 50, title: 'Week Warrior' },
      { days: 14, gems: 50, xp: 100, title: 'Two-Week Champion' },
      { days: 30, gems: 100, xp: 200, title: 'Monthly Master' },
      { days: 60, gems: 200, xp: 400, title: 'Learning Legend' },
      { days: 100, gems: 500, xp: 1000, title: 'Streak Superhero' },
    ],
    
    // Achievement Types
    ACHIEVEMENT_TYPES: {
      COMPLETION: 'completion',
      ACTIVITY: 'activity',
      STREAK: 'streak',
      PERFORMANCE: 'performance',
      SOCIAL: 'social',
    },
    
    // Achievement Rarity
    ACHIEVEMENT_RARITY: {
      COMMON: 'common',
      RARE: 'rare',
      EPIC: 'epic',
      LEGENDARY: 'legendary',
    },
  };
  
  // Recommendation Constants
  export const RECOMMENDATIONS = {
    MAX_RECOMMENDATIONS: 5,
    CONFIDENCE_THRESHOLD: 0.6,
    REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes
    
    // Scoring Weights
    SCORING_WEIGHTS: {
      SUBJECT_PERFORMANCE: 0.3,
      DIFFICULTY_MATCH: 0.25,
      TIME_MATCH: 0.2,
      FEATURED_BONUS: 0.15,
      RECENT_ACTIVITY: 0.1,
    },
    
    // Recommendation Strategies
    STRATEGIES: {
      REINFORCEMENT: 'reinforcement', // Strengthen weak areas
      EXPLORATION: 'exploration', // Try new topics
      SEQUENTIAL: 'sequential', // Follow curriculum order
      PERSONALIZED: 'personalized', // Based on preferences
    },
  };
  
  // Progress Constants
  export const PROGRESS = {
    COMPLETION_THRESHOLD: 80, // Percentage to consider "completed"
    TIME_SESSION_MIN: 5 * 60 * 1000, // Minimum 5 minutes for a valid session
    TIME_SESSION_MAX: 4 * 60 * 60 * 1000, // Maximum 4 hours per session
    
    // Progress Status
    STATUS: {
      NOT_STARTED: 'not_started',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      PAUSED: 'paused',
    },
  };
  
  // Assessment Constants
  export const ASSESSMENT = {
    PASS_THRESHOLD: 60, // Percentage to pass
    EXCELLENCE_THRESHOLD: 90, // Percentage for excellence
    MAX_ATTEMPTS: 3, // Maximum quiz attempts
    TIME_LIMIT: 30 * 60 * 1000, // 30 minutes default time limit
    
    // Question Types
    QUESTION_TYPES: {
      MULTIPLE_CHOICE: 'multiple_choice',
      TRUE_FALSE: 'true_false',
      FILL_BLANK: 'fill_blank',
      SHORT_ANSWER: 'short_answer',
      ESSAY: 'essay',
      DRAG_DROP: 'drag_and_drop',
      MATCHING: 'matching',
    },
  };
  
  // UI Constants
  export const UI = {
    // Breakpoints (in pixels)
    BREAKPOINTS: {
      SM: 640,
      MD: 768,
      LG: 1024,
      XL: 1280,
      '2XL': 1536,
    },
    
    // Animation Durations (in milliseconds)
    ANIMATIONS: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
    
    // Toast Types
    TOAST_TYPES: {
      SUCCESS: 'success',
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'info',
    },
    
    // Loading States
    LOADING_TYPES: {
      SPINNER: 'spinner',
      SKELETON: 'skeleton',
      DOTS: 'dots',
      PROGRESS: 'progress',
    },
  };
  
  // Error Codes
  export const ERROR_CODES = {
    // Network Errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    
    // Authentication Errors
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    
    // Validation Errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    REQUIRED_FIELD: 'REQUIRED_FIELD',
    INVALID_FORMAT: 'INVALID_FORMAT',
    
    // Application Errors
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    RATE_LIMIT: 'RATE_LIMIT',
  };
  
  // Storage Keys
  export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_PREFERENCES: 'user_preferences',
    LEARNING_SESSION: 'learning_session',
    OFFLINE_DATA: 'offline_data',
    THEME: 'theme',
    LANGUAGE: 'language',
  };
  
  // Event Types for Analytics
  export const ANALYTICS_EVENTS = {
    // User Events
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_SIGNUP: 'user_signup',
    
    // Learning Events
    CHAPTER_START: 'chapter_start',
    CHAPTER_COMPLETE: 'chapter_complete',
    QUIZ_START: 'quiz_start',
    QUIZ_COMPLETE: 'quiz_complete',
    VIDEO_START: 'video_start',
    VIDEO_COMPLETE: 'video_complete',
    
    // Gamification Events
    ACHIEVEMENT_UNLOCK: 'achievement_unlock',
    LEVEL_UP: 'level_up',
    STREAK_MILESTONE: 'streak_milestone',
    XP_GAIN: 'xp_gain',
    
    // Recommendation Events
    RECOMMENDATION_VIEW: 'recommendation_view',
    RECOMMENDATION_CLICK: 'recommendation_click',
    RECOMMENDATION_DISMISS: 'recommendation_dismiss',
    RECOMMENDATION_FEEDBACK: 'recommendation_feedback',
    
    // Navigation Events
    PAGE_VIEW: 'page_view',
    BUTTON_CLICK: 'button_click',
    SEARCH: 'search',
  };
  
  // Colors
  export const COLORS = {
    PRIMARY: '#f97316', // Orange-500
    PRIMARY_DARK: '#ea580c', // Orange-600
    PRIMARY_LIGHT: '#fed7aa', // Orange-200
    
    SECONDARY: '#3b82f6', // Blue-500
    SUCCESS: '#10b981', // Green-500
    WARNING: '#f59e0b', // Yellow-500
    ERROR: '#ef4444', // Red-500
    
    GRAY: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  };
  
  // Regex Patterns
  export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^(\+255|0)[67]\d{8}$/, // Tanzania phone number format
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    NAME: /^[a-zA-Z\s]{2,50}$/,
  };
  
  // Time Constants
  export const TIME = {
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    YEAR: 365 * 24 * 60 * 60 * 1000,
  };
  
  // Feature Flags
  export const FEATURES = {
    RECOMMENDATIONS: true,
    GAMIFICATION: true,
    SOCIAL_LEARNING: false,
    OFFLINE_MODE: false,
    VOICE_NAVIGATION: false,
    AR_VR: false,
    PEER_TUTORING: false,
    ADVANCED_ANALYTICS: true,
  };
  
  // Export all constants as default
  export default {
    API_CONFIG,
    USER_TYPES,
    EDUCATION_LEVELS,
    SUBJECTS,
    CONTENT_TYPES,
    DIFFICULTY_LEVELS,
    GAMIFICATION,
    RECOMMENDATIONS,
    PROGRESS,
    ASSESSMENT,
    UI,
    ERROR_CODES,
    STORAGE_KEYS,
    ANALYTICS_EVENTS,
    COLORS,
    REGEX_PATTERNS,
    TIME,
    FEATURES,
  };