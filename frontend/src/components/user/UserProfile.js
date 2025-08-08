// src/components/user/UserProfile.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  Mail,
  MapPin,
  Calendar,
  School,
  Award,
  Star,
  Flame,
  TrendingUp,
  BookOpen,
  Clock,
  Target,
  Users,
  Edit3,
  Camera,
  Shield,
  Settings,
  BarChart3,
  Trophy,
  Zap,
  CheckCircle,
  Heart,
  Share2,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

// Import contexts and hooks
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { useGamification } from '../../hooks/useGamification';

// Import components
import ProgressTracker from '../learning/ProgressTracker';
import BadgeDisplay from '../gamification/BadgeDisplay';

// Import utilities
import { formatDate, formatDuration } from '../../utils/dateUtils';
import { calculatePerformanceMetrics } from '../../utils/progressCalculator';

const UserProfile = ({ 
  userId = null, // If null, shows current user
  variant = 'full', // 'full', 'compact', 'mini', 'card'
  showActions = true,
  showStats = true,
  showAchievements = true,
  isEditable = false,
  onEdit = null
}) => {
  const navigate = useNavigate();
  
  // State
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // Contexts and hooks
  const { user: currentUser } = useAuth();
  const { userProgress } = useProgress();
  const { 
    totalXP, 
    gems, 
    coins, 
    levelInfo, 
    achievements, 
    streakData,
    weeklyStats 
  } = useGamification();

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        if (userId && userId !== currentUser?.id) {
          // Load other user's profile (would come from API)
          const userData = await fetchUserProfile(userId);
          setProfileUser(userData);
        } else {
          // Use current user
          setProfileUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, currentUser]);

  // Mock function to fetch user profile
  const fetchUserProfile = async (id) => {
    // In real app, this would be an API call
    return {
      id,
      name: 'Alex Student',
      email: 'alex@student.com',
      avatar: '/api/placeholder/100/100',
      bio: 'Passionate learner exploring science and mathematics. Love solving complex problems!',
      location: 'Dar es Salaam, Tanzania',
      school: 'Mwalimu Secondary School',
      grade: 'Form 4',
      joinedAt: '2024-01-15',
      isPublic: true,
      followers: 156,
      following: 89,
      interests: ['Mathematics', 'Physics', 'Computer Science']
    };
  };

  // Calculate performance metrics
  const performanceMetrics = calculatePerformanceMetrics(userProgress);

  // Handle follow/unfollow
  const handleFollow = async () => {
    try {
      // API call to follow/unfollow user
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-8">
        <User size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  const isOwnProfile = !userId || userId === currentUser?.id;

  // Mini variant for mentions/lists
  if (variant === 'mini') {
    return (
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={profileUser.avatar}
            alt={profileUser.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          {isOwnProfile && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{profileUser.name}</p>
          {levelInfo && (
            <p className="text-xs text-gray-600">Level {levelInfo.level}</p>
          )}
        </div>
      </div>
    );
  }

  // Card variant for profile cards
  if (variant === 'card') {
    return (
      <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition-all cursor-pointer"
           onClick={() => navigate(`/profile/${profileUser.id}`)}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="relative inline-block">
            <img
              src={profileUser.avatar}
              alt={profileUser.name}
              className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
            />
            {levelInfo && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold text-white">{levelInfo.level}</span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">{profileUser.name}</h3>
          {profileUser.school && (
            <p className="text-sm text-gray-600">{profileUser.school}</p>
          )}
        </div>

        {/* Quick Stats */}
        {showStats && (
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-lg font-bold text-blue-600">{levelInfo?.level || 1}</div>
              <div className="text-xs text-gray-600">Level</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{totalXP || 0}</div>
              <div className="text-xs text-gray-600">XP</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{achievements?.length || 0}</div>
              <div className="text-xs text-gray-600">Badges</div>
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        {showAchievements && achievements?.length > 0 && (
          <div className="flex justify-center space-x-1">
            {achievements.slice(0, 3).map((achievement) => (
              <BadgeDisplay
                key={achievement.id}
                achievement={achievement}
                size="sm"
                variant="icon"
              />
            ))}
            {achievements.length > 3 && (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">+{achievements.length - 3}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Compact variant for sidebars
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={profileUser.avatar}
              alt={profileUser.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {levelInfo && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold text-white">{levelInfo.level}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{profileUser.name}</h4>
            <p className="text-sm text-gray-600">{profileUser.school}</p>
            {streakData && (
              <div className="flex items-center mt-1 text-xs text-orange-600">
                <Flame size={12} className="mr-1" />
                {streakData.currentStreak} day streak
              </div>
            )}
          </div>
          
          {showActions && isEditable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit ? onEdit() : navigate('/profile/edit');
              }}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <Edit3 size={16} />
            </button>
          )}
        </div>

        {showStats && (
          <div className="grid grid-cols-4 gap-2 mt-4 text-center">
            <div>
              <div className="text-sm font-bold text-blue-600">{totalXP || 0}</div>
              <div className="text-xs text-gray-600">XP</div>
            </div>
            <div>
              <div className="text-sm font-bold text-purple-600">{gems || 0}</div>
              <div className="text-xs text-gray-600">Gems</div>
            </div>
            <div>
              <div className="text-sm font-bold text-green-600">{achievements?.length || 0}</div>
              <div className="text-xs text-gray-600">Badges</div>
            </div>
            <div>
              <div className="text-sm font-bold text-orange-600">{streakData?.currentStreak || 0}</div>
              <div className="text-xs text-gray-600">Streak</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant for profile pages
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl p-6 border">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
          {/* Avatar and Basic Info */}
          <div className="text-center md:text-left">
            <div className="relative inline-block">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-24 h-24 rounded-full object-cover mx-auto md:mx-0"
              />
              {isEditable && (
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
            
            <h2 className="text-2xl font-bold text-gray-900 mt-4">{profileUser.name}</h2>
            
            {/* Status/Title */}
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
                {profileUser.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail size={16} className="mr-2" />
                    <span className="text-sm">{profileUser.email}</span>
                  </div>
                )}
                
                {profileUser.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-sm">{profileUser.location}</span>
                  </div>
                )}
                
                {profileUser.school && (
                  <div className="flex items-center text-gray-600">
                    <School size={16} className="mr-2" />
                    <span className="text-sm">{profileUser.school}</span>
                    {profileUser.grade && <span className="text-sm ml-1">({profileUser.grade})</span>}
                  </div>
                )}
                
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span className="text-sm">Joined {formatDate(profileUser.joinedAt, 'medium')}</span>
                </div>
              </div>

              {/* Social Stats */}
              <div className="space-y-3">
                {!isOwnProfile && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users size={16} className="mr-1" />
                      <span>{profileUser.followers || 0} followers</span>
                    </div>
                    <div className="flex items-center">
                      <span>{profileUser.following || 0} following</span>
                    </div>
                  </div>
                )}

                {/* Streak Info */}
                {streakData && (
                  <div className="flex items-center text-gray-600">
                    <Flame size={16} className="mr-2 text-orange-500" />
                    <span className="text-sm">
                      {streakData.currentStreak} day learning streak
                      {streakData.longestStreak > streakData.currentStreak && 
                        ` (best: ${streakData.longestStreak})`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <div className="mt-4">
                <p className="text-gray-700">{profileUser.bio}</p>
              </div>
            )}

            {/* Interests */}
            {profileUser.interests && profileUser.interests.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {profileUser.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-col space-y-2 mt-6 md:mt-0">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit3 size={16} className="mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => navigate('/profile/settings')}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <Users size={16} className="mr-2" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <MessageCircle size={16} className="mr-2" />
                    Message
                  </button>
                  <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 size={16} className="mr-2" />
                    Share
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border text-center">
            <div className="text-2xl font-bold text-blue-600">{totalXP || 0}</div>
            <div className="text-sm text-gray-600">Total XP</div>
            <div className="mt-2">
              <ProgressTracker
                progress={levelInfo?.progressToNextLevel || 0}
                size="sm"
                showLabel={false}
              />
              <div className="text-xs text-gray-500 mt-1">
                {levelInfo?.xpToNextLevel || 0} to Level {(levelInfo?.level || 1) + 1}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border text-center">
            <div className="text-2xl font-bold text-purple-600">{gems || 0}</div>
            <div className="text-sm text-gray-600">Gems</div>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
              <Zap size={12} className="mr-1" />
              +{weeklyStats?.gemsEarned || 0} this week
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border text-center">
            <div className="text-2xl font-bold text-green-600">{achievements?.length || 0}</div>
            <div className="text-sm text-gray-600">Achievements</div>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
              <Trophy size={12} className="mr-1" />
              +{weeklyStats?.achievementsEarned || 0} this week
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
      )}

      {/* Achievements Section */}
      {showAchievements && achievements && achievements.length > 0 && (
        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award size={20} className="mr-2 text-yellow-500" />
              Recent Achievements
            </h3>
            {achievements.length > 6 && (
              <button
                onClick={() => setShowAllAchievements(!showAllAchievements)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showAllAchievements ? 'Show Less' : 'View All'}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(showAllAchievements ? achievements : achievements.slice(0, 6)).map((achievement) => (
              <BadgeDisplay
                key={achievement.id}
                achievement={achievement}
                variant="card"
                size="md"
              />
            ))}
          </div>
        </div>
      )}

      {/* Learning Performance */}
      {showStats && performanceMetrics && (
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 size={20} className="mr-2 text-green-500" />
            Learning Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Average Quiz Score</div>
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics.averageQuizScore.toFixed(0)}%
              </div>
              <ProgressTracker
                progress={performanceMetrics.averageQuizScore}
                size="sm"
                showLabel={false}
                className="mt-2"
              />
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics.completionRate.toFixed(0)}%
              </div>
              <ProgressTracker
                progress={performanceMetrics.completionRate}
                color="green"
                size="sm"
                showLabel={false}
                className="mt-2"
              />
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Learning Velocity</div>
              <div className="text-2xl font-bold text-purple-600">
                {performanceMetrics.learningVelocity.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-2">chapters/week</div>
            </div>
          </div>

          {/* Subject Performance */}
          {performanceMetrics.strongSubjects.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Strong Subjects</h4>
              <div className="flex flex-wrap gap-2">
                {performanceMetrics.strongSubjects.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    <CheckCircle size={14} className="mr-1" />
                    {subject.subject.replace('_', ' ')} ({subject.averageScore.toFixed(0)}%)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;