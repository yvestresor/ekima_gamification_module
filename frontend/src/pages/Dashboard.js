import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Target, Clock, Star, Users, BookOpen, Trophy } from 'lucide-react';

// Component imports
import SubjectCard from '../components/learning/SubjectCard';
import RecommendedTopics from '../components/recommendations/RecommendedTopics';
import UserStats from '../components/user/UserStats';
import ProgressTracker from '../components/learning/ProgressTracker';
import AchievementCard from '../components/gamification/AchievementCard';
import StreakTracker from '../components/gamification/StreakTracker';
import Leaderboard from '../components/gamification/Leaderboard';


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
  const [isLoadingData, setIsLoadingData] = useState(false);
  const loadingRef = useRef(false);
  const {user} = useAuth();

  console.log('Dashboard user:', user);

  const loadDashboardData = useCallback(async () => {
    if (isLoadingData || loadingRef.current) {
      console.log('Dashboard data already loading, skipping...');
      return;
    }
    
    if (!user || !user._id) {
      console.log('No user available for dashboard loading');
      return;
    }
    
    // Add timeout to prevent hanging
    const loadingTimeout = setTimeout(() => {
      console.warn('Dashboard loading timeout - providing fallback data');
      setDashboardData({
        user: user,
        progress: [],
        achievements: [],
        topics: [],
        subjects: [],
        quizAttempts: [],
      });
      setRecommendations([]);
      loadingRef.current = false;
      setLoading(false);
      setIsLoadingData(false);
    }, 10000); // 10 second timeout

    try {
      console.log('Starting dashboard data load...');
      loadingRef.current = true;
      setIsLoadingData(true);
      setLoading(true);
      setError(null);
      
      // Try to load data from actual APIs, with fallback to empty data
      let userProfile = { data: user };
      let subjects = { data: [] };
      let userProgress = { data: [] };
      let userQuizAttempts = { data: [] };
      let badges = { data: [] };

      try {
        // Try each API call individually to identify which one is failing
        userProfile = await userAPI.getProfile();
      } catch (err) {
        console.warn('Failed to load user profile:', err.message);
      }

      try {
        subjects = await contentAPI.getSubjects();
      } catch (err) {
        console.warn('Failed to load subjects:', err.message);
      }

      try {
        userProgress = await progressAPI.getUserProgress(user._id);
      } catch (err) {
        console.warn('Failed to load user progress:', err.message);
      }

      try {
        userQuizAttempts = await quizAttemptAPI.getByUser(user._id);
      } catch (err) {
        console.warn('Failed to load quiz attempts:', err.message);
      }

      try {
        badges = await badgeAPI.getAll();
      } catch (err) {
        console.warn('Failed to load badges:', err.message);
      }

      setDashboardData({
        user: userProfile.data || user,
        progress: userProgress.data || [],
        achievements: badges.data || [],
        topics: [], // Will be loaded separately if needed
        subjects: subjects.data || [],
        quizAttempts: userQuizAttempts.data || [],
      });

      // Generate recommendations based on actual data
      const recs = generateRecommendations(
        userProfile.data || user,
        userProgress.data || [],
        userQuizAttempts.data || [],
        [], // topics - loaded separately if needed
        subjects.data || []
      );
      setRecommendations(recs);
      
      // Clear the timeout since loading completed successfully
      clearTimeout(loadingTimeout);

    } catch (err) {
      console.error('Dashboard loading error:', err);
      // Set empty data to allow dashboard to render
      setDashboardData({
        user: user,
        progress: [],
        achievements: [],
        topics: [],
        subjects: [],
        quizAttempts: [],
      });
      setRecommendations([]);
      // Clear timeout in error case as well
      clearTimeout(loadingTimeout);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setIsLoadingData(false);
      console.log('Dashboard data load completed.');
    }
  }, [user]); // Only depend on user

  useEffect(() => {
    console.log('Dashboard useEffect triggered, user:', user);
    if (user && user._id) {
      loadDashboardData();
    } else if (user === null) {
      // User is explicitly null (logged out), stop loading
      setLoading(false);
    }
    // If user is undefined, keep loading until AuthContext resolves
  }, [user]); // Remove loadDashboardData from dependencies to prevent infinite loop

  // Failsafe: if data arrives but loading hasn't flipped yet, flip it off
  useEffect(() => {
    if (dashboardData && loading) {
      setLoading(false);
    }
  }, [dashboardData, loading]);

  // Global timeout fallback to ensure UI never stays stuck in loading
  useEffect(() => {
    if (!loading) return;
    const hardStop = setTimeout(() => {
      console.warn('Dashboard hard-stop timeout hit. Forcing loading=false.');
      setLoading(false);
    }, 1000); // 1s hard stop
    return () => clearTimeout(hardStop);
  }, [loading]);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your dashboard.</p>
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
  const displayName = (safeUser.name && typeof safeUser.name === 'string') ? safeUser.name.split(' ')[0] : 
                    (safeUser.username && typeof safeUser.username === 'string') ? safeUser.username.split(' ')[0] : 'User';

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
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
                {/* User Stats */}
                <UserStats 
                  user={user} 
                  progress={progress} 
                  achievements={achievements} 
                />
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
                  {subjects.length === 0 ? (
                    <div className="bg-white rounded-lg border p-8 text-center">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Start your learning journey by exploring available subjects!
                      </p>
                      <button 
                        onClick={() => navigate('/subjects')}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Browse Subjects
                      </button>
                    </div>
                  ) : (
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
                  )}
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
              {/* Leaderboard */}
              <Leaderboard 
                currentUserId={user?._id}
                type="xp"
                compact={true}
                maxDisplay={5}
              />
              
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
            
            {/* Recent Achievements */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Achievements</h3>
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {achievements.length === 0 ? (
                <div className="text-center py-6">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">No Achievements Yet</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Complete lessons and quizzes to earn your first badges!
                  </p>
                  <button 
                    onClick={() => navigate('/subjects')}
                    className="text-orange-600 hover:text-orange-700 text-xs font-medium"
                  >
                    Start Learning →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.slice(0, 3).map(achievement => (
                    <AchievementCard 
                      key={achievement._id}
                      achievement={achievement}
                      compact={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;