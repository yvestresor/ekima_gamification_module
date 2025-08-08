// src/hooks/useGamification.js

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; // To get the current user/JWT
import { badgeAPI, userAPI } from '../services/api'; // You may need to create this
import {
  calculateLevel,
  calculateChapterXP,
  calculateQuizXP,
  calculateStreak,
  calculateGemsEarned,
  calculateCoinsEarned
} from '../utils/progressCalculator';

/**
 * Custom hook for managing gamification state and actions
 * Handles XP, levels, gems, coins, streaks, and achievements
 */
export const useGamification = () => {
  const { user } = useAuth();

  // State
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real gamification data on user load
  useEffect(() => {
    if (!user) return;
    const fetchGamification = async () => {
      setLoading(true);
      try {
        const res = await badgeAPI.getAll(); // Adjust to your API
        setGamificationData(res.data);
      } catch (err) {
        // Handle error (show message, etc.)
        setGamificationData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchGamification();
  }, [user]);

  // Calculate current level info
  const [levelInfo, setLevelInfo] = useState(() => calculateLevel(gamificationData && gamificationData.totalXP ? gamificationData.totalXP : 0));

  // Recalculate level when XP changes
  useEffect(() => {
    setLevelInfo(calculateLevel(gamificationData && gamificationData.totalXP ? gamificationData.totalXP : 0));
  }, [gamificationData && gamificationData.totalXP]);

  // Reset daily goals if it's a new day
  useEffect(() => {
    const today = new Date().toDateString();
    if (gamificationData && gamificationData.dailyGoals && gamificationData.dailyGoals.lastResetDate !== today) {
      setGamificationData(prev => ({
        ...prev,
        dailyGoals: {
          ...prev.dailyGoals,
          currentProgress: {
            chapters: 0,
            quizzes: 0,
            studyTime: 0
          },
          lastResetDate: today
        }
      }));
    }
  }, [gamificationData && gamificationData.dailyGoals && gamificationData.dailyGoals.lastResetDate, setGamificationData]);

  /**
   * Add XP and update related gamification metrics
   */
  const addXP = useCallback(async (amount, source = 'general') => {
    if (!gamificationData || typeof gamificationData.totalXP !== 'number') return;
    const previousLevel = calculateLevel(gamificationData.totalXP).level;
    const newTotalXP = gamificationData.totalXP + amount;
    const newLevel = calculateLevel(newTotalXP).level;
    
    // Check for level up
    const leveledUp = newLevel > previousLevel;
    
    // Calculate gems earned
    const gemsEarned = calculateGemsEarned(
      amount, 
      gamificationData.streakData.currentStreak,
      source === 'perfect_quiz'
    );

    setGamificationData(prev => ({
      ...prev,
      totalXP: newTotalXP,
      gems: prev.gems + gemsEarned
    }));

    // Sync to backend
    await userAPI.updateXP(newTotalXP);

    return {
      xpAdded: amount,
      gemsEarned,
      leveledUp,
      newLevel: leveledUp ? newLevel : null
    };
  }, [gamificationData]);

  /**
   * Complete a chapter and award XP/gems
   */
  const completeChapter = useCallback((chapterData, timeSpent, quizScore) => {
    if (!gamificationData || !gamificationData.streakData) return;
    const xpEarned = calculateChapterXP(
      chapterData, 
      timeSpent, 
      quizScore, 
      gamificationData.streakData.currentStreak
    );

    // Update daily progress
    setGamificationData(prev => ({
      ...prev,
      dailyGoals: {
        ...prev.dailyGoals,
        currentProgress: {
          ...prev.dailyGoals.currentProgress,
          chapters: prev.dailyGoals.currentProgress.chapters + 1,
          studyTime: prev.dailyGoals.currentProgress.studyTime + timeSpent
        }
      }
    }));

    // Update learning history for streak calculation
    updateLearningHistory();

    return addXP(xpEarned, quizScore === 100 ? 'perfect_quiz' : 'chapter');
  }, [gamificationData && gamificationData.streakData && gamificationData.streakData.currentStreak, setGamificationData, addXP]);

  /**
   * Complete a quiz and award XP/gems
   */
  const completeQuiz = useCallback((score, questionsCount, timeSpent, attempts) => {
    if (!gamificationData) return;
    const xpEarned = calculateQuizXP(score, questionsCount, timeSpent, attempts);
    
    // Update daily progress
    setGamificationData(prev => ({
      ...prev,
      dailyGoals: {
        ...prev.dailyGoals,
        currentProgress: {
          ...prev.dailyGoals.currentProgress,
          quizzes: prev.dailyGoals.currentProgress.quizzes + 1
        }
      }
    }));

    return addXP(xpEarned, score === 100 ? 'perfect_quiz' : 'quiz');
  }, [setGamificationData, addXP]);

  /**
   * Update learning history and recalculate streak
   */
  const updateLearningHistory = useCallback(() => {
    if (!gamificationData) return;
    const today = new Date().toDateString();
    
    setGamificationData(prev => {
      const newHistory = prev && prev.learningHistory ? [...prev.learningHistory] : [];
      
      // Add today if not already added
      if (!newHistory.includes(today)) {
        newHistory.push(today);
      }

      // Calculate new streak
      const newStreakData = calculateStreak(newHistory);

      return {
        ...prev,
        learningHistory: newHistory,
        streakData: newStreakData
      };
    });
  }, [setGamificationData]);

  /**
   * Spend gems on items/rewards
   */
  const spendGems = useCallback((amount, item) => {
    if (!gamificationData || typeof gamificationData.gems !== 'number' || gamificationData.gems < amount) {
      return { success: false, error: 'Insufficient gems' };
    }
    setGamificationData(prev => ({
      ...prev,
      gems: prev.gems - amount
    }));
    return { success: true, remainingGems: gamificationData.gems - amount };
  }, [gamificationData && gamificationData.gems, setGamificationData]);

  /**
   * Spend coins on items/rewards
   */
  const spendCoins = useCallback((amount, item) => {
    if (!gamificationData || typeof gamificationData.coins !== 'number' || gamificationData.coins < amount) {
      return { success: false, error: 'Insufficient coins' };
    }
    setGamificationData(prev => ({
      ...prev,
      coins: prev.coins - amount
    }));
    return { success: true, remainingCoins: gamificationData.coins - amount };
  }, [gamificationData && gamificationData.coins, setGamificationData]);

  /**
   * Unlock an achievement
   */
  const unlockAchievement = useCallback((achievementId, achievementData) => {
    if (!gamificationData || !Array.isArray(gamificationData.achievements)) return { success: false, error: 'No achievements data' };
    // Check if achievement already unlocked
    if (gamificationData.achievements.find(a => a.id === achievementId)) {
      return { success: false, error: 'Achievement already unlocked' };
    }

    const achievement = {
      id: achievementId,
      unlockedAt: new Date().toISOString(),
      ...achievementData
    };

    setGamificationData(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement],
      gems: prev.gems + (achievementData.gemsReward || 0),
      coins: prev.coins + (achievementData.coinsReward || 0)
    }));

    return { success: true, achievement };
  }, [gamificationData && gamificationData.achievements, setGamificationData]);

  /**
   * Check and unlock achievements based on current progress
   */
  const checkAchievements = useCallback(() => {
    if (!gamificationData || !Array.isArray(gamificationData.achievements) || !gamificationData.streakData || !gamificationData.dailyGoals) return [];
    const unlockedAchievements = [];

    // Level-based achievements
    if (levelInfo.level >= 5 && !gamificationData.achievements.find(a => a.id === 'level_5')) {
      const result = unlockAchievement('level_5', {
        name: 'Rising Scholar',
        description: 'Reach Level 5',
        category: 'progression',
        gemsReward: 50,
        coinsReward: 100
      });
      if (result.success) unlockedAchievements.push(result.achievement);
    }

    if (levelInfo.level >= 10 && !gamificationData.achievements.find(a => a.id === 'level_10')) {
      const result = unlockAchievement('level_10', {
        name: 'Dedicated Learner',
        description: 'Reach Level 10',
        category: 'progression',
        gemsReward: 100,
        coinsReward: 200
      });
      if (result.success) unlockedAchievements.push(result.achievement);
    }

    // Streak-based achievements
    if (gamificationData.streakData.currentStreak >= 7 && !gamificationData.achievements.find(a => a.id === 'week_streak')) {
      const result = unlockAchievement('week_streak', {
        name: 'Week Warrior',
        description: 'Study for 7 days in a row',
        category: 'streak',
        gemsReward: 75,
        coinsReward: 150
      });
      if (result.success) unlockedAchievements.push(result.achievement);
    }

    if (gamificationData.streakData.currentStreak >= 30 && !gamificationData.achievements.find(a => a.id === 'month_streak')) {
      const result = unlockAchievement('month_streak', {
        name: 'Monthly Master',
        description: 'Study for 30 days in a row',
        category: 'streak',
        gemsReward: 200,
        coinsReward: 500
      });
      if (result.success) unlockedAchievements.push(result.achievement);
    }

    // Daily goal achievements
    const { chapters, quizzes, studyTime } = gamificationData.dailyGoals.currentProgress;
    const { chaptersTarget, quizzesTarget, studyTimeTarget } = gamificationData.dailyGoals;

    if (chapters >= chaptersTarget && quizzes >= quizzesTarget && studyTime >= studyTimeTarget) {
      const today = new Date().toDateString();
      if (!gamificationData.achievements.find(a => a.id === `daily_goal_${today}`)) {
        const result = unlockAchievement(`daily_goal_${today}`, {
          name: 'Daily Champion',
          description: 'Complete all daily goals',
          category: 'daily',
          gemsReward: 25,
          coinsReward: 50
        });
        if (result.success) unlockedAchievements.push(result.achievement);
      }
    }

    return unlockedAchievements;
  }, [levelInfo.level, gamificationData && gamificationData.achievements, gamificationData && gamificationData.streakData && gamificationData.streakData.currentStreak, gamificationData && gamificationData.dailyGoals, unlockAchievement]);

  /**
   * Get daily coins bonus
   */
  const claimDailyBonus = useCallback(() => {
    if (!gamificationData || !gamificationData.streakData) return { success: false, error: 'No streak data' };
    const today = new Date().toDateString();
    const lastBonusDate = gamificationData.lastDailyBonus;

    if (lastBonusDate !== today) {
      const bonusAmount = 100 + (gamificationData.streakData.currentStreak * 10);
      
      setGamificationData(prev => ({
        ...prev,
        coins: prev.coins + bonusAmount,
        lastDailyBonus: today
      }));

      return { success: true, amount: bonusAmount };
    }

    return { success: false, error: 'Daily bonus already claimed' };
  }, [gamificationData && gamificationData.lastDailyBonus, gamificationData && gamificationData.streakData && gamificationData.streakData.currentStreak, setGamificationData]);

  /**
   * Update daily goals targets
   */
  const updateDailyGoals = useCallback((newTargets) => {
    if (!gamificationData || !gamificationData.dailyGoals) return;
    setGamificationData(prev => ({
      ...prev,
      dailyGoals: {
        ...prev.dailyGoals,
        ...newTargets
      }
    }));
  }, [setGamificationData]);

  /**
   * Get progress towards daily goals as percentages
   */
  const getDailyGoalProgress = useCallback(() => {
    if (!gamificationData || !gamificationData.dailyGoals || !gamificationData.dailyGoals.currentProgress) return { chapters: 0, quizzes: 0, studyTime: 0, overall: 0 };
    const { chapters, quizzes, studyTime } = gamificationData.dailyGoals.currentProgress;
    const { chaptersTarget, quizzesTarget, studyTimeTarget } = gamificationData.dailyGoals;

    return {
      chapters: Math.min((chapters / chaptersTarget) * 100, 100),
      quizzes: Math.min((quizzes / quizzesTarget) * 100, 100),
      studyTime: Math.min((studyTime / studyTimeTarget) * 100, 100),
      overall: Math.min(((chapters / chaptersTarget + quizzes / quizzesTarget + studyTime / studyTimeTarget) / 3) * 100, 100)
    };
  }, [gamificationData && gamificationData.dailyGoals]);

  // Auto-check achievements when relevant data changes
  useEffect(() => {
    checkAchievements();
  }, [levelInfo.level, gamificationData && gamificationData.streakData && gamificationData.streakData.currentStreak]);

  // Loading state
  if (loading || !gamificationData) {
    return {
      loading: true,
      totalXP: 0,
      gems: 0,
      coins: 0,
      levelInfo: { level: 1, currentLevelXP: 0, xpToNextLevel: 1000, progressToNextLevel: 0, totalXP: 0 },
      achievements: [],
      streakData: { currentStreak: 0, longestStreak: 0, lastStudyDate: null },
      dailyGoals: { currentProgress: { chapters: 0, quizzes: 0, studyTime: 0 }, chaptersTarget: 1, quizzesTarget: 1, studyTimeTarget: 10, lastResetDate: null },
      // ...other actions as no-ops
    };
  }

  return {
    loading: false,
    totalXP: gamificationData.totalXP ?? 0,
    gems: gamificationData.gems ?? 0,
    coins: gamificationData.coins ?? 0,
    levelInfo: levelInfo ?? { level: 1, currentLevelXP: 0, xpToNextLevel: 1000, progressToNextLevel: 0, totalXP: 0 },
    achievements: gamificationData.achievements ?? [],
    streakData: gamificationData.streakData ?? { currentStreak: 0, longestStreak: 0, lastStudyDate: null },
    dailyGoals: gamificationData.dailyGoals ?? { currentProgress: { chapters: 0, quizzes: 0, studyTime: 0 }, chaptersTarget: 1, quizzesTarget: 1, studyTimeTarget: 10, lastResetDate: null },
    // ...other actions
    addXP,
    // etc.
  };
};

export default useGamification;