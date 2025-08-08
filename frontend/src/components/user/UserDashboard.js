// src/components/user/UserDashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  BookOpen, 
  Clock, 
  Target, 
  Award,
  TrendingUp,
  Calendar,
  Flame,
  Star,
  ChevronRight,
  BarChart3,
  Trophy,
  Zap,
  CheckCircle,
  Play,
  Edit3,
  Settings,
  Camera
} from 'lucide-react';

// Import contexts and hooks
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { useGamification } from '../../hooks/useGamification';

// Import components
import XPBar from '../gamification/XPBar';
import StreakTracker from '../gamification/StreakTracker';
import BadgeDisplay from '../gamification/BadgeDisplay';
import ProgressTracker from '../learning/ProgressTracker';

// Import utilities
import { formatDate, formatDuration, getStudyStats } from '../../utils/dateUtils';
import { calculatePerformanceMetrics } from '../../utils/progressCalculator';

const UserDashboard = ({ variant = 'full' }) => {
  const navigate = useNavigate();
  
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('thisWeek');
  const [showAchievements, setShowAchievements] = useState(false);

  // Contexts and hooks
  const { user, updateUserProfile } = useAuth();
  const { userProgress } = useProgress();
  const { 
    totalXP, 
    gems, 
    coins, 
    levelInfo, 
    achievements, 
    streakData, 
    dailyGoals,
    getDailyGoalProgress,
    claimDailyBonus
  } = useGamification();

  // Calculate performance metrics
  const performanceMetrics = calculatePerformanceMetrics(userProgress);

  // Get study statistics
  const studyStats = getStudyStats(
    userProgress?.learningHistory || [],
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    new Date()
  );

  // Daily goal progress
  const dailyProgress = getDailyGoalProgress();

  // Recent achievements (last 3)
  const recentAchievements = achievements
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, 3);

  // Time filter options
  const timeFilters = [
    { id: 'today', label: 'Today' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'thisMonth', label: 'This Month' }
  ];

  // Handle daily bonus claim
  const handleClaimBonus = async () => {
    try {
      const result = await claimDailyBonus();
      if (result.success) {
        alert(`🎉 Daily bonus claimed! +${result.amount} coins`);
      }
    } catch (err) {
      console.error('Error claiming bonus:', err);
    }
  };

  // Compact version for smaller spaces
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">{user?.name || 'User'}</h3>
              <p className="text-sm text-gray-600">Level {levelInfo.level}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="text-gray-400 hover:text-gray-600"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{totalXP}</div>
            <div className="text-xs text-gray-600">Total XP</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{gems}</div>
            <div className="text-xs text-gray-600">Gems</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">{streakData.currentStreak}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
        </div>

        <div className="mt-4">
          <XPBar 
            currentXP={levelInfo.currentLevelXP}
            requiredXP={1000}
            level={levelInfo.level}
            size="sm"
          />
        </div>
      </div>
    );
  }

  // Full dashboard version
  return (
    <div className="space-y-6">
      {/* ================= Profile Header ================= */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Camera size={12} />
              </button>
            </div>

            {/* User Info */}
            <div className="ml-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{user?.name || 'Welcome!'}</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Edit3 size={16} />
                </button>
              </div>
              <p className="text-blue-100 mb-2">{user?.email}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Trophy size={14} className="mr-1" />
                  Level {levelInfo.level}
                </span>
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Joined {formatDate(user?.joinedAt || new Date('2025-07-02'), 'medium')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalXP}</div>
                <div className="text-blue-100 text-sm">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{achievements.length}</div>
                <div className="text-blue-100 text-sm">Achievements</div>
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4">
          <XPBar 
            currentXP={levelInfo.currentLevelXP}
            requiredXP={1000}
            level={levelInfo.level}
            nextLevel={levelInfo.level + 1}
            showDetails={true}
          />
        </div>
      </div>

      {/* ================= Stats Grid ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gems */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Gems</p>
              <p className="text-2xl font-bold text-purple-600">{gems}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
              Spend Gems →
            </button>
          </div>
        </div>

        {/* Coins */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Coins</p>
              <p className="text-2xl font-bold text-yellow-600">{coins}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap size={24} className="text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={handleClaimBonus}
              className="text-yellow-600 text-sm font-medium hover:text-yellow-700"
            >
              Daily Bonus →
            </button>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current Streak</p>
              <p className="text-2xl font-bold text-orange-600">{streakData.currentStreak}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-sm">
              Best: {streakData.longestStreak} days
            </p>
          </div>
        </div>

        {/* Study Time */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Study Time</p>
              <p className="text-2xl font-bold text-green-600">
                {formatDuration(performanceMetrics.averageTimePerChapter * studyStats.studyDays, true)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-sm">This week</p>
          </div>
        </div>
      </div>

      {/* ================= Main Content Grid ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* -------- Left Column: Daily Goals & Streak -------- */}
        <div className="space-y-6">
          {/* Daily Goals */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target size={20} className="mr-2 text-blue-500" />
              Daily Goals
            </h3>
            
            <div className="space-y-4">
              {/* Chapters Goal */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Chapters</span>
                  <span className="font-medium">
                    {dailyGoals.currentProgress.chapters}/{dailyGoals.chaptersTarget}
                  </span>
                </div>
                <ProgressTracker 
                  progress={dailyProgress.chapters}
                  color="blue"
                  size="sm"
                />
              </div>

              {/* Quizzes Goal */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Quizzes</span>
                  <span className="font-medium">
                    {dailyGoals.currentProgress.quizzes}/{dailyGoals.quizzesTarget}
                  </span>
                </div>
                <ProgressTracker 
                  progress={dailyProgress.quizzes}
                  color="green"
                  size="sm"
                />
              </div>

              {/* Study Time Goal */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Study Time</span>
                  <span className="font-medium">
                    {formatDuration(dailyGoals.currentProgress.studyTime, true)}/
                    {formatDuration(dailyGoals.studyTimeTarget, true)}
                  </span>
                </div>
                <ProgressTracker 
                  progress={dailyProgress.studyTime}
                  color="purple"
                  size="sm"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {Math.round(dailyProgress.overall)}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
            </div>
          </div>

          {/* Streak Tracker */}
          {/* <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Flame size={20} className="mr-2 text-orange-500" />
              Study Streak
            </h3>
            <StreakTracker 
              streak={streakData.currentStreak}
              longestStreak={streakData.longestStreak}
              lastStudyDate={streakData.lastStudyDate}
            />
          </div> */}
        </div>

        {/* -------- Center Column: Performance & Progress -------- */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 size={20} className="mr-2 text-green-500" />
                Performance
              </h3>
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1"
              >
                {timeFilters.map(filter => (
                  <option key={filter.id} value={filter.id}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Score</span>
                <span className="font-semibold text-blue-600">
                  {performanceMetrics.averageQuizScore.toFixed(0)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">
                  {performanceMetrics.completionRate.toFixed(0)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Learning Velocity</span>
                <span className="font-semibold text-purple-600">
                  {performanceMetrics.learningVelocity.toFixed(1)} chapters/week
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Study Days</span>
                <span className="font-semibold text-orange-600">
                  {studyStats.studyDays}/{studyStats.totalDays} days
                </span>
              </div>
            </div>
          </div>

          {/* Subject Strengths */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
            
            {performanceMetrics.strongSubjects.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-green-700 mb-2">Strong Areas</h4>
                <div className="space-y-2">
                  {performanceMetrics.strongSubjects.map((subject, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 capitalize">
                        {subject.subject.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {subject.averageScore.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {performanceMetrics.weakSubjects.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-orange-700 mb-2">Needs Improvement</h4>
                <div className="space-y-2">
                  {performanceMetrics.weakSubjects.map((subject, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 capitalize">
                        {subject.subject.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-medium text-orange-600">
                        {subject.averageScore.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------- Right Column: Achievements & Actions -------- */}
        <div className="space-y-6">
          {/* Recent Achievements */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award size={20} className="mr-2 text-yellow-500" />
                Achievements
              </h3>
              <button
                onClick={() => setShowAchievements(!showAchievements)}
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All
              </button>
            </div>

            {recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <BadgeDisplay
                    key={achievement.id}
                    achievement={achievement}
                    size="sm"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Award size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No achievements yet</p>
                <p className="text-gray-400 text-xs">Keep learning to unlock badges!</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/subjects')}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <BookOpen size={16} className="text-blue-600 mr-3" />
                  <span className="text-blue-900 font-medium">Continue Learning</span>
                </div>
                <ChevronRight size={16} className="text-blue-600" />
              </button>

              <button
                onClick={() => navigate('/progress')}
                className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <BarChart3 size={16} className="text-green-600 mr-3" />
                  <span className="text-green-900 font-medium">View Progress</span>
                </div>
                <ChevronRight size={16} className="text-green-600" />
              </button>

              <button
                onClick={() => navigate('/experiments')}
                className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Play size={16} className="text-purple-600 mr-3" />
                  <span className="text-purple-900 font-medium">Try Experiments</span>
                </div>
                <ChevronRight size={16} className="text-purple-600" />
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Settings size={16} className="text-gray-600 mr-3" />
                  <span className="text-gray-900 font-medium">Settings</span>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;