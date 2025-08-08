import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Target, Clock, Star, Users, BookOpen, Trophy } from 'lucide-react';

// Component imports
import SubjectCard from '../components/learning/SubjectCard';
import RecommendedTopics from '../components/recommendations/RecommendedTopics';
import UserStats from '../components/user/UserStats';
import ProgressTracker from '../components/learning/ProgressTracker';
import AchievementCard from '../components/gamification/AchievementCard';
import StreakTracker from '../components/gamification/StreakTracker';
import LearningPath from '../components/recommendations/LearningPath';
import SmartSuggestions from '../components/recommendations/SmartSuggestions';
import UserProfile from '../components/user/UserProfile';

// Service imports
import { userAPI, contentAPI, progressAPI, quizAttemptAPI, badgeAPI, recommendationAPI } from '../services/api';
import { generateRecommendations } from '../utils/recommendationAlgorithm';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const {user} = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getProfile(user._id); // or the current user's id
      setDashboardData({
        user: data.user || {},
        progress: data.progress || [],
        achievements: data.achievements || [],
        topics: data.topics || [],
        subjects: data.subjects || [],
        quizAttempts: data.quizAttempts || [],
      });

      // Generate recommendations (if needed)
      const recs = generateRecommendations(
        data.user || {},
        data.progress || [],
        data.quizAttempts || [],
        data.topics || [],
        data.subjects || []
      );
      setRecommendations(recs);

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subject) => {
    navigate(`/subject/${subject._id}`);
  };

  const handleTopicClick = (topic) => {
    navigate(`/topic/${topic._id}`);
  };

  const handleRecommendationClick = (recommendation) => {
    // Track recommendation usage
    console.log('Recommendation clicked:', recommendation);
    navigate(`/topic/${recommendation._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Defensive: ensure dashboardData and its fields are defined
  const dashboardUser = dashboardData?.user || {};
  const subjects = dashboardData?.subjects || [];
  const progress = dashboardData?.progress || [];
  const achievements = dashboardData?.achievements || [];

  // Defensive: ensure user is defined
  const safeUser = user || dashboardUser || {};
  const displayName = (safeUser.name && typeof safeUser.name === 'string') ? safeUser.name.split(' ')[0] : 'User';

  // Calculate overall stats
  const totalProgress = progress.length > 0
    ? progress.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / progress.length
    : 0;
  const totalTimeSpent = Math.round((safeUser.timeSpent || 0) / 3600000); // Convert to hours
  const completedChapters = progress.filter(p => p.isCompleted).length;
  const totalChapters = progress.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Continue your learning journey with personalized recommendations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <StreakTracker streak={safeUser.streak} />
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Study Time</p>
                <p className="text-2xl font-bold text-orange-600">{totalTimeSpent}h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Dashboard Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lg:col-span-2">
            {/* Existing dashboard content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Progress</p>
                        <p className="text-2xl font-bold text-gray-900">{Math.round(totalProgress)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{completedChapters}/{totalChapters}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Gems</p>
                        <p className="text-2xl font-bold text-gray-900">{user.gems}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Trophy className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Achievements</p>
                        <p className="text-2xl font-bold text-gray-900">{achievements.filter(a => a.unlocked).length}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Recommended Topics Section */}
                <RecommendedTopics 
                  recommendations={recommendations}
                  onTopicClick={handleRecommendationClick}
                />
                {/* Subjects Grid */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Subjects</h2>
                    <button 
                      onClick={() => navigate('/subjects')}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subjects.map(subject => {
                      // Calculate subject progress from user progress data
                      const subjectProgress = progress.filter(p => 
                        // This would need to be properly mapped in your real API
                        p.chapterId.includes(subject.name.toLowerCase())
                      );
                      const avgProgress = subjectProgress.length > 0 
                        ? subjectProgress.reduce((sum, p) => sum + p.overallProgress, 0) / subjectProgress.length
                        : 0;
                      const isRecommended = recommendations.some(rec => 
                        rec.subject === subject._id
                      );
                      return (
                        <SubjectCard
                          key={subject._id}
                          subject={{
                            ...subject,
                            progress: Math.round(avgProgress),
                            isRecommended
                          }}
                          onClick={() => handleSubjectClick(subject)}
                        />
                      );
                    })}
                  </div>
                </div>
                {/* Recent Progress */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Progress</h2>
                  <ProgressTracker 
                    progress={progress.slice(0, 5)} 
                    subjects={subjects}
                  />
                </div>
              </div>
              {/* Sidebar */}
              <div className="space-y-6">
                {/* User Stats */}
                <UserStats user={user} />
                {/* Achievements */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
                    <button 
                      onClick={() => navigate('/profile')}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {achievements.slice(0, 4).map(achievement => (
                      <AchievementCard 
                        key={achievement._id}
                        achievement={achievement}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/experiments')}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          🧪
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Try Experiments</p>
                          <p className="text-sm text-gray-500">Interactive lab simulations</p>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => navigate('/videos')}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          📹
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Watch Videos</p>
                          <p className="text-sm text-gray-500">Educational content</p>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => navigate('/questions')}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          ❓
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Practice Quizzes</p>
                          <p className="text-sm text-gray-500">Test your knowledge</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* New Sidebar Widgets */}
          <div className="space-y-6">
            <UserProfile variant="compact" />
            <LearningPath variant="mini" />
            <SmartSuggestions variant="compact" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;