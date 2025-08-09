// src/pages/Progress.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
  BookOpen,
  CheckCircle,
  Star,
  Zap,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Eye,
  Users,
  Flame,
  Trophy,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../context/ProgressContext';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';
import { contentAPI } from '../services/api'; // or wherever your API service is

// Import components
import ProgressTracker from '../components/learning/ProgressTracker';
import Loading from '../components/common/Loading';

// Import utilities
import { 
  formatDate, 
  formatDuration, 
  getTimePeriod, 
  getStudyStats,
  createDateRange 
} from '../utils/dateUtils';
import { 
  calculateSubjectProgress, 
  calculatePerformanceMetrics 
} from '../utils/progressCalculator';

const Progress = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [selectedPeriod, setSelectedPeriod] = useState('thisWeek');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all');
  const [viewMode, setViewMode] = useState('overview');
  const [sortBy, setSortBy] = useState('progress');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Contexts and hooks
  const { userProgress, learningHistory } = useProgress();
  const { totalXP, levelInfo, streakData, achievements } = useGamification();
  const { user } = useAuth();
  const { level = 0, progressToNextLevel = 0, xpToNextLevel = 0 } = levelInfo || {};
  const { currentStreak = 0, longestStreak = 0 } = streakData || {};
  const safeAchievements = Array.isArray(achievements) ? achievements : [];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const res = await contentAPI.getSubjects(); // Adjust to your API
        setSubjects(res.data); // Ensure this matches your API response shape
      } catch (err) {
        setSubjects([]);
        // Optionally handle error
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Time periods for filtering
  const timePeriods = [
    { id: 'today', label: 'Today' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'last7Days', label: 'Last 7 Days' },
    { id: 'last30Days', label: 'Last 30 Days' },
    { id: 'allTime', label: 'All Time' }
  ];

  // View modes
  const viewModes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'subjects', label: 'By Subject', icon: BookOpen },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: Target }
  ];

  // Get time period data
  const periodData = selectedPeriod !== 'allTime' ? getTimePeriod(selectedPeriod) : null;

  // Calculate performance metrics
  const performanceMetrics = calculatePerformanceMetrics(userProgress);

  // Get study statistics for the selected period
  const studyStats = getStudyStats(
    learningHistory || [],
    periodData?.start || new Date(0),
    periodData?.end || new Date()
  );

  // Get subject progress data
  const getSubjectProgressData = () => {
    return subjects.map(subject => {
      const progress = calculateSubjectProgress(subject, userProgress);
      return {
        id: subject._id || subject.id,
        name: subject.name,
        color: subject.color,
        icon: subject.icon,
        ...progress,
        topics: Object.values(subject.topics).map(topic => ({
          id: topic.id,
          name: topic.name,
          progress: userProgress?.topics?.[topic.id] || { completed: false, percentage: 0 }
        }))
      };
    }).sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return sortOrder === 'desc' ? b.percentage - a.percentage : a.percentage - b.percentage;
        case 'name':
          return sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
        case 'xp':
          return sortOrder === 'desc' ? b.totalXP - a.totalXP : a.totalXP - b.totalXP;
        default:
          return 0;
      }
    });
  };

  // Filter subjects
  const subjectProgressData = getSubjectProgressData().filter(subject => 
    selectedSubject === 'all' || subject.id === selectedSubject
  );

  // Get recent activity
  const getRecentActivity = () => {
    if (!userProgress?.chapters) return [];
    
    return Object.entries(userProgress.chapters)
      .filter(([_, progress]) => progress.completedAt)
      .sort((a, b) => new Date(b[1].completedAt) - new Date(a[1].completedAt))
      .slice(0, 10)
      .map(([chapterId, progress]) => ({
        id: chapterId,
        type: 'chapter_completed',
        title: progress.chapterName || `Chapter ${chapterId}`,
        subject: progress.subjectId,
        date: progress.completedAt,
        xp: progress.xpEarned || 0,
        score: progress.quizScore || 0
      }));
  };

  // Get weekly progress chart data
  const getWeeklyProgressData = () => {
    const dates = createDateRange(
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // Last 7 days
      new Date()
    );

    return dates.map(date => {
      const dateStr = date.toDateString();
      const dayProgress = learningHistory?.filter(session => 
        new Date(session.date).toDateString() === dateStr
      ) || [];

      return {
        date: formatDate(date, 'shortWeekday'),
        fullDate: date,
        sessions: dayProgress.length,
        xp: dayProgress.reduce((sum, session) => sum + (session.xpEarned || 0), 0),
        studyTime: dayProgress.reduce((sum, session) => sum + (session.timeSpent || 0), 0)
      };
    });
  };

  const weeklyData = getWeeklyProgressData();

  // Toggle subject expansion
  const toggleSubjectExpansion = (subjectId) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  if (loadingSubjects) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
              <p className="text-gray-600 mt-1">Track your learning journey and achievements</p>
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              {/* Period Filter */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-black text-sm"
              >
                {timePeriods.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>

              {/* Export Button */}
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black">
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${viewMode === mode.id 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon size={16} className="mr-2" />
                    {mode.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total XP</p>
                    <p className="text-3xl font-bold text-blue-600">{totalXP}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap size={24} className="text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUp size={16} className="text-green-500 mr-1" />
                  <span className="text-green-600">+250 this week</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Current Level</p>
                    <p className="text-3xl font-bold text-purple-600">{level}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star size={24} className="text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressTracker 
                    progress={progressToNextLevel}
                    color="purple"
                    size="sm"
                    showLabel={false}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {xpToNextLevel} XP to Level {level + 1}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Study Streak</p>
                    <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Flame size={24} className="text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Best: {longestStreak} days
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Achievements</p>
                    <p className="text-3xl font-bold text-green-600">{safeAchievements.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trophy size={24} className="text-green-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  +2 this week
                </div>
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Study Sessions
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    XP Earned
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4">
                {weeklyData.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 mb-2">{day.date}</div>
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-20">
                          <div
                            className="bg-blue-500 rounded-full transition-all duration-300"
                            style={{ 
                              height: `${Math.max(day.sessions * 20, 4)}%`,
                              width: '50%'
                            }}
                          />
                          <div
                            className="bg-green-500 rounded-full transition-all duration-300 ml-auto"
                            style={{ 
                              height: `${Math.max(day.xp / 10, 4)}%`,
                              width: '50%',
                              marginTop: `-${Math.max(day.sessions * 20, 4)}%`
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="text-blue-600 font-medium">{day.sessions}</div>
                        <div className="text-green-600 font-medium">{day.xp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {getRecentActivity().map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-600">
                        Score: {activity.score}% • +{activity.xp} XP
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(activity.date, 'relative')}
                    </div>
                  </div>
                ))}
                
                {getRecentActivity().length === 0 && (
                  <div className="text-center py-8">
                    <Activity size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                    <p className="text-sm text-gray-500">Complete a chapter to see your progress here!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subjects Mode */}
        {viewMode === 'subjects' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-black text-sm"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject._id || subject.id} value={subject._id || subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-black text-sm"
                  >
                    <option value="progress">Sort by Progress</option>
                    <option value="name">Sort by Name</option>
                    <option value="xp">Sort by XP</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {sortOrder === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Subject Progress Cards */}
            <div className="space-y-4">
              {subjectProgressData.map((subject) => (
                <div key={subject.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleSubjectExpansion(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${subject.color}20` }}
                        >
                          <BookOpen size={24} style={{ color: subject.color }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                          <p className="text-sm text-gray-600">
                            {subject.completedChapters} of {subject.totalChapters} chapters completed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: subject.color }}>
                            {Math.round(subject.percentage)}%
                          </div>
                          <div className="text-sm text-gray-600">
                            {subject.totalXP || 0} XP earned
                          </div>
                        </div>

                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          {expandedSubjects.has(subject.id) ? 
                            <ChevronDown size={20} /> : 
                            <ChevronRight size={20} />
                          }
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <ProgressTracker 
                        progress={subject.percentage}
                        color={subject.color === '#3B82F6' ? 'blue' : 
                               subject.color === '#EF4444' ? 'red' :
                               subject.color === '#10B981' ? 'green' : 'purple'}
                        size="md"
                        showLabel={false}
                      />
                    </div>
                  </div>

                  {/* Expanded Topic Details */}
                  {expandedSubjects.has(subject.id) && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-4">Topics Progress</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subject.topics.map((topic) => (
                          <div 
                            key={topic.id} 
                            className="bg-white p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all"
                            onClick={() => navigate(`/topic/${topic.id}`)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{topic.name}</h5>
                              <span className="text-sm text-gray-600">
                                {Math.round(topic.progress.percentage || 0)}%
                              </span>
                            </div>
                            <ProgressTracker 
                              progress={topic.progress.percentage || 0}
                              color="blue"
                              size="sm"
                              showLabel={false}
                            />
                            {topic.progress.completed && (
                              <div className="mt-2 flex items-center text-green-600 text-sm">
                                <CheckCircle size={14} className="mr-1" />
                                Completed
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Mode */}
        {viewMode === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Overview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Quiz Score</span>
                    <span className="font-semibold text-blue-600">
                      {performanceMetrics.averageQuizScore.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-semibold text-green-600">
                      {performanceMetrics.completionRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Learning Velocity</span>
                    <span className="font-semibold text-purple-600">
                      {performanceMetrics.learningVelocity.toFixed(1)} chapters/week
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Time per Chapter</span>
                    <span className="font-semibold text-orange-600">
                      {formatDuration(performanceMetrics.averageTimePerChapter, true)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Strong vs Weak Subjects */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
                
                {performanceMetrics.strongSubjects.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-700 mb-2">Strong Areas</h4>
                    <div className="space-y-2">
                      {performanceMetrics.strongSubjects.map((subject, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 capitalize">
                            {subject.subject.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            {subject.averageScore.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {performanceMetrics.weakSubjects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-orange-700 mb-2">Areas for Improvement</h4>
                    <div className="space-y-2">
                      {performanceMetrics.weakSubjects.map((subject, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 capitalize">
                            {subject.subject.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-medium text-orange-600">
                            {subject.averageScore.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {performanceMetrics.strongSubjects.length === 0 && performanceMetrics.weakSubjects.length === 0 && (
                  <div className="text-center py-8">
                    <Target size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">No performance data yet</p>
                    <p className="text-sm text-gray-500">Complete some quizzes to see your performance analysis!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Mode */}
        {viewMode === 'timeline' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Timeline</h3>
            
            <div className="space-y-4">
              {getRecentActivity().map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    {index < getRecentActivity().length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(activity.date, 'relative')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Completed with {activity.score}% score • Earned {activity.xp} XP
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDate(activity.date, 'datetime')}
                    </div>
                  </div>
                </div>
              ))}
              
              {getRecentActivity().length === 0 && (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">No activity timeline yet</p>
                  <p className="text-sm text-gray-500">Start learning to build your timeline!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;