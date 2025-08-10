// src/pages/Profile.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  Edit3,
  Camera,
  Save,
  X,
  Settings,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Calendar,
  MapPin,
  School,
  Award,
  BarChart3,
  Clock,
  Target,
  Zap,
  Star,
  Flame,
  BookOpen,
  TrendingUp,
  Users,
  Heart,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Palette,
  Trophy,
  ChevronDown
} from 'lucide-react';

// Import contexts and hooks
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useGamification } from '../hooks/useGamification';
import { userAPI, quizAttemptAPI, recommendationAPI } from '../services/api';

// Import components
import UserDashboard from '../components/user/UserDashboard';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import ProgressTracker from '../components/learning/ProgressTracker';
import Loading from '../components/common/Loading';
import UserSettings from '../components/user/UserSettings';

// Import utilities
import { formatDate, formatDuration } from '../utils/dateUtils';
import { calculatePerformanceMetrics } from '../utils/progressCalculator';

const Profile = () => {
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      streak: true,
      achievements: true,
      reminders: true
    },
    privacy: {
      profileVisible: true,
      progressVisible: true,
      achievementsVisible: true
    },
    learning: {
      autoPlay: true,
      soundEffects: true,
      dailyGoal: 60, // minutes
      reminderTime: '19:00'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Contexts and hooks
  const { user, updateProfile, changePassword, deleteAccount, hasPermission } = useAuth();
  const { userProgress } = useProgress();
  const { 
    totalXP, 
    gems, 
    coins, 
    levelInfo, 
    achievements, 
    streakData, 
    dailyGoals,
    updateDailyGoals 
  } = useGamification();

  // Initialize profile form
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        school: user.school || '',
        grade: user.grade || '',
        interests: user.interests || [],
        avatar: user.profilePic || user.avatar || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      setLoading(true);
      userAPI.getProfile()
        .then((response) => {
          setDashboardData(response.data);
        })
        .catch((err) => {
          setError('Failed to load profile data');
          console.error('Profile loading error:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  // Add admin/teacher specific tabs
  if (user && (user.role === 'admin' || user.role === 'teacher')) {
    tabs.push(
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'recommendations', label: 'Recommendations', icon: Target },
      { id: 'quizAttempts', label: 'Quiz Attempts', icon: BarChart3 }
    );
  }

  // User management state
  const [users, setUsers] = useState([]);
  const [userCrudLoading, setUserCrudLoading] = useState(false);
  const [userCrudError, setUserCrudError] = useState(null);
  const [userCrudSuccess, setUserCrudSuccess] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'student', password: '' });

  // Fetch users for management
  useEffect(() => {
    if (activeTab === 'users' && user && (user.role === 'admin' || user.role === 'teacher')) {
      setUserCrudLoading(true);
      userAPI.getAll()
        .then(res => { setUsers(res.data || []); setUserCrudLoading(false); })
        .catch(err => { setUserCrudError('Failed to load users'); setUserCrudLoading(false); });
    }
  }, [activeTab, user]);

  // User CRUD handlers
  const handleAddUser = async () => {
    setUserCrudLoading(true); setUserCrudError(null); setUserCrudSuccess(null);
    try {
      await userAPI.create(userForm);
      setUserCrudSuccess('User added successfully');
      setShowAddUserModal(false);
      setUserForm({ name: '', email: '', role: 'student', password: '' });
      // Refresh users
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      setUserCrudError('Failed to add user');
    } finally {
      setUserCrudLoading(false);
    }
  };
  const handleEditUser = async () => {
    setUserCrudLoading(true); setUserCrudError(null); setUserCrudSuccess(null);
    try {
      await userAPI.update(editUser._id, userForm);
      setUserCrudSuccess('User updated successfully');
      setShowEditUserModal(false);
      setEditUser(null);
      setUserForm({ name: '', email: '', role: 'student', password: '' });
      // Refresh users
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      setUserCrudError('Failed to update user');
    } finally {
      setUserCrudLoading(false);
    }
  };
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setUserCrudLoading(true); setUserCrudError(null); setUserCrudSuccess(null);
    try {
      await userAPI.delete(userId);
      setUserCrudSuccess('User deleted successfully');
      // Refresh users
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (err) {
      setUserCrudError('Failed to delete user');
    } finally {
      setUserCrudLoading(false);
    }
  };

  // Recommendation management state
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationCrudLoading, setRecommendationCrudLoading] = useState(false);
  const [recommendationCrudError, setRecommendationCrudError] = useState(null);
  const [recommendationCrudSuccess, setRecommendationCrudSuccess] = useState(null);
  const [showAddRecommendationModal, setShowAddRecommendationModal] = useState(false);
  const [showEditRecommendationModal, setShowEditRecommendationModal] = useState(false);
  const [editRecommendation, setEditRecommendation] = useState(null);
  const [recommendationForm, setRecommendationForm] = useState({ title: '', description: '', subject: '', topic: '', type: 'topic', priority: 1, reasoning: '', contentTypes: [], confidence: 1 });

  // Fetch recommendations for management
  useEffect(() => {
    if (activeTab === 'recommendations' && user && (user.role === 'admin' || user.role === 'teacher')) {
      setRecommendationCrudLoading(true);
      recommendationAPI.getAll()
        .then(res => { setRecommendations(res.data || []); setRecommendationCrudLoading(false); })
        .catch(err => { setRecommendationCrudError('Failed to load recommendations'); setRecommendationCrudLoading(false); });
    }
  }, [activeTab, user]);

  // Recommendation CRUD handlers
  const handleAddRecommendation = async () => {
    setRecommendationCrudLoading(true); setRecommendationCrudError(null); setRecommendationCrudSuccess(null);
    try {
      await recommendationAPI.create(recommendationForm);
      setRecommendationCrudSuccess('Recommendation added successfully');
      setShowAddRecommendationModal(false);
      setRecommendationForm({ title: '', description: '', subject: '', topic: '', type: 'topic', priority: 1, reasoning: '', contentTypes: [], confidence: 1 });
      // Refresh recommendations
      const res = await recommendationAPI.getAll();
      setRecommendations(res.data);
    } catch (err) {
      setRecommendationCrudError('Failed to add recommendation');
    } finally {
      setRecommendationCrudLoading(false);
    }
  };
  const handleEditRecommendation = async () => {
    setRecommendationCrudLoading(true); setRecommendationCrudError(null); setRecommendationCrudSuccess(null);
    try {
      await recommendationAPI.update(editRecommendation._id, recommendationForm);
      setRecommendationCrudSuccess('Recommendation updated successfully');
      setShowEditRecommendationModal(false);
      setEditRecommendation(null);
      setRecommendationForm({ title: '', description: '', subject: '', topic: '', type: 'topic', priority: 1, reasoning: '', contentTypes: [], confidence: 1 });
      // Refresh recommendations
      const res = await recommendationAPI.getAll();
      setRecommendations(res.data);
    } catch (err) {
      setRecommendationCrudError('Failed to update recommendation');
    } finally {
      setRecommendationCrudLoading(false);
    }
  };
  const handleDeleteRecommendation = async (recommendationId) => {
    if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
    setRecommendationCrudLoading(true); setRecommendationCrudError(null); setRecommendationCrudSuccess(null);
    try {
      await recommendationAPI.delete(recommendationId);
      setRecommendationCrudSuccess('Recommendation deleted successfully');
      // Refresh recommendations
      const res = await recommendationAPI.getAll();
      setRecommendations(res.data);
    } catch (err) {
      setRecommendationCrudError('Failed to delete recommendation');
    } finally {
      setRecommendationCrudLoading(false);
    }
  };

  // Quiz attempt management state
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizAttemptCrudLoading, setQuizAttemptCrudLoading] = useState(false);
  const [quizAttemptCrudError, setQuizAttemptCrudError] = useState(null);
  const [quizAttemptCrudSuccess, setQuizAttemptCrudSuccess] = useState(null);
  const [showAddQuizAttemptModal, setShowAddQuizAttemptModal] = useState(false);
  const [showEditQuizAttemptModal, setShowEditQuizAttemptModal] = useState(false);
  const [editQuizAttempt, setEditQuizAttempt] = useState(null);
  const [quizAttemptForm, setQuizAttemptForm] = useState({ user: '', quiz: '', score: 0, timeSpent: 0, date: '', answers: [] });

  // Fetch quiz attempts for management
  useEffect(() => {
    if (activeTab === 'quizAttempts' && user && (user.role === 'admin' || user.role === 'teacher')) {
      setQuizAttemptCrudLoading(true);
      quizAttemptAPI.getAll()
        .then(res => { setQuizAttempts(res.data || []); setQuizAttemptCrudLoading(false); })
        .catch(err => { setQuizAttemptCrudError('Failed to load quiz attempts'); setQuizAttemptCrudLoading(false); });
    }
  }, [activeTab, user]);

  // Quiz attempt CRUD handlers
  const handleAddQuizAttempt = async () => {
    setQuizAttemptCrudLoading(true); setQuizAttemptCrudError(null); setQuizAttemptCrudSuccess(null);
    try {
      await quizAttemptAPI.create(quizAttemptForm);
      setQuizAttemptCrudSuccess('Quiz attempt added successfully');
      setShowAddQuizAttemptModal(false);
      setQuizAttemptForm({ user: '', quiz: '', score: 0, timeSpent: 0, date: '', answers: [] });
      // Refresh quiz attempts
      const res = await quizAttemptAPI.getAll();
      setQuizAttempts(res.data);
    } catch (err) {
      setQuizAttemptCrudError('Failed to add quiz attempt');
    } finally {
      setQuizAttemptCrudLoading(false);
    }
  };
  const handleEditQuizAttempt = async () => {
    setQuizAttemptCrudLoading(true); setQuizAttemptCrudError(null); setQuizAttemptCrudSuccess(null);
    try {
      await quizAttemptAPI.update(editQuizAttempt._id, quizAttemptForm);
      setQuizAttemptCrudSuccess('Quiz attempt updated successfully');
      setShowEditQuizAttemptModal(false);
      setEditQuizAttempt(null);
      setQuizAttemptForm({ user: '', quiz: '', score: 0, timeSpent: 0, date: '', answers: [] });
      // Refresh quiz attempts
      const res = await quizAttemptAPI.getAll();
      setQuizAttempts(res.data);
    } catch (err) {
      setQuizAttemptCrudError('Failed to update quiz attempt');
    } finally {
      setQuizAttemptCrudLoading(false);
    }
  };
  const handleDeleteQuizAttempt = async (quizAttemptId) => {
    if (!window.confirm('Are you sure you want to delete this quiz attempt?')) return;
    setQuizAttemptCrudLoading(true); setQuizAttemptCrudError(null); setQuizAttemptCrudSuccess(null);
    try {
      await quizAttemptAPI.delete(quizAttemptId);
      setQuizAttemptCrudSuccess('Quiz attempt deleted successfully');
      // Refresh quiz attempts
      const res = await quizAttemptAPI.getAll();
      setQuizAttempts(res.data);
    } catch (err) {
      setQuizAttemptCrudError('Failed to delete quiz attempt');
    } finally {
      setQuizAttemptCrudLoading(false);
    }
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    // Reset form to original user data
    if (user) {
      setProfileForm({
        name: user.name || user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        school: user.school || '',
        grade: user.grade || '',
        interests: user.interests || [],
        avatar: user.profilePic || user.avatar || ''
      });
    }
    setIsEditing(false);
    setError(null);
  };

  // Handle profile form submission
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Update user profile via API
      const result = await updateProfile(profileForm);
      
      if (result && result.success === false) {
        setError(result.error || 'Failed to update profile');
        return;
      }
      
      setIsEditing(false);
      
      // Show success message (optional)
      setTimeout(() => {
        // Could add a success toast here
      }, 100);
      
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle preferences update
  const handleUpdatePreferences = async (newPreferences) => {
    try {
      setPreferences(newPreferences);
      // Save to backend/localStorage
      localStorage.setItem('ekima_preferences', JSON.stringify(newPreferences));
    } catch (err) {
      console.error('Preferences update error:', err);
    }
  };

  // Handle daily goals update
  const handleUpdateDailyGoals = async (newGoals) => {
    try {
      await updateDailyGoals(newGoals);
    } catch (err) {
      console.error('Daily goals update error:', err);
    }
  };

  // Calculate performance metrics
  const performanceMetrics = calculatePerformanceMetrics(userProgress);

  // Get recent achievements
  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const recentAchievements = safeAchievements
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, 6);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon size={16} className="mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Profile Header Card - IMPROVED VERSION */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Cover Background */}
              <div className="h-32 relative">
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              </div>

              <div className="px-6 pb-6">
                <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center md:items-start -mt-16 relative z-10">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center text-4xl font-bold text-orange-600 overflow-hidden">
                        {user?.profilePic || user?.avatar ? (
                          <img 
                            src={user.profilePic || user.avatar} 
                            alt={user?.name || 'Profile'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={48} className="text-orange-500" />
                        )}
                      </div>
                      
                      {isEditing && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Camera size={24} />
                        </button>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const { uploadAPI } = await import('../services/api');
                              const response = await uploadAPI.uploadProfilePic(file);
                              setProfileForm(prev => ({ ...prev, avatar: response.data.url }));
                            } catch (err) {
                              console.error('Upload failed:', err);
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </div>

                    {/* Level Badge */}
                    <div className="mt-4 flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full border border-yellow-200">
                      <Star size={16} className="text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        Level {levelInfo?.level || 1} Learner
                      </span>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 mt-6 md:mt-6">
                    <div className="text-center md:text-left mb-6">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={profileForm.name || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                            className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-orange-300 focus:border-orange-500 focus:outline-none w-full text-center md:text-left"
                            placeholder="Enter your name"
                          />
                        </div>
                      ) : (
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {user?.name || user?.username || 'Welcome!'}
                          </h1>
                          {user?.bio && (
                            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contact Info */}
                      <div className="space-y-3">
                        {/* Email */}
                        <div className="flex items-center text-gray-600">
                          <Mail size={16} className="mr-2" />
                          {isEditing ? (
                            <input
                              type="email"
                              value={profileForm.email || ''}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                              className="text-sm bg-transparent border-b border-gray-300 focus:border-orange-500 focus:outline-none flex-1"
                              placeholder="Enter your email"
                            />
                          ) : (
                            <span className="text-sm">{user?.email || 'No email provided'}</span>
                          )}
                        </div>
                                                
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          <span className="text-sm">Joined {user?.joinedAt ? new Date(user?.joinedAt).toLocaleDateString() : 'Recently'}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-3">
                        {streakData && (
                          <div className="flex items-center text-gray-600">
                            <Flame size={16} className="mr-2 text-orange-500" />
                            <span className="text-sm">
                              {streakData.currentStreak} day learning streak
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex flex-col space-y-2 mt-6 md:mt-0">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        disabled={loading}
                      >
                        <Save size={16} className="mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X size={16} className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-blue-600">{totalXP || 0}</div>
                <div className="text-sm text-gray-600">Total XP</div>
                <div className="mt-2">
                  <div className="text-xs text-gray-500">
                    {levelInfo?.xpToNextLevel || 0} to Level {(levelInfo?.level || 1) + 1}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-purple-600">{gems || 0}</div>
                <div className="text-sm text-gray-600">Gems</div>
                <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                  <Zap size={12} className="mr-1" />
                  +0 this week
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-green-600">{achievements?.length || 0}</div>
                <div className="text-sm text-gray-600">Achievements</div>
                <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                  <Trophy size={12} className="mr-1" />
                  +0 this week
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-orange-600">{streakData?.currentStreak || 0}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
                <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                  <Flame size={12} className="mr-1" />
                  Best: {streakData?.longestStreak || 0} days
                </div>
              </div>
            </div>

            {/* Learning Performance */}
            {performanceMetrics && (
              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 size={20} className="mr-2 text-green-500" />
                  Learning Performance
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Average Quiz Score</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {performanceMetrics.averageQuizScore?.toFixed(0) || 0}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                      {performanceMetrics.completionRate?.toFixed(0) || 0}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Learning Velocity</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {performanceMetrics.learningVelocity?.toFixed(1) || 0.0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">chapters/week</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Achievement Gallery</h3>
                {user && (user.role === 'admin' || user.role === 'teacher') && (
                  <button
                    className="flex items-center bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                    onClick={() => navigate('/badges')}
                  >
                    <Settings size={16} className="mr-2" />
                    Manage Badges
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentAchievements && recentAchievements.length > 0 ? (
                  recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="relative">
                      <BadgeDisplay badges={[achievement]} layout="grid" showDetails={true} />
                      <div className="absolute top-2 right-2">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Earned
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Award size={48} className="mx-auto text-gray-300 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No achievements unlocked yet</h4>
                    <p className="text-gray-600 mb-4">
                      Start your learning journey to unlock amazing badges and achievements!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => navigate('/subjects')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <BookOpen size={16} className="mr-2" />
                        Start Learning
                      </button>
                      {user && (user.role === 'admin' || user.role === 'teacher') && (
                        <button
                          onClick={() => navigate('/badges')}
                          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Settings size={16} className="mr-2" />
                          Configure Badges
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {recentAchievements && recentAchievements.length > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Showing your most recent achievements. Keep learning to unlock more!
                  </p>
                  {user && (user.role === 'admin' || user.role === 'teacher') && (
                    <button
                      onClick={() => navigate('/badges')}
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                    >
                      Configure achievement system →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total XP Earned</span>
                  <span className="font-semibold text-orange-600">{totalXP}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Level</span>
                  <span className="font-semibold text-orange-600">{levelInfo && typeof levelInfo.level === 'number' ? levelInfo.level : 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-orange-600">{streakData && typeof streakData.currentStreak === 'number' ? streakData.currentStreak : 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Longest Streak</span>
                  <span className="font-semibold text-red-600">{streakData && typeof streakData.longestStreak === 'number' ? streakData.longestStreak : 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-semibold text-green-600">
                    {performanceMetrics.averageQuizScore.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-teal-600">
                    {performanceMetrics.completionRate.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
              <div className="space-y-4">
                {performanceMetrics.strongSubjects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">Strong Areas</h4>
                    {performanceMetrics.strongSubjects.map((subject, index) => (
                      <div key={index} className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-700 capitalize">
                          {subject.subject.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {subject.averageScore.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {performanceMetrics.weakSubjects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-orange-700 mb-2">Areas for Improvement</h4>
                    {performanceMetrics.weakSubjects.map((subject, index) => (
                      <div key={index} className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-700 capitalize">
                          {subject.subject.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-orange-600">
                          {subject.averageScore.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {performanceMetrics.strongSubjects.length === 0 && performanceMetrics.weakSubjects.length === 0 && (
                  <div className="text-center py-8">
                    <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">No performance data yet</p>
                    <p className="text-sm text-gray-500">Complete some chapters to see your progress!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
          <UserSettings variant="full" />
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                    <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.profileVisible}
                      onChange={(e) => handleUpdatePreferences({
                        ...preferences,
                        privacy: { ...preferences.privacy, profileVisible: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Progress Sharing</h4>
                    <p className="text-sm text-gray-600">Allow others to see your learning progress</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.progressVisible}
                      onChange={(e) => handleUpdatePreferences({
                        ...preferences,
                        privacy: { ...preferences.privacy, progressVisible: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
                  <div className="space-y-3">
                    <button className="flex items-center text-orange-600 hover:text-orange-700 transition-colors">
                      <Download size={16} className="mr-2" />
                      Download My Data
                    </button>
                    <button className="flex items-center text-red-600 hover:text-red-700 transition-colors">
                      <Trash2 size={16} className="mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab (admin/teacher only) */}
        {activeTab === 'users' && user && (user.role === 'admin' || user.role === 'teacher') && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                      <p className="text-sm text-gray-600">Manage system users and their permissions</p>
                    </div>
                  </div>
                  <button
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    onClick={() => { setShowAddUserModal(true); setUserForm({ name: '', email: '', role: 'student', password: '' }); }}
                  >
                    <User className="w-4 h-4" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              {(userCrudLoading || userCrudSuccess || userCrudError) && (
                <div className="px-6 py-3 border-b border-gray-200">
                  {userCrudLoading && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  )}
                  {userCrudSuccess && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>{userCrudSuccess}</span>
                    </div>
                  )}
                  {userCrudError && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <X className="w-4 h-4" />
                      <span>{userCrudError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Table Section */}
              <div className="overflow-x-auto">
                {users.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          User Information
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((u, index) => (
                        <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          {/* User Information */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-700">
                                  {u.username?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{u.username}</div>
                                <div className="text-xs text-gray-500">ID: {u._id?.slice(-6) || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Contact */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              {u.email}
                            </div>
                          </td>
                          
                          {/* Role */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                              u.role === 'admin' ? 'bg-red-100 text-red-800' :
                              u.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {u.role === 'admin' && '⚡ '}
                              {u.role === 'teacher' && '👩‍🏫 '}
                              {u.role === 'student' && '🎓 '}
                              {u.role}
                            </span>
                          </td>
                          
                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                className="flex items-center space-x-1 bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors text-xs font-medium"
                                onClick={() => { 
                                  setShowEditUserModal(true); 
                                  setEditUser(u); 
                                  setUserForm({ name: u.username, email: u.email, role: u.role, password: '' }); 
                                }}
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
                                onClick={() => handleDeleteUser(u._id)}
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h4>
                    <p className="text-gray-600 mb-4">Get started by adding your first user to the system.</p>
                    <button
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium mx-auto"
                      onClick={() => { setShowAddUserModal(true); setUserForm({ name: '', email: '', role: 'student', password: '' }); }}
                    >
                      <User className="w-4 h-4" />
                      <span>Add First User</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              {users.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total users: {users.length}</span>
                    <span>
                      Admins: {users.filter(u => u.role === 'admin').length} • 
                      Teachers: {users.filter(u => u.role === 'teacher').length} • 
                      Students: {users.filter(u => u.role === 'student').length}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* Add/Edit User Modal */}
            {(showAddUserModal || showEditUserModal) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {showAddUserModal ? 'Add New User' : 'Edit User'}
                          </h2>
                          <p className="text-sm text-gray-600">
                            {showAddUserModal ? 'Create a new user account' : 'Update user information'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { 
                          setShowAddUserModal(false); 
                          setShowEditUserModal(false); 
                          setEditUser(null); 
                          setUserForm({ name: '', email: '', role: 'student', password: '' }); 
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="px-6 py-6">
                    <form onSubmit={e => { e.preventDefault(); showAddUserModal ? handleAddUser() : handleEditUser(); }} className="space-y-6">
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Full Name
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500" 
                          placeholder="Enter full name"
                          value={userForm.name} 
                          onChange={e => setUserForm({ ...userForm, name: e.target.value })} 
                          required 
                        />
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email Address
                        </label>
                        <input 
                          type="email" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500" 
                          placeholder="Enter email address"
                          value={userForm.email} 
                          onChange={e => setUserForm({ ...userForm, email: e.target.value })} 
                          required 
                        />
                      </div>

                      {/* Role Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Shield className="w-4 h-4 inline mr-2" />
                          User Role
                        </label>
                        <div className="relative">
                          <select 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 appearance-none bg-white" 
                            value={userForm.role} 
                            onChange={e => setUserForm({ ...userForm, role: e.target.value })} 
                            required
                          >
                            <option value="student">🎓 Student</option>
                            <option value="teacher">👩‍🏫 Teacher</option>
                            <option value="admin">⚡ Administrator</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Select the appropriate role for this user
                        </p>
                      </div>

                      {/* Password Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Eye className="w-4 h-4 inline mr-2" />
                          Password
                          {showAddUserModal && <span className="text-red-500 ml-1">*</span>}
                          {!showAddUserModal && <span className="text-xs text-gray-500 ml-2">(leave blank to keep current)</span>}
                        </label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500" 
                            placeholder={showAddUserModal ? "Enter password" : "Enter new password (optional)"}
                            value={userForm.password} 
                            onChange={e => setUserForm({ ...userForm, password: e.target.value })} 
                            required={showAddUserModal}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {showAddUserModal && (
                          <p className="mt-1 text-xs text-gray-500">
                            Password must be at least 6 characters long
                          </p>
                        )}
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button 
                          type="button" 
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          onClick={() => { 
                            setShowAddUserModal(false); 
                            setShowEditUserModal(false); 
                            setEditUser(null); 
                            setUserForm({ name: '', email: '', role: 'student', password: '' }); 
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={userCrudLoading}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {userCrudLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>{showAddUserModal ? 'Add User' : 'Save Changes'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Management Tab (admin/teacher only) */}
        {activeTab === 'recommendations' && user && (user.role === 'admin' || user.role === 'teacher') && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recommendations Management</h3>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={() => { setShowAddRecommendationModal(true); setRecommendationForm({ title: '', description: '', subject: '', topic: '', type: 'topic', priority: 1, reasoning: '', contentTypes: [], confidence: 1 }); }}
                >
                  + Add Recommendation
                </button>
              </div>
              {recommendationCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
              {recommendationCrudSuccess && <div className="text-green-600 mb-2">{recommendationCrudSuccess}</div>}
              {recommendationCrudError && <div className="text-red-600 mb-2">{recommendationCrudError}</div>}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-black">
                    {recommendations.map((rec) => (
                      <tr key={rec._id}>
                        <td className="px-4 py-2 whitespace-nowrap">{rec.title}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{rec.description}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{rec.subject}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{rec.topic}</td>
                        <td className="px-4 py-2 whitespace-nowrap capitalize">{rec.type}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{rec.priority}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 mr-2"
                            onClick={() => { setShowEditRecommendationModal(true); setEditRecommendation(rec); setRecommendationForm({ title: rec.title, description: rec.description, subject: rec.subject, topic: rec.topic, type: rec.type, priority: rec.priority, reasoning: rec.reasoning, contentTypes: rec.contentTypes || [], confidence: rec.confidence }); }}
                          >Edit</button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            onClick={() => handleDeleteRecommendation(rec._id)}
                          >Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Add/Edit Recommendation Modal */}
            {(showAddRecommendationModal || showEditRecommendationModal) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">{showAddRecommendationModal ? 'Add Recommendation' : 'Edit Recommendation'}</h2>
                  <form onSubmit={e => { e.preventDefault(); showAddRecommendationModal ? handleAddRecommendation() : handleEditRecommendation(); }}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Title</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-black" value={recommendationForm.title} onChange={e => setRecommendationForm({ ...recommendationForm, title: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Description</label>
                      <textarea className="w-full border rounded px-3 py-2 text-black" value={recommendationForm.description} onChange={e => setRecommendationForm({ ...recommendationForm, description: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Subject</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-black" value={recommendationForm.subject} onChange={e => setRecommendationForm({ ...recommendationForm, subject: e.target.value })} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Topic</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-black" value={recommendationForm.topic} onChange={e => setRecommendationForm({ ...recommendationForm, topic: e.target.value })} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Type</label>
                      <select className="w-full border rounded px-3 py-2 text-black" value={recommendationForm.type} onChange={e => setRecommendationForm({ ...recommendationForm, type: e.target.value })} required>
                        <option value="topic">Topic</option>
                        <option value="chapter">Chapter</option>
                        <option value="experiment">Experiment</option>
                        <option value="simulation">Simulation</option>
                        <option value="video">Video</option>
                        <option value="model3d">3D Model</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Priority</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-black" value={recommendationForm.priority} onChange={e => setRecommendationForm({ ...recommendationForm, priority: Number(e.target.value) })} min={1} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Reasoning</label>
                      <textarea className="w-full border rounded px-3 py-2 text-black" value={recommendationForm.reasoning} onChange={e => setRecommendationForm({ ...recommendationForm, reasoning: e.target.value })} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Content Types (comma separated)</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-black" value={recommendationForm.contentTypes.join(', ')} onChange={e => setRecommendationForm({ ...recommendationForm, contentTypes: e.target.value.split(',').map(s => s.trim()) })} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Confidence (0-1)</label>
                      <input type="number" step="0.01" min={0} max={1} className="w-full border rounded px-3 py-2 text-black" value={recommendationForm.confidence} onChange={e => setRecommendationForm({ ...recommendationForm, confidence: Number(e.target.value) })} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => { setShowAddRecommendationModal(false); setShowEditRecommendationModal(false); setEditRecommendation(null); setRecommendationForm({ title: '', description: '', subject: '', topic: '', type: 'topic', priority: 1, reasoning: '', contentTypes: [], confidence: 1 }); }}>Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{showAddRecommendationModal ? 'Add' : 'Save'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Attempts Management Tab (admin/teacher only) */}
        {activeTab === 'quizAttempts' && user && (user.role === 'admin' || user.role === 'teacher') && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quiz Attempts Management</h3>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={() => { setShowAddQuizAttemptModal(true); setQuizAttemptForm({ user: '', quiz: '', score: 0, timeSpent: 0, date: '', answers: [] }); }}
                >
                  + Add Quiz Attempt
                </button>
              </div>
              {quizAttemptCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
              {quizAttemptCrudSuccess && <div className="text-green-600 mb-2">{quizAttemptCrudSuccess}</div>}
              {quizAttemptCrudError && <div className="text-red-600 mb-2">{quizAttemptCrudError}</div>}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-black">
                    {quizAttempts.map((qa) => (
                      <tr key={qa._id}>
                        <td className="px-4 py-2 whitespace-nowrap">{qa.user}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{qa.quiz}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{qa.score}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{qa.timeSpent}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{qa.date}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 mr-2"
                            onClick={() => { setShowEditQuizAttemptModal(true); setEditQuizAttempt(qa); setQuizAttemptForm({ user: qa.user, quiz: qa.quiz, score: qa.score, timeSpent: qa.timeSpent, date: qa.date, answers: qa.answers }); }}
                          >Edit</button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            onClick={() => handleDeleteQuizAttempt(qa._id)}
                          >Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Add/Edit Quiz Attempt Modal */}
            {(showAddQuizAttemptModal || showEditQuizAttemptModal) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">{showAddQuizAttemptModal ? 'Add Quiz Attempt' : 'Edit Quiz Attempt'}</h2>
                  <form onSubmit={e => { e.preventDefault(); showAddQuizAttemptModal ? handleAddQuizAttempt() : handleEditQuizAttempt(); }}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">User</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-black" value={quizAttemptForm.user} onChange={e => setQuizAttemptForm({ ...quizAttemptForm, user: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Quiz</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-black" value={quizAttemptForm.quiz} onChange={e => setQuizAttemptForm({ ...quizAttemptForm, quiz: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Score</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-black" value={quizAttemptForm.score} onChange={e => setQuizAttemptForm({ ...quizAttemptForm, score: Number(e.target.value) })} min={0} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Time Spent (seconds)</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-black" value={quizAttemptForm.timeSpent} onChange={e => setQuizAttemptForm({ ...quizAttemptForm, timeSpent: Number(e.target.value) })} min={0} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Date</label>
                      <input type="date" className="w-full border rounded px-3 py-2 text-black" value={quizAttemptForm.date} onChange={e => setQuizAttemptForm({ ...quizAttemptForm, date: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Answers (JSON)</label>
                      <textarea className="w-full border rounded px-3 py-2 text-black" value={JSON.stringify(quizAttemptForm.answers)} onChange={e => setQuizAttemptForm({ ...quizAttemptForm, answers: JSON.parse(e.target.value || '[]') })} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => { setShowAddQuizAttemptModal(false); setShowEditQuizAttemptModal(false); setEditQuizAttempt(null); setQuizAttemptForm({ user: '', quiz: '', score: 0, timeSpent: 0, date: '', answers: [] }); }}>Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{showAddQuizAttemptModal ? 'Add' : 'Save'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;