import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

// Action types
const NOTIFICATION_ACTIONS = {
  LOAD_START: 'LOAD_START',
  LOAD_SUCCESS: 'LOAD_SUCCESS',
  LOAD_FAILURE: 'LOAD_FAILURE',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS'
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.LOAD_START:
      return { 
        ...state, 
        loading: true, 
        error: null 
      };

    case NOTIFICATION_ACTIONS.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        pagination: action.payload.pagination,
        error: null
      };

    case NOTIFICATION_ACTIONS.LOAD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        notifications: [],
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => 
          notification._id === action.payload.id 
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true,
          readAt: new Date()
        })),
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: action.payload.read ? state.unreadCount : state.unreadCount + 1
      };

    case NOTIFICATION_ACTIONS.DELETE_NOTIFICATION:
      const deletedNotification = state.notifications.find(n => n._id === action.payload.id);
      return {
        ...state,
        notifications: state.notifications.filter(n => n._id !== action.payload.id),
        unreadCount: deletedNotification && !deletedNotification.read 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      };

    case NOTIFICATION_ACTIONS.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload
      };

    case NOTIFICATION_ACTIONS.CLEAR_NOTIFICATIONS:
      return initialState;

    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user } = useAuth();
  const isLoadingRef = useRef(false);

  // Load notifications
  const loadNotifications = useCallback(async (params = {}) => {
    if (!user || isLoadingRef.current) {
      console.log('NotificationContext: Skipping load - no user or already loading');
      return;
    }

    try {
      isLoadingRef.current = true;
      console.log('NotificationContext: Starting to load notifications');
      dispatch({ type: NOTIFICATION_ACTIONS.LOAD_START });
      
      const response = await notificationAPI.getAll({
        page: 1,
        limit: 20,
        ...params
      });

      console.log('NotificationContext: Successfully loaded notifications', response.data);

      dispatch({
        type: NOTIFICATION_ACTIONS.LOAD_SUCCESS,
        payload: {
          notifications: response.data.notifications || [],
          unreadCount: response.data.unreadCount || 0,
          pagination: response.data.pagination || initialState.pagination
        }
      });
    } catch (error) {
      console.error('NotificationContext: API error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        code: error.code,
        message: error.message
      });
      
      // For any error, provide empty data instead of hanging in loading state
      console.log('NotificationContext: Providing empty data due to error');
      dispatch({
        type: NOTIFICATION_ACTIONS.LOAD_SUCCESS,
        payload: {
          notifications: [],
          unreadCount: 0,
          pagination: initialState.pagination
        }
      });
    } finally {
      isLoadingRef.current = false;
      console.log('NotificationContext: Loading completed');
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      dispatch({
        type: NOTIFICATION_ACTIONS.MARK_AS_READ,
        payload: { id: notificationId }
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      dispatch({
        type: NOTIFICATION_ACTIONS.DELETE_NOTIFICATION,
        payload: { id: notificationId }
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: notification
    });
  }, []);

  // Clear all notifications (on logout)
  const clearNotifications = useCallback(() => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_NOTIFICATIONS });
  }, []);

  // Load notifications when user changes (DISABLED FOR NOW - manual loading only)
  useEffect(() => {
    if (user) {
      // Don't automatically load notifications - user can manually refresh
      console.log('NotificationContext: User available, but not auto-loading notifications');
    } else {
      clearNotifications();
    }
  }, [user]);

  // Periodically refresh notifications (DISABLED FOR NOW)
  // useEffect(() => {
  //   if (!user) return;

  //   const interval = setInterval(() => {
  //     loadNotifications();
  //   }, 5 * 60 * 1000); // 5 minutes

  //   return () => clearInterval(interval);
  // }, [user]);

  const value = {
    ...state,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
