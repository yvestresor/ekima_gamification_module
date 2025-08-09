import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { userAPI } from '../services/api';
import { authAPI } from '../services/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  token: localStorage.getItem('auth_token'),
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER_STATS: 'UPDATE_USER_STATS'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };

    case AUTH_ACTIONS.UPDATE_USER_STATS:
      return {
        ...state,
        user: {
          ...state.user,
          gems: action.payload.gems ?? state.user.gems,
          coins: action.payload.coins ?? state.user.coins,
          xp: action.payload.xp ?? state.user.xp,
          level_number: action.payload.level_number ?? state.user.level_number,
          streak: action.payload.streak ?? state.user.streak,
          timeSpent: action.payload.timeSpent ?? state.user.timeSpent
        }
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const userLoadedRef = useRef(false);

  // Load user function
  const loadUser = useCallback(async () => {
    if (userLoadedRef.current) return; // Prevent multiple calls
    
    try {
      userLoadedRef.current = true;
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
      const response = await authAPI.getMe();
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      userLoadedRef.current = false; // Reset on error
      const errorMessage = error.response?.data?.message || 'Failed to load user';
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: errorMessage
      });
      localStorage.removeItem('auth_token');
    }
  }, []);

  // Load user on app start if token exists
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && !state.user && !userLoadedRef.current) {
      loadUser();
    } else if (!token) {
      dispatch({ 
        type: AUTH_ACTIONS.LOAD_USER_FAILURE, 
        payload: null
      });
    }
  }, []); // Only run once on mount

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      userLoadedRef.current = true; // Mark user as loaded since we got it from login
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      await authAPI.register(userData);
      // Return success without auto-login
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };



  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    userLoadedRef.current = false; // Reset ref on logout
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await userAPI.updateProfile(userData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      return { success: false, error: errorMessage };
    }
  };

  // Update user gamification stats
  const updateUserStats = (stats) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER_STATS,
      payload: stats
    });
  };

  // Add gems/coins/XP
  const addGems = (amount) => {
    updateUserStats({
      gems: (state.user?.gems || 0) + amount
    });
  };

  const addCoins = (amount) => {
    updateUserStats({
      coins: (state.user?.coins || 0) + amount
    });
  };

  const addXP = (amount) => {
    const currentXP = state.user?.xp || 0;
    const newXP = currentXP + amount;
    
    // Calculate level progression (every 1000 XP = 1 level)
    const newLevel = Math.floor(newXP / 1000) + 1;
    const currentLevel = state.user?.level_number || 1;

    updateUserStats({
      xp: newXP,
      level_number: newLevel
    });

    // Return level up information
    return {
      leveledUp: newLevel > currentLevel,
      newLevel: newLevel,
      xpGained: amount
    };
  };

  // Update time spent
  const updateTimeSpent = (additionalTime) => {
    const currentTime = state.user?.timeSpent || 0;
    updateUserStats({
      timeSpent: currentTime + additionalTime
    });
  };

  // Update streak
  const updateStreak = (newStreak) => {
    updateUserStats({
      streak: newStreak
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!state.user) return false;
    
    // Add your permission logic here
    // For now, basic role-based permissions
    switch (permission) {
      case 'view_analytics':
        return ['admin', 'teacher'].includes(state.user.type);
      case 'manage_content':
        return ['admin'].includes(state.user.type);
      case 'view_progress':
        return true; // All authenticated users
      default:
        return false;
    }
  };

  // Calculate user level info
  const getUserLevelInfo = () => {
    if (!state.user) return null;

    const currentXP = state.user.xp || 0;
    const currentLevel = state.user.level_number || 1;
    const xpForCurrentLevel = (currentLevel - 1) * 1000;
    const xpForNextLevel = currentLevel * 1000;
    const progressToNextLevel = ((currentXP - xpForCurrentLevel) / 1000) * 100;

    return {
      currentLevel,
      currentXP,
      xpForNextLevel,
      xpNeededForNext: xpForNextLevel - currentXP,
      progressToNextLevel: Math.min(progressToNextLevel, 100)
    };
  };

  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    token: state.token,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    updateUserStats,
    addGems,
    addCoins,
    addXP,
    updateTimeSpent,
    updateStreak,
    clearError,

    // Utilities
    hasPermission,
    getUserLevelInfo
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        updateUserStats,
        addGems,
        addCoins,
        addXP,
        updateTimeSpent,
        updateStreak,
        clearError,
        hasPermission,
        getUserLevelInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;