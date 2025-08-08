// src/pages/Topic.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Play,
  ChevronRight,
  ChevronLeft,
  Award,
  TrendingUp,
  CheckCircle,
  Lock,
  Star,
  Users,
  BarChart3,
  Lightbulb,
  FileText,
  Beaker,
  Zap,
  Download
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../context/ProgressContext';
import { useRecommendations } from '../context/RecommendationContext';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';

// Import components
import ChapterCard from '../components/learning/ChapterCard';
import ProgressTracker from '../components/learning/ProgressTracker';
import Loading from '../components/common/Loading';

// Import services and utilities
import { calculateTopicProgress } from '../utils/progressCalculator';
import { getTopicData } from '../services/api';
import { contentAPI } from '../services/api';

const Topic = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('chapters');

  // CRUD state for chapters
  const [chapterCrudLoading, setChapterCrudLoading] = useState(false);
  const [chapterCrudError, setChapterCrudError] = useState(null);
  const [chapterCrudSuccess, setChapterCrudSuccess] = useState(null);

  // Contexts and hooks
  const { userProgress, updateChapterProgress } = useProgress();
  const { getRecommendationsByTopic, recommendations } = useRecommendations();
  const { levelInfo, streakData, completeChapter } = useGamification();
  // Get prerequisites for this topic from backend data
  const getTopicPrerequisites = () => topicData?.prerequisites || [];

  // Check if topic is unlocked based on completed topics from userProgress
  const isTopicUnlocked = () => {
    const prerequisites = getTopicPrerequisites();
    const completedTopics = Object.keys(userProgress?.topics || {}).filter(
      id => userProgress.topics[id].completed
    );
    return prerequisites.every(prereq => completedTopics.includes(prereq));
  };
  const { user, hasPermission } = useAuth();

  // Load topic data
  useEffect(() => {
    const loadTopicData = async () => {
      try {
        setLoading(true);
        const res = await contentAPI.getTopic(topicId);
        setTopicData(res.data);
      } catch (err) {
        setError('Failed to load topic data');
        console.error('Error loading topic:', err);
      } finally {
        setLoading(false);
      }
    };
    if (topicId) loadTopicData();
  }, [topicId]);

  // Calculate progress
  const topicProgress = topicData 
    ? calculateTopicProgress(topicData, userProgress)
    : { percentage: 0, completedChapters: 0, totalChapters: 0 };

  // Get recommendations
  const topicRecommendations = getRecommendationsByTopic
    ? getRecommendationsByTopic(topicId)
    : (recommendations ? recommendations.filter(rec => rec.topic === topicId) : []);

  // Check if topic is unlocked
  const prerequisites = getTopicPrerequisites();
  const completedTopics = Object.keys(userProgress?.topics || {}).filter(
    id => userProgress.topics[id].completed
  );
  const isUnlocked = isTopicUnlocked();

  // View options
  const viewOptions = [
    { id: 'chapters', label: 'Chapters', icon: BookOpen },
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'resources', label: 'Resources', icon: Download }
  ];

  // Content type icons
  const contentTypeIcons = {
    videos: Play,
    experiments: Beaker,
    simulations: Zap,
    readings: FileText,
    quizzes: BookOpen
  };

  // Handle chapter start
  const handleStartChapter = (chapterId) => {
    if (!isUnlocked) {
      alert('Complete prerequisites first!');
      return;
    }
    navigate(`/chapter/${chapterId}`);
  };

  // Handle chapter completion
  const handleChapterComplete = async (chapterId, timeSpent, quizScore) => {
    try {
      const chapter = topicData.chapters.find(c => c.id === chapterId);
      const result = await completeChapter(chapter, timeSpent, quizScore);
      
      // Update progress context
      await updateChapterProgress(chapterId, {
        completed: true,
        timeSpent,
        quizScore,
        completedAt: new Date().toISOString(),
        xpEarned: result.xpAdded
      });

      if (result.leveledUp) {
        alert(`Congratulations! You've reached Level ${result.newLevel}!`);
      }
    } catch (err) {
      console.error('Error completing chapter:', err);
    }
  };

  // CRUD handlers for chapters
  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Are you sure you want to delete this chapter?')) return;
    setChapterCrudLoading(true); setChapterCrudError(null); setChapterCrudSuccess(null);
    try {
      await contentAPI.deleteChapter(chapterId);
      setChapterCrudSuccess('Chapter deleted successfully');
      // Refresh topic data
      const res = await contentAPI.getTopic(topicId);
      setTopicData(res.data);
    } catch (err) {
      setChapterCrudError('Failed to delete chapter');
    } finally {
      setChapterCrudLoading(false);
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
  if (error || !topicData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BookOpen size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested topic could not be found.'}</p>
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
      {/* Topic Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <Link to="/subjects" className="hover:text-blue-600">Subjects</Link>
            <ChevronRight size={16} className="mx-2" />
            <Link to={`/subject/${topicData.subjectId}`} className="hover:text-blue-600">
              {topicData.subjectName}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-900 font-medium">{topicData.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Topic Info */}
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{topicData.name}</h1>
                
                {/* Status Badges */}
                <div className="ml-4 flex items-center gap-2">
                  {!isUnlocked && (
                    <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      <Lock size={14} className="mr-1" />
                      Locked
                    </span>
                  )}
                  
                  {topicProgress.percentage === 100 && (
                    <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle size={14} className="mr-1" />
                      Completed
                    </span>
                  )}
                  
                  {topicData.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      topicData.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      topicData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      topicData.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {topicData.difficulty}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-lg mb-4">{topicData.description}</p>
              
              {/* Topic Stats */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <BookOpen size={16} className="mr-1" />
                  <span>{topicData.chapters?.length || 0} Chapters</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{topicData.estimatedTime || 0} minutes</span>
                </div>
                <div className="flex items-center">
                  <Target size={16} className="mr-1" />
                  <span>{topicProgress.percentage.toFixed(0)}% Complete</span>
                </div>
                {topicData.rating && (
                  <div className="flex items-center">
                    <Star size={16} className="mr-1 text-yellow-500" />
                    <span>{topicData.rating.toFixed(1)} rating</span>
                  </div>
                )}
              </div>

              {/* Content Types */}
              {topicData.contentTypes && topicData.contentTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {topicData.contentTypes.map((type) => {
                    const Icon = contentTypeIcons[type] || BookOpen;
                    return (
                      <div
                        key={type}
                        className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
                      >
                        <Icon size={14} className="mr-1" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Progress Card */}
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {topicProgress.percentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 mb-3">Progress</div>
                  <ProgressTracker 
                    progress={topicProgress.percentage}
                    size="lg"
                    showLabel={false}
                  />
                  <div className="mt-3 text-xs text-gray-500">
                    {topicProgress.completedChapters} of {topicProgress.totalChapters} chapters
                  </div>
                  {topicProgress.averageScore > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Average Score: {topicProgress.averageScore.toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Prerequisites Warning */}
          {!isUnlocked && prerequisites.length > 0 && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <Lock size={20} className="text-orange-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900 mb-2">Complete Prerequisites First</h4>
                  <p className="text-orange-800 text-sm mb-3">
                    You need to complete these topics before starting:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prerequisites.map(prereqId => (
                      <button
                        key={prereqId}
                        onClick={() => navigate(`/topic/${prereqId}`)}
                        className="px-3 py-1 bg-orange-100 text-orange-900 rounded-md text-sm hover:bg-orange-200 transition-colors"
                      >
                        {prereqId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* View Selector */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {viewOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedView(option.id)}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedView === option.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={16} className="mr-2" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Chapter Button (admin/teacher only) */}
            {user && (hasPermission?.('manage_chapters') || user.role === 'admin' || user.role === 'teacher') && (
              <button
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => navigate(`/chapters/new?topicId=${topicId}`)}
              >
                + Add Chapter
              </button>
            )}
            {/* CRUD Feedback */}
            {chapterCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
            {chapterCrudSuccess && <div className="text-green-600 mb-2">{chapterCrudSuccess}</div>}
            {chapterCrudError && <div className="text-red-600 mb-2">{chapterCrudError}</div>}
            {/* Content based on selected view */}
            {selectedView === 'chapters' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Chapters</h2>
                {topicData.chapters?.map((chapter, index) => (
                  <div key={chapter.id} className="relative">
                    <ChapterCard
                      chapter={chapter}
                      progress={userProgress?.chapters?.[chapter.id]}
                      isLocked={!isUnlocked}
                      chapterNumber={index + 1}
                      onStart={() => handleStartChapter(chapter.id)}
                      onComplete={(timeSpent, quizScore) => handleChapterComplete(chapter.id, timeSpent, quizScore)}
                    />
                    {/* Edit/Delete controls (admin/teacher only) */}
                    {user && (hasPermission?.('manage_chapters') || user.role === 'admin' || user.role === 'teacher') && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                          onClick={() => navigate(`/chapters/${chapter.id}/edit?topicId=${topicId}`)}
                        >Edit</button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          onClick={() => handleDeleteChapter(chapter.id)}
                        >Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedView === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Objectives</h2>
                  {topicData.learningObjectives && topicData.learningObjectives.length > 0 ? (
                    <ul className="space-y-2">
                      {topicData.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <Target size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No learning objectives defined for this topic.</p>
                  )}
                </div>

                {topicData.skills && topicData.skills.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills You'll Develop</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topicData.skills.map((skill, index) => (
                        <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <Lightbulb size={16} className="text-blue-500 mr-2" />
                          <span className="text-blue-900 font-medium">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {topicData.realWorldApplications && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-World Applications</h2>
                    <div className="prose prose-sm text-gray-700">
                      <p>{topicData.realWorldApplications}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedView === 'resources' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Resources</h2>
                
                {/* Placeholder for resources - would be populated from API */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Study Guide</h3>
                    <p className="text-sm text-gray-600 mb-3">Comprehensive study materials and notes</p>
                    <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Download size={14} className="mr-1" />
                      Download PDF
                    </button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Practice Problems</h3>
                    <p className="text-sm text-gray-600 mb-3">Additional exercises and solutions</p>
                    <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Download size={14} className="mr-1" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {isUnlocked && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {topicProgress.percentage === 0 && (
                    <button
                      onClick={() => navigate(`/chapter/${topicData.chapters[0]?.id}`)}
                      className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Start First Chapter
                    </button>
                  )}
                  
                  {topicProgress.percentage > 0 && topicProgress.percentage < 100 && (
                    <button
                      onClick={() => {
                        const nextChapter = topicData.chapters.find(ch => 
                          !userProgress?.chapters?.[ch.id]?.completed
                        );
                        if (nextChapter) navigate(`/chapter/${nextChapter.id}`);
                      }}
                      className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Continue Learning
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate(`/questions?topic=${topicId}`)}
                    className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Practice Questions
                  </button>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {topicRecommendations.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp size={20} className="mr-2 text-blue-500" />
                  Related Topics
                </h3>
                <div className="space-y-3">
                  {topicRecommendations.slice(0, 3).map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => navigate(`/topic/${rec.id}`)}
                      className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="font-medium text-gray-900 mb-1">{rec.title}</div>
                      <div className="text-sm text-gray-600">{rec.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 size={20} className="mr-2 text-green-500" />
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-semibold text-gray-900">
                    {topicProgress.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Chapters Done</span>
                  <span className="font-semibold text-green-600">
                    {topicProgress.completedChapters}/{topicProgress.totalChapters}
                  </span>
                </div>
                {topicProgress.averageScore > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Average Score</span>
                    <span className="font-semibold text-blue-600">
                      {topicProgress.averageScore.toFixed(0)}%
                    </span>
                  </div>
                )}
                {topicProgress.totalTime > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time Spent</span>
                    <span className="font-semibold text-orange-600">
                      {Math.round(topicProgress.totalTime)} min
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users size={20} className="mr-2 text-purple-500" />
                Community
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Students Enrolled</span>
                  <span className="font-semibold text-purple-600">
                    {topicData.enrolledCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-purple-600">
                    {topicData.completionRate || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold text-purple-600 flex items-center">
                    <Star size={14} className="mr-1 text-yellow-500" />
                    {topicData.rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topic;