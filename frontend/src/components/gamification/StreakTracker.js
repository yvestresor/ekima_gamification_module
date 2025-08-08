import React, { useState, useEffect } from 'react';
import { Zap, Flame, Calendar, Trophy, Target, Gift } from 'lucide-react';

const StreakTracker = ({ 
  streak = 0, 
  compact = false, 
  showGoals = true,
  showRewards = true,
  animated = true 
}) => {
  const [isFlaming, setIsFlaming] = useState(false);

  useEffect(() => {
    if (animated && streak > 0) {
      setIsFlaming(true);
      const timer = setTimeout(() => setIsFlaming(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [streak, animated]);

  // Streak milestones and rewards
  const milestones = [
    { days: 3, reward: { gems: 10, xp: 25 }, title: '3-Day Starter' },
    { days: 7, reward: { gems: 25, xp: 50 }, title: 'Week Warrior' },
    { days: 14, reward: { gems: 50, xp: 100 }, title: 'Two-Week Champion' },
    { days: 30, reward: { gems: 100, xp: 200 }, title: 'Monthly Master' },
    { days: 60, reward: { gems: 200, xp: 400 }, title: 'Learning Legend' },
    { days: 100, reward: { gems: 500, xp: 1000 }, title: 'Streak Superhero' }
  ];

  const getNextMilestone = () => {
    return milestones.find(m => m.days > streak);
  };

  const getCurrentMilestone = () => {
    return milestones.filter(m => m.days <= streak).slice(-1)[0];
  };

  const getStreakLevel = () => {
    if (streak >= 100) return { level: 'legendary', color: 'from-purple-500 to-pink-500', emoji: '🏆' };
    if (streak >= 60) return { level: 'epic', color: 'from-orange-500 to-red-500', emoji: '🔥' };
    if (streak >= 30) return { level: 'amazing', color: 'from-yellow-500 to-orange-500', emoji: '⚡' };
    if (streak >= 14) return { level: 'great', color: 'from-green-500 to-blue-500', emoji: '💪' };
    if (streak >= 7) return { level: 'good', color: 'from-blue-500 to-purple-500', emoji: '👍' };
    if (streak >= 3) return { level: 'growing', color: 'from-gray-400 to-gray-600', emoji: '🌱' };
    return { level: 'starting', color: 'from-gray-300 to-gray-400', emoji: '🚀' };
  };

  const getDaysOfWeek = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const mondayIndex = today === 0 ? 6 : today - 1; // Convert Sunday (0) to 6, others subtract 1
    
    return days.map((day, index) => {
      const isToday = index === mondayIndex;
      const daysPast = mondayIndex - index;
      const isActive = streak > daysPast && daysPast >= 0;
      
      return {
        day,
        isToday,
        isActive,
        dayIndex: index
      };
    });
  };

  const streakLevel = getStreakLevel();
  const nextMilestone = getNextMilestone();
  const currentMilestone = getCurrentMilestone();
  const weekDays = getDaysOfWeek();

  if (compact) {
    return (
      <div className={`
        flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300
        bg-gradient-to-r ${streakLevel.color} text-white
        ${isFlaming ? 'animate-pulse scale-110' : ''}
      `}>
        <Zap className={`w-4 h-4 ${isFlaming ? 'animate-bounce' : ''}`} />
        <span className="font-bold text-sm">{streak} Days</span>
        <span className="text-sm opacity-90">{streakLevel.emoji}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
            bg-gradient-to-br ${streakLevel.color} shadow-lg
            ${isFlaming ? 'animate-pulse' : ''}
          `}>
            <Zap className={`w-6 h-6 ${isFlaming ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {streak} Day Streak {streakLevel.emoji}
            </h3>
            <p className="text-sm text-gray-600 capitalize">
              {streakLevel.level} learner
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl mb-1">
            {streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '🌟'}
          </div>
          {currentMilestone && (
            <p className="text-xs text-gray-500">
              {currentMilestone.title}
            </p>
          )}
        </div>
      </div>

      {/* Week Progress */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">This Week</h4>
        <div className="flex justify-between space-x-2">
          {weekDays.map((dayData) => (
            <div key={dayData.day} className="flex-1 text-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mx-auto mb-1 transition-all duration-300
                ${dayData.isActive 
                  ? `bg-gradient-to-br ${streakLevel.color} text-white shadow-md` 
                  : dayData.isToday 
                    ? 'bg-gray-200 text-gray-700 ring-2 ring-orange-300' 
                    : 'bg-gray-100 text-gray-400'
                }
                ${dayData.isActive && isFlaming ? 'animate-pulse' : ''}
              `}>
                {dayData.isActive ? '✓' : dayData.day.charAt(0)}
              </div>
              <span className={`text-xs ${dayData.isToday ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                {dayData.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestone */}
      {showGoals && nextMilestone && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Next Goal</h4>
            <span className="text-sm text-gray-500">
              {nextMilestone.days - streak} days to go
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r ${streakLevel.color}`}
              style={{ 
                width: `${Math.min((streak / nextMilestone.days) * 100, 100)}%` 
              }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {nextMilestone.title}
            </span>
            {showRewards && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Trophy className="w-4 h-4" />
                  <span>{nextMilestone.reward.gems} gems</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <Zap className="w-4 h-4" />
                  <span>{nextMilestone.reward.xp} XP</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Achievements */}
      {currentMilestone && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800">
                {currentMilestone.title} Achieved!
              </h4>
              <p className="text-sm text-yellow-700">
                You earned {currentMilestone.reward.gems} gems and {currentMilestone.reward.xp} XP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Streak Tips */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-3">💡 Keep Your Streak Alive</h4>
        <div className="space-y-2 text-sm text-gray-600">
          {streak === 0 && (
            <p>• Start learning today to begin your streak!</p>
          )}
          {streak > 0 && streak < 3 && (
            <p>• Study for at least 10 minutes daily to maintain your streak</p>
          )}
          {streak >= 3 && streak < 7 && (
            <p>• You're doing great! Try to study at the same time each day</p>
          )}
          {streak >= 7 && (
            <p>• Amazing dedication! Set reminders to never miss a day</p>
          )}
          <p>• Even 5 minutes of learning counts towards your streak</p>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 text-center">
        {streak === 0 && (
          <p className="text-sm text-gray-500 italic">
            "A journey of a thousand miles begins with a single step" 🚀
          </p>
        )}
        {streak > 0 && streak < 7 && (
          <p className="text-sm text-gray-500 italic">
            "Consistency is the key to mastery" 💪
          </p>
        )}
        {streak >= 7 && streak < 30 && (
          <p className="text-sm text-gray-500 italic">
            "Excellence is not an act, but a habit" ⭐
          </p>
        )}
        {streak >= 30 && (
          <p className="text-sm text-gray-500 italic">
            "You are unstoppable! Keep going!" 🏆
          </p>
        )}
      </div>
    </div>
  );
};

export default StreakTracker;