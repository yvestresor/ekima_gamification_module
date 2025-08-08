// Core recommendation algorithm for Ekima Learning Platform
// Based on TIE API data structure and user learning patterns

import { format, differenceInDays, parseISO } from 'date-fns';

/**
 * Main recommendation engine that generates personalized learning suggestions
 * @param {Object} user - User object from TIE API
 * @param {Array} progress - User's progress data
 * @param {Array} quizAttempts - User's quiz attempt history
 * @param {Array} allTopics - Available topics from TIE API
 * @param {Array} subjects - Available subjects
 * @returns {Array} Sorted array of recommended topics
 */
export const generateRecommendations = (user, progress, quizAttempts, allTopics, subjects) => {
  try {
    // Defensive: ensure all arguments are defined
    user = user || {};
    progress = Array.isArray(progress) ? progress : [];
    quizAttempts = Array.isArray(quizAttempts) ? quizAttempts : [];
    allTopics = Array.isArray(allTopics) ? allTopics : [];
    subjects = Array.isArray(subjects) ? subjects : [];

    // 1. Analyze user's learning patterns
    const userProfile = analyzeUserProfile(user, progress, quizAttempts);
    
    // 2. Get completed and in-progress topics
    const completedTopics = getCompletedTopics(progress);
    const inProgressTopics = getInProgressTopics(progress);
    
    // 3. Find next available topics based on curriculum flow
    const availableTopics = findAvailableTopics(allTopics, completedTopics, inProgressTopics);
    
    // 4. Score each available topic based on user profile
    const scoredTopics = scoreTopics(availableTopics, userProfile, subjects);
    
    // 5. Apply recommendation strategies
    const strategicRecommendations = applyRecommendationStrategies(scoredTopics, userProfile);
    
    // 6. Sort by final score and return top recommendations
    return strategicRecommendations
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5)
      .map(addRecommendationMetadata);
      
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

/**
 * Analyze user's learning patterns and preferences
 */
const analyzeUserProfile = (user, progress, quizAttempts) => {
  user = user || {};
  progress = Array.isArray(progress) ? progress : [];
  quizAttempts = Array.isArray(quizAttempts) ? quizAttempts : [];

  const totalTimeSpent = user.timeSpent || 0;
  const avgSessionTime = calculateAverageSessionTime(progress);
  
  // Calculate performance metrics
  const performanceBySubject = calculateSubjectPerformance(progress, quizAttempts);
  const overallPerformance = calculateOverallPerformance(quizAttempts);
  
  // Determine learning preferences
  const contentTypePreference = determineContentPreference(progress);
  const difficultyPreference = determineDifficultyPreference(quizAttempts);
  const learningSpeed = determineLearningSpeed(progress, quizAttempts);
  
  // Identify strengths and weaknesses
  const strongSubjects = Object.entries(performanceBySubject)
    .filter(([_, score]) => score >= 75)
    .map(([subject, _]) => subject);
    
  const weakSubjects = Object.entries(performanceBySubject)
    .filter(([_, score]) => score < 60)
    .map(([subject, _]) => subject);
  
  return {
    userId: user._id,
    totalTimeSpent,
    avgSessionTime,
    performanceBySubject,
    overallPerformance,
    contentTypePreference,
    difficultyPreference,
    learningSpeed,
    strongSubjects,
    weakSubjects,
    ageGroup: user.ageGroup,
    level: user.level,
    region: user.region,
    deviceType: user.deviceType,
    lastLogin: user.loginAt
  };
};

/**
 * Calculate average session time from progress data
 */
const calculateAverageSessionTime = (progress) => {
  if (!progress || progress.length === 0) return 30; // Default 30 minutes
  
  const sessions = progress.filter(p => p.timeSpent > 0);
  if (sessions.length === 0) return 30;
  
  const totalTime = sessions.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  return Math.round(totalTime / sessions.length / 60000); // Convert to minutes
};

/**
 * Calculate performance by subject
 */
const calculateSubjectPerformance = (progress, quizAttempts) => {
  const subjectScores = {};
  
  // Group quiz attempts by subject
  quizAttempts.forEach(attempt => {
    const subject = attempt.subject;
    if (!subjectScores[subject]) {
      subjectScores[subject] = [];
    }
    subjectScores[subject].push(attempt.score);
  });
  
  // Calculate average score per subject
  const subjectAverages = {};
  Object.entries(subjectScores).forEach(([subject, scores]) => {
    subjectAverages[subject] = scores.reduce((a, b) => a + b, 0) / scores.length;
  });
  
  return subjectAverages;
};

/**
 * Calculate overall performance
 */
const calculateOverallPerformance = (quizAttempts) => {
  if (!quizAttempts || quizAttempts.length === 0) return 50; // Default
  
  const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return Math.round(totalScore / quizAttempts.length);
};

/**
 * Determine preferred content type
 */
const determineContentPreference = (progress) => {
  let videoTime = 0, experimentTime = 0, notesTime = 0;
  
  progress.forEach(p => {
    if (p.videoProgress > 50) videoTime += p.timeSpent || 0;
    if (p.experimentsAttempted > 0) experimentTime += p.timeSpent || 0;
    if (p.notesProgress > 50) notesTime += p.timeSpent || 0;
  });
  
  const total = videoTime + experimentTime + notesTime;
  if (total === 0) return 'video'; // Default
  
  if (videoTime >= experimentTime && videoTime >= notesTime) return 'video';
  if (experimentTime >= notesTime) return 'experiment';
  return 'notes';
};

/**
 * Determine difficulty preference
 */
const determineDifficultyPreference = (quizAttempts) => {
  const difficultyScores = { Easy: [], Medium: [], Hard: [] };
  
  quizAttempts.forEach(attempt => {
    const difficulty = attempt.difficulty || 'Medium';
    difficultyScores[difficulty].push(attempt.score);
  });
  
  // Find difficulty with best average performance
  let bestDifficulty = 'Medium';
  let bestScore = 0;
  
  Object.entries(difficultyScores).forEach(([difficulty, scores]) => {
    if (scores.length > 0) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestDifficulty = difficulty;
      }
    }
  });
  
  return bestDifficulty;
};

/**
 * Determine learning speed (fast, medium, slow)
 */
const determineLearningSpeed = (progress, quizAttempts) => {
  // Calculate based on time spent vs. progress made
  const completedItems = progress.filter(p => p.isCompleted);
  if (completedItems.length === 0) return 'medium';
  
  const avgTimePerCompletion = completedItems.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / completedItems.length;
  
  // Thresholds in milliseconds (adjust based on your data)
  if (avgTimePerCompletion < 1800000) return 'fast'; // Less than 30 minutes
  if (avgTimePerCompletion > 3600000) return 'slow'; // More than 60 minutes
  return 'medium';
};

/**
 * Get completed topics from progress data
 */
const getCompletedTopics = (progress) => {
  return progress
    .filter(p => p.isCompleted)
    .map(p => p.chapterId); // Assuming chapter maps to topic
};

/**
 * Get in-progress topics
 */
const getInProgressTopics = (progress) => {
  return progress
    .filter(p => !p.isCompleted && p.overallProgress > 0)
    .map(p => p.chapterId);
};

/**
 * Find available topics based on prerequisites and completion status
 */
const findAvailableTopics = (allTopics, completed, inProgress) => {
  return allTopics.filter(topic => {
    // Don't recommend already completed topics
    if (completed.includes(topic._id)) return false;
    
    // Include in-progress topics
    if (inProgress.includes(topic._id)) return true;
    
    // Check if prerequisites are met
    const prerequisitesMet = topic.prerequisites?.every(prereq => 
      completed.some(completedTopic => 
        completedTopic.includes(prereq) || prereq === 'basic'
      )
    ) ?? true;
    
    return prerequisitesMet;
  });
};

/**
 * Score topics based on user profile
 */
const scoreTopics = (availableTopics, userProfile, subjects) => {
  return availableTopics.map(topic => {
    let score = 0;
    const reasons = [];
    
    // Subject performance factor (30%)
    const subjectPerformance = userProfile.performanceBySubject[getSubjectName(topic.subject, subjects)] || 50;
    const subjectScore = Math.min(subjectPerformance / 100, 1) * 30;
    score += subjectScore;
    
    if (subjectPerformance >= 75) {
      reasons.push(`Strong performance in ${getSubjectName(topic.subject, subjects)}`);
    }
    
    // Difficulty matching (25%)
    const difficultyMatch = topic.difficulty === userProfile.difficultyPreference ? 25 : 
                          Math.abs(getDifficultyLevel(topic.difficulty) - getDifficultyLevel(userProfile.difficultyPreference)) * 8;
    score += Math.max(0, 25 - difficultyMatch);
    
    // Learning speed factor (20%)
    const timeScore = calculateTimeScore(topic.estimatedTime, userProfile.avgSessionTime) * 20;
    score += timeScore;
    
    // Featured topic bonus (15%)
    if (topic.isFeatured) {
      score += 15;
      reasons.push("Featured topic for your level");
    }
    
    // Recent activity bonus (10%)
    const recentActivityScore = calculateRecentActivityScore(topic, userProfile) * 10;
    score += recentActivityScore;
    
    return {
      ...topic,
      recommendationScore: score,
      reasons: reasons.length > 0 ? reasons : [`Good match for your ${userProfile.difficultyPreference.toLowerCase()} level`],
      confidence: Math.min(score / 100, 0.95) // Max 95% confidence
    };
  });
};

/**
 * Apply strategic recommendation rules
 */
const applyRecommendationStrategies = (scoredTopics, userProfile) => {
  return scoredTopics.map(topic => {
    let strategicScore = topic.recommendationScore;
    const strategicReasons = [...topic.reasons];
    
    // Weak subject reinforcement strategy
    if (userProfile.weakSubjects.includes(getSubjectName(topic.subject))) {
      strategicScore += 10;
      strategicReasons.push("Helps improve your weaker areas");
    }
    
    // Learning speed optimization
    if (userProfile.learningSpeed === 'fast' && topic.difficulty === 'Hard') {
      strategicScore += 5;
      strategicReasons.push("Challenge for fast learners");
    } else if (userProfile.learningSpeed === 'slow' && topic.difficulty === 'Easy') {
      strategicScore += 5;
      strategicReasons.push("Good pace for steady learning");
    }
    
    // Sequential learning bonus
    if (topic.prerequisites && topic.prerequisites.length > 0) {
      strategicScore += 3;
    }
    
    return {
      ...topic,
      finalScore: strategicScore,
      reasons: strategicReasons
    };
  });
};

/**
 * Add metadata to recommendations
 */
const addRecommendationMetadata = (topic) => {
  return {
    _id: topic._id,
    name: topic.name,
    subject: topic.subject,
    difficulty: topic.difficulty,
    estimatedTime: topic.estimatedTime,
    reasons: topic.reasons,
    confidence: topic.confidence,
    score: topic.finalScore,
    contentTypes: determineContentTypes(topic),
    priority: Math.ceil(topic.finalScore / 20), // 1-5 priority scale
    createdAt: new Date().toISOString()
  };
};

/**
 * Helper functions
 */
const getSubjectName = (subjectId, subjects) => {
  const subject = subjects?.find(s => s._id === subjectId);
  return subject?.name || 'Unknown Subject';
};

const getDifficultyLevel = (difficulty) => {
  const levels = { Easy: 1, Medium: 2, Hard: 3 };
  return levels[difficulty] || 2;
};

const calculateTimeScore = (topicTime, userAvgTime) => {
  const topicMinutes = parseInt(topicTime) || 45;
  const ratio = Math.min(userAvgTime / topicMinutes, 2); // Cap at 2x
  return Math.max(0, 1 - Math.abs(1 - ratio)); // Best score when ratio is 1
};

const calculateRecentActivityScore = (topic, userProfile) => {
  // Give bonus for topics in subjects user has been active in recently
  const daysSinceLogin = differenceInDays(new Date(), parseISO(userProfile.lastLogin));
  return Math.max(0, 1 - (daysSinceLogin / 7)); // Decay over a week
};

const determineContentTypes = (topic) => {
  const types = ['video', 'quiz']; // Default content types
  
  if (topic.name.toLowerCase().includes('experiment') || 
      topic.subject === 'Physics' || 
      topic.subject === 'Chemistry') {
    types.push('experiment');
  }
  
  if (topic.difficulty === 'Hard') {
    types.push('simulation');
  }
  
  if (topic.subject === 'Biology') {
    types.push('3d-model');
  }
  
  return types;
};

export default {
  generateRecommendations,
  analyzeUserProfile,
  calculateSubjectPerformance,
  determineContentPreference,
  determineDifficultyPreference
};