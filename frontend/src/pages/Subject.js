// src/pages/Subject.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  Award,
  Play,
  FileText,
  Beaker,
  Zap,
  ChevronRight,
  Star,
  CheckCircle,
  BarChart3
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../context/ProgressContext';
import { useRecommendations } from '../context/RecommendationContext';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';

// Import components
import TopicCard from '../components/learning/TopicCard';
import ProgressTracker from '../components/learning/ProgressTracker';
import Loading from '../components/common/Loading';
import SmartSuggestions from '../components/recommendations/SmartSuggestions';
import LearningPath from '../components/recommendations/LearningPath';
import TopicFormPage from './TopicFormPage';

// Import services and utilities
import { calculateSubjectProgress } from '../utils/progressCalculator';
import { contentAPI } from '../services/api';

const Subject = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState('all');

  // CRUD state for topics
  const [topicCrudLoading, setTopicCrudLoading] = useState(false);
  const [topicCrudError, setTopicCrudError] = useState(null);
  const [topicCrudSuccess, setTopicCrudSuccess] = useState(null);

  // Contexts and hooks
  const { userProgress } = useProgress();
  const { getRecommendationsBySubject } = useRecommendations();
  const { levelInfo, streakData } = useGamification();
  const { user, hasPermission } = useAuth();

  // Load subject data
  useEffect(() => {
    const loadSubjectData = async () => {
      try {
        setLoading(true);
        const res = await contentAPI.getSubject(subjectId);
        setSubjectData(res.data);
      } catch (err) {
        setError('Failed to load subject data');
        console.error('Error loading subject:', err);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      loadSubjectData();
    }
  }, [subjectId]);

  // Calculate progress
  const subjectProgress = subjectData 
    ? calculateSubjectProgress(subjectData, userProgress)
    : { percentage: 0, completedChapters: 0, totalChapters: 0 };

  // Get recommendations for this subject
  const recommendations = getRecommendationsBySubject(subjectId);

  // Content type filtering
  const contentTypes = [
    { id: 'all', label: 'All Content', icon: BookOpen },
    { id: 'videos', label: 'Videos', icon: Play },
    { id: 'experiments', label: 'Experiments', icon: Beaker },
    { id: 'simulations', label: 'Simulations', icon: Zap },
    { id: 'readings', label: 'Readings', icon: FileText }
  ];

  // Filter topics based on selected content type
  const filteredTopics = subjectData?.topics?.filter(topic => {
    if (selectedContentType === 'all') return true;
    return topic.contentTypes?.includes(selectedContentType);
  }) || [];

  // CRUD handlers for topics
  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;
    setTopicCrudLoading(true); setTopicCrudError(null); setTopicCrudSuccess(null);
    try {
      await contentAPI.deleteTopic(topicId);
      setTopicCrudSuccess('Topic deleted successfully');
      // Refresh subject data
      const res = await contentAPI.getSubject(subjectId);
      setSubjectData(res.data);
    } catch (err) {
      setTopicCrudError('Failed to delete topic');
    } finally {
      setTopicCrudLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error || !subjectData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BookOpen size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested subject could not be found.'}</p>
          <button
            onClick={() => navigate('/subjects')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subject Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Subject Info */}
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <button
                  onClick={() => navigate('/subjects')}
                  className="text-gray-500 hover:text-gray-700 mr-3"
                >
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{subjectData.name}</h1>
                <div className="ml-3 flex items-center">
                  {subjectData.difficulty && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subjectData.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      subjectData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      subjectData.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {subjectData.difficulty}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-lg mb-4">{subjectData.description}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <BookOpen size={16} className="mr-1" />
                  <span>{subjectData.topics?.length || 0} Topics</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{subjectData.estimatedHours || 0} Hours</span>
                </div>
                <div className="flex items-center">
                  <Target size={16} className="mr-1" />
                  <span>{subjectProgress.percentage.toFixed(0)}% Complete</span>
                </div>
                <div className="flex items-center">
                  <Star size={16} className="mr-1" />
                  <span>Level {levelInfo.level} Recommended</span>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {subjectProgress.percentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 mb-3">Overall Progress</div>
                  <ProgressTracker 
                    progress={subjectProgress.percentage}
                    size="lg"
                    showLabel={false}
                  />
                  <div className="mt-3 text-xs text-gray-500">
                    {subjectProgress.completedChapters} of {subjectProgress.totalChapters} chapters
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Content Type Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedContentType(type.id)}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedContentType === type.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <Icon size={16} className="mr-2" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Topic Button (admin/teacher only) */}
            {user && (hasPermission?.('manage_topics') || user.role === 'admin' || user.role === 'teacher') && (
              <button
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => navigate(`/topics/new?subject=${subjectId}`)}
              >
                + Add Topic
              </button>
            )}
            {/* CRUD Feedback */}
            {topicCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
            {topicCrudSuccess && <div className="text-green-600 mb-2">{topicCrudSuccess}</div>}
            {topicCrudError && <div className="text-red-600 mb-2">{topicCrudError}</div>}
            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="relative">
                  <TopicCard
                    topic={topic}
                    progress={userProgress?.topics?.[topic._id]}
                    onClick={() => navigate(`/topic/${topic._id}`)}
                  />
                  {/* Edit/Delete controls (admin/teacher only) */}
                  {user && (hasPermission?.('manage_topics') || user.role === 'admin' || user.role === 'teacher') && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                        onClick={() => navigate(`/topics/${topic._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDeleteTopic(topic._id)}
                      >Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* No Results */}
            {filteredTopics.length === 0 && (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {selectedContentType !== 'all' ? selectedContentType : 'topics'} found
                </h3>
                <p className="text-gray-600">
                  {selectedContentType !== 'all' 
                    ? `No topics with ${selectedContentType} content are available.`
                    : 'This subject doesn\'t have any topics yet.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp size={20} className="mr-2 text-blue-500" />
                  Recommended for You
                </h3>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => navigate(`/topic/${rec._id}`)}
                      className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="font-medium text-gray-900 mb-1">{rec.title}</div>
                      <div className="text-sm text-gray-600 mb-2">{rec.reason}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 font-medium">
                          {rec.confidence}% match
                        </span>
                        <ChevronRight size={14} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 size={20} className="mr-2 text-green-500" />
                Your Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-gray-900">
                    {subjectProgress.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-orange-600">
                    {streakData.currentStreak} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">XP Earned</span>
                  <span className="font-semibold text-blue-600">
                    {subjectProgress.totalXP || 0} XP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Topics Completed</span>
                  <span className="font-semibold text-green-600">
                    {Object.values(userProgress?.topics || {}).filter(t => t.completed).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/progress?subject=${subjectId}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-gray-700">View Progress</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                <button
                  onClick={() => navigate(`/questions?subject=${subjectId}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-gray-700">Practice Questions</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                <button
                  onClick={() => navigate(`/experiments?subject=${subjectId}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-gray-700">Try Experiments</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Achievement Progress */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award size={20} className="mr-2 text-purple-500" />
                Subject Mastery
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle size={16} className={`mr-2 ${subjectProgress.percentage >= 25 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={`text-sm ${subjectProgress.percentage >= 25 ? 'text-gray-900' : 'text-gray-500'}`}>
                    Complete 25% of topics
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle size={16} className={`mr-2 ${subjectProgress.percentage >= 50 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={`text-sm ${subjectProgress.percentage >= 50 ? 'text-gray-900' : 'text-gray-500'}`}>
                    Complete 50% of topics
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle size={16} className={`mr-2 ${subjectProgress.percentage >= 80 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={`text-sm ${subjectProgress.percentage >= 80 ? 'text-gray-900' : 'text-gray-500'}`}>
                    Achieve 80% mastery
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle size={16} className={`mr-2 ${subjectProgress.percentage >= 100 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={`text-sm ${subjectProgress.percentage >= 100 ? 'text-gray-900' : 'text-gray-500'}`}>
                    Complete all topics
                  </span>
                </div>
              </div>
            </div>

            {/* Smart Suggestions and Learning Path */}
            <SmartSuggestions 
              variant="compact" 
              category="topics" 
              maxSuggestions={3} 
            />
            <LearningPath variant="compact" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subject;