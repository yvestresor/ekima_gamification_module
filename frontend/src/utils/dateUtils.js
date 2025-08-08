// src/utils/dateUtils.js

/**
 * Comprehensive date utility functions for the Ekima Learning Platform
 */

// Import date-fns for robust date handling
import { 
    format, 
    formatDistanceToNow, 
    isToday, 
    isYesterday, 
    isThisWeek, 
    isThisMonth,
    isThisYear,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    addDays,
    subDays,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    parseISO,
    isValid,
    getDay,
    isSameDay,
    isBefore,
    isAfter
  } from 'date-fns';
  
  /**
   * Format a date for display in various contexts
   * @param {string|Date} date - Date to format
   * @param {string} formatType - Type of formatting (short, medium, long, time, datetime)
   * @returns {string} Formatted date string
   */
  export const formatDate = (date, formatType = 'medium') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return 'Invalid date';
  
    switch (formatType) {
      case 'short':
        return format(dateObj, 'MMM d');
      case 'medium':
        return format(dateObj, 'MMM d, yyyy');
      case 'long':
        return format(dateObj, 'MMMM d, yyyy');
      case 'time':
        return format(dateObj, 'h:mm a');
      case 'datetime':
        return format(dateObj, 'MMM d, yyyy h:mm a');
      case 'relative':
        return getRelativeDate(dateObj);
      case 'dayMonth':
        return format(dateObj, 'MMM d');
      case 'monthYear':
        return format(dateObj, 'MMM yyyy');
      case 'weekday':
        return format(dateObj, 'EEEE');
      case 'shortWeekday':
        return format(dateObj, 'EEE');
      case 'iso':
        return dateObj.toISOString();
      case 'dateOnly':
        return format(dateObj, 'yyyy-MM-dd');
      default:
        return format(dateObj, 'MMM d, yyyy');
    }
  };
  
  /**
   * Get relative date description (e.g., "2 hours ago", "yesterday")
   * @param {string|Date} date - Date to compare
   * @returns {string} Relative date description
   */
  export const getRelativeDate = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return 'Invalid date';
  
    if (isToday(dateObj)) {
      const hoursAgo = differenceInHours(new Date(), dateObj);
      const minutesAgo = differenceInMinutes(new Date(), dateObj);
      
      if (minutesAgo < 1) return 'Just now';
      if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
      if (hoursAgo < 2) return '1 hour ago';
      return `${hoursAgo} hours ago`;
    }
  
    if (isYesterday(dateObj)) {
      return 'Yesterday';
    }
  
    if (isThisWeek(dateObj)) {
      const daysAgo = differenceInDays(new Date(), dateObj);
      return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
    }
  
    if (isThisMonth(dateObj)) {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }
  
    if (isThisYear(dateObj)) {
      return format(dateObj, 'MMM d');
    }
  
    return format(dateObj, 'MMM d, yyyy');
  };
  
  /**
   * Format duration in minutes to human readable format
   * @param {number} minutes - Duration in minutes
   * @param {boolean} shortFormat - Use short format (1h 30m vs 1 hour 30 minutes)
   * @returns {string} Formatted duration
   */
  export const formatDuration = (minutes, shortFormat = false) => {
    if (!minutes || minutes < 0) return shortFormat ? '0m' : '0 minutes';
  
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
  
    if (shortFormat) {
      if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
      if (hours > 0) return `${hours}h`;
      return `${mins}m`;
    }
  
    if (hours > 0 && mins > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ${mins} minute${mins === 1 ? '' : 's'}`;
    }
    if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return `${mins} minute${mins === 1 ? '' : 's'}`;
  };
  
  /**
   * Get time period for analytics (today, this week, this month, etc.)
   * @param {string} period - Period type
   * @returns {object} Start and end dates
   */
  export const getTimePeriod = (period) => {
    const now = new Date();
    
    switch (period) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        };
      case 'thisWeek':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
        return {
          start: lastWeekStart,
          end: endOfWeek(lastWeekStart, { weekStartsOn: 1 })
        };
      case 'thisMonth':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'last7Days':
        return {
          start: startOfDay(subDays(now, 6)),
          end: endOfDay(now)
        };
      case 'last30Days':
        return {
          start: startOfDay(subDays(now, 29)),
          end: endOfDay(now)
        };
      default:
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
    }
  };
  
  /**
   * Check if user has studied today
   * @param {array} studyDates - Array of study date strings
   * @returns {boolean} Whether user studied today
   */
  export const hasStudiedToday = (studyDates = []) => {
    const today = new Date();
    return studyDates.some(dateStr => {
      const studyDate = parseISO(dateStr);
      return isValid(studyDate) && isSameDay(studyDate, today);
    });
  };
  
  /**
   * Calculate study streak
   * @param {array} studyDates - Array of study date strings (sorted newest first)
   * @returns {object} Streak information
   */
  export const calculateStudyStreak = (studyDates = []) => {
    if (!studyDates || studyDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastStudyDate: null };
    }
  
    // Convert to Date objects and sort
    const dates = studyDates
      .map(dateStr => parseISO(dateStr))
      .filter(date => isValid(date))
      .sort((a, b) => b - a); // Newest first
  
    if (dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastStudyDate: null };
    }
  
    const today = startOfDay(new Date());
    const yesterday = startOfDay(subDays(today, 1));
    const lastStudyDate = startOfDay(dates[0]);
  
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
  
    // Calculate current streak
    if (isSameDay(lastStudyDate, today) || isSameDay(lastStudyDate, yesterday)) {
      let checkDate = today;
      
      // If didn't study today, start from yesterday
      if (!isSameDay(lastStudyDate, today)) {
        checkDate = yesterday;
      }
  
      for (let i = 0; i < dates.length; i++) {
        const studyDate = startOfDay(dates[i]);
        
        if (isSameDay(studyDate, checkDate)) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else if (isBefore(studyDate, checkDate)) {
          // Gap in streak
          break;
        }
      }
    }
  
    // Calculate longest streak
    let previousDate = null;
    for (const date of dates) {
      const currentDate = startOfDay(date);
      
      if (previousDate) {
        const daysDiff = differenceInDays(previousDate, currentDate);
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      previousDate = currentDate;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
  
    return {
      currentStreak,
      longestStreak,
      lastStudyDate: dates[0]
    };
  };
  
  /**
   * Get week days for calendar display
   * @param {Date} weekStart - Start of the week
   * @returns {array} Array of date objects for the week
   */
  export const getWeekDays = (weekStart = null) => {
    const start = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    
    return days;
  };
  
  /**
   * Check if date is within study schedule
   * @param {Date} date - Date to check
   * @param {object} schedule - User's study schedule
   * @returns {boolean} Whether date is in schedule
   */
  export const isInStudySchedule = (date, schedule = {}) => {
    if (!date || !schedule) return false;
    
    const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, etc.
    const dayName = format(date, 'EEEE').toLowerCase();
    
    return schedule[dayName] === true || schedule[dayOfWeek] === true;
  };
  
  /**
   * Get next study date based on schedule
   * @param {object} schedule - User's study schedule
   * @returns {Date|null} Next scheduled study date
   */
  export const getNextStudyDate = (schedule = {}) => {
    if (!schedule) return null;
    
    const today = new Date();
    
    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const futureDate = addDays(today, i);
      
      if (isInStudySchedule(futureDate, schedule)) {
        return futureDate;
      }
    }
    
    return null;
  };
  
  /**
   * Format time for session tracking
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time (HH:MM:SS)
   */
  export const formatSessionTime = (seconds) => {
    if (!seconds || seconds < 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  /**
   * Get time zone information
   * @returns {object} Time zone data
   */
  export const getTimeZoneInfo = () => {
    const now = new Date();
    
    return {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offset: now.getTimezoneOffset(),
      offsetString: format(now, 'xxx'),
      isDST: now.getTimezoneOffset() < Math.max(
        new Date(now.getFullYear(), 0, 1).getTimezoneOffset(),
        new Date(now.getFullYear(), 6, 1).getTimezoneOffset()
      )
    };
  };
  
  /**
   * Create date range array
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {array} Array of dates in range
   */
  export const createDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = startOfDay(startDate);
    const end = startOfDay(endDate);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  };
  
  /**
   * Get study statistics for a time period
   * @param {array} studyDates - Array of study dates
   * @param {Date} startDate - Period start
   * @param {Date} endDate - Period end
   * @returns {object} Study statistics
   */
  export const getStudyStats = (studyDates = [], startDate, endDate) => {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    
    const validDates = studyDates
      .map(dateStr => parseISO(dateStr))
      .filter(date => isValid(date) && date >= start && date <= end);
    
    const totalDays = differenceInDays(end, start) + 1;
    const studyDays = validDates.length;
    const streak = calculateStudyStreak(studyDates);
    
    return {
      totalDays,
      studyDays,
      restDays: totalDays - studyDays,
      studyRate: totalDays > 0 ? (studyDays / totalDays) * 100 : 0,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak
    };
  };
  
  /**
   * Validate and parse date input
   * @param {any} input - Date input to validate
   * @returns {Date|null} Valid date or null
   */
  export const validateDate = (input) => {
    if (!input) return null;
    
    let date;
    
    if (typeof input === 'string') {
      date = parseISO(input);
    } else if (input instanceof Date) {
      date = input;
    } else {
      return null;
    }
    
    return isValid(date) ? date : null;
  };
  
  export const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };
  
  export const getAvailableStudyTime = () => {
    // Mock implementation - could integrate with calendar
    return Math.floor(Math.random() * 45) + 15; // 15-60 minutes
  };
  
  // Export all utility functions as default
  export default {
    formatDate,
    getRelativeDate,
    formatDuration,
    getTimePeriod,
    hasStudiedToday,
    calculateStudyStreak,
    getWeekDays,
    isInStudySchedule,
    getNextStudyDate,
    formatSessionTime,
    getTimeZoneInfo,
    createDateRange,
    getStudyStats,
    validateDate,
    getTimeOfDay,
    getAvailableStudyTime
  };