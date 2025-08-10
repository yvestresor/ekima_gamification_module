// src/pages/BadgeManagement.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award,
  Plus,
  Edit3,
  Trash2,
  Star,
  Trophy,
  Crown,
  Zap,
  Target,
  Clock,
  Users,
  BookOpen,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Settings,
  CheckCircle,
  X,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

// Import contexts and hooks
import { useAuth } from '../context/AuthContext';
import { badgeAPI } from '../services/api';

// Import components
import Loading from '../components/common/Loading';

const BadgeManagement = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  // State
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // CRUD state
  const [showAddBadgeModal, setShowAddBadgeModal] = useState(false);
  const [showEditBadgeModal, setShowEditBadgeModal] = useState(false);
  const [editBadge, setEditBadge] = useState(null);
  const [badgeCrudLoading, setBadgeCrudLoading] = useState(false);
  const [badgeCrudError, setBadgeCrudError] = useState(null);
  const [badgeCrudSuccess, setBadgeCrudSuccess] = useState(null);
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '',
    xp_reward: 0,
    gems_reward: 0,
    rarity: 'common',
    requirement: '',
    type: 'completion',
    criteria: {
      threshold: 1,
      timeframe: 'all_time',
      conditions: []
    }
  });

  // Check permissions
  const canManageBadges = user && (user.role === 'admin' || user.role === 'teacher' || hasPermission('manage_badges'));

  useEffect(() => {
    if (!canManageBadges) {
      navigate('/');
      return;
    }
    
    loadBadges();
  }, [canManageBadges, navigate]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const response = await badgeAPI.getAll();
      setBadges(response.data || []);
    } catch (err) {
      setError('Failed to load badges');
      console.error('Badge loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter badges
  const getFilteredBadges = () => {
    return badges.filter(badge => {
      const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity;
      const matchesType = selectedType === 'all' || badge.type === selectedType;
      const matchesSearch = !searchQuery || 
        badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.requirement.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesRarity && matchesType && matchesSearch;
    });
  };

  const filteredBadges = getFilteredBadges();

  // Get rarity color and icon
  const getRarityInfo = (rarity) => {
    switch (rarity) {
      case 'common':
        return { color: 'text-gray-600 bg-gray-100', icon: Star, borderColor: 'border-gray-300' };
      case 'rare':
        return { color: 'text-blue-600 bg-blue-100', icon: Award, borderColor: 'border-blue-300' };
      case 'epic':
        return { color: 'text-purple-600 bg-purple-100', icon: Trophy, borderColor: 'border-purple-300' };
      case 'legendary':
        return { color: 'text-yellow-600 bg-yellow-100', icon: Crown, borderColor: 'border-yellow-300' };
      default:
        return { color: 'text-gray-600 bg-gray-100', icon: Star, borderColor: 'border-gray-300' };
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'completion':
        return CheckCircle;
      case 'streak':
        return Zap;
      case 'performance':
        return Target;
      case 'activity':
        return Users;
      default:
        return Award;
    }
  };

  // CRUD handlers
  const handleAddBadge = async () => {
    setBadgeCrudLoading(true);
    setBadgeCrudError(null);
    setBadgeCrudSuccess(null);
    
    try {
      await badgeAPI.create(badgeForm);
      setBadgeCrudSuccess('Badge created successfully');
      setShowAddBadgeModal(false);
      resetBadgeForm();
      await loadBadges();
    } catch (err) {
      setBadgeCrudError('Failed to create badge');
    } finally {
      setBadgeCrudLoading(false);
    }
  };

  const handleEditBadge = async () => {
    setBadgeCrudLoading(true);
    setBadgeCrudError(null);
    setBadgeCrudSuccess(null);
    
    try {
      await badgeAPI.update(editBadge._id, badgeForm);
      setBadgeCrudSuccess('Badge updated successfully');
      setShowEditBadgeModal(false);
      setEditBadge(null);
      resetBadgeForm();
      await loadBadges();
    } catch (err) {
      setBadgeCrudError('Failed to update badge');
    } finally {
      setBadgeCrudLoading(false);
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!window.confirm('Are you sure you want to delete this badge? This action cannot be undone.')) {
      return;
    }
    
    setBadgeCrudLoading(true);
    setBadgeCrudError(null);
    setBadgeCrudSuccess(null);
    
    try {
      await badgeAPI.delete(badgeId);
      setBadgeCrudSuccess('Badge deleted successfully');
      await loadBadges();
    } catch (err) {
      setBadgeCrudError('Failed to delete badge');
    } finally {
      setBadgeCrudLoading(false);
    }
  };

  const resetBadgeForm = () => {
    setBadgeForm({
      name: '',
      description: '',
      icon: '',
      xp_reward: 0,
      gems_reward: 0,
      rarity: 'common',
      requirement: '',
      type: 'completion',
      criteria: {
        threshold: 1,
        timeframe: 'all_time',
        conditions: []
      }
    });
  };

  const openEditModal = (badge) => {
    setEditBadge(badge);
    setBadgeForm({
      name: badge.name || '',
      description: badge.description || '',
      icon: badge.icon || '',
      xp_reward: badge.xp_reward || 0,
      gems_reward: badge.gems_reward || 0,
      rarity: badge.rarity || 'common',
      requirement: badge.requirement || '',
      type: badge.type || 'completion',
      criteria: badge.criteria || {
        threshold: 1,
        timeframe: 'all_time',
        conditions: []
      }
    });
    setShowEditBadgeModal(true);
  };

  if (!canManageBadges) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Profile
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Award size={32} className="mr-3 text-yellow-600" />
                  Badge Management
                </h1>
                <p className="text-gray-600 mt-1">Create and configure achievement badges for your platform</p>
              </div>
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search badges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-64 text-black"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>

              {/* Add Badge Button */}
              <button
                onClick={() => {
                  resetBadgeForm();
                  setShowAddBadgeModal(true);
                }}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Create Badge
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{badges.length}</p>
                <p className="text-sm text-gray-600">Total Badges</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-gray-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {badges.filter(b => b.rarity === 'common').length}
                </p>
                <p className="text-sm text-gray-600">Common</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {badges.filter(b => b.rarity === 'epic').length}
                </p>
                <p className="text-sm text-gray-600">Epic</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {badges.filter(b => b.rarity === 'legendary').length}
                </p>
                <p className="text-sm text-gray-600">Legendary</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center text-yellow-600 hover:text-yellow-700"
            >
              <Filter size={16} className="mr-1" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${showFilters ? '' : 'hidden lg:grid'}`}>
            {/* Rarity Filter */}
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-black"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-black"
            >
              <option value="all">All Types</option>
              <option value="completion">Completion</option>
              <option value="streak">Streak</option>
              <option value="performance">Performance</option>
              <option value="activity">Activity</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSelectedRarity('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredBadges.length} of {badges.length} badges
          </div>
        </div>

        {/* CRUD Feedback */}
        {badgeCrudSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-600">{badgeCrudSuccess}</p>
          </div>
        )}
        {badgeCrudError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{badgeCrudError}</p>
          </div>
        )}

        {/* Badges Grid/List */}
        {filteredBadges.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredBadges.map((badge) => {
              const rarityInfo = getRarityInfo(badge.rarity);
              const TypeIcon = getTypeIcon(badge.type);
              const RarityIcon = rarityInfo.icon;

              return (
                <div
                  key={badge._id}
                  className={`
                    bg-white rounded-xl shadow-sm border-2 ${rarityInfo.borderColor} overflow-hidden hover:shadow-lg transition-all duration-200
                    ${viewMode === 'list' ? 'flex' : ''}
                  `}
                >
                  {/* Badge Icon/Visual */}
                  <div className={`
                    ${viewMode === 'list' ? 'w-24 h-24' : 'aspect-square h-32'}
                    bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center relative
                  `}>
                    <div className="text-4xl">
                      {badge.icon || '🏆'}
                    </div>
                    
                    {/* Rarity indicator */}
                    <div className="absolute top-2 right-2">
                      <div className={`p-1 rounded-full ${rarityInfo.color}`}>
                        <RarityIcon size={12} />
                      </div>
                    </div>

                    {/* Type indicator */}
                    <div className="absolute bottom-2 left-2">
                      <div className="p-1 rounded-full bg-white shadow-sm">
                        <TypeIcon size={12} className="text-gray-600" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{badge.name}</h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => openEditModal(badge)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteBadge(badge._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {badge.description}
                    </p>

                    {/* Requirements */}
                    <div className="text-xs text-gray-500 mb-3">
                      <strong>Requirement:</strong> {badge.requirement || 'No requirement specified'}
                    </div>

                    {/* Rewards and Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        {badge.xp_reward > 0 && (
                          <div className="flex items-center text-blue-600">
                            <Zap size={12} className="mr-1" />
                            {badge.xp_reward} XP
                          </div>
                        )}
                        {badge.gems_reward > 0 && (
                          <div className="flex items-center text-purple-600">
                            <Star size={12} className="mr-1" />
                            {badge.gems_reward} Gems
                          </div>
                        )}
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${rarityInfo.color}`}>
                        {badge.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Badges Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedRarity !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Create your first badge to get started.'
              }
            </p>
            {(!searchQuery && selectedRarity === 'all' && selectedType === 'all') && (
              <button
                onClick={() => {
                  resetBadgeForm();
                  setShowAddBadgeModal(true);
                }}
                className="flex items-center mx-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Create First Badge
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Badge Modal */}
      {(showAddBadgeModal || showEditBadgeModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Award className="w-6 h-6 mr-3 text-yellow-600" />
                  {showAddBadgeModal ? 'Create New Badge' : 'Edit Badge'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddBadgeModal(false);
                    setShowEditBadgeModal(false);
                    setEditBadge(null);
                    resetBadgeForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={e => { e.preventDefault(); showAddBadgeModal ? handleAddBadge() : handleEditBadge(); }}>
              <div className="px-6 py-6 space-y-6">
                {/* Badge Preview */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center text-3xl border-2 border-yellow-300">
                      {badgeForm.icon || '🏆'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {badgeForm.name || 'Badge Name'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {badgeForm.description || 'Badge description will appear here...'}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        {badgeForm.xp_reward > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            +{badgeForm.xp_reward} XP
                          </span>
                        )}
                        {badgeForm.gems_reward > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            +{badgeForm.gems_reward} Gems
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          badgeForm.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                          badgeForm.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                          badgeForm.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {badgeForm.rarity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Badge Name *</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors" 
                        placeholder="Enter a memorable badge name" 
                        value={badgeForm.name} 
                        onChange={e => setBadgeForm(f => ({ ...f, name: e.target.value }))} 
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji or URL) *</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors" 
                        placeholder="🏆 or image URL" 
                        value={badgeForm.icon} 
                        onChange={e => setBadgeForm(f => ({ ...f, icon: e.target.value }))} 
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea 
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors resize-none" 
                      placeholder="Describe what this badge represents and how students can earn it..." 
                      value={badgeForm.description} 
                      onChange={e => setBadgeForm(f => ({ ...f, description: e.target.value }))} 
                      required 
                    />
                  </div>
                </div>

                {/* Badge Properties */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-600" />
                    Badge Properties
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Badge Type *</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors" 
                        value={badgeForm.type} 
                        onChange={e => setBadgeForm(f => ({ ...f, type: e.target.value }))}
                      >
                        <option value="completion">✅ Completion</option>
                        <option value="streak">⚡ Streak</option>
                        <option value="performance">🎯 Performance</option>
                        <option value="activity">👥 Activity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rarity Level</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors" 
                        value={badgeForm.rarity} 
                        onChange={e => setBadgeForm(f => ({ ...f, rarity: e.target.value }))}
                      >
                        <option value="common">⚪ Common</option>
                        <option value="rare">🔵 Rare</option>
                        <option value="epic">🟣 Epic</option>
                        <option value="legendary">🟡 Legendary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors" 
                        value={badgeForm.criteria.timeframe} 
                        onChange={e => setBadgeForm(f => ({ ...f, criteria: { ...f.criteria, timeframe: e.target.value } }))}
                      >
                        <option value="all_time">All Time</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rewards */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-green-600" />
                    Rewards
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">XP Reward</label>
                      <input 
                        type="number" 
                        min={0} 
                        max={1000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors" 
                        value={badgeForm.xp_reward} 
                        onChange={e => setBadgeForm(f => ({ ...f, xp_reward: parseInt(e.target.value) || 0 }))} 
                      />
                      <p className="text-xs text-gray-500 mt-1">Experience points awarded when earned</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gems Reward</label>
                      <input 
                        type="number" 
                        min={0} 
                        max={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors" 
                        value={badgeForm.gems_reward} 
                        onChange={e => setBadgeForm(f => ({ ...f, gems_reward: parseInt(e.target.value) || 0 }))} 
                      />
                      <p className="text-xs text-gray-500 mt-1">Premium currency bonus</p>
                    </div>
                  </div>
                </div>

                {/* Achievement Criteria */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-orange-600" />
                    Achievement Criteria
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Requirement Description *</label>
                      <textarea 
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors resize-none" 
                        placeholder="e.g., Complete 10 chapters in Mathematics" 
                        value={badgeForm.requirement} 
                        onChange={e => setBadgeForm(f => ({ ...f, requirement: e.target.value }))} 
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Threshold Value</label>
                      <input 
                        type="number" 
                        min={1} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors" 
                        placeholder="e.g., 10 for 10 chapters" 
                        value={badgeForm.criteria.threshold} 
                        onChange={e => setBadgeForm(f => ({ ...f, criteria: { ...f.criteria, threshold: parseInt(e.target.value) || 1 } }))} 
                      />
                      <p className="text-xs text-gray-500 mt-1">Numeric value to achieve (e.g., 10 chapters, 5 days)</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Achievement Examples</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• <strong>Completion:</strong> "Complete 5 chapters in any subject" (threshold: 5)</li>
                          <li>• <strong>Streak:</strong> "Maintain a 7-day learning streak" (threshold: 7)</li>
                          <li>• <strong>Performance:</strong> "Score 90% or higher on 3 quizzes" (threshold: 3)</li>
                          <li>• <strong>Activity:</strong> "Spend 60 minutes learning in a day" (threshold: 60)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" 
                    onClick={() => {
                      setShowAddBadgeModal(false);
                      setShowEditBadgeModal(false);
                      setEditBadge(null);
                      resetBadgeForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={badgeCrudLoading || !badgeForm.name || !badgeForm.description || !badgeForm.requirement}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                  >
                    {badgeCrudLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        {showAddBadgeModal ? 'Create Badge' : 'Save Changes'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeManagement;
