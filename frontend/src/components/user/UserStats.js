import React from 'react';
import { Star, Coins, Trophy, Zap, Clock, TrendingUp, Award, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserStats = ({ user, compact = false }) => {
  const { getUserLevelInfo } = useAuth();
  
  const levelInfo = getUserLevelInfo();
  const totalTimeHours = Math.round((user?.timeSpent || 0) / 3600000);

  const StatCard = ({ icon: Icon, label, value, color, trend = null, subtitle = null }) => (
    <div className={`bg-white rounded-lg p-4 border ${compact ? 'text-center' : ''}`}>
      <div className={`flex items-center ${compact ? 'justify-center space-x-2' : 'space-x-3'}`}>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {!compact && (
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">{trend}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {compact && (
        <div className="mt-2">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      )}
    </div>
  );

  const XPProgressBar = () => {
    if (!levelInfo) return null;

    return (
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Level Progress</span>
          <span className="text-sm text-gray-500">
            Level {levelInfo.currentLevel}
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500 relative"
              style={{ width: `${levelInfo.progressToNextLevel}%` }}
            >
              <div className="absolute inset-0 bg-white bg-opacity-30 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{levelInfo.currentXP} XP</span>
            <span>{levelInfo.xpForNextLevel} XP</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mt-2">
          {levelInfo.xpNeededForNext} XP to next level
        </p>
      </div>
    );
  };

  const StreakDisplay = () => (
    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg p-4 border border-orange-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-orange-500" />
          <div>
            <p className="text-lg font-bold text-orange-800">{user?.streak || 0} Days</p>
            <p className="text-sm text-orange-600">Learning Streak</p>
          </div>
        </div>
        <div className="text-2xl">🔥</div>
      </div>
      
      <div className="mt-3">
        <div className="flex space-x-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                i < (user?.streak || 0) % 7 
                  ? 'bg-orange-500' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-orange-600 mt-1">This week</p>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{user?.name}</h3>
              <p className="text-gray-600 text-sm">Student • {user?.level}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Star}
              label="Gems"
              value={user?.gems || 0}
              color="bg-yellow-100 text-yellow-600"
              compact={true}
            />
            <StatCard
              icon={Coins}
              label="Coins"
              value={user?.coins || 0}
              color="bg-amber-100 text-amber-600"
              compact={true}
            />
          </div>
        </div>
        
        <XPProgressBar />
        <StreakDisplay />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.type?.charAt(0).toUpperCase() + user?.type?.slice(1)} • {user?.level}</p>
            <p className="text-sm text-gray-500">{user?.region}, {user?.district}</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-yellow-600 mb-1">
              <Star className="w-4 h-4" />
              <span className="font-bold">{user?.gems || 0}</span>
            </div>
            <p className="text-xs text-gray-500">Gems</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-amber-600 mb-1">
              <Coins className="w-4 h-4" />
              <span className="font-bold">{user?.coins || 0}</span>
            </div>
            <p className="text-xs text-gray-500">Coins</p>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <XPProgressBar />

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={Clock}
          label="Study Time"
          value={`${totalTimeHours}h`}
          color="bg-blue-100 text-blue-600"
          subtitle="Total time learning"
          trend="+2h this week"
        />
        
        <StatCard
          icon={Trophy}
          label="Level"
          value={levelInfo?.currentLevel || 1}
          color="bg-purple-100 text-purple-600"
          subtitle={`${levelInfo?.currentXP || 0} XP`}
        />
        
        <StatCard
          icon={Target}
          label="Completion"
          value="68%"
          color="bg-green-100 text-green-600"
          subtitle="Overall progress"
          trend="+5% this week"
        />
        
        <StatCard
          icon={Award}
          label="Achievements"
          value="8"
          color="bg-orange-100 text-orange-600"
          subtitle="Badges earned"
        />
      </div>

      {/* Streak Display */}
      <StreakDisplay />

      {/* Learning Insights */}
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold text-gray-900 mb-3">Learning Insights</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Favorite Subject</span>
            <span className="text-sm font-medium text-gray-900">Mathematics</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Best Time to Learn</span>
            <span className="text-sm font-medium text-gray-900">Evening</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Average Session</span>
            <span className="text-sm font-medium text-gray-900">45 minutes</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Learning Style</span>
            <span className="text-sm font-medium text-gray-900">Visual</span>
          </div>
        </div>
      </div>

      {/* Device Info */}
      {user?.deviceType && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-medium text-gray-900 mb-2">Device Information</h4>
          <div className="text-sm text-gray-600">
            <p>Device Type: {user.deviceType}</p>
            <p>Last Login: {new Date(user.loginAt).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStats;