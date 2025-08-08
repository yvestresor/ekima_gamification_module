import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Initial theme state
const initialState = {
  theme: 'light', // light, dark, auto
  colorScheme: 'orange', // orange, blue, green, purple
  fontSize: 'medium', // small, medium, large
  reducedMotion: false,
  highContrast: false,
  compactMode: false,
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_COLOR_SCHEME: 'SET_COLOR_SCHEME',
  SET_FONT_SIZE: 'SET_FONT_SIZE',
  TOGGLE_REDUCED_MOTION: 'TOGGLE_REDUCED_MOTION',
  TOGGLE_HIGH_CONTRAST: 'TOGGLE_HIGH_CONTRAST',
  TOGGLE_COMPACT_MODE: 'TOGGLE_COMPACT_MODE',
  RESET_THEME: 'RESET_THEME',
};

// Theme reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };
    
    case THEME_ACTIONS.SET_COLOR_SCHEME:
      return { ...state, colorScheme: action.payload };
    
    case THEME_ACTIONS.SET_FONT_SIZE:
      return { ...state, fontSize: action.payload };
    
    case THEME_ACTIONS.TOGGLE_REDUCED_MOTION:
      return { ...state, reducedMotion: !state.reducedMotion };
    
    case THEME_ACTIONS.TOGGLE_HIGH_CONTRAST:
      return { ...state, highContrast: !state.highContrast };
    
    case THEME_ACTIONS.TOGGLE_COMPACT_MODE:
      return { ...state, compactMode: !state.compactMode };
    
    case THEME_ACTIONS.RESET_THEME:
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [storedTheme, setStoredTheme] = useLocalStorage('theme_preferences', initialState);
  const [state, dispatch] = useReducer(themeReducer, storedTheme);

  // Update localStorage when state changes
  useEffect(() => {
    setStoredTheme(state);
  }, [state, setStoredTheme]);

  // Apply theme changes to document
  useEffect(() => {
    applyThemeToDocument(state);
  }, [state]);

  // Listen for system theme changes
  useEffect(() => {
    if (state.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyThemeToDocument(state);
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state]);

  // Theme actions
  const setTheme = (theme) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: theme });
  };

  const setColorScheme = (colorScheme) => {
    dispatch({ type: THEME_ACTIONS.SET_COLOR_SCHEME, payload: colorScheme });
  };

  const setFontSize = (fontSize) => {
    dispatch({ type: THEME_ACTIONS.SET_FONT_SIZE, payload: fontSize });
  };

  const toggleReducedMotion = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_REDUCED_MOTION });
  };

  const toggleHighContrast = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_HIGH_CONTRAST });
  };

  const toggleCompactMode = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_COMPACT_MODE });
  };

  const resetTheme = () => {
    dispatch({ type: THEME_ACTIONS.RESET_THEME });
  };

  // Get computed theme (resolve 'auto' to actual theme)
  const getComputedTheme = () => {
    if (state.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return state.theme;
  };

  // Check if dark mode is active
  const isDarkMode = getComputedTheme() === 'dark';

  const value = {
    // State
    ...state,
    isDarkMode,
    computedTheme: getComputedTheme(),

    // Actions
    setTheme,
    setColorScheme,
    setFontSize,
    toggleReducedMotion,
    toggleHighContrast,
    toggleCompactMode,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Apply theme changes to document
const applyThemeToDocument = (themeState) => {
  const root = document.documentElement;
  
  // Determine actual theme
  let actualTheme = themeState.theme;
  if (actualTheme === 'auto') {
    actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Apply theme class
  root.classList.remove('light', 'dark');
  root.classList.add(actualTheme);

  // Apply color scheme
  root.classList.remove('scheme-orange', 'scheme-blue', 'scheme-green', 'scheme-purple');
  root.classList.add(`scheme-${themeState.colorScheme}`);

  // Apply font size
  root.classList.remove('font-small', 'font-medium', 'font-large');
  root.classList.add(`font-${themeState.fontSize}`);

  // Apply accessibility preferences
  if (themeState.reducedMotion) {
    root.classList.add('reduced-motion');
  } else {
    root.classList.remove('reduced-motion');
  }

  if (themeState.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  if (themeState.compactMode) {
    root.classList.add('compact-mode');
  } else {
    root.classList.remove('compact-mode');
  }

  // Update CSS custom properties
  updateCSSCustomProperties(themeState, actualTheme);
};

// Update CSS custom properties based on theme
const updateCSSCustomProperties = (themeState, actualTheme) => {
  const root = document.documentElement;

  // Color scheme variables
  const colorSchemes = {
    orange: {
      primary: '#f97316',
      primaryDark: '#ea580c',
      primaryLight: '#fed7aa',
    },
    blue: {
      primary: '#3b82f6',
      primaryDark: '#2563eb',
      primaryLight: '#dbeafe',
    },
    green: {
      primary: '#10b981',
      primaryDark: '#059669',
      primaryLight: '#d1fae5',
    },
    purple: {
      primary: '#8b5cf6',
      primaryDark: '#7c3aed',
      primaryLight: '#e9d5ff',
    },
  };

  const scheme = colorSchemes[themeState.colorScheme] || colorSchemes.orange;
  
  root.style.setProperty('--color-primary', scheme.primary);
  root.style.setProperty('--color-primary-dark', scheme.primaryDark);
  root.style.setProperty('--color-primary-light', scheme.primaryLight);

  // Font size variables
  const fontSizes = {
    small: {
      base: '14px',
      scale: '0.9',
    },
    medium: {
      base: '16px',
      scale: '1',
    },
    large: {
      base: '18px',
      scale: '1.1',
    },
  };

  const fontSize = fontSizes[themeState.fontSize] || fontSizes.medium;
  root.style.setProperty('--font-size-base', fontSize.base);
  root.style.setProperty('--font-scale', fontSize.scale);

  // Dark/light mode variables
  if (actualTheme === 'dark') {
    root.style.setProperty('--color-background', '#111827');
    root.style.setProperty('--color-surface', '#1f2937');
    root.style.setProperty('--color-text', '#f9fafb');
    root.style.setProperty('--color-text-secondary', '#d1d5db');
  } else {
    root.style.setProperty('--color-background', '#ffffff');
    root.style.setProperty('--color-surface', '#f9fafb');
    root.style.setProperty('--color-text', '#111827');
    root.style.setProperty('--color-text-secondary', '#6b7280');
  }

  // High contrast adjustments
  if (themeState.highContrast) {
    root.style.setProperty('--border-width', '2px');
    root.style.setProperty('--focus-ring-width', '3px');
  } else {
    root.style.setProperty('--border-width', '1px');
    root.style.setProperty('--focus-ring-width', '2px');
  }

  // Compact mode adjustments
  if (themeState.compactMode) {
    root.style.setProperty('--spacing-unit', '0.75rem');
    root.style.setProperty('--component-height', '2rem');
  } else {
    root.style.setProperty('--spacing-unit', '1rem');
    root.style.setProperty('--component-height', '2.5rem');
  }
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme selector component
export const ThemeSelector = ({ className = '' }) => {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Theme Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme Mode
        </label>
        <div className="flex space-x-2">
          {['light', 'dark', 'auto'].map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${theme === mode 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Scheme
        </label>
        <div className="flex space-x-2">
          {[
            { name: 'orange', color: '#f97316' },
            { name: 'blue', color: '#3b82f6' },
            { name: 'green', color: '#10b981' },
            { name: 'purple', color: '#8b5cf6' },
          ].map((scheme) => (
            <button
              key={scheme.name}
              onClick={() => setColorScheme(scheme.name)}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${colorScheme === scheme.name 
                  ? 'border-gray-900 scale-110' 
                  : 'border-gray-300 hover:scale-105'
                }
              `}
              style={{ backgroundColor: scheme.color }}
              title={scheme.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeContext;