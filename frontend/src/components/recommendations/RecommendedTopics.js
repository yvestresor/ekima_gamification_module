import React, { useState } from 'react';
import { Target, Clock, Brain, ChevronRight, Star, Play, BookOpen, Zap } from 'lucide-react';

const RecommendedTopics = ({ recommendations = [], onTopicClick, loading = false }) => {
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getContentTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video': return '📹';
      case 'experiment': return '🧪';
      case 'simulation': return '🔬';
      case '3d-model': return '🎯';
      case 'quiz': return '❓';
      case 'notes': return '📝';
      default: return '📚';
    }
  };

  const handleTopicSelect = (recommendation) => {
    setSelectedRecommendation(recommendation);
    if (onTopicClick) {
      onTopicClick(recommendation);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="h-6 bg-gray-300 rounded w-48"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600">
            Complete more topics and quizzes to get personalized recommendations!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
        </div>
        <div className="text-sm text-gray-500">
          Based on your learning patterns
        </div>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <div 
            key={recommendation._id || index}
            className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-orange-300 ${
              selectedRecommendation?._id === recommendation._id ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
            }`}
            onClick={() => handleTopicSelect(recommendation)}
          >
            <div className="flex items-start space-x-4">
              {/* Priority Number */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-orange-500' : 
                  index === 1 ? 'bg-orange-400' : 
                  'bg-orange-300'
                }`}>
                  {index + 1}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {recommendation.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-600 font-medium">
                        {recommendation.subject}
                      </span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {recommendation.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
                
                {/* Difficulty and Confidence */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(recommendation.difficulty)}`}>
                    {recommendation.difficulty}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <Brain className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                      {Math.round(recommendation.confidence * 100)}% match
                    </span>
                  </div>
                  
                  {index < 2 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-yellow-600 font-medium">Top Pick</span>
                    </div>
                  )}
                </div>
                
                {/* Reason */}
                <p className="text-sm text-gray-600 mb-3 italic">
                  💡 {Array.isArray(recommendation.reasons) 
                    ? recommendation.reasons[0] 
                    : recommendation.reasons || 'Recommended based on your progress'}
                </p>
                
                {/* Content Types */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xs text-gray-500 font-medium">Available content:</span>
                  <div className="flex space-x-1">
                    {(recommendation.contentTypes || ['video', 'quiz']).map((type, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center space-x-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        title={type}
                      >
                        <span>{getContentTypeIcon(type)}</span>
                        <span className="capitalize">{type}</span>
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {recommendation.priority <= 2 && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-medium">High Priority</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTopicSelect(recommendation);
                    }}
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Learning</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Show More Button */}
      {recommendations.length > 3 && (
        <div className="mt-6 text-center">
          <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
            View More Recommendations →
          </button>
        </div>
      )}
      
      {/* Recommendation Feedback */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Recommendations improve as you learn more. 
          <button className="text-orange-600 hover:text-orange-700 ml-1">
            Give feedback
          </button>
        </p>
      </div>
    </div>
  );
};

export default RecommendedTopics;