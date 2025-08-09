import React from 'react';
import { Star, Trophy, Award, Target } from 'lucide-react';

const UserStats = ({ user, progress = [], achievements = [] }) => {
  // Calculate stats from actual data
  const totalProgress = progress.length > 0
    ? progress.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / progress.length
    : 0;
  const completedChapters = progress.filter(p => p.isCompleted).length;
  const totalChapters = progress.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
            <Target className="w-3 h-3" />
            <span className="text-xl font-bold">{Math.round(totalProgress)}%</span>
          </div>
          <p className="text-lg text-gray-500">Progress</p>
        </div>
        <div>
          <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
            <Trophy className="w-3 h-3" />
            <span className="text-xl font-bold">{completedChapters}/{totalChapters}</span>
          </div>
          <p className="text-lg text-gray-500">Completed</p>
        </div>
        <div>
          <div className="flex items-center justify-center space-x-1 text-yellow-600 mb-1">
            <Star className="w-3 h-3" />
            <span className="text-xl font-bold">{user?.gems || 0}</span>
          </div>
          <p className="text-lg text-gray-500">Gems</p>
        </div>
        <div>
          <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
            <Award className="w-3 h-3" />
            <span className="text-xl font-bold">{unlockedAchievements}</span>
          </div>
          <p className="text-lg text-gray-500">Achievements</p>
        </div>
      </div>
    </div>
  );
};

export default UserStats;