import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Star, Zap, TrendingUp, Calendar, Filter } from 'lucide-react';

// Component imports
import Leaderboard from '../components/gamification/Leaderboard';
import Loading from '../components/common/Loading';

// Service imports
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Leaderboards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedType, setSelectedType] = useState('xp');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      // Fetch users from the API
      const response = await userAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'xp', label: 'Experience Points', icon: Zap, description: 'Total XP earned' },
    { value: 'gems', label: 'Gems', icon: Star, description: 'Gems collected' },
    { value: 'streak', label: 'Learning Streak', icon: TrendingUp, description: 'Consecutive days' },
    { value: 'completion', label: 'Completion Rate', icon: Trophy, description: 'Percentage completed' }
  ];

  const timeframeOptions = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  if (loading) {
    return <Loading />;
  }

  const selectedTypeOption = typeOptions.find(option => option.value === selectedType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <span>Leaderboards</span>
              </h1>
              <p className="text-gray-600 mt-1">
                See how you rank against other learners
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>Updated hourly</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Type Filter */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Ranking Type</span>
              </h3>
              
              <div className="space-y-2">
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedType(option.value)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedType === option.value
                          ? 'bg-orange-50 border-orange-200 text-orange-900'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${
                          selectedType === option.value ? 'text-orange-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium text-black">{option.label}</p>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeframe Filter */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Time Period</span>
              </h3>
              
              <div className="space-y-2">
                {timeframeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTimeframe(option.value)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedTimeframe === option.value
                        ? 'bg-orange-100 text-orange-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h4 className="font-semibold text-blue-900 mb-2">How Rankings Work</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• Rankings update every hour</p>
                <p>• Only active learners are included</p>
                <p>• Ties are broken by join date</p>
                <p>• Keep learning to climb higher!</p>
              </div>
            </div>
          </div>

          {/* Main Leaderboard */}
          <div className="lg:col-span-3">
            <Leaderboard
              users={users}
              currentUserId={user?._id}
              type={selectedType}
              timeframe={selectedTimeframe}
              showCurrentUser={true}
              maxDisplay={20}
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
