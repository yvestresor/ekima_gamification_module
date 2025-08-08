// useLocalStorage hook - Custom hook for localStorage management

import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial value if none exists
 * @returns {[value, setValue]} - Current value and setter function
 */
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log('Error reading localStorage key "' + key + '":', error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log('Error setting localStorage key "' + key + '":', error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Hook for session storage (similar to localStorage but cleared when tab closes)
 */
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log('Error reading sessionStorage key "' + key + '":', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log('Error setting sessionStorage key "' + key + '":', error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Hook for persisting user preferences
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('user_preferences', {
    theme: 'light',
    language: 'en',
    notifications: true,
    sound: true,
    difficulty: 'medium',
    learningReminders: true,
    dataUsage: 'normal' // low, normal, high
  });

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetPreferences = () => {
    setPreferences({
      theme: 'light',
      language: 'en',
      notifications: true,
      sound: true,
      difficulty: 'medium',
      learningReminders: true,
      dataUsage: 'normal'
    });
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
    setPreferences
  };
};

/**
 * Hook for managing learning session data
 */
export const useLearningSession = () => {
  const [sessionData, setSessionData] = useSessionStorage('learning_session', null);

  const startSession = (data) => {
    const session = {
      ...data,
      startTime: new Date().toISOString(),
      interactions: [],
      timeSpent: 0
    };
    setSessionData(session);
    return session;
  };

  const updateSession = (updates) => {
    if (!sessionData) return null;
    
    const updatedSession = {
      ...sessionData,
      ...updates,
      timeSpent: Date.now() - new Date(sessionData.startTime).getTime()
    };
    setSessionData(updatedSession);
    return updatedSession;
  };

  const endSession = () => {
    const finalSession = sessionData ? {
      ...sessionData,
      endTime: new Date().toISOString(),
      timeSpent: Date.now() - new Date(sessionData.startTime).getTime()
    } : null;
    
    setSessionData(null);
    return finalSession;
  };

  const addInteraction = (interaction) => {
    if (!sessionData) return;
    
    const updatedSession = {
      ...sessionData,
      interactions: [
        ...sessionData.interactions,
        {
          ...interaction,
          timestamp: new Date().toISOString()
        }
      ]
    };
    setSessionData(updatedSession);
  };

  return {
    sessionData,
    startSession,
    updateSession,
    endSession,
    addInteraction,
    isActive: !!sessionData
  };
};

/**
 * Hook for offline data management
 */
export const useOfflineData = () => {
  const [offlineData, setOfflineData] = useLocalStorage('offline_data', {
    pendingActions: [],
    cachedContent: {},
    lastSync: null
  });

  const addPendingAction = (action) => {
    setOfflineData(prev => ({
      ...prev,
      pendingActions: [
        ...prev.pendingActions,
        {
          ...action,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        }
      ]
    }));
  };

  const removePendingAction = (actionId) => {
    setOfflineData(prev => ({
      ...prev,
      pendingActions: prev.pendingActions.filter(action => action.id !== actionId)
    }));
  };

  const cacheContent = (key, content) => {
    setOfflineData(prev => ({
      ...prev,
      cachedContent: {
        ...prev.cachedContent,
        [key]: {
          content,
          timestamp: new Date().toISOString()
        }
      }
    }));
  };

  const getCachedContent = (key) => {
    return offlineData.cachedContent[key]?.content || null;
  };

  const clearOfflineData = () => {
    setOfflineData({
      pendingActions: [],
      cachedContent: {},
      lastSync: null
    });
  };

  const updateLastSync = () => {
    setOfflineData(prev => ({
      ...prev,
      lastSync: new Date().toISOString()
    }));
  };

  return {
    offlineData,
    addPendingAction,
    removePendingAction,
    cacheContent,
    getCachedContent,
    clearOfflineData,
    updateLastSync,
    hasPendingActions: offlineData.pendingActions.length > 0
  };
};

export default useLocalStorage;