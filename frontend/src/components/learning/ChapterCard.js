// src/components/learning/ChapterCard.js

import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle, 
  Lock,
  Star,
  Award,
  TrendingUp,
  FileText,
  Beaker,
  Zap,
  Target,
  BarChart3,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

/**
 * ChapterCard component for displaying chapter information with progress and actions
 */
const ChapterCard = ({ 
  chapter, 
  progress, 
  isLocked = false,
  chapterNumber,
  onStart,
  onContinue,
  onComplete,
  onReview,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine chapter status
  const isCompleted = progress?.completed || false;
  const isInProgress = progress && !progress.completed && progress.timeSpent > 0;
  const isNotStarted = !progress || progress.timeSpent === 0;

  // Get status color and text
  const getStatusInfo = () => {
    if (isLocked) {
      return {
        color: 'text-gray-400',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        status: 'Locked',
        icon: Lock
      };
    }
    
    if (isCompleted) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        status: 'Completed',
        icon: CheckCircle
      };
    }
    
    if (isInProgress) {
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        status: 'In Progress',
        icon: Play
      };
    }
    
    return {
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      status: 'Not Started',
      icon: BookOpen
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Calculate progress percentage
  const progressPercentage = progress?.progressPercentage || 0;

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expert':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Content type icons
  const contentTypeIcons = {
    videos: Play,
    experiments: Beaker,
    simulations: Zap,
    readings: FileText,
    quizzes: BookOpen
  };

  // Handle primary action
  const handlePrimaryAction = () => {
    if (isLocked) return;
    
    if (isCompleted && onReview) {
      onReview(chapter.id);
    } else if (isInProgress && onContinue) {
      onContinue(chapter.id);
    } else if (isNotStarted && onStart) {
      onStart(chapter.id);
    }
  };

  // Get primary action text
  const getPrimaryActionText = () => {
    if (isLocked) return 'Locked';
    if (isCompleted) return 'Review';
    if (isInProgress) return 'Continue';
    return 'Start';
  };

  return (
    <div
      className={`
        bg-white rounded-xl border transition-all duration-200
        ${isLocked ? 'opacity-60' : 'hover:shadow-lg'}
        ${statusInfo.borderColor}
        ${className}
      `}
    >
      {/* Main Card Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1">
            {/* Chapter Number */}
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4
              ${statusInfo.bgColor} ${statusInfo.color}
            `}>
              {isCompleted ? (
                <CheckCircle size={20} />
              ) : (
                <span>{chapterNumber}</span>
              )}
            </div>

            {/* Chapter Info */}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 mr-3">
                  {chapter.name}
                </h3>
                
                {/* Status Badge */}
                <span className={`
                  flex items-center px-2 py-1 rounded-full text-xs font-medium border
                  ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor}
                `}>
                  <StatusIcon size={12} className="mr-1" />
                  {statusInfo.status}
                </span>

                {/* Difficulty Badge */}
                {chapter.difficulty && (
                  <span className={`
                    ml-2 px-2 py-1 rounded-full text-xs font-medium border
                    ${getDifficultyColor(chapter.difficulty)}
                  `}>
                    {chapter.difficulty}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm line-clamp-2">
                {chapter.description}
              </p>
            </div>
          </div>

          {/* Progress Circle */}
          {(isInProgress || isCompleted) && (
            <div className="flex-shrink-0 ml-4">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="4"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(progressPercentage * 125.6) / 100} 125.6`}
                    className={isCompleted ? 'text-green-500' : 'text-blue-500'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${isCompleted ? 'text-green-500' : 'text-blue-500'}`}>
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Types */}
        {chapter.contentTypes && chapter.contentTypes.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {chapter.contentTypes.map((type) => {
                const Icon = contentTypeIcons[type] || BookOpen;
                return (
                  <div
                    key={type}
                    className="flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700"
                  >
                    <Icon size={12} className="mr-1" />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chapter Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            {/* Estimated Time */}
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{chapter.estimatedTime || 30} min</span>
            </div>

            {/* XP Reward */}
            <div className="flex items-center">
              <Award size={14} className="mr-1 text-yellow-500" />
              <span>{chapter.xpReward || 50} XP</span>
            </div>

            {/* Learning Objectives Count */}
            {chapter.learningObjectives && (
              <div className="flex items-center">
                <Target size={14} className="mr-1" />
                <span>{chapter.learningObjectives.length} objectives</span>
              </div>
            )}
          </div>

          {/* Quiz Score */}
          {progress?.quizScore && (
            <div className="flex items-center">
              <BarChart3 size={14} className="mr-1 text-blue-500" />
              <span className="font-medium">{progress.quizScore}% score</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {(isInProgress || isCompleted) && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Time Spent */}
        {progress?.timeSpent > 0 && (
          <div className="mb-4 text-xs text-gray-600">
            Time spent: {Math.round(progress.timeSpent)} minutes
            {progress.completedAt && (
              <span className="ml-2">
                • Completed {new Date(progress.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
            disabled={isLocked}
          >
            <span className="mr-1">
              {isExpanded ? 'Less details' : 'More details'}
            </span>
            <ChevronRight 
              size={14} 
              className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={handlePrimaryAction}
            disabled={isLocked}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors text-sm
              ${isLocked 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {getPrimaryActionText()}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && !isLocked && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {/* Learning Objectives */}
          {chapter.learningObjectives && chapter.learningObjectives.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Target size={16} className="mr-2 text-blue-500" />
                Learning Objectives
              </h4>
              <ul className="space-y-2">
                {chapter.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {chapter.prerequisites && chapter.prerequisites.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Prerequisites</h4>
              <div className="flex flex-wrap gap-2">
                {chapter.prerequisites.map((prereq, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Actions */}
          <div className="flex flex-wrap gap-2">
            {isCompleted && (
              <button
                onClick={() => onReview && onReview(chapter.id)}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw size={14} className="mr-1" />
                Review Again
              </button>
            )}
            
            <button
              onClick={() => {/* Navigate to practice questions */}}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FileText size={14} className="mr-1" />
              Practice Questions
            </button>

            {chapter.contentTypes?.includes('experiments') && (
              <button
                onClick={() => {/* Navigate to experiments */}}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Beaker size={14} className="mr-1" />
                Try Experiments
              </button>
            )}

            {chapter.contentTypes?.includes('simulations') && (
              <button
                onClick={() => {/* Navigate to simulations */}}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Zap size={14} className="mr-1" />
                Run Simulations
              </button>
            )}
          </div>

          {/* Performance Stats for Completed Chapters */}
          {isCompleted && progress && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Your Performance</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {progress.quizScore || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Quiz Score</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(progress.timeSpent || 0)}m
                  </div>
                  <div className="text-xs text-gray-600">Time Spent</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">
                    {progress.xpEarned || 0}
                  </div>
                  <div className="text-xs text-gray-600">XP Earned</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterCard;