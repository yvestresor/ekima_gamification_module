// src/components/navigation/Navigation.js

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  BookOpen,
  BarChart3,
  Beaker,
  Play,
  Zap,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Menu,
  X,
  Award,
  Target,
  HelpCircle,
  Star,
  Gem,
  Flame,
  Calendar
} from 'lucide-react';

// Import contexts and hooks
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../hooks/useGamification';
import { useProgress } from '../../context/ProgressContext';

// Import components
import UserDashboard from '../user/UserDashboard';

const Navigation = ({ isSidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Contexts and hooks
  const { user, logout } = useAuth();
  const { totalXP, gems, coins, levelInfo, streakData, achievements } = useGamification();
  const { userProgress } = useProgress();

  // Navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/',
      description: 'Overview of your learning progress'
    },
    {
      id: 'subjects',
      label: 'Subjects',
      icon: BookOpen,
      path: '/subjects',
      description: 'Browse all available subjects'
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: BarChart3,
      path: '/progress',
      description: 'Track your learning analytics'
    },
    {
      id: 'experiments',
      label: 'Experiments',
      icon: Beaker,
      path: '/experiments',
      description: 'Interactive science experiments'
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: Play,
      path: '/videos',
      description: 'Educational video content'
    },
    {
      id: 'simulations',
      label: 'Simulations',
      icon: Zap,
      path: '/simulations',
      description: 'Interactive simulations'
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: Target,
      path: '/questions',
      description: 'Practice questions and quizzes'
    }
  ];

  // Check if current path matches navigation item
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileDropdown(false);
      setShowNotifications(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Mock notifications (in real app, would come from API)
  const mockNotifications = [
    {
      id: 1,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'You earned the "Week Warrior" badge',
      time: '2 hours ago',
      read: false,
      icon: Award
    },
    {
      id: 2,
      type: 'streak',
      title: 'Streak Reminder',
      message: "Don't forget to study today to maintain your 7-day streak!",
      time: '5 hours ago',
      read: false,
      icon: Flame
    },
    {
      id: 3,
      type: 'assignment',
      title: 'New Chapter Available',
      message: 'Quadratic Equations chapter is now available',
      time: '1 day ago',
      read: true,
      icon: BookOpen
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Ekima</span>
            </Link>
          </div>

          {/* Mobile User Menu */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell size={20} className="text-gray-600" />
              {mockNotifications.filter(n => !n.read).length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
            
            <Link to="/profile" className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <span className="font-bold text-xl text-gray-900">Ekima</span>
                <div className="text-xs text-gray-600">Learning Platform</div>
              </div>
            </Link>
          </div>

          {/* User Stats */}
          <div className="px-6 py-4 border-b border-gray-200">
            <UserDashboard variant="compact" />
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-200">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </form>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  title={item.description}
                >
                  <Icon 
                    size={20} 
                    className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
                  />
                  {item.label}
                  
                  {/* Badge for notifications */}
                  {item.id === 'progress' && userProgress?.pendingReviews > 0 && (
                    <span className="ml-auto bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                      {userProgress.pendingReviews}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-gray-200 px-3 py-4">
            <div className="space-y-1">
              <Link
                to="/profile"
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <User size={20} className="mr-3 text-gray-400 group-hover:text-gray-600" />
                Profile
              </Link>

              <Link
                to="/help"
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <HelpCircle size={20} className="mr-3 text-gray-400 group-hover:text-gray-600" />
                Help & Support
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut size={20} className="mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Top Bar */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Page Title and Breadcrumb */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigationItems.find(item => isActiveRoute(item.path))?.label || 'Dashboard'}
              </h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* XP and Level */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star size={16} className="text-yellow-500" />
                  <span className="font-medium text-gray-700">Level {levelInfo.level}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gem size={16} className="text-purple-500" />
                  <span className="font-medium text-gray-700">{gems}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flame size={16} className="text-orange-500" />
                  <span className="font-medium text-gray-700">{streakData.currentStreak}</span>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifications(!showNotifications);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <Bell size={20} className="text-gray-600" />
                  {mockNotifications.filter(n => !n.read).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {mockNotifications.length > 0 ? (
                        mockNotifications.map((notification) => {
                          const Icon = notification.icon;
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`
                                  w-8 h-8 rounded-full flex items-center justify-center
                                  ${notification.type === 'achievement' ? 'bg-yellow-100' :
                                    notification.type === 'streak' ? 'bg-orange-100' :
                                    'bg-blue-100'
                                  }
                                `}>
                                  <Icon size={16} className={`
                                    ${notification.type === 'achievement' ? 'text-yellow-600' :
                                      notification.type === 'streak' ? 'text-orange-600' :
                                      'text-blue-600'
                                    }
                                  `} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </p>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-gray-500 text-xs mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center">
                          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-600">No notifications</p>
                        </div>
                      )}
                    </div>
                    {mockNotifications.length > 0 && (
                      <div className="p-4 border-t border-gray-200">
                        <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View All Notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileDropdown(!showProfileDropdown);
                  }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="font-medium text-gray-900">{user?.name}</div>
                      <div className="text-sm text-gray-600">{user?.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Level {levelInfo.level} • {totalXP} XP
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <User size={16} className="mr-3" />
                        View Profile
                      </Link>
                      <Link
                        to="/help"
                        className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <HelpCircle size={16} className="mr-3" />
                        Help & Support
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-200 p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;