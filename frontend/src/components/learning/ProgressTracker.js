import React from 'react';
import { Clock, BookOpen, CheckCircle, Play, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const ProgressTracker = ({ progress = [], subjects = [], compact = false }) => {
  
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-500';
    if (percentage >= 60) return 'text-blue-600 bg-blue-500';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-500';
    return 'text-red-600 bg-red-500';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTimeSpent = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const ProgressItem = ({ item, index }) => (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Progress Circle */}
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className={getProgressColor(item.overallProgress).split(' ')[1]}
                strokeDasharray={`${(item.overallProgress / 100) * 175.929} 175.929`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${getProgressColor(item.overallProgress).split(' ')[0]}`}>
                {Math.round(item.overallProgress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">
                Chapter {item.chapterId.split('CH')[1] || index + 1}
              </h3>
              <p className="text-sm text-gray-600">
                {getSubjectName(item.subjectId)}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {item.isCompleted && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {!item.isCompleted && item.overallProgress > 0 && (
                <Play className="w-5 h-5 text-blue-500" />
              )}
            </div>
          </div>

          {/* Progress Details */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Content</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Videos</span>
                  <span className="font-medium">{item.videoProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${item.videoProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1 mb-1">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Assessment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getScoreColor(item.assessmentScoreAverage)}`}>
                  {Math.round(item.assessmentScoreAverage)}
                </div>
                <span className="text-xs text-gray-600">avg score</span>
              </div>
            </div>
          </div>

          {/* Experiments Progress */}
          {item.totalExperiments > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Experiments</span>
                <span>{item.experimentsAttempted}/{item.totalExperiments}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-purple-400 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(item.experimentsAttempted / item.totalExperiments) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Time and Date Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatTimeSpent(item.timeSpent || 0)}</span>
              </div>
              {item.lastAccessedAt && (
                <span>
                  Last: {format(new Date(item.lastAccessedAt), 'MMM dd')}
                </span>
              )}
            </div>
            
            {item.strugglingAreas && item.strugglingAreas.length > 0 && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <AlertCircle className="w-3 h-3" />
                <span>Needs review</span>
              </div>
            )}
          </div>

          {/* Mastered Concepts */}
          {item.masteredConcepts && item.masteredConcepts.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {item.masteredConcepts.slice(0, 3).map((concept, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {concept.replace('_', ' ')}
                  </span>
                ))}
                {item.masteredConcepts.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{item.masteredConcepts.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CompactProgressItem = ({ item, index }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getScoreColor(item.assessmentScoreAverage)}`}>
        {Math.round(item.overallProgress)}%
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">
          Chapter {item.chapterId.split('CH')[1] || index + 1}
        </h4>
        <p className="text-sm text-gray-600">
          {getSubjectName(item.subjectId)} • {formatTimeSpent(item.timeSpent || 0)}
        </p>
      </div>
      <div className="text-right">
        {item.isCompleted ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <div className="text-xs text-gray-500">
            {format(new Date(item.lastAccessedAt), 'MMM dd')}
          </div>
        )}
      </div>
    </div>
  );

  if (!progress || progress.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Yet</h3>
        <p className="text-gray-600">
          Start learning to see your progress tracked here!
        </p>
      </div>
    );
  }

  const completedCount = progress.filter(p => p.isCompleted).length;
  const averageProgress = progress.reduce((sum, p) => sum + p.overallProgress, 0) / progress.length;
  const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {!compact && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Progress Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {progress.length}
              </div>
              <div className="text-sm text-gray-600">Total Chapters</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {completedCount}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {Math.round(averageProgress)}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatTimeSpent(totalTimeSpent)}
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Completion</span>
              <span>{Math.round((completedCount / progress.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / progress.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Items */}
      <div className="space-y-4">
        {compact && (
          <h3 className="text-lg font-bold text-gray-900">Recent Progress</h3>
        )}
        
        {progress
          .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
          .map((item, index) => 
            compact ? (
              <CompactProgressItem key={item._id || index} item={item} index={index} />
            ) : (
              <ProgressItem key={item._id || index} item={item} index={index} />
            )
          )}
      </div>

      {/* Learning Insights */}
      {!compact && progress.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📊 Learning Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-800">
                <strong>Strongest Subject:</strong> {
                  subjects.find(s => s.name === 'Mathematics')?.name || 'Mathematics'
                }
              </p>
              <p className="text-blue-700 mt-1">
                You're excelling in problem-solving areas!
              </p>
            </div>
            
            <div>
              <p className="text-blue-800">
                <strong>Recommended Focus:</strong> Video content
              </p>
              <p className="text-blue-700 mt-1">
                You learn best through visual materials.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;