// src/pages/Profile.js

import React, { useState, useEffect } from 'react';
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
  Trophy
} from 'lucide-react';

// Import contexts and hooks
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useGamification } from '../hooks/useGamification';
import { userAPI, quizAttemptAPI, badgeAPI, recommendationAPI } from '../services/api';

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

  // Badge/Achievement management state
  const [badges, setBadges] = useState([]);
  const [badgeCrudLoading, setBadgeCrudLoading] = useState(false);
  const [badgeCrudError, setBadgeCrudError] = useState(null);
  const [badgeCrudSuccess, setBadgeCrudSuccess] = useState(null);
  const [showAddBadgeModal, setShowAddBadgeModal] = useState(false);
  const [showEditBadgeModal, setShowEditBadgeModal] = useState(false);
  const [editBadge, setEditBadge] = useState(null);
  const [badgeForm, setBadgeForm] = useState({ name: '', description: '', icon: '', xp_reward: 0, gems_reward: 0, rarity: 'common', requirement: '', type: 'completion' });

  // Fetch badges for management
  useEffect(() => {
    if (activeTab === 'achievements' && user && (user.role === 'admin' || user.role === 'teacher')) {
      setBadgeCrudLoading(true);
      badgeAPI.getAll()
        .then(res => { setBadges(res.data || []); setBadgeCrudLoading(false); })
        .catch(err => { setBadgeCrudError('Failed to load badges'); setBadgeCrudLoading(false); });
    }
  }, [activeTab, user]);

  // Badge CRUD handlers
  const handleAddBadge = async () => {
    setBadgeCrudLoading(true); setBadgeCrudError(null); setBadgeCrudSuccess(null);
    try {
      await badgeAPI.create(badgeForm);
      setBadgeCrudSuccess('Badge added successfully');
      setShowAddBadgeModal(false);
      setBadgeForm({ name: '', description: '', icon: '', xp_reward: 0, gems_reward: 0, rarity: 'common', requirement: '', type: 'completion' });
      // Refresh badges
      const res = await badgeAPI.getAll();
      setBadges(res.data);
    } catch (err) {
      setBadgeCrudError('Failed to add badge');
    } finally {
      setBadgeCrudLoading(false);
    }
  };
  const handleEditBadge = async () => {
    setBadgeCrudLoading(true); setBadgeCrudError(null); setBadgeCrudSuccess(null);
    try {
      await badgeAPI.update(editBadge._id, badgeForm);
      setBadgeCrudSuccess('Badge updated successfully');
      setShowEditBadgeModal(false);
      setEditBadge(null);
      setBadgeForm({ name: '', description: '', icon: '', xp_reward: 0, gems_reward: 0, rarity: 'common', requirement: '', type: 'completion' });
      // Refresh badges
      const res = await badgeAPI.getAll();
      setBadges(res.data);
    } catch (err) {
      setBadgeCrudError('Failed to update badge');
    } finally {
      setBadgeCrudLoading(false);
    }
  };
  const handleDeleteBadge = async (badgeId) => {
    if (!window.confirm('Are you sure you want to delete this badge?')) return;
    setBadgeCrudLoading(true); setBadgeCrudError(null); setBadgeCrudSuccess(null);
    try {
      await badgeAPI.delete(badgeId);
      setBadgeCrudSuccess('Badge deleted successfully');
      // Refresh badges
      const res = await badgeAPI.getAll();
      setBadges(res.data);
    } catch (err) {
      setBadgeCrudError('Failed to delete badge');
    } finally {
      setBadgeCrudLoading(false);
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
            
            <div className="flex items-center space-x-3">
              {!isEditing && activeTab === 'overview' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Edit3 size={16} className="mr-2" />
                  Edit Profile
                </button>
              )}
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
            {/* Profile Header Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                {/* Avatar and Basic Info */}
                <div className="text-center md:text-left">
                  <div className="relative inline-block">
                    <img
                      src={user?.profilePic || user?.avatar || '/api/placeholder/100/100'}
                      alt={user?.name || user?.username}
                      className="w-24 h-24 rounded-full object-cover mx-auto md:mx-0"
                    />
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                        <Camera size={16} />
                      </button>
                    )}
                    {levelInfo && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{levelInfo.level}</span>
                      </div>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={profileForm.name || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                        placeholder="Enter your name"
                      />
                    </div>
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900 mt-4">
                      {user?.name || user?.username || 'Unknown User'}
                    </h2>
                  )}
                  
                  <div className="flex items-center justify-center md:justify-start mt-2 space-x-2">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-gray-600">Level {levelInfo?.level || 1} Learner</span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1 mt-6 md:mt-0">
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
                      
                      {/* Location */}
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileForm.location || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                            className="text-sm bg-transparent border-b border-gray-300 focus:border-orange-500 focus:outline-none flex-1"
                            placeholder="Enter your location"
                          />
                        ) : (
                          <span className="text-sm">{user?.location || (isEditing ? '' : 'No location provided')}</span>
                        )}
                      </div>
                      
                      {/* School */}
                      <div className="flex items-center text-gray-600">
                        <School size={16} className="mr-2" />
                        {isEditing ? (
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={profileForm.school || ''}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, school: e.target.value }))}
                              className="text-sm bg-transparent border-b border-gray-300 focus:border-orange-500 focus:outline-none w-full"
                              placeholder="Enter your school"
                            />
                            <input
                              type="text"
                              value={profileForm.grade || ''}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, grade: e.target.value }))}
                              className="text-sm bg-transparent border-b border-gray-300 focus:border-orange-500 focus:outline-none w-full"
                              placeholder="Enter your grade"
                            />
                          </div>
                        ) : (
                          <span className="text-sm">
                            {user?.school || 'No school provided'}
                            {user?.grade && <span className="ml-1">({user.grade})</span>}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        <span className="text-sm">Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
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

                  {/* Bio */}
                  {(user?.bio || isEditing) && (
                    <div className="mt-4">
                      {isEditing ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                          <textarea
                            value={profileForm.bio || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      ) : (
                        <p className="text-gray-700">{user.bio}</p>
                      )}
                    </div>
                  )}
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
                <h3 className="text-lg font-semibold text-gray-900">Achievement Gallery</h3>
                {user && (user.role === 'admin' || user.role === 'teacher') && (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    onClick={() => { setShowAddBadgeModal(true); setBadgeForm({ name: '', description: '', icon: '', xp_reward: 0, gems_reward: 0, rarity: 'common', requirement: '', type: 'completion' }); }}
                  >
                    + Add Badge
                  </button>
                )}
              </div>
              {badgeCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
              {badgeCrudSuccess && <div className="text-green-600 mb-2">{badgeCrudSuccess}</div>}
              {badgeCrudError && <div className="text-red-600 mb-2">{badgeCrudError}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.length > 0 ? (
                  badges.map((badge) => (
                    <div key={badge._id} className="relative">
                      <BadgeDisplay badges={[badge]} layout="grid" showDetails={true} />
                      {user && (user.role === 'admin' || user.role === 'teacher') && (
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                            onClick={() => { setShowEditBadgeModal(true); setEditBadge(badge); setBadgeForm({ name: badge.name, description: badge.description, icon: badge.icon, xp_reward: badge.xp_reward, gems_reward: badge.gems_reward, rarity: badge.rarity, requirement: badge.requirement, type: badge.type }); }}
                          >Edit</button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            onClick={() => handleDeleteBadge(badge._id)}
                          >Delete</button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Award size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">No achievements yet</p>
                    <p className="text-sm text-gray-500">Keep learning to unlock your first badge!</p>
                  </div>
                )}
              </div>
            </div>
            {/* Add/Edit Badge Modal */}
            {(showAddBadgeModal || showEditBadgeModal) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">{showAddBadgeModal ? 'Add Badge' : 'Edit Badge'}</h2>
                  <form onSubmit={e => { e.preventDefault(); showAddBadgeModal ? handleAddBadge() : handleEditBadge(); }}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Name</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-black" value={badgeForm.name} onChange={e => setBadgeForm({ ...badgeForm, name: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Description</label>
                      <textarea className="w-full border rounded px-3 py-2 text-black" value={badgeForm.description} onChange={e => setBadgeForm({ ...badgeForm, description: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Icon (emoji or URL)</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-black" value={badgeForm.icon} onChange={e => setBadgeForm({ ...badgeForm, icon: e.target.value })} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">XP Reward</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-black" value={badgeForm.xp_reward} onChange={e => setBadgeForm({ ...badgeForm, xp_reward: Number(e.target.value) })} min={0} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Gems Reward</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-black" value={badgeForm.gems_reward} onChange={e => setBadgeForm({ ...badgeForm, gems_reward: Number(e.target.value) })} min={0} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Rarity</label>
                      <select className="w-full border rounded px-3 py-2 text-black" value={badgeForm.rarity} onChange={e => setBadgeForm({ ...badgeForm, rarity: e.target.value })} required>
                        <option value="common">Common</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Requirement</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-black" value={badgeForm.requirement} onChange={e => setBadgeForm({ ...badgeForm, requirement: e.target.value })} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Type</label>
                      <select className="w-full border rounded px-3 py-2 text-black" value={badgeForm.type} onChange={e => setBadgeForm({ ...badgeForm, type: e.target.value })} required>
                        <option value="completion">Completion</option>
                        <option value="streak">Streak</option>
                        <option value="performance">Performance</option>
                        <option value="activity">Activity</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => { setShowAddBadgeModal(false); setShowEditBadgeModal(false); setEditBadge(null); setBadgeForm({ name: '', description: '', icon: '', xp_reward: 0, gems_reward: 0, rarity: 'common', requirement: '', type: 'completion' }); }}>Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{showAddBadgeModal ? 'Add' : 'Save'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={() => { setShowAddUserModal(true); setUserForm({ name: '', email: '', role: 'student', password: '' }); }}
                >
                  + Add User
                </button>
              </div>
              {userCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
              {userCrudSuccess && <div className="text-green-600 mb-2">{userCrudSuccess}</div>}
              {userCrudError && <div className="text-red-600 mb-2">{userCrudError}</div>}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-black">
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td className="px-4 py-2 whitespace-nowrap">{u.username}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{u.email}</td>
                        <td className="px-4 py-2 whitespace-nowrap capitalize">{u.role}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 mr-2"
                            onClick={() => { setShowEditUserModal(true); setEditUser(u); setUserForm({ name: u.username, email: u.email, role: u.role, password: '' }); }}
                          >Edit</button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            onClick={() => handleDeleteUser(u._id)}
                          >Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Add/Edit User Modal */}
            {(showAddUserModal || showEditUserModal) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">{showAddUserModal ? 'Add User' : 'Edit User'}</h2>
                  <form onSubmit={e => { e.preventDefault(); showAddUserModal ? handleAddUser() : handleEditUser(); }}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Name</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-black" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Email</label>
                      <input type="email" className="w-full border rounded px-3 py-2 text-black" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Role</label>
                      <select className="w-full border rounded px-3 py-2 text-black" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} required>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Password {showAddUserModal && <span className="text-xs text-gray-400">(required for new user)</span>}</label>
                      <input type="password" className="w-full border rounded px-3 py-2 text-black" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required={showAddUserModal} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => { setShowAddUserModal(false); setShowEditUserModal(false); setEditUser(null); setUserForm({ name: '', email: '', role: 'student', password: '' }); }}>Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{showAddUserModal ? 'Add' : 'Save'}</button>
                    </div>
                  </form>
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