import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Crown, Zap, Star, Users } from 'lucide-react';

const Leaderboard = ({ 
  users = [], 
  currentUserId = null,
  type = 'xp', // xp, gems, streak, completion
  timeframe = 'week', // day, week, month, all
  showCurrentUser = true,
  maxDisplay = 10,
  compact = false 
}) => {
  const [sortedUsers, setSortedUsers] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  // Mock leaderboard data for demonstration
  const mockUsers = users.length === 0 ? [
    {
      _id: "user1",
      name: "Amelia Johnson",
      username: "amelia_j",
      avatar: "👩‍🎓",
      xp: 2850,
      gems: 450,
      streak: 15,
      completion: 85,
      school: "Dar es Salaam High School",
      level: 8
    },
    {
      _id: "user2", 
      name: "David Mwalimu",
      username: "david_m",
      avatar: "👨‍🎓",
      xp: 2720,
      gems: 420,
      streak: 12,
      completion: 78,
      school: "Dodoma Secondary",
      level: 7
    },
    {
      _id: "665f1fab9c934afcd203a2aa", // Current user
      name: "Yves-tresor Nsabimana",
      username: "yves_tresor",
      avatar: "👤",
      xp: 1250,
      gems: 150,
      streak: 7,
      completion: 68,
      school: "Riviera High School",
      level: 5
    },
    {
      _id: "user4",
      name: "Sarah Kilimanjaro",
      username: "sarah_k",
      avatar: "👩‍💻",
      xp: 1180,
      gems: 140,
      streak: 9,
      completion: 62,
      school: "Arusha International",
      level: 4
    },
    {
      _id: "user5",
      name: "John Serengeti",
      username: "john_s",
      avatar: "👨‍🔬",
      xp: 980,
      gems: 120,
      streak: 5,
      completion: 55,
      school: "Mwanza Science School",
      level: 3
    }
  ] : users;

  useEffect(() => {
    // Sort users based on selected type
    const sorted = [...mockUsers].sort((a, b) => {
      switch (type) {
        case 'gems':
          return b.gems - a.gems;
        case 'streak':
          return b.streak - a.streak;
        case 'completion':
          return b.completion - a.completion;
        default: // xp
          return b.xp - a.xp;
      }
    });

    setSortedUsers(sorted);

    // Find current user rank
    if (currentUserId && showCurrentUser) {
      const rank = sorted.findIndex(user => user._id === currentUserId) + 1;
      setCurrentUserRank(rank > 0 ? rank : null);
    }
  }, [mockUsers, type, currentUserId, showCurrentUser]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'gems':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'streak':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'completion':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'gems':
        return 'Gems';
      case 'streak':
        return 'Streak';
      case 'completion':
        return 'Completion';
      default:
        return 'XP';
    }
  };

  const getValueDisplay = (user) => {
    switch (type) {
      case 'gems':
        return `${user.gems} gems`;
      case 'streak':
        return `${user.streak} days`;
      case 'completion':
        return `${user.completion}%`;
      default:
        return `${user.xp} XP`;
    }
  };

  const displayUsers = sortedUsers.slice(0, maxDisplay);

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-gray-900">Top Learners</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            {getTypeIcon()}
            <span>{getTypeLabel()}</span>
          </div>
        </div>

        <div className="space-y-2">
          {displayUsers.slice(0, 3).map((user, index) => (
            <div key={user._id} className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(index + 1)}`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                {getValueDisplay(user)}
              </div>
            </div>
          ))}
        </div>

        {currentUserRank && currentUserRank > 3 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-3 bg-orange-50 p-2 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                {currentUserRank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">You</p>
              </div>
              <div className="text-sm text-gray-600">
                {getValueDisplay(sortedUsers.find(u => u._id === currentUserId))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
              <p className="text-sm text-gray-600">
                Top learners this {timeframe} by {getTypeLabel().toLowerCase()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getTypeIcon()}
            <span className="text-sm font-medium text-gray-700">{getTypeLabel()}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-6">
        <div className="space-y-3">
          {displayUsers.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user._id === currentUserId;
            
            return (
              <div 
                key={user._id}
                className={`
                  flex items-center space-x-4 p-4 rounded-lg transition-all duration-200
                  ${isCurrentUser 
                    ? 'bg-orange-50 border-2 border-orange-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                  }
                  ${rank <= 3 ? 'shadow-sm' : ''}
                `}
              >
                {/* Rank */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  ${getRankBadgeColor(rank)}
                `}>
                  {rank <= 3 ? getRankIcon(rank) : rank}
                </div>

                {/* User Avatar */}
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                  {user.avatar || '👤'}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-orange-600 text-sm">(You)</span>
                      )}
                    </h3>
                    {rank <= 3 && (
                      <div className="flex">
                        {getRankIcon(rank)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {user.school} • Level {user.level}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    {getValueDisplay(user).split(' ')[0]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getValueDisplay(user).split(' ')[1] || ''}
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className="w-6 flex justify-center">
                  {rank <= 3 && (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current User Position (if not in top list) */}
        {showCurrentUser && currentUserRank && currentUserRank > maxDisplay && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500 mb-3">
              <Users className="w-4 h-4 inline mr-1" />
              Your position
            </div>
            
            {(() => {
              const currentUser = sortedUsers.find(u => u._id === currentUserId);
              return currentUser ? (
                <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    #{currentUserRank}
                  </div>
                  
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                    {currentUser.avatar || '👤'}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {currentUser.name} (You)
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentUser.school} • Level {currentUser.level}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {getValueDisplay(currentUser).split(' ')[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getValueDisplay(currentUser).split(' ')[1] || ''}
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Rankings update every hour • Keep learning to climb higher!
          </p>
        </div>
      </div>
    </div>
  );
};

// Simple leaderboard for smaller spaces
export const MiniLeaderboard = ({ users = [], type = 'xp' }) => {
  const topUsers = users.sort((a, b) => b[type] - a[type]).slice(0, 3);

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <span>Top 3</span>
      </h3>
      
      <div className="space-y-2">
        {topUsers.map((user, index) => (
          <div key={user._id} className="flex items-center space-x-2">
            <div className={`
              w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
              ${index === 0 ? 'bg-yellow-500 text-white' : 
                index === 1 ? 'bg-gray-400 text-white' : 
                'bg-orange-500 text-white'}
            `}>
              {index + 1}
            </div>
            <span className="text-sm font-medium text-gray-900 flex-1 truncate">
              {user.name}
            </span>
            <span className="text-xs text-gray-600">
              {user[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;