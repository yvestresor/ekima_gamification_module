// src/components/recommendations/SmartSuggestions.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Play,
  Zap,
  Award,
  ChevronRight,
  Star,
  Users,
  Calendar,
  BarChart3,
  Flame,
  RefreshCw,
  X,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Brain,
  Sparkles,
  Compass
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../../context/ProgressContext';
import { useRecommendations } from '../../context/RecommendationContext';
import { useGamification } from '../../hooks/useGamification';
import { useAuth } from '../../context/AuthContext';

// Import utilities
import { formatDate, getTimeOfDay } from '../../utils/dateUtils';

const SmartSuggestions = ({ 
  variant = 'full', // 'full', 'compact', 'widget'
  category = 'all', // 'all', 'topics', 'videos', 'experiments', 'review'
  maxSuggestions = 6,
  showFeedback = true,
  onSuggestionClick = null
}) => {
  const navigate = useNavigate();
  
  // State
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());
  const [feedbackGiven, setFeedbackGiven] = useState(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  // Contexts and hooks
  const { userProgress, learningHistory } = useProgress();
  const { getSmartRecommendations, recordSuggestionInteraction } = useRecommendations();
  const { levelInfo, streakData, dailyGoals } = useGamification();
  const { user } = useAuth();

  // Load suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      setIsLoading(true);
      try {
        const smartSuggestions = await generateSmartSuggestions();
        setSuggestions(smartSuggestions.filter(s => !dismissedSuggestions.has(s.id)));
      } catch (error) {
        console.error('Error loading suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [userProgress, category, refreshKey, dismissedSuggestions]);

  // Generate smart suggestions based on user data
  const generateSmartSuggestions = async () => {
    const currentTime = new Date();
    const timeOfDay = getTimeOfDay();
    const dayOfWeek = currentTime.getDay();
    
    const suggestions = [];

    // Time-based suggestions
    if (timeOfDay === 'morning') {
      suggestions.push({
        id: 'morning_motivation',
        type: 'motivation',
        title: 'Start Your Day Strong! 🌅',
        description: 'Begin with a quick review session to activate your learning mindset',
        reason: 'Morning learning sessions improve retention by 23%',
        action: 'Start Review',
        actionType: 'review',
        priority: 'high',
        confidence: 85,
        estimatedTime: 15,
        xpReward: 25,
        category: 'review'
      });
    }

    // Streak-based suggestions
    if (streakData.currentStreak >= 7) {
      suggestions.push({
        id: 'streak_challenge',
        type: 'challenge',
        title: `Amazing ${streakData.currentStreak}-Day Streak! 🔥`,
        description: 'Take on a challenging topic to maintain your momentum',
        reason: 'Your consistent learning pattern shows you\'re ready for harder content',
        action: 'View Challenges',
        actionType: 'topic',
        topicId: 'advanced_topics',
        priority: 'medium',
        confidence: 78,
        estimatedTime: 30,
        xpReward: 50,
        category: 'topics'
      });
    } else if (streakData.currentStreak === 0) {
      suggestions.push({
        id: 'streak_restart',
        type: 'motivation',
        title: 'Ready to Restart Your Streak? 💪',
        description: 'A short video lesson is a perfect way to get back on track',
        reason: 'Quick wins help rebuild learning momentum',
        action: 'Watch Video',
        actionType: 'video',
        priority: 'high',
        confidence: 90,
        estimatedTime: 10,
        xpReward: 20,
        category: 'videos'
      });
    }

    // Performance-based suggestions
    const weakSubjects = getWeakSubjects();
    if (weakSubjects.length > 0) {
      suggestions.push({
        id: 'weakness_improvement',
        type: 'improvement',
        title: `Strengthen Your ${weakSubjects[0].name} Skills`,
        description: 'Focus on areas where you can make the biggest improvement',
        reason: `Your ${weakSubjects[0].name} average is ${weakSubjects[0].average}% - let's boost it!`,
        action: 'Practice Now',
        actionType: 'topic',
        subjectId: weakSubjects[0].id,
        priority: 'high',
        confidence: 88,
        estimatedTime: 25,
        xpReward: 40,
        category: 'topics'
      });
    }

    // Level-based suggestions
    if (levelInfo.progressToNextLevel > 80) {
      suggestions.push({
        id: 'level_up_soon',
        type: 'achievement',
        title: 'So Close to Leveling Up! ⭐',
        description: `Only ${levelInfo.xpToNextLevel} XP needed to reach Level ${levelInfo.level + 1}`,
        reason: 'Complete any activity to level up and unlock new features',
        action: 'Earn XP',
        actionType: 'any',
        priority: 'medium',
        confidence: 95,
        estimatedTime: 15,
        xpReward: levelInfo.xpToNextLevel,
        category: 'all'
      });
    }

    // Time-available suggestions
    const availableTime = getAvailableStudyTime();
    if (availableTime <= 15) {
      suggestions.push({
        id: 'quick_session',
        type: 'time_optimized',
        title: 'Perfect for a Quick Session',
        description: 'These short activities fit perfectly in your available time',
        reason: `You have ${availableTime} minutes - ideal for focused learning`,
        action: 'Quick Learn',
        actionType: 'video',
        priority: 'medium',
        confidence: 82,
        estimatedTime: availableTime,
        xpReward: 15,
        category: 'videos'
      });
    }

    // Goal-based suggestions
    if (dailyGoals.chaptersCompleted < dailyGoals.chaptersTarget) {
      const remaining = dailyGoals.chaptersTarget - dailyGoals.chaptersCompleted;
      suggestions.push({
        id: 'daily_goal',
        type: 'goal',
        title: `${remaining} More Chapter${remaining > 1 ? 's' : ''} to Goal! 🎯`,
        description: 'Stay on track with your daily learning target',
        reason: 'Consistent goal achievement improves long-term retention',
        action: 'Continue Chapter',
        actionType: 'topic',
        priority: 'medium',
        confidence: 85,
        estimatedTime: 20,
        xpReward: 30,
        category: 'topics'
      });
    }

    // Exploration suggestions
    const unexploredSubjects = getUnexploredSubjects();
    if (unexploredSubjects.length > 0) {
      suggestions.push({
        id: 'explore_new',
        type: 'exploration',
        title: 'Discover Something New! 🚀',
        description: `Try ${unexploredSubjects[0].name} - it connects well with your current studies`,
        reason: 'Cross-subject learning strengthens understanding',
        action: 'Explore',
        actionType: 'subject',
        subjectId: unexploredSubjects[0].id,
        priority: 'low',
        confidence: 70,
        estimatedTime: 20,
        xpReward: 35,
        category: 'topics'
      });
    }

    // Social/collaborative suggestions
    suggestions.push({
      id: 'popular_content',
      type: 'social',
      title: 'Trending This Week 📈',
      description: 'Join thousands of students learning this popular topic',
      reason: 'Peer learning increases engagement and understanding',
      action: 'Join Trend',
      actionType: 'topic',
      priority: 'low',
      confidence: 75,
      estimatedTime: 25,
      xpReward: 30,
      category: 'topics',
      socialProof: '2,847 students this week'
    });

    // Experimental learning suggestions
    if (Math.random() > 0.7) {
      suggestions.push({
        id: 'hands_on_learning',
        type: 'experiment',
        title: 'Try Hands-On Learning! 🧪',
        description: 'Interactive experiments make complex concepts click',
        reason: 'Kinesthetic learning improves concept retention by 40%',
        action: 'Start Experiment',
        actionType: 'experiment',
        priority: 'medium',
        confidence: 80,
        estimatedTime: 30,
        xpReward: 45,
        category: 'experiments'
      });
    }

    // Filter by category and limit
    return suggestions
      .filter(s => category === 'all' || s.category === category)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority] || b.confidence - a.confidence;
      })
      .slice(0, maxSuggestions);
  };

  // Helper functions
  const getWeakSubjects = () => {
    // Analyze userProgress from context to determine weak subjects
    if (!userProgress || !userProgress.subjects) return [];
    return Object.entries(userProgress.subjects)
      .filter(([_, subj]) => subj.average < 75)
      .map(([id, subj]) => ({ id, name: subj.name, average: subj.average }));
  };

  const getUnexploredSubjects = () => {
    // Find subjects in context that have not been started by the user
    if (!userProgress || !userProgress.subjects) return [];
    return Object.entries(userProgress.subjects)
      .filter(([_, subj]) => !subj.started)
      .map(([id, subj]) => ({ id, name: subj.name }));
  };

  const getAvailableStudyTime = () => {
    // Use a default or user preference from context
    return (user && user.preferences && user.preferences.timeAvailable) || 30;
  };

  // Handle suggestion click
  const handleSuggestionClick = async (suggestion) => {
    try {
      // Record interaction
      await recordSuggestionInteraction(suggestion.id, 'clicked');
      
      // Custom handler if provided
      if (onSuggestionClick) {
        onSuggestionClick(suggestion);
        return;
      }

      // Default navigation based on action type
      switch (suggestion.actionType) {
        case 'topic':
          if (suggestion.topicId) {
            navigate(`/topic/${suggestion.topicId}`);
          } else if (suggestion.subjectId) {
            navigate(`/subject/${suggestion.subjectId}`);
          } else {
            navigate('/subjects');
          }
          break;
        case 'video':
          navigate('/videos');
          break;
        case 'experiment':
          navigate('/experiments');
          break;
        case 'review':
          navigate('/progress');
          break;
        case 'subject':
          navigate(`/subject/${suggestion.subjectId}`);
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error handling suggestion click:', error);
    }
  };

  // Handle suggestion dismissal
  const handleDismiss = async (suggestionId) => {
    try {
      await recordSuggestionInteraction(suggestionId, 'dismissed');
      setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  // Handle feedback
  const handleFeedback = async (suggestionId, feedback) => {
    try {
      await recordSuggestionInteraction(suggestionId, feedback);
      setFeedbackGiven(prev => new Set([...prev, suggestionId]));
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  // Refresh suggestions
  const refreshSuggestions = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Get suggestion icon
  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'motivation': return Flame;
      case 'challenge': return Target;
      case 'improvement': return TrendingUp;
      case 'achievement': return Award;
      case 'time_optimized': return Clock;
      case 'goal': return CheckCircle;
      case 'exploration': return Compass;
      case 'social': return Users;
      case 'experiment': return Zap;
      default: return Lightbulb;
    }
  };

  // Get suggestion color
  const getSuggestionColor = (type) => {
    switch (type) {
      case 'motivation': return 'from-orange-400 to-red-500';
      case 'challenge': return 'from-purple-400 to-pink-500';
      case 'improvement': return 'from-blue-400 to-indigo-500';
      case 'achievement': return 'from-yellow-400 to-orange-500';
      case 'time_optimized': return 'from-green-400 to-blue-500';
      case 'goal': return 'from-teal-400 to-green-500';
      case 'exploration': return 'from-indigo-400 to-purple-500';
      case 'social': return 'from-pink-400 to-rose-500';
      case 'experiment': return 'from-cyan-400 to-blue-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  // Widget variant for dashboard
  if (variant === 'widget') {
    const topSuggestion = suggestions[0];
    if (!topSuggestion) return null;

    const IconComponent = getSuggestionIcon(topSuggestion.type);
    
    return (
      <div 
        className={`bg-gradient-to-r ${getSuggestionColor(topSuggestion.type)} rounded-lg p-4 text-white cursor-pointer hover:shadow-lg transition-all`}
        onClick={() => handleSuggestionClick(topSuggestion)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <IconComponent size={24} className="mr-3" />
            <div>
              <h4 className="font-medium">{topSuggestion.title}</h4>
              <p className="text-sm opacity-90">{topSuggestion.description}</p>
            </div>
          </div>
          <ArrowRight size={20} />
        </div>
      </div>
    );
  }

  // Compact variant for sidebars
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Brain size={16} className="mr-2 text-purple-500" />
            Smart Suggestions
          </h3>
          <button
            onClick={refreshSuggestions}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        
        <div className="space-y-3">
          {suggestions.slice(0, 3).map((suggestion) => {
            const IconComponent = getSuggestionIcon(suggestion.type);
            return (
              <div
                key={suggestion.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-start">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getSuggestionColor(suggestion.type)} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                    <IconComponent size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{suggestion.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{suggestion.description}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock size={10} className="mr-1" />
                      {suggestion.estimatedTime}min
                      <Award size={10} className="ml-2 mr-1" />
                      {suggestion.xpReward} XP
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {suggestions.length > 3 && (
          <button
            onClick={() => navigate('/suggestions')}
            className="w-full mt-3 text-sm text-purple-600 hover:text-purple-700 text-center"
          >
            View All Suggestions
          </button>
        )}
      </div>
    );
  }

  // Full variant for dedicated pages
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles size={28} className="mr-3 text-purple-500" />
            Smart Suggestions
          </h2>
          <p className="text-gray-600 mt-1">Personalized recommendations based on your learning patterns</p>
        </div>
        
        <button
          onClick={refreshSuggestions}
          className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Suggestions Grid */}
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((suggestion) => {
            const IconComponent = getSuggestionIcon(suggestion.type);
            const hasFeedback = feedbackGiven.has(suggestion.id);
            
            return (
              <div
                key={suggestion.id}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${getSuggestionColor(suggestion.type)} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IconComponent size={24} className="mr-3" />
                      <div>
                        <h3 className="font-semibold">{suggestion.title}</h3>
                        <div className="text-sm opacity-90 flex items-center mt-1">
                          <Clock size={12} className="mr-1" />
                          {suggestion.estimatedTime} min
                          <Award size={12} className="ml-3 mr-1" />
                          {suggestion.xpReward} XP
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                        {suggestion.confidence}% match
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(suggestion.id);
                        }}
                        className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <p className="text-gray-700 mb-3">{suggestion.description}</p>
                  
                  <div className="flex items-start mb-4">
                    <AlertCircle size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{suggestion.reason}</p>
                  </div>

                  {suggestion.socialProof && (
                    <div className="flex items-center mb-4 text-sm text-gray-600">
                      <Users size={14} className="mr-2" />
                      {suggestion.socialProof}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      {suggestion.action}
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                    
                    {/* Feedback */}
                    {showFeedback && !hasFeedback && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Helpful?</span>
                        <button
                          onClick={() => handleFeedback(suggestion.id, 'helpful')}
                          className="p-1 hover:bg-green-100 rounded transition-colors"
                        >
                          <ThumbsUp size={14} className="text-green-600" />
                        </button>
                        <button
                          onClick={() => handleFeedback(suggestion.id, 'not_helpful')}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <ThumbsDown size={14} className="text-red-600" />
                        </button>
                      </div>
                    )}
                    
                    {hasFeedback && (
                      <span className="text-xs text-green-600 flex items-center">
                        <CheckCircle size={12} className="mr-1" />
                        Thanks for feedback!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Brain size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Suggestions Available</h3>
          <p className="text-gray-600 mb-4">
            Complete more activities to receive personalized recommendations.
          </p>
          <button
            onClick={() => navigate('/subjects')}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Explore Subjects
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;