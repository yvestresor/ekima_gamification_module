import React, { useState, useEffect } from 'react';
import { CheckCircle, Lock, Star, Trophy, Zap, Target, Award } from 'lucide-react';
import { format } from 'date-fns';

const AchievementCard = ({ 
  achievement, 
  compact = false, 
  showProgress = true,
  onClick = null,
  animate = false 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animate && achievement.unlocked) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [animate, achievement.unlocked]);

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'completion': return Trophy;
      case 'activity': return Target;
      case 'streak': return Zap;
      case 'performance': return Star;
      default: return Award;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'completion': return 'from-yellow-400 to-yellow-600';
      case 'activity': return 'from-blue-400 to-blue-600';
      case 'streak': return 'from-orange-400 to-orange-600';
      case 'performance': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (xp_reward) => {
    if (xp_reward >= 200) return 'border-yellow-400 shadow-yellow-200'; // Legendary
    if (xp_reward >= 150) return 'border-purple-400 shadow-purple-200'; // Epic
    if (xp_reward >= 100) return 'border-blue-400 shadow-blue-200'; // Rare
    return 'border-gray-300 shadow-gray-200'; // Common
  };

  const IconComponent = getAchievementIcon(achievement.type);

  if (compact) {
    return (
      <div 
        className={`
          flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 cursor-pointer
          ${achievement.unlocked 
            ? 'bg-white border hover:shadow-md' 
            : 'bg-gray-50 border-gray-200 opacity-60'
          }
          ${onClick ? 'hover:scale-105' : ''}
          ${isAnimating ? 'animate-bounce' : ''}
        `}
        onClick={() => onClick?.(achievement)}
      >
        <div className={`
          relative w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
          ${achievement.unlocked 
            ? `bg-gradient-to-br ${getTypeColor(achievement.type)}` 
            : 'bg-gray-400'
          }
        `}>
          {achievement.unlocked ? (
            <span className="text-lg">{achievement.icon}</span>
          ) : (
            <Lock className="w-5 h-5" />
          )}
          
          {achievement.unlocked && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium truncate ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {achievement.name}
          </h4>
          <p className={`text-sm truncate ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>
        </div>
        
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {format(new Date(achievement.unlockedAt), 'MMM dd')}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`
        relative bg-white rounded-xl border-2 p-6 transition-all duration-300 transform
        ${achievement.unlocked 
          ? `${getRarityBorder(achievement.xp_reward)} shadow-lg hover:shadow-xl hover:-translate-y-1` 
          : 'border-gray-200 shadow-sm opacity-75'
        }
        ${onClick ? 'cursor-pointer' : ''}
        ${isAnimating ? 'animate-pulse scale-105' : ''}
      `}
      onClick={() => onClick?.(achievement)}
    >
      {/* Unlock Animation Overlay */}
      {isAnimating && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl opacity-20 animate-pulse"></div>
      )}

      {/* Rarity Indicator */}
      {achievement.unlocked && achievement.xp_reward >= 150 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
          <Star className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className={`
          relative w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold shadow-lg
          ${achievement.unlocked 
            ? `bg-gradient-to-br ${getTypeColor(achievement.type)}` 
            : 'bg-gray-400'
          }
        `}>
          {achievement.unlocked ? (
            <span className="text-2xl">{achievement.icon}</span>
          ) : (
            <Lock className="w-8 h-8" />
          )}
          
          {/* Success Checkmark */}
          {achievement.unlocked && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-bold mb-1 ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {achievement.name}
          </h3>
          <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>
          
          {/* Type Badge */}
          <div className="mt-2">
            <span className={`
              inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
              ${achievement.unlocked 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-500'
              }
            `}>
              <IconComponent className="w-3 h-3" />
              <span className="capitalize">{achievement.type}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {showProgress && achievement.requirement && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {achievement.unlocked ? achievement.requirement : '?'} / {achievement.requirement}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`
                h-2 rounded-full transition-all duration-500 ease-out
                ${achievement.unlocked 
                  ? `bg-gradient-to-r ${getTypeColor(achievement.type)}` 
                  : 'bg-gray-400'
                }
              `}
              style={{ 
                width: achievement.unlocked ? '100%' : '0%' 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Rewards Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* XP Reward */}
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className={`text-sm font-medium ${achievement.unlocked ? 'text-blue-600' : 'text-gray-400'}`}>
              {achievement.xp_reward} XP
            </span>
          </div>
          
          {/* Gems Reward */}
          {achievement.gems_reward && (
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <span className={`text-sm font-medium ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`}>
                {achievement.gems_reward} Gems
              </span>
            </div>
          )}
        </div>
        
        {/* Unlock Date */}
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="text-right">
            <p className="text-xs text-gray-500">
              Unlocked {format(new Date(achievement.unlockedAt), 'MMM dd, yyyy')}
            </p>
          </div>
        )}
      </div>

      {/* Subject Filter */}
      {achievement.subject && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Subject: <span className="font-medium text-gray-700">{achievement.subject}</span>
          </span>
        </div>
      )}

      {/* Locked Message */}
      {!achievement.unlocked && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-600 text-center">
            Complete the required actions to unlock this achievement!
          </p>
        </div>
      )}

      {/* Sparkle Effect for High-Value Achievements */}
      {achievement.unlocked && achievement.xp_reward >= 200 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>
      )}
    </div>
  );
};

export default AchievementCard;