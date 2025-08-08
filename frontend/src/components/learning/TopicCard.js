// src/components/learning/TopicCard.js

import React from 'react';
import { 
  BookOpen, 
  Clock, 
  Play, 
  FileText, 
  Beaker, 
  Zap, 
  CheckCircle, 
  Star,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import { calculateTopicProgress } from '../../utils/progressCalculator';

/**
 * TopicCard component for displaying topic information with progress and content types
 */
const TopicCard = ({ 
  topic, 
  progress, 
  onClick, 
  showRecommendation = false,
  recommendationReason = '',
  className = '' 
}) => {
  // Calculate progress if progress data is provided
  const topicProgress = progress ? calculateTopicProgress(topic, { chapters: progress }) : null;
  
  // Content type icons mapping
  const contentTypeIcons = {
    videos: Play,
    experiments: Beaker,
    simulations: Zap,
    readings: FileText,
    quizzes: BookOpen
  };

  // Get difficulty color scheme
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

  // Get progress color
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 
        hover:shadow-lg transition-all duration-200 cursor-pointer group
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {topic.name || topic.title || 'Untitled Topic'}
            </h3>
            {showRecommendation && (
              <div className="ml-2 flex items-center">
                <TrendingUp size={16} className="text-blue-500" />
                <span className="ml-1 text-xs font-medium text-blue-600">Recommended</span>
              </div>
            )}
          </div>
          
          {/* Difficulty and Status */}
          <div className="flex items-center gap-2 mb-2">
            {topic.difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(topic.difficulty)}`}>
                {topic.difficulty}
              </span>
            )}
            
            {topicProgress?.percentage === 100 && (
              <div className="flex items-center text-green-600">
                <CheckCircle size={14} className="mr-1" />
                <span className="text-xs font-medium">Completed</span>
              </div>
            )}
            
            {topic.isNew && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                New
              </span>
            )}
          </div>
        </div>

        {/* Progress Circle */}
        {topicProgress && (
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
                  strokeDasharray={`${(topicProgress.percentage * 125.6) / 100} 125.6`}
                  className={getProgressColor(topicProgress.percentage)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold ${getProgressColor(topicProgress.percentage)}`}>
                  {Math.round(topicProgress.percentage)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {topic.descriptions || topic.description || 'No description provided.'}
      </p>

      {/* Recommendation Reason */}
      {showRecommendation && recommendationReason && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-xs">
            <strong>Why recommended:</strong> {recommendationReason}
          </p>
        </div>
      )}

      {/* Content Types */}
      {topic.contentTypes && topic.contentTypes.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {topic.contentTypes.map((type) => {
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

      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center space-x-4">
          {/* Chapter Count */}
          <div className="flex items-center">
            <BookOpen size={14} className="mr-1" />
            <span>{Array.isArray(topic.chapters) ? topic.chapters.length : 0} chapters</span>
          </div>
          
          {/* Estimated Time */}
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{topic.estimatedTime ? `${topic.estimatedTime} min` : 'N/A'}</span>
          </div>
        </div>

        {/* Rating */}
        {topic.rating && (
          <div className="flex items-center">
            <Star size={14} className="mr-1 text-yellow-500" />
            <span className="font-medium">{topic.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Progress Details */}
      {topicProgress && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span>{topicProgress.completedChapters} of {topicProgress.totalChapters} chapters</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                topicProgress.percentage >= 80 ? 'bg-green-500' :
                topicProgress.percentage >= 50 ? 'bg-yellow-500' :
                topicProgress.percentage >= 25 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${topicProgress.percentage}%` }}
            />
          </div>
          
          {/* Average Score */}
          {topicProgress.averageScore > 0 && (
            <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
              <span>Average Score</span>
              <span className="font-medium">{topicProgress.averageScore.toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Achievements Preview */}
      {topic.achievements && topic.achievements.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Award size={14} className="mr-1 text-yellow-500" />
            <span className="text-xs font-medium text-gray-700">Achievements Available</span>
          </div>
          <div className="flex gap-1">
            {topic.achievements.slice(0, 3).map((achievement, index) => (
              <div
                key={index}
                className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center"
                title={achievement.name}
              >
                <Award size={10} className="text-yellow-600" />
              </div>
            ))}
            {topic.achievements.length > 3 && (
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">+{topic.achievements.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Prerequisites */}
        {topic.prerequisites && topic.prerequisites.length > 0 && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Prerequisites:</span> {topic.prerequisites.slice(0, 2).join(', ')}
            {topic.prerequisites.length > 2 && '...'}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
          <span className="text-sm font-medium mr-1">
            {topicProgress?.percentage === 100 ? 'Review' : topicProgress?.percentage > 0 ? 'Continue' : 'Start'}
          </span>
          <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Last Study Date */}
      {topicProgress?.lastStudied && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Last studied: {new Date(topicProgress.lastStudied).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicCard;