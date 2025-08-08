import React from 'react';
import { BookOpen, Clock, TrendingUp, Star, Play, CheckCircle, Bookmark } from 'lucide-react';

const SubjectCard = ({ subject, onClick, className = '' }) => {
  const {
    _id,
    name,
    description,
    thumbnail,
    progress = 0,
    chapters = 0,
    completedChapters = 0,
    isRecommended = false,
    estimatedTime = '120 hours',
    difficulty_level = 'intermediate',
    learning_outcomes = []
  } = subject;

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (progress) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('math')) return '🔢';
    if (lowerName.includes('physics')) return '⚗️';
    if (lowerName.includes('chemistry')) return '🧪';
    if (lowerName.includes('biology')) return '🧬';
    if (lowerName.includes('english')) return '📚';
    if (lowerName.includes('history')) return '📜';
    if (lowerName.includes('geography')) return '🌍';
    return thumbnail || '📖';
  };

  return (
    <div 
      className={`
        relative bg-white rounded-xl shadow-sm border transition-all duration-300 cursor-pointer
        hover:shadow-lg hover:-translate-y-1 hover:border-orange-300
        ${isRecommended ? 'ring-2 ring-orange-400 ring-opacity-50' : ''}
        ${className}
      `}
      onClick={() => onClick?.(subject)}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
            <Star className="w-3 h-3" />
            <span>Recommended</span>
          </div>
        </div>
      )}

      {/* Bookmark Button */}
      <button 
        className="absolute top-4 right-4 z-10 p-1 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          // Handle bookmark functionality
          console.log('Bookmark clicked for:', name);
        }}
      >
        <Bookmark className="w-5 h-5 text-gray-400 hover:text-orange-500" />
      </button>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="text-4xl">{getSubjectIcon(name)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className={`text-sm font-bold ${getProgressTextColor(progress)}`}>
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`${getProgressColor(progress)} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{completedChapters}/{chapters} chapters</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{estimatedTime}</span>
            </div>
          </div>
        </div>

        {/* Difficulty and Stats */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty_level)}`}>
            {difficulty_level?.charAt(0).toUpperCase() + difficulty_level?.slice(1)}
          </span>
          
          {progress > 0 && (
            <div className="flex items-center space-x-1 text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">In Progress</span>
            </div>
          )}
          
          {progress >= 100 && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Completed</span>
            </div>
          )}
        </div>

        {/* Learning Outcomes Preview */}
        {learning_outcomes && learning_outcomes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">You'll learn:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {learning_outcomes.slice(0, 2).map((outcome, index) => (
                <li key={index} className="flex items-start space-x-1">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="line-clamp-1">{outcome}</span>
                </li>
              ))}
              {learning_outcomes.length > 2 && (
                <li className="text-gray-400 italic">
                  +{learning_outcomes.length - 2} more outcomes...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button 
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(subject);
            }}
          >
            {progress > 0 ? (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Continue</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start</span>
              </>
            )}
          </button>
          
          {progress > 0 && (
            <button 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Handle progress view
                console.log('View progress for:', name);
              }}
            >
              Progress
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>NECTA Aligned</span>
          {isRecommended && (
            <div className="flex items-center space-x-1 text-orange-600">
              <Star className="w-3 h-3" />
              <span className="font-medium">Recommended for you</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;