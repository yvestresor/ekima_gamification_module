// Utility helper functions for Ekima Learning Platform

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { COLORS, TIME, REGEX_PATTERNS } from './constants';

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Generate a random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Convert text to URL-friendly slug
 */
export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Clean and format names
 */
export const formatName = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat().format(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Round to specific decimal places
 */
export const roundToDecimals = (num, decimals = 2) => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Generate random number between min and max
 */
export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Clamp number between min and max
 */
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

// ============================================================================
// DATE AND TIME UTILITIES
// ============================================================================

/**
 * Format time duration from milliseconds
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0m';
  
  const totalMinutes = Math.floor(milliseconds / TIME.MINUTE);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

/**
 * Format date for display
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString);
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  return checkDate.toDateString() === today.toDateString();
};

/**
 * Get days between two dates
 */
export const getDaysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = typeof date1 === 'string' ? parseISO(date1) : date1;
  const secondDate = typeof date2 === 'string' ? parseISO(date2) : date2;
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email address
 */
export const isValidEmail = (email) => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

/**
 * Validate phone number (Tanzania format)
 */
export const isValidPhone = (phone) => {
  return REGEX_PATTERNS.PHONE.test(phone);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  return REGEX_PATTERNS.PASSWORD.test(password);
};

/**
 * Get password strength score
 */
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character types
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;
  
  return Math.min(score, 5);
};

/**
 * Validate username
 */
export const isValidUsername = (username) => {
  return REGEX_PATTERNS.USERNAME.test(username);
};

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Get color based on score/percentage
 */
export const getScoreColor = (score) => {
  if (score >= 90) return COLORS.SUCCESS;
  if (score >= 80) return COLORS.PRIMARY;
  if (score >= 70) return COLORS.WARNING;
  if (score >= 60) return '#f59e0b'; // Yellow-500
  return COLORS.ERROR;
};

/**
 * Get difficulty color
 */
export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return COLORS.SUCCESS;
    case 'medium': return COLORS.WARNING;
    case 'hard': return COLORS.ERROR;
    default: return COLORS.GRAY[500];
  }
};

/**
 * Convert hex to RGBA
 */
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Shuffle array randomly
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

/**
 * Remove duplicates from array
 */
export const uniqueArray = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  return array.filter((item, index, self) => 
    index === self.findIndex(t => t[key] === item[key])
  );
};

/**
 * Sort array by multiple keys
 */
export const sortByMultiple = (array, ...keys) => {
  return array.sort((a, b) => {
    for (const key of keys) {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
};

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone an object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Get nested object property safely
 */
export const get = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || !(key in result)) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result;
};

/**
 * Set nested object property
 */
export const set = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
  return obj;
};

// ============================================================================
// URL AND ROUTING UTILITIES
// ============================================================================

/**
 * Get query parameters from URL
 */
export const getQueryParams = (url = window.location.search) => {
  const params = new URLSearchParams(url);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Build URL with query parameters
 */
export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Safe localStorage setter
 */
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Failed to set localStorage:', error);
    return false;
  }
};

/**
 * Safe localStorage getter
 */
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to get localStorage:', error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 */
export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove localStorage:', error);
    return false;
  }
};

// ============================================================================
// DEBOUNCE AND THROTTLE
// ============================================================================

/**
 * Debounce function calls
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function calls
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ============================================================================
// FILE UTILITIES
// ============================================================================

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Check if file is image
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Measure function execution time
 */
export const measurePerformance = (func, label = 'Function') => {
  return function(...args) {
    const start = performance.now();
    const result = func.apply(this, args);
    const end = performance.now();
    console.log(`${label} took ${end - start} milliseconds`);
    return result;
  };
};

/**
 * Create a delay/sleep function
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// ANALYTICS UTILITIES
// ============================================================================

/**
 * Track event for analytics
 */
export const trackEvent = (eventName, properties = {}) => {
  // In production, send to your analytics service
  console.log('Analytics Event:', eventName, properties);
  
  // Example implementations:
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }
  
  // Custom analytics
  if (window.analytics && typeof window.analytics.track === 'function') {
    window.analytics.track(eventName, properties);
  }
};

// Export all utilities
export default {
  // String utilities
  capitalize,
  toTitleCase,
  generateRandomString,
  slugify,
  truncateText,
  formatName,
  
  // Number utilities
  formatNumber,
  formatPercentage,
  calculatePercentage,
  roundToDecimals,
  randomBetween,
  clamp,
  
  // Date utilities
  formatDuration,
  formatRelativeTime,
  formatDate,
  isToday,
  getDaysBetween,
  
  // Validation utilities
  isValidEmail,
  isValidPhone,
  isValidPassword,
  getPasswordStrength,
  isValidUsername,
  
  // Color utilities
  getScoreColor,
  getDifficultyColor,
  hexToRgba,
  
  // Array utilities
  shuffleArray,
  groupBy,
  uniqueArray,
  sortByMultiple,
  
  // Object utilities
  deepClone,
  isEmpty,
  get,
  set,
  
  // URL utilities
  getQueryParams,
  buildUrl,
  
  // Storage utilities
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  
  // Performance utilities
  debounce,
  throttle,
  measurePerformance,
  delay,
  
  // File utilities
  formatFileSize,
  getFileExtension,
  isImageFile,
  
  // Analytics
  trackEvent,
};