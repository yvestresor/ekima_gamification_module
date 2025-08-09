import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Trash2, 
  Eye, 
  EyeOff, 
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, achievement, recommendation, streak, etc.

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    loadNotifications();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    const params = {
      unreadOnly: newFilter === 'unread'
    };
    loadNotifications(params);
  };

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
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'recommendation':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'streak':
        return <Zap className="w-5 h-5 text-orange-500" />;
      case 'progress':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'quiz':
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800';
      case 'recommendation':
        return 'bg-blue-100 text-blue-800';
      case 'streak':
        return 'bg-orange-100 text-orange-800';
      case 'progress':
        return 'bg-green-100 text-green-800';
      case 'quiz':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (typeFilter !== 'all' && notification.type !== typeFilter) {
      return false;
    }
    return true;
  });

  if (loading && notifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <RefreshCw className="w-8 h-8 text-orange-500 mx-auto animate-spin" />
          <p className="text-gray-600 mt-4">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-600 mt-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
          <Filter className="w-4 h-4 text-gray-500" />
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="achievement">Achievements</option>
              <option value="recommendation">Recommendations</option>
              <option value="streak">Streaks</option>
              <option value="progress">Progress</option>
              <option value="quiz">Quizzes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900 mt-4">No notifications</h3>
            <p className="text-gray-600 mt-2">
              {filter === 'unread' ? 'No unread notifications' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer group hover:shadow-md transition-all ${
                !notification.read ? 'ring-2 ring-blue-100' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      
                      <p className="text-sm text-gray-500 mt-2">
                        {notification.timeAgo || new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination (if needed) */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            {/* Add pagination controls here if needed */}
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Notifications;
