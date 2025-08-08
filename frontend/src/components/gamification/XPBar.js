import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp } from 'lucide-react';

const XPBar = ({ 
  currentXP = 0, 
  maxXP = 1000, 
  level = 1,
  showAnimation = true,
  size = 'medium',
  showLabel = true,
  className = ''
}) => {
  const [animatedXP, setAnimatedXP] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showAnimation && currentXP !== animatedXP) {
      setIsAnimating(true);
      
      // Animate XP increase
      const duration = 1000; // 1 second
      const steps = 60; // 60fps
      const increment = (currentXP - animatedXP) / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        setAnimatedXP(prev => {
          const newValue = prev + increment;
          if (step >= steps || newValue >= currentXP) {
            clearInterval(timer);
            setIsAnimating(false);
            return currentXP;
          }
          return newValue;
        });
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedXP(currentXP);
    }
  }, [currentXP, showAnimation]);

  const progressPercentage = Math.min((animatedXP / maxXP) * 100, 100);
  const xpNeeded = Math.max(maxXP - currentXP, 0);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'h-2',
          text: 'text-xs',
          icon: 'w-3 h-3'
        };
      case 'large':
        return {
          container: 'h-6',
          text: 'text-base',
          icon: 'w-5 h-5'
        };
      default: // medium
        return {
          container: 'h-4',
          text: 'text-sm',
          icon: 'w-4 h-4'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Zap className={`${sizeClasses.icon} text-orange-500`} />
            <span className={`${sizeClasses.text} font-medium text-gray-700`}>
              Level {level}
            </span>
          </div>
          <div className={`${sizeClasses.text} text-gray-600`}>
            {Math.round(animatedXP)} / {maxXP} XP
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="relative">
        <div className={`w-full bg-gray-200 rounded-full ${sizeClasses.container} overflow-hidden`}>
          {/* Progress Fill */}
          <div 
            className={`
              ${sizeClasses.container} bg-gradient-to-r from-orange-400 to-orange-600 rounded-full 
              transition-all duration-500 ease-out relative overflow-hidden
              ${isAnimating ? 'animate-pulse' : ''}
            `}
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-shine" />
          </div>
        </div>

        {/* XP Text Overlay */}
        {size !== 'small' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${sizeClasses.text} font-bold text-white mix-blend-difference`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
        )}
      </div>

      {/* XP Needed */}
      {showLabel && xpNeeded > 0 && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {xpNeeded} XP to next level
          </span>
          {isAnimating && (
            <div className="flex items-center space-x-1 text-orange-600">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-medium">+XP</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Circular XP Progress Component
export const CircularXPBar = ({ 
  currentXP = 0, 
  maxXP = 1000, 
  level = 1,
  size = 80,
  strokeWidth = 8,
  showAnimation = true 
}) => {
  const [animatedXP, setAnimatedXP] = useState(0);

  useEffect(() => {
    if (showAnimation && currentXP !== animatedXP) {
      const duration = 1000;
      const steps = 60;
      const increment = (currentXP - animatedXP) / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        setAnimatedXP(prev => {
          const newValue = prev + increment;
          if (step >= steps || newValue >= currentXP) {
            clearInterval(timer);
            return currentXP;
          }
          return newValue;
        });
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedXP(currentXP);
    }
  }, [currentXP, showAnimation]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = Math.min((animatedXP / maxXP) * 100, 100);
  const strokeDasharray = `${(progressPercentage / 100) * circumference} ${circumference}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#xp-gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          className="transition-all duration-500 ease-out"
        />
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-lg font-bold text-gray-900">
          {level}
        </div>
        <div className="text-xs text-gray-600">
          Level
        </div>
      </div>
    </div>
  );
};

// Mini XP Bar for compact spaces
export const MiniXPBar = ({ currentXP = 0, maxXP = 1000, className = '' }) => {
  const progressPercentage = Math.min((currentXP / maxXP) * 100, 100);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Zap className="w-3 h-3 text-orange-500" />
      <div className="flex-1 bg-gray-200 rounded-full h-1.5 min-w-[40px]">
        <div 
          className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600">
        {Math.round(currentXP)}
      </span>
    </div>
  );
};

// XP Gain Animation Component
export const XPGainAnimation = ({ xpGained, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce-in">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span className="font-bold">+{xpGained} XP</span>
        </div>
      </div>
    </div>
  );
};

export default XPBar;