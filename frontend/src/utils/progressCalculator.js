// src/utils/progressCalculator.js

/**
 * Core utilities for calculating learning progress, XP, levels, and performance metrics
 */

// Constants for calculations
const XP_PER_LEVEL = 1000;
const CHAPTER_BASE_XP = 50;
const QUIZ_BASE_XP = 25;
const STREAK_BONUS_MULTIPLIER = 0.1;
const PERFORMANCE_BONUS_MULTIPLIER = 0.5;

/**
 * Calculate user level from total XP
 * @param {number} totalXP - Total experience points
 * @returns {object} Level information
 */
export const calculateLevel = (totalXP) => {
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - currentLevelXP;
  const progressToNextLevel = (currentLevelXP / XP_PER_LEVEL) * 100;

  return {
    level,
    currentLevelXP,
    xpToNextLevel,
    progressToNextLevel: Math.round(progressToNextLevel * 100) / 100,
    totalXP
  };
};

/**
 * Calculate XP earned for completing a chapter
 * @param {object} chapter - Chapter data
 * @param {number} timeSpent - Time spent in minutes
 * @param {number} quizScore - Quiz score percentage (0-100)
 * @param {number} streak - Current learning streak
 * @returns {number} XP earned
 */
export const calculateChapterXP = (chapter, timeSpent = 0, quizScore = 0, streak = 0) => {
  let baseXP = CHAPTER_BASE_XP;
  
  // Bonus for chapter difficulty
  const difficultyMultiplier = {
    'easy': 1.0,
    'medium': 1.2,
    'hard': 1.5,
    'expert': 2.0
  };
  
  const difficulty = chapter.difficulty || 'medium';
  baseXP *= difficultyMultiplier[difficulty];
  
  // Performance bonus based on quiz score
  const performanceBonus = (quizScore / 100) * PERFORMANCE_BONUS_MULTIPLIER * baseXP;
  
  // Streak bonus
  const streakBonus = streak * STREAK_BONUS_MULTIPLIER * baseXP;
  
  // Time efficiency bonus (if completed in reasonable time)
  const expectedTime = chapter.estimatedTime || 30; // minutes
  const efficiencyBonus = timeSpent <= expectedTime ? baseXP * 0.2 : 0;
  
  const totalXP = Math.round(baseXP + performanceBonus + streakBonus + efficiencyBonus);
  
  return Math.max(totalXP, 10); // Minimum 10 XP
};

/**
 * Calculate quiz XP based on performance
 * @param {number} score - Quiz score percentage (0-100)
 * @param {number} questionsCount - Number of questions
 * @param {number} timeSpent - Time spent in minutes
 * @param {number} attempts - Number of attempts taken
 * @returns {number} XP earned
 */
export const calculateQuizXP = (score, questionsCount = 10, timeSpent = 0, attempts = 1) => {
  let baseXP = QUIZ_BASE_XP * (questionsCount / 10); // Scale by question count
  
  // Score multiplier
  const scoreMultiplier = score / 100;
  
  // Attempt penalty (fewer attempts = more XP)
  const attemptMultiplier = Math.max(1 - (attempts - 1) * 0.1, 0.5);
  
  // Time bonus for quick completion
  const avgTimePerQuestion = timeSpent / questionsCount;
  const timeBonus = avgTimePerQuestion <= 1 ? baseXP * 0.15 : 0;
  
  const totalXP = Math.round((baseXP * scoreMultiplier * attemptMultiplier) + timeBonus);
  
  return Math.max(totalXP, 5); // Minimum 5 XP
};

/**
 * Calculate overall progress for a subject
 * @param {object} subjectData - Subject data with topics and chapters
 * @param {object} userProgress - User's progress data
 * @returns {object} Progress information
 */
export const calculateSubjectProgress = (subjectData, userProgress) => {
  if (!subjectData || !subjectData.topics) {
    return { percentage: 0, completedChapters: 0, totalChapters: 0 };
  }

  let totalChapters = 0;
  let completedChapters = 0;
  let totalXP = 0;

  subjectData.topics.forEach(topic => {
    if (topic.chapters) {
      topic.chapters.forEach(chapter => {
        totalChapters++;
        const chapterProgress = userProgress?.chapters?.[chapter.id];
        
        if (chapterProgress?.completed) {
          completedChapters++;
          totalXP += chapterProgress.xpEarned || 0;
        }
      });
    }
  });

  const percentage = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

  return {
    percentage: Math.round(percentage * 100) / 100,
    completedChapters,
    totalChapters,
    totalXP
  };
};

/**
 * Calculate topic progress
 * @param {object} topicData - Topic data with chapters
 * @param {object} userProgress - User's progress data
 * @returns {object} Progress information
 */
export const calculateTopicProgress = (topicData, userProgress) => {
  if (!topicData || !topicData.chapters) {
    return { percentage: 0, completedChapters: 0, totalChapters: 0 };
  }

  let totalChapters = topicData.chapters.length;
  let completedChapters = 0;
  let averageScore = 0;
  let totalTime = 0;

  topicData.chapters.forEach(chapter => {
    const chapterProgress = userProgress?.chapters?.[chapter.id];
    
    if (chapterProgress?.completed) {
      completedChapters++;
      averageScore += chapterProgress.quizScore || 0;
      totalTime += chapterProgress.timeSpent || 0;
    }
  });

  const percentage = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
  averageScore = completedChapters > 0 ? averageScore / completedChapters : 0;

  return {
    percentage: Math.round(percentage * 100) / 100,
    completedChapters,
    totalChapters,
    averageScore: Math.round(averageScore * 100) / 100,
    totalTime
  };
};

/**
 * Calculate learning streak
 * @param {array} learningHistory - Array of learning session dates
 * @param {Date} currentDate - Current date (defaults to today)
 * @returns {object} Streak information
 */
export const calculateStreak = (learningHistory = [], currentDate = new Date()) => {
  if (!learningHistory || learningHistory.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastStudyDate: null };
  }

  // Sort dates in descending order
  const sortedDates = learningHistory
    .map(date => new Date(date))
    .sort((a, b) => b - a);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastStudyDate = sortedDates[0];

  // Check if studied today or yesterday
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastStudy = new Date(lastStudyDate);
  lastStudy.setHours(0, 0, 0, 0);

  // Calculate current streak
  if (lastStudy.getTime() === today.getTime() || lastStudy.getTime() === yesterday.getTime()) {
    let checkDate = new Date(today);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const studyDate = new Date(sortedDates[i]);
      studyDate.setHours(0, 0, 0, 0);
      
      if (studyDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (studyDate.getTime() === checkDate.getTime()) {
        // Continue checking previous days
        continue;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let previousDate = null;
  for (const date of sortedDates) {
    const currentDateCheck = new Date(date);
    currentDateCheck.setHours(0, 0, 0, 0);
    
    if (previousDate) {
      const dayDifference = (previousDate - currentDateCheck) / (1000 * 60 * 60 * 24);
      
      if (dayDifference === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    
    previousDate = currentDateCheck;
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastStudyDate: lastStudyDate
  };
};

/**
 * Calculate performance metrics for analytics
 * @param {object} userProgress - User's complete progress data
 * @returns {object} Performance metrics
 */
export const calculatePerformanceMetrics = (userProgress) => {
  // Accept both array and object with chapters
  let chapters = [];
  if (Array.isArray(userProgress)) {
    chapters = userProgress;
  } else if (userProgress && userProgress.chapters) {
    chapters = Object.values(userProgress.chapters);
  }

  if (!chapters.length) {
    return {
      averageQuizScore: 0,
      averageTimePerChapter: 0,
      completionRate: 0,
      learningVelocity: 0,
      strongSubjects: [],
      weakSubjects: []
    };
  }

  const completedChapters = chapters.filter(chapter => chapter.isCompleted || chapter.completed);

  // Average quiz score
  const averageQuizScore = completedChapters.length > 0
    ? completedChapters.reduce((sum, chapter) => sum + (chapter.assessmentScoreAverage || chapter.quizScore || 0), 0) / completedChapters.length
    : 0;

  // Average time per chapter
  const averageTimePerChapter = completedChapters.length > 0
    ? completedChapters.reduce((sum, chapter) => sum + (chapter.timeSpent || 0), 0) / completedChapters.length
    : 0;

  // Completion rate (chapters completed vs attempted)
  const completionRate = chapters.length > 0
    ? (completedChapters.length / chapters.length) * 100
    : 0;

  // Learning velocity (chapters per week)
  const firstChapterDate = completedChapters.length > 0 ? Math.min(...completedChapters.map(ch => new Date(ch.completedAt || Date.now()))) : Date.now();
  const daysSinceStart = (Date.now() - firstChapterDate) / (1000 * 60 * 60 * 24);
  const learningVelocity = daysSinceStart > 0 ? (completedChapters.length / daysSinceStart) * 7 : 0;

  // Subject performance analysis
  const subjectPerformance = {};
  completedChapters.forEach(chapter => {
    const subject = chapter.subjectId || chapter.subject;
    if (!subjectPerformance[subject]) {
      subjectPerformance[subject] = { scores: [], count: 0 };
    }
    subjectPerformance[subject].scores.push(chapter.assessmentScoreAverage || chapter.quizScore || 0);
    subjectPerformance[subject].count++;
  });

  const subjectAverages = Object.entries(subjectPerformance).map(([subject, data]) => ({
    subject,
    averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
    chapterCount: data.count
  }));

  const strongSubjects = subjectAverages
    .filter(s => s.averageScore >= 80)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3);

  const weakSubjects = subjectAverages
    .filter(s => s.averageScore < 60)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3);

  return {
    averageQuizScore: Math.round(averageQuizScore * 100) / 100,
    averageTimePerChapter: Math.round(averageTimePerChapter * 100) / 100,
    completionRate: Math.round(completionRate * 100) / 100,
    learningVelocity: Math.round(learningVelocity * 100) / 100,
    strongSubjects,
    weakSubjects
  };
};

/**
 * Calculate gems earned based on performance
 * @param {number} xpEarned - XP earned in session
 * @param {number} streak - Current streak
 * @param {boolean} perfectScore - Whether user got perfect score
 * @returns {number} Gems earned
 */
export const calculateGemsEarned = (xpEarned, streak = 0, perfectScore = false) => {
  let gems = Math.floor(xpEarned / 100); // 1 gem per 100 XP
  
  // Streak bonus
  if (streak >= 7) gems += 2;
  else if (streak >= 3) gems += 1;
  
  // Perfect score bonus
  if (perfectScore) gems += 3;
  
  return Math.max(gems, 1); // Minimum 1 gem
};

/**
 * Calculate coins earned based on daily activities
 * @param {object} dailyActivities - Daily activities completed
 * @returns {number} Coins earned
 */
export const calculateCoinsEarned = (dailyActivities = {}) => {
  let coins = 0;
  
  // Base coins for different activities
  if (dailyActivities.chaptersCompleted) coins += dailyActivities.chaptersCompleted * 10;
  if (dailyActivities.quizzesCompleted) coins += dailyActivities.quizzesCompleted * 5;
  if (dailyActivities.experimentsCompleted) coins += dailyActivities.experimentsCompleted * 15;
  if (dailyActivities.videosWatched) coins += dailyActivities.videosWatched * 3;
  
  // Daily login bonus
  if (dailyActivities.dailyLogin) coins += 50;
  
  return coins;
};

export const calculatePathProgress = (path, userProgress) => {
  if (!path?.steps) return 0;
  
  const completedSteps = path.steps.filter(step => 
    userProgress?.chapters?.[step.topicId]?.completed
  ).length;
  
  return (completedSteps / path.steps.length) * 100;
};

export default {
  calculateLevel,
  calculateChapterXP,
  calculateQuizXP,
  calculateSubjectProgress,
  calculateTopicProgress,
  calculateStreak,
  calculatePerformanceMetrics,
  calculateGemsEarned,
  calculateCoinsEarned
};