// src/services/gamification.js

/**
 * Gamification service for managing XP, levels, achievements, streaks, and rewards
 * Provides comprehensive gamification mechanics for the Ekima Learning Platform
 */

import { 
    calculateLevel, 
    calculateChapterXP, 
    calculateQuizXP, 
    calculateStreak,
    calculateGemsEarned,
    calculateCoinsEarned 
  } from '../utils/progressCalculator';
  import { formatDate } from '../utils/dateUtils';
  
  // Gamification constants
  const GAMIFICATION_CONFIG = {
    xpPerLevel: 1000,
    maxLevel: 100,
    dailyBonusCoins: 100,
    streakBonusMultiplier: 10,
    achievementCategories: [
      'progression', 'completion', 'streak', 'performance', 
      'activity', 'social', 'special', 'daily'
    ],
    rarityLevels: ['common', 'rare', 'epic', 'legendary', 'mythic'],
    leaderboardTypes: ['xp', 'level', 'streak', 'achievements']
  };
  
  // Achievement definitions
  const ACHIEVEMENT_DEFINITIONS = {
    // Progression Achievements
    level_5: {
      id: 'level_5',
      name: 'Rising Scholar',
      description: 'Reach Level 5',
      category: 'progression',
      rarity: 'common',
      xpReward: 100,
      gemsReward: 25,
      requirements: ['level >= 5'],
      icon: 'star'
    },
    level_10: {
      id: 'level_10',
      name: 'Dedicated Learner',
      description: 'Reach Level 10',
      category: 'progression',
      rarity: 'rare',
      xpReward: 250,
      gemsReward: 50,
      requirements: ['level >= 10'],
      icon: 'trophy'
    },
    level_25: {
      id: 'level_25',
      name: 'Knowledge Seeker',
      description: 'Reach Level 25',
      category: 'progression',
      rarity: 'epic',
      xpReward: 500,
      gemsReward: 100,
      requirements: ['level >= 25'],
      icon: 'crown'
    },
    
    // Completion Achievements
    first_chapter: {
      id: 'first_chapter',
      name: 'First Steps',
      description: 'Complete your first chapter',
      category: 'completion',
      rarity: 'common',
      xpReward: 50,
      gemsReward: 10,
      requirements: ['chapters_completed >= 1'],
      icon: 'book'
    },
    chapter_marathon: {
      id: 'chapter_marathon',
      name: 'Chapter Marathon',
      description: 'Complete 50 chapters',
      category: 'completion',
      rarity: 'epic',
      xpReward: 1000,
      gemsReward: 200,
      requirements: ['chapters_completed >= 50'],
      icon: 'target'
    },
    subject_master: {
      id: 'subject_master',
      name: 'Subject Master',
      description: 'Complete all topics in a subject',
      category: 'completion',
      rarity: 'rare',
      xpReward: 300,
      gemsReward: 75,
      requirements: ['subject_completion >= 100'],
      icon: 'award'
    },
    
    // Streak Achievements
    week_warrior: {
      id: 'week_warrior',
      name: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      category: 'streak',
      rarity: 'rare',
      xpReward: 200,
      gemsReward: 50,
      requirements: ['streak >= 7'],
      icon: 'flame'
    },
    month_master: {
      id: 'month_master',
      name: 'Monthly Master',
      description: 'Study for 30 consecutive days',
      category: 'streak',
      rarity: 'legendary',
      xpReward: 1000,
      gemsReward: 300,
      requirements: ['streak >= 30'],
      icon: 'calendar'
    },
    
    // Performance Achievements
    perfect_score: {
      id: 'perfect_score',
      name: 'Perfectionist',
      description: 'Get 100% on a quiz',
      category: 'performance',
      rarity: 'rare',
      xpReward: 150,
      gemsReward: 40,
      requirements: ['quiz_score >= 100'],
      icon: 'star'
    },
    speed_demon: {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a chapter in under 10 minutes',
      category: 'performance',
      rarity: 'epic',
      xpReward: 300,
      gemsReward: 80,
      requirements: ['chapter_time <= 600'], // 10 minutes in seconds
      icon: 'zap'
    },
    
    // Activity Achievements
    daily_goal_streak: {
      id: 'daily_goal_streak',
      name: 'Goal Crusher',
      description: 'Complete daily goals for 7 days',
      category: 'activity',
      rarity: 'rare',
      xpReward: 250,
      gemsReward: 60,
      requirements: ['daily_goal_streak >= 7'],
      icon: 'target'
    },
    experiment_enthusiast: {
      id: 'experiment_enthusiast',
      name: 'Experiment Enthusiast',
      description: 'Complete 25 experiments',
      category: 'activity',
      rarity: 'rare',
      xpReward: 200,
      gemsReward: 50,
      requirements: ['experiments_completed >= 25'],
      icon: 'beaker'
    },
    
    // Special Achievements
    early_bird: {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Study before 8 AM',
      category: 'special',
      rarity: 'rare',
      xpReward: 100,
      gemsReward: 30,
      requirements: ['study_hour <= 8'],
      icon: 'clock'
    },
    night_owl: {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Study after 10 PM',
      category: 'special',
      rarity: 'rare',
      xpReward: 100,
      gemsReward: 30,
      requirements: ['study_hour >= 22'],
      icon: 'moon'
    }
  };
  
  // Leaderboard configurations
  const LEADERBOARD_CONFIG = {
    xp: {
      name: 'XP Leaders',
      description: 'Top learners by experience points',
      icon: 'zap',
      timeframes: ['daily', 'weekly', 'monthly', 'all_time']
    },
    level: {
      name: 'Level Leaders',
      description: 'Highest level achievers',
      icon: 'star',
      timeframes: ['all_time']
    },
    streak: {
      name: 'Streak Champions',
      description: 'Longest learning streaks',
      icon: 'flame',
      timeframes: ['current', 'all_time']
    },
    achievements: {
      name: 'Achievement Hunters',
      description: 'Most achievements unlocked',
      icon: 'trophy',
      timeframes: ['weekly', 'monthly', 'all_time']
    }
  };
  
  class GamificationService {
    constructor() {
      this.eventListeners = new Map();
      this.achievementCache = new Map();
      this.leaderboardCache = new Map();
      this.lastCacheUpdate = 0;
      this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
      
      this.init();
    }
  
    /**
     * Initialize gamification service
     */
    init() {
      // Load achievement definitions
      this.loadAchievementDefinitions();
      
      // Set up periodic tasks
      this.startPeriodicTasks();
      
      console.log('Gamification service initialized');
    }
  
    /**
     * Award XP to user with optional multipliers and bonuses
     */
    async awardXP(userId, amount, source = 'general', metadata = {}) {
      try {
        let finalAmount = amount;
        
        // Apply streak bonus
        const streakData = await this.getStreakData(userId);
        if (streakData.currentStreak >= 7) {
          finalAmount *= 1.2; // 20% bonus for 7+ day streak
        }
        
        // Apply daily goal bonus
        const dailyProgress = await this.getDailyGoalProgress(userId);
        if (dailyProgress.completed) {
          finalAmount *= 1.1; // 10% bonus for completing daily goals
        }
        
        // Apply source-specific multipliers
        const sourceMultipliers = {
          perfect_quiz: 1.5,
          fast_completion: 1.3,
          challenge_mode: 2.0,
          weekend_study: 1.2
        };
        
        if (sourceMultipliers[source]) {
          finalAmount *= sourceMultipliers[source];
        }
        
        finalAmount = Math.round(finalAmount);
        
        // Calculate level changes
        const currentData = await this.getUserGamificationData(userId);
        const oldLevel = calculateLevel(currentData.totalXP).level;
        const newLevel = calculateLevel(currentData.totalXP + finalAmount).level;
        
        // Update user data
        await this.updateUserGamificationData(userId, {
          totalXP: currentData.totalXP + finalAmount,
          lastXPSource: source,
          lastXPAmount: finalAmount,
          lastXPTimestamp: Date.now()
        });
        
        // Check for level up
        if (newLevel > oldLevel) {
          await this.handleLevelUp(userId, oldLevel, newLevel);
        }
        
        // Emit XP awarded event
        this.emitEvent('xp_awarded', {
          userId,
          amount: finalAmount,
          source,
          metadata,
          levelUp: newLevel > oldLevel,
          newLevel
        });
        
        return {
          awarded: finalAmount,
          total: currentData.totalXP + finalAmount,
          levelUp: newLevel > oldLevel,
          newLevel: newLevel > oldLevel ? newLevel : null
        };
        
      } catch (error) {
        console.error('Error awarding XP:', error);
        throw error;
      }
    }
  
    /**
     * Handle level up rewards and notifications
     */
    async handleLevelUp(userId, oldLevel, newLevel) {
      try {
        // Calculate level up rewards
        const levelDifference = newLevel - oldLevel;
        const gemsReward = levelDifference * 50; // 50 gems per level
        const coinsReward = levelDifference * 100; // 100 coins per level
        
        // Award level up rewards
        await this.awardGems(userId, gemsReward, 'level_up');
        await this.awardCoins(userId, coinsReward, 'level_up');
        
        // Check for level-based achievements
        await this.checkLevelAchievements(userId, newLevel);
        
        // Emit level up event
        this.emitEvent('level_up', {
          userId,
          oldLevel,
          newLevel,
          levelDifference,
          gemsReward,
          coinsReward
        });
        
        console.log(`User ${userId} leveled up from ${oldLevel} to ${newLevel}`);
        
      } catch (error) {
        console.error('Error handling level up:', error);
      }
    }
  
    /**
     * Award gems to user
     */
    async awardGems(userId, amount, source = 'general') {
      try {
        const currentData = await this.getUserGamificationData(userId);
        
        await this.updateUserGamificationData(userId, {
          gems: currentData.gems + amount,
          lastGemsSource: source,
          lastGemsAmount: amount,
          lastGemsTimestamp: Date.now()
        });
        
        this.emitEvent('gems_awarded', {
          userId,
          amount,
          source,
          total: currentData.gems + amount
        });
        
        return currentData.gems + amount;
        
      } catch (error) {
        console.error('Error awarding gems:', error);
        throw error;
      }
    }
  
    /**
     * Award coins to user
     */
    async awardCoins(userId, amount, source = 'general') {
      try {
        const currentData = await this.getUserGamificationData(userId);
        
        await this.updateUserGamificationData(userId, {
          coins: currentData.coins + amount,
          lastCoinsSource: source,
          lastCoinsAmount: amount,
          lastCoinsTimestamp: Date.now()
        });
        
        this.emitEvent('coins_awarded', {
          userId,
          amount,
          source,
          total: currentData.coins + amount
        });
        
        return currentData.coins + amount;
        
      } catch (error) {
        console.error('Error awarding coins:', error);
        throw error;
      }
    }
  
    /**
     * Check and unlock achievements
     */
    async checkAchievements(userId, context = {}) {
      try {
        const userStats = await this.getUserStats(userId);
        const unlockedAchievements = [];
        
        for (const [achievementId, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
          // Skip if already unlocked
          if (userStats.achievements.includes(achievementId)) {
            continue;
          }
          
          // Check if requirements are met
          if (this.checkAchievementRequirements(definition, userStats, context)) {
            await this.unlockAchievement(userId, achievementId);
            unlockedAchievements.push(achievementId);
          }
        }
        
        return unlockedAchievements;
        
      } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
      }
    }
  
    /**
     * Check if achievement requirements are met
     */
    checkAchievementRequirements(definition, userStats, context) {
      return definition.requirements.every(requirement => {
        const [field, operator, value] = this.parseRequirement(requirement);
        const actualValue = this.getStatValue(userStats, context, field);
        
        switch (operator) {
          case '>=':
            return actualValue >= value;
          case '<=':
            return actualValue <= value;
          case '==':
            return actualValue === value;
          case '>':
            return actualValue > value;
          case '<':
            return actualValue < value;
          default:
            return false;
        }
      });
    }
  
    /**
     * Parse achievement requirement string
     */
    parseRequirement(requirement) {
      const match = requirement.match(/^(\w+)\s*(>=|<=|==|>|<)\s*(.+)$/);
      if (!match) {
        throw new Error(`Invalid requirement format: ${requirement}`);
      }
      
      const [, field, operator, valueStr] = match;
      const value = isNaN(valueStr) ? valueStr : Number(valueStr);
      
      return [field, operator, value];
    }
  
    /**
     * Get stat value from user stats or context
     */
    getStatValue(userStats, context, field) {
      // First check context for recent values
      if (context[field] !== undefined) {
        return context[field];
      }
      
      // Then check user stats
      return userStats[field] || 0;
    }
  
    /**
     * Unlock achievement for user
     */
    async unlockAchievement(userId, achievementId) {
      try {
        const definition = ACHIEVEMENT_DEFINITIONS[achievementId];
        if (!definition) {
          throw new Error(`Achievement not found: ${achievementId}`);
        }
        
        const currentData = await this.getUserGamificationData(userId);
        
        // Add achievement to user's collection
        const updatedAchievements = [...currentData.achievements, {
          id: achievementId,
          unlockedAt: new Date().toISOString(),
          ...definition
        }];
        
        await this.updateUserGamificationData(userId, {
          achievements: updatedAchievements
        });
        
        // Award achievement rewards
        if (definition.xpReward) {
          await this.awardXP(userId, definition.xpReward, 'achievement');
        }
        if (definition.gemsReward) {
          await this.awardGems(userId, definition.gemsReward, 'achievement');
        }
        if (definition.coinsReward) {
          await this.awardCoins(userId, definition.coinsReward, 'achievement');
        }
        
        // Emit achievement unlocked event
        this.emitEvent('achievement_unlocked', {
          userId,
          achievementId,
          definition,
          timestamp: Date.now()
        });
        
        console.log(`Achievement unlocked: ${achievementId} for user ${userId}`);
        
        return true;
        
      } catch (error) {
        console.error('Error unlocking achievement:', error);
        throw error;
      }
    }
  
    /**
     * Update learning streak
     */
    async updateStreak(userId, studiedToday = true) {
      try {
        const currentData = await this.getUserGamificationData(userId);
        const streakData = calculateStreak(currentData.learningHistory || []);
        
        let newHistory = [...(currentData.learningHistory || [])];
        const today = new Date().toDateString();
        
        if (studiedToday && !newHistory.includes(today)) {
          newHistory.push(today);
        }
        
        const newStreakData = calculateStreak(newHistory);
        
        await this.updateUserGamificationData(userId, {
          learningHistory: newHistory,
          streakData: newStreakData
        });
        
        // Check for streak milestones
        await this.checkStreakMilestones(userId, newStreakData.currentStreak);
        
        return newStreakData;
        
      } catch (error) {
        console.error('Error updating streak:', error);
        throw error;
      }
    }
  
    /**
     * Check for streak milestone achievements
     */
    async checkStreakMilestones(userId, currentStreak) {
      const milestones = [3, 7, 14, 30, 50, 100];
      
      for (const milestone of milestones) {
        if (currentStreak === milestone) {
          await this.checkAchievements(userId, { streak: currentStreak });
          
          // Award streak bonus
          const bonusCoins = milestone * 10;
          await this.awardCoins(userId, bonusCoins, 'streak_milestone');
          
          this.emitEvent('streak_milestone', {
            userId,
            milestone,
            bonusCoins
          });
          
          break;
        }
      }
    }
  
    /**
     * Get leaderboard data
     */
    async getLeaderboard(type = 'xp', timeframe = 'weekly', limit = 100) {
      try {
        const cacheKey = `${type}_${timeframe}_${limit}`;
        
        // Check cache
        if (this.leaderboardCache.has(cacheKey) && 
            Date.now() - this.lastCacheUpdate < this.cacheTimeout) {
          return this.leaderboardCache.get(cacheKey);
        }
        
        // Fetch leaderboard data
        const leaderboard = await this.fetchLeaderboardData(type, timeframe, limit);
        
        // Cache result
        this.leaderboardCache.set(cacheKey, leaderboard);
        this.lastCacheUpdate = Date.now();
        
        return leaderboard;
        
      } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
      }
    }
  
    /**
     * Fetch leaderboard data (mock implementation)
     */
    async fetchLeaderboardData(type, timeframe, limit) {
      // Mock leaderboard data - in real app would fetch from API
      const mockUsers = Array.from({ length: limit }, (_, i) => ({
        id: `user_${i + 1}`,
        name: `User ${i + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        value: Math.floor(Math.random() * 10000) + 1000,
        rank: i + 1,
        change: Math.floor(Math.random() * 21) - 10 // -10 to +10
      }));
      
      return {
        type,
        timeframe,
        updated: new Date().toISOString(),
        users: mockUsers
      };
    }
  
    /**
     * Get user gamification data
     */
    async getUserGamificationData(userId) {
      try {
        // In real app, would fetch from API
        const storedData = localStorage.getItem(`ekima_gamification_${userId}`);
        
        if (storedData) {
          return JSON.parse(storedData);
        }
        
        // Return default data for new users
        return {
          userId,
          totalXP: 0,
          gems: 100,
          coins: 500,
          achievements: [],
          learningHistory: [],
          streakData: {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: null
          },
          dailyGoals: {
            chaptersTarget: 3,
            quizzesTarget: 2,
            studyTimeTarget: 60,
            currentProgress: {
              chapters: 0,
              quizzes: 0,
              studyTime: 0
            },
            lastResetDate: new Date().toDateString()
          },
          preferences: {
            notifications: true,
            publicProfile: false,
            shareProgress: true
          }
        };
        
      } catch (error) {
        console.error('Error getting user gamification data:', error);
        throw error;
      }
    }
  
    /**
     * Update user gamification data
     */
    async updateUserGamificationData(userId, updates) {
      try {
        const currentData = await this.getUserGamificationData(userId);
        const updatedData = { ...currentData, ...updates };
        
        // Save to localStorage (in real app would send to API)
        localStorage.setItem(`ekima_gamification_${userId}`, JSON.stringify(updatedData));
        
        return updatedData;
        
      } catch (error) {
        console.error('Error updating user gamification data:', error);
        throw error;
      }
    }
  
    /**
     * Get comprehensive user stats for achievement checking
     */
    async getUserStats(userId) {
      const gamificationData = await this.getUserGamificationData(userId);
      const levelInfo = calculateLevel(gamificationData.totalXP);
      
      return {
        userId,
        level: levelInfo.level,
        totalXP: gamificationData.totalXP,
        gems: gamificationData.gems,
        coins: gamificationData.coins,
        achievements: gamificationData.achievements.map(a => a.id),
        streak: gamificationData.streakData.currentStreak,
        longestStreak: gamificationData.streakData.longestStreak,
        chapters_completed: this.getChaptersCompleted(userId),
        quizzes_completed: this.getQuizzesCompleted(userId),
        experiments_completed: this.getExperimentsCompleted(userId),
        daily_goal_streak: this.getDailyGoalStreak(userId),
        study_hour: new Date().getHours(),
        // Add more stats as needed
      };
    }
  
    /**
     * Helper methods to get various user statistics
     */
    getChaptersCompleted(userId) {
      // Mock implementation - would fetch from progress service
      return Math.floor(Math.random() * 50);
    }
  
    getQuizzesCompleted(userId) {
      // Mock implementation - would fetch from progress service
      return Math.floor(Math.random() * 30);
    }
  
    getExperimentsCompleted(userId) {
      // Mock implementation - would fetch from progress service
      return Math.floor(Math.random() * 20);
    }
  
    getDailyGoalStreak(userId) {
      // Mock implementation - would calculate from daily goal history
      return Math.floor(Math.random() * 14);
    }
  
    /**
     * Load achievement definitions
     */
    loadAchievementDefinitions() {
      this.achievementCache.clear();
      
      Object.entries(ACHIEVEMENT_DEFINITIONS).forEach(([id, definition]) => {
        this.achievementCache.set(id, definition);
      });
      
      console.log(`Loaded ${this.achievementCache.size} achievement definitions`);
    }
  
    /**
     * Start periodic tasks
     */
    startPeriodicTasks() {
      // Daily reset tasks
      setInterval(() => {
        this.performDailyReset();
      }, 24 * 60 * 60 * 1000); // Every 24 hours
      
      // Cache cleanup
      setInterval(() => {
        this.cleanupCaches();
      }, 60 * 60 * 1000); // Every hour
    }
  
    /**
     * Perform daily reset tasks
     */
    async performDailyReset() {
      try {
        // Reset daily goals for all users
        // In real app, would process all users
        console.log('Performing daily reset tasks...');
        
        // Clean up expired data
        this.cleanupExpiredData();
        
      } catch (error) {
        console.error('Error in daily reset:', error);
      }
    }
  
    /**
     * Clean up caches and expired data
     */
    cleanupCaches() {
      this.leaderboardCache.clear();
      this.lastCacheUpdate = 0;
      console.log('Gamification caches cleaned up');
    }
  
    /**
     * Clean up expired data
     */
    cleanupExpiredData() {
      // Remove old learning history entries (keep last 365 days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 365);
      
      // Implementation would clean up old data
      console.log('Expired data cleaned up');
    }
  
    /**
     * Event system for gamification events
     */
    addEventListener(eventType, callback) {
      if (!this.eventListeners.has(eventType)) {
        this.eventListeners.set(eventType, []);
      }
      this.eventListeners.get(eventType).push(callback);
    }
  
    removeEventListener(eventType, callback) {
      if (this.eventListeners.has(eventType)) {
        const listeners = this.eventListeners.get(eventType);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  
    emitEvent(eventType, data) {
      if (this.eventListeners.has(eventType)) {
        this.eventListeners.get(eventType).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in event listener for ${eventType}:`, error);
          }
        });
      }
    }
  
    /**
     * Get gamification configuration
     */
    getConfig() {
      return GAMIFICATION_CONFIG;
    }
  
    /**
     * Get achievement definitions
     */
    getAchievementDefinitions() {
      return ACHIEVEMENT_DEFINITIONS;
    }
  
    /**
     * Get leaderboard configurations
     */
    getLeaderboardConfig() {
      return LEADERBOARD_CONFIG;
    }
  }
  
  // Create singleton instance
  const gamificationService = new GamificationService();
  
  // Export service and utility functions
  export default gamificationService;
  
  export const awardXP = (userId, amount, source, metadata) => 
    gamificationService.awardXP(userId, amount, source, metadata);
  
  export const awardGems = (userId, amount, source) => 
    gamificationService.awardGems(userId, amount, source);
  
  export const awardCoins = (userId, amount, source) => 
    gamificationService.awardCoins(userId, amount, source);
  
  export const checkAchievements = (userId, context) => 
    gamificationService.checkAchievements(userId, context);
  
  export const updateStreak = (userId, studiedToday) => 
    gamificationService.updateStreak(userId, studiedToday);
  
  export const getLeaderboard = (type, timeframe, limit) => 
    gamificationService.getLeaderboard(type, timeframe, limit);
  
  export const getUserGamificationData = (userId) => 
    gamificationService.getUserGamificationData(userId);
  
  export const addEventListener = (eventType, callback) => 
    gamificationService.addEventListener(eventType, callback);
  
  export const removeEventListener = (eventType, callback) => 
    gamificationService.removeEventListener(eventType, callback);