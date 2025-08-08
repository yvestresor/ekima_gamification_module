import React, { useState } from 'react';
import { Trophy, Star, Zap, Target, Award, Lock, CheckCircle } from 'lucide-react';

const BadgeDisplay = ({ 
  badges = [], 
  layout = 'grid', 
  showProgress = false,
  showDetails = true,
  maxDisplay = null,
  onBadgeClick = null
}) => {
  const [selectedBadge, setSelectedBadge] = useState(null);

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'completion': return Trophy;
      case 'streak': return Zap;
      case 'performance': return Star;
      case 'activity': return Target;
      default: return Award;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getBadgeProgress = (badge, userStats) => {
    if (!showProgress || !badge.requirement) return 100;
    
    // This would be calculated based on user stats and badge conditions
    // For now, returning mock progress
    if (badge.unlocked) return 100;
    
    // Mock progress calculation
    const mockProgress = Math.min((userStats?.chaptersCompleted || 0) / badge.requirement * 100, 100);
    return mockProgress;
  };

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;

  const BadgeItem = ({ badge, index }) => {
    const IconComponent = getBadgeIcon(badge.type);
    const rarityGradient = getRarityColor(badge.rarity);
    const progress = getBadgeProgress(badge);
    const isUnlocked = badge.unlocked;

    return (
      <div 
        className={`
          relative group cursor-pointer transition-all duration-300 transform hover:scale-105
          ${layout === 'list' ? 'flex items-center space-x-4 p-3 rounded-lg border' : ''}
        `}
        onClick={() => {
          setSelectedBadge(badge);
          onBadgeClick?.(badge);
        }}
      >
        {/* Badge Icon */}
        <div className={`
          relative flex items-center justify-center rounded-full shadow-lg
          ${layout === 'grid' ? 'w-16 h-16 mx-auto mb-2' : 'w-12 h-12 flex-shrink-0'}
          ${isUnlocked 
            ? `bg-gradient-to-br ${rarityGradient}` 
            : 'bg-gray-300'
          }
        `}>
          {isUnlocked ? (
            <span className="text-2xl">{badge.icon}</span>
          ) : (
            <Lock className="w-6 h-6 text-gray-500" />
          )}
          
          {/* Unlock Indicator */}
          {isUnlocked && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
          
          {/* Rarity Sparkle */}
          {isUnlocked && badge.rarity === 'legendary' && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-20 animate-pulse" />
          )}
        </div>

        {/* Badge Info */}
        <div className={`${layout === 'grid' ? 'text-center' : 'flex-1'}`}>
          <h3 className={`
            font-semibold mb-1
            ${layout === 'grid' ? 'text-sm' : 'text-base'}
            ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}
          `}>
            {badge.name}
          </h3>
          
          {showDetails && (
            <p className={`
              text-xs mb-2
              ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}
              ${layout === 'grid' ? 'line-clamp-2' : 'line-clamp-1'}
            `}>
              {badge.description}
            </p>
          )}

          {/* Rewards */}
          {showDetails && (
            <div className={`flex items-center space-x-2 ${layout === 'grid' ? 'justify-center' : ''}`}>
              {badge.xp_reward && (
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">
                    {badge.xp_reward} XP
                  </span>
                </div>
              )}
              
              {badge.gems_reward && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-medium text-yellow-600">
                    {badge.gems_reward} Gems
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && !isUnlocked && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(progress)}% complete
              </div>
            </div>
          )}
        </div>

        {/* Rarity Badge */}
        {showDetails && badge.rarity !== 'common' && (
          <div className={`
            absolute top-0 right-0 px-1 py-0.5 rounded-bl text-xs font-bold text-white
            ${badge.rarity === 'rare' ? 'bg-blue-500' : ''}
            ${badge.rarity === 'epic' ? 'bg-purple-500' : ''}
            ${badge.rarity === 'legendary' ? 'bg-yellow-500' : ''}
          `}>
            {badge.rarity.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Hover Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
          {badge.name}
          {badge.unlockedAt && (
            <div className="text-gray-300">
              Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Badges Yet</h3>
        <p className="text-gray-600">Start learning to earn your first badge!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Badges ({badges.filter(b => b.unlocked).length}/{badges.length})</span>
        </h2>
        
        {maxDisplay && badges.length > maxDisplay && (
          <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View All →
          </button>
        )}
      </div>

      {/* Badge Display */}
      <div className={`
        ${layout === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
          : 'space-y-3'
        }
      `}>
        {displayBadges.map((badge, index) => (
          <BadgeItem key={badge._id || index} badge={badge} index={index} />
        ))}
      </div>

      {/* Badge Categories */}
      {layout === 'grid' && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {['completion', 'streak', 'performance', 'activity'].map(category => {
              const categoryBadges = badges.filter(b => b.type === category);
              const unlockedCount = categoryBadges.filter(b => b.unlocked).length;
              
              return (
                <div 
                  key={category}
                  className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span className="capitalize text-sm text-gray-700">{category}</span>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {unlockedCount}/{categoryBadges.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Badge Modal/Details */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className={`
                w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center
                ${selectedBadge.unlocked 
                  ? `bg-gradient-to-br ${getRarityColor(selectedBadge.rarity)}` 
                  : 'bg-gray-300'
                }
              `}>
                {selectedBadge.unlocked ? (
                  <span className="text-3xl">{selectedBadge.icon}</span>
                ) : (
                  <Lock className="w-8 h-8 text-gray-500" />
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedBadge.name}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {selectedBadge.description}
              </p>
              
              <div className="flex items-center justify-center space-x-4 mb-4">
                {selectedBadge.xp_reward && (
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">
                      {selectedBadge.xp_reward} XP
                    </span>
                  </div>
                )}
                
                {selectedBadge.gems_reward && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600">
                      {selectedBadge.gems_reward} Gems
                    </span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setSelectedBadge(null)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple badge list for compact spaces
export const BadgeList = ({ badges, maxDisplay = 5 }) => {
  const unlockedBadges = badges.filter(b => b.unlocked).slice(0, maxDisplay);
  
  if (unlockedBadges.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm">
        No badges earned yet
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {unlockedBadges.map((badge, index) => (
        <div 
          key={badge._id || index}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-sm"
          title={badge.name}
        >
          <span className="text-sm">{badge.icon}</span>
        </div>
      ))}
      
      {badges.filter(b => b.unlocked).length > maxDisplay && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
          +{badges.filter(b => b.unlocked).length - maxDisplay}
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;