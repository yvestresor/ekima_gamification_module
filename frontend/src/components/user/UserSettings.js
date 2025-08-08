// src/components/user/UserSettings.js

import React, { useState, useEffect } from 'react';
import { 
  Settings,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Palette,
  Zap,
  Clock,
  Target,
  Heart,
  Download,
  Trash2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Camera,
  User,
  Key
} from 'lucide-react';

// Import contexts and hooks
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../hooks/useGamification';

const UserSettings = ({ 
  variant = 'full', // 'full', 'compact', 'modal'
  categories = ['profile', 'notifications', 'privacy', 'learning', 'appearance'], // Which settings to show
  onSave = null,
  onClose = null
}) => {
  // State
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [settings, setSettings] = useState({
    // Profile settings
    profile: {
      name: '',
      email: '',
      bio: '',
      location: '',
      school: '',
      grade: '',
      avatar: '',
      isPublic: true,
      showEmail: false,
      showLocation: true
    },
    
    // Notification settings
    notifications: {
      email: {
        enabled: true,
        streakReminders: true,
        achievementAlerts: true,
        weeklyProgress: true,
        newContent: false,
        socialActivity: true
      },
      push: {
        enabled: true,
        studyReminders: true,
        goalDeadlines: true,
        friendActivity: true,
        systemUpdates: false
      },
      inApp: {
        soundEffects: true,
        visualNotifications: true,
        celebrationAnimations: true,
        tipOfTheDay: true
      }
    },
    
    // Privacy settings
    privacy: {
      profileVisibility: 'public', // public, friends, private
      progressSharing: 'friends', // public, friends, private
      achievementSharing: 'public',
      allowMessages: 'friends', // everyone, friends, none
      showOnlineStatus: true,
      dataCollection: true,
      analyticsOptIn: true
    },
    
    // Learning preferences
    learning: {
      dailyGoals: {
        studyTime: 60, // minutes
        chaptersTarget: 2,
        quizzesTarget: 3,
        xpTarget: 100
      },
      preferences: {
        autoPlay: true,
        autoAdvance: false,
        skipIntro: false,
        showHints: true,
        difficulty: 'adaptive', // easy, medium, hard, adaptive
        learningStyle: 'visual' // visual, auditory, kinesthetic, mixed
      },
      reminders: {
        enabled: true,
        time: '19:00',
        frequency: 'daily', // daily, weekdays, custom
        customDays: [1, 2, 3, 4, 5] // Monday-Friday
      }
    },
    
    // Appearance settings
    appearance: {
      theme: 'light', // light, dark, auto
      colorScheme: 'blue', // blue, green, purple, orange
      fontSize: 'medium', // small, medium, large
      animations: true,
      reducedMotion: false,
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12' // 12, 24
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Contexts and hooks
  const { user, updateUserSettings } = useAuth();
  const { dailyGoals, updateDailyGoals } = useGamification();

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // Load from user data and localStorage
        const savedSettings = localStorage.getItem('ekima_user_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        }
        
        // Merge with user data
        if (user) {
          setSettings(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              name: user.name || '',
              email: user.email || '',
              bio: user.bio || '',
              location: user.location || '',
              school: user.school || '',
              grade: user.grade || '',
              avatar: user.avatar || ''
            }
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Handle setting change
  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Handle nested setting change
  const handleNestedSettingChange = (category, subCategory, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: {
          ...prev[category][subCategory],
          [key]: value
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('ekima_user_settings', JSON.stringify(settings));
      
      // Update user profile if needed
      if (settings.profile) {
        await updateUserSettings(settings.profile);
      }
      
      // Update daily goals
      if (settings.learning.dailyGoals) {
        await updateDailyGoals(settings.learning.dailyGoals);
      }
      
      // Apply theme changes
      applyThemeSettings();
      
      setHasUnsavedChanges(false);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      
      if (onSave) onSave(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Apply theme settings
  const applyThemeSettings = () => {
    const { theme, colorScheme, fontSize, reducedMotion } = settings.appearance;
    
    // Apply theme
    document.documentElement.classList.remove('light', 'dark');
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.classList.add(theme);
    }
    
    // Apply color scheme
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    
    // Apply font size
    document.documentElement.setAttribute('data-font-size', fontSize);
    
    // Apply motion preference
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('ekima_user_settings');
      window.location.reload();
    }
  };

  // Settings categories
  const settingsCategories = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Manage your personal information'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Control how you receive updates'
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: Shield,
      description: 'Manage your privacy and data settings'
    },
    {
      id: 'learning',
      label: 'Learning',
      icon: Target,
      description: 'Customize your learning experience'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      description: 'Personalize the look and feel'
    }
  ].filter(cat => categories.includes(cat.id));

  // Render setting section
  const renderSettingSection = () => {
    switch (activeCategory) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <input
                    type="text"
                    value={settings.profile.school}
                    onChange={(e) => handleSettingChange('profile', 'school', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Form</label>
                  <input
                    type="text"
                    value={settings.profile.grade}
                    onChange={(e) => handleSettingChange('profile', 'grade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={settings.profile.bio}
                    onChange={(e) => handleSettingChange('profile', 'bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell others about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Visibility Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Public Profile</div>
                    <div className="text-sm text-gray-600">Allow others to find and view your profile</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.profile.isPublic}
                      onChange={(e) => handleSettingChange('profile', 'isPublic', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Show Email</div>
                    <div className="text-sm text-gray-600">Display your email on your public profile</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.profile.showEmail}
                      onChange={(e) => handleSettingChange('profile', 'showEmail', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications.email).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-sm text-gray-600">Receive email notifications for this activity</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNestedSettingChange('notifications', 'email', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications.push).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-sm text-gray-600">Receive push notifications for this activity</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleNestedSettingChange('notifications', 'push', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public - Anyone can see</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private - Only me</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Progress Sharing</label>
                  <select
                    value={settings.privacy.progressSharing}
                    onChange={(e) => handleSettingChange('privacy', 'progressSharing', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Data Collection</div>
                    <div className="text-sm text-gray-600">Allow us to collect usage data to improve the platform</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy.dataCollection}
                      onChange={(e) => handleSettingChange('privacy', 'dataCollection', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'learning':
        return (
          <div className="space-y-6">
            {/* Daily Goals */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Goals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Study Time (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={settings.learning.dailyGoals.studyTime}
                    onChange={(e) => handleNestedSettingChange('learning', 'dailyGoals', 'studyTime', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chapters Target</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.learning.dailyGoals.chaptersTarget}
                    onChange={(e) => handleNestedSettingChange('learning', 'dailyGoals', 'chaptersTarget', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Learning Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={settings.learning.preferences.difficulty}
                    onChange={(e) => handleNestedSettingChange('learning', 'preferences', 'difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="adaptive">Adaptive (Recommended)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Auto-play Videos</div>
                    <div className="text-sm text-gray-600">Automatically start video content</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.learning.preferences.autoPlay}
                      onChange={(e) => handleNestedSettingChange('learning', 'preferences', 'autoPlay', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            {/* Theme Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'auto', icon: Monitor, label: 'Auto' }
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => handleSettingChange('appearance', 'theme', value)}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      settings.appearance.theme === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={24} className="mx-auto mb-2" />
                    <div className="font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Color Scheme</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { value: 'blue', color: 'bg-blue-500' },
                  { value: 'green', color: 'bg-green-500' },
                  { value: 'purple', color: 'bg-purple-500' },
                  { value: 'orange', color: 'bg-orange-500' }
                ].map(({ value, color }) => (
                  <button
                    key={value}
                    onClick={() => handleSettingChange('appearance', 'colorScheme', value)}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      settings.appearance.colorScheme === value
                        ? 'border-gray-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 ${color} rounded-full mx-auto mb-2`}></div>
                    <div className="font-medium capitalize">{value}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                  <select
                    value={settings.appearance.fontSize}
                    onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Reduce Motion</div>
                    <div className="text-sm text-gray-600">Minimize animations and transitions</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.appearance.reducedMotion}
                      onChange={(e) => handleSettingChange('appearance', 'reducedMotion', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg p-4 border max-w-md">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Theme</span>
            <select
              value={settings.appearance.theme}
              onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push.enabled}
                onChange={(e) => handleNestedSettingChange('notifications', 'push', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${variant === 'modal' ? 'max-w-4xl' : 'w-full'}`}>
      {variant === 'modal' && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {settingsCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  <div>
                    <div className="font-medium">{category.label}</div>
                    <div className="text-xs opacity-75">{category.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl p-6 border">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
                ))}
              </div>
            ) : (
              renderSettingSection()
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              {saveMessage && (
                <div className={`flex items-center text-sm ${
                  saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                }`}>
                  {saveMessage.includes('Error') ? (
                    <AlertCircle size={16} className="mr-1" />
                  ) : (
                    <CheckCircle size={16} className="mr-1" />
                  )}
                  {saveMessage}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Reset to Defaults
              </button>
              
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;