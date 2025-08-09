import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Star,
  Trophy,
  Zap,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Header = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, getUserLevelInfo } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications 
  } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const levelInfo = getUserLevelInfo();

  // Helper functions for notifications
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'achievement':
        navigate('/profile?tab=achievements');
        break;
      case 'recommendation':
        navigate('/');
        break;
      case 'streak':
        navigate('/progress');
        break;
      case 'quiz':
        navigate('/questions');
        break;
      default:
        break;
    }
    setShowNotifications(false);
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'recommendation':
        return '💡';
      case 'streak':
        return '🔥';
      case 'progress':
        return '📈';
      case 'quiz':
        return '📝';
      default:
        return '📢';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/subjects') return 'Subjects';
    if (path === '/progress') return 'My Progress';
    if (path === '/profile') return 'Profile';
    if (path === '/experiments') return 'Experiments';
    if (path === '/videos') return 'Videos';
    if (path === '/simulations') return 'Simulations';
    if (path === '/models') return '3D Models';
    if (path === '/questions') return 'Questions';
    return 'Ekima';
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-40 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* Left Side - Page Title & Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div>
            <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              Welcome back, {user?.name?.split(' ')[0]}!
            </p>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects, topics, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
              />
            </div>
          </form>
        </div>

        {/* Right Side - User Actions */}
        <div className="flex items-center space-x-4">
          
          {/* User Stats (Desktop Only) */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">{user?.gems || 0}</span>
            </div>
            
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Lv.{levelInfo?.currentLevel || 1}</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => loadNotifications()}
                      disabled={notificationsLoading}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      {notificationsLoading ? 'Loading...' : 'Refresh'}
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading notifications...
                    </div>
                  ) : notificationsError ? (
                    <div className="p-4 text-center">
                      <p className="text-red-600 text-sm">{notificationsError}</p>
                      <button
                        onClick={() => loadNotifications()}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No notifications yet</p>
                      <button
                        onClick={() => loadNotifications()}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Load Notifications
                      </button>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer group ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">
                            {notification.icon || getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.timeAgo || new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(e, notification._id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      navigate('/notifications');
                      setShowNotifications(false);
                    }}
                    className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.username?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
                {/* User Info */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.username?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user?.username}</h4>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  
                  {/* User Stats */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{user?.gems || 0}</p>
                      <p className="text-xs text-gray-500">Gems</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">Level {levelInfo?.currentLevel || 1}</p>
                      <p className="text-xs text-gray-500">{levelInfo?.currentXP || 0} XP</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">{user?.streak || 0}</p>
                      <p className="text-xs text-gray-500">Day Streak</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Achievements</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-6 pb-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
            />
          </div>
        </form>
      </div>

      {/* Click Outside Handler */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;