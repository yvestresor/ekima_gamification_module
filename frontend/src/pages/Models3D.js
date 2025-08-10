// src/pages/Models3D.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Box,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Eye,
  Download,
  Share2,
  Bookmark,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Info,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../context/ProgressContext';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';
import { contentAPI, model3dAPI } from '../services/api';

// Import components
import Loading from '../components/common/Loading';
import ProgressTracker from '../components/learning/ProgressTracker';

// Import utilities
import { formatDate } from '../utils/dateUtils';

const Models3D = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all');
  const [selectedModel, setSelectedModel] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [modelControls, setModelControls] = useState({
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 1,
    position: { x: 0, y: 0, z: 0 },
    isAnimating: false,
    showWireframe: false,
    showLabels: true
  });
  const [favorites, setFavorites] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Add CRUD state for 3D models
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [showEditModelModal, setShowEditModelModal] = useState(false);
  const [editModel, setEditModel] = useState(null);
  const [modelCrudLoading, setModelCrudLoading] = useState(false);
  const [modelCrudError, setModelCrudError] = useState(null);
  const [modelCrudSuccess, setModelCrudSuccess] = useState(null);
  const [modelForm, setModelForm] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    duration: 10,
    difficulty: 'easy',
    tags: [],
    downloadSize: '',
    viewCount: 0,
    hasAnimation: false,
    fileUrl: '',
    learningObjectives: [],
    instructions: [],
  });

  // Refs
  const modelViewerRef = useRef(null);
  const containerRef = useRef(null);

  // Contexts and hooks
  const { userProgress, updateModelProgress } = useProgress();
  const { addXP } = useGamification();
  const { user, hasPermission } = useAuth();

  // Load subjects for filter dropdown
  useEffect(() => {
    contentAPI.getSubjects().then(res => setSubjects(res.data));
  }, []);

  // Load topics when subject changes
  useEffect(() => {
    if (selectedSubject !== 'all') {
      contentAPI.getTopics(selectedSubject).then(res => setTopics(res.data));
    } else {
      setTopics([]);
    }
  }, [selectedSubject]);

  // Load models when filters change
  useEffect(() => {
    let params = {};
    if (selectedSubject !== 'all') params.subjectId = selectedSubject;
    if (searchQuery) params.q = searchQuery;
    model3dAPI.getAll(params)
      .then(res => setModels(res.data))
      .catch(() => setModels([]));
  }, [selectedSubject, searchQuery]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('ekima_model_favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  // Handle model selection
  const handleModelSelect = async (model) => {
    setSelectedModel(model);
    setIsLoading(true);
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Track model view
      await updateModelProgress(model.id, {
        viewed: true,
        viewedAt: new Date().toISOString(),
        timeSpent: 0
      });
      
      // Award XP for viewing
      await addXP(10, 'model_viewed');
      
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle model controls
  const handleModelControl = (action, value) => {
    setModelControls(prev => {
      switch (action) {
        case 'rotate':
          return { ...prev, rotation: { ...prev.rotation, ...value } };
        case 'zoom':
          return { ...prev, zoom: Math.max(0.1, Math.min(5, prev.zoom + value)) };
        case 'reset':
          return {
            ...prev,
            rotation: { x: 0, y: 0, z: 0 },
            zoom: 1,
            position: { x: 0, y: 0, z: 0 }
          };
        case 'toggleAnimation':
          return { ...prev, isAnimating: !prev.isAnimating };
        case 'toggleWireframe':
          return { ...prev, showWireframe: !prev.showWireframe };
        case 'toggleLabels':
          return { ...prev, showLabels: !prev.showLabels };
        default:
          return prev;
      }
    });
  };

  // Toggle favorite
  const toggleFavorite = (modelId) => {
    const newFavorites = favorites.includes(modelId)
      ? favorites.filter(id => id !== modelId)
      : [...favorites, modelId];
    
    setFavorites(newFavorites);
    localStorage.setItem('ekima_model_favorites', JSON.stringify(newFavorites));
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // CRUD handlers for 3D models
  const handleAddModel = async () => {
    setModelCrudLoading(true); setModelCrudError(null); setModelCrudSuccess(null);
    try {
      await model3dAPI.create(modelForm);
      setModelCrudSuccess('3D Model added successfully');
      setShowAddModelModal(false);
      setModelForm({ title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', tags: [], downloadSize: '', viewCount: 0, hasAnimation: false, fileUrl: '', learningObjectives: [], instructions: [] });
      // Refresh models
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (searchQuery) params.q = searchQuery;
      const res = await model3dAPI.getAll(params);
      setModels(res.data);
    } catch (err) {
      setModelCrudError('Failed to add 3D model');
    } finally {
      setModelCrudLoading(false);
    }
  };
  const handleEditModel = async () => {
    setModelCrudLoading(true); setModelCrudError(null); setModelCrudSuccess(null);
    try {
      await model3dAPI.update(editModel._id, modelForm);
      setModelCrudSuccess('3D Model updated successfully');
      setShowEditModelModal(false);
      setEditModel(null);
      setModelForm({ title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', tags: [], downloadSize: '', viewCount: 0, hasAnimation: false, fileUrl: '', learningObjectives: [], instructions: [] });
      // Refresh models
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (searchQuery) params.q = searchQuery;
      const res = await model3dAPI.getAll(params);
      setModels(res.data);
    } catch (err) {
      setModelCrudError('Failed to update 3D model');
    } finally {
      setModelCrudLoading(false);
    }
  };
  const handleDeleteModel = async (modelId) => {
    if (!window.confirm('Are you sure you want to delete this 3D model?')) return;
    setModelCrudLoading(true); setModelCrudError(null); setModelCrudSuccess(null);
    try {
      await model3dAPI.delete(modelId);
      setModelCrudSuccess('3D Model deleted successfully');
      // Refresh models
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (searchQuery) params.q = searchQuery;
      const res = await model3dAPI.getAll(params);
      setModels(res.data);
    } catch (err) {
      setModelCrudError('Failed to delete 3D model');
    } finally {
      setModelCrudLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">3D Models</h1>
              <p className="text-gray-600 mt-1">Explore interactive 3D models to enhance your learning</p>
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-black"
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Model Viewer Modal */}
        {selectedModel && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedModel.title}</h2>
                  <p className="text-gray-600 text-sm">{selectedModel.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorite(selectedModel.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(selectedModel.id)
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Bookmark size={20} />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedModel(null)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex h-[600px]">
                {/* 3D Viewer */}
                <div className="flex-1 relative bg-gray-900" ref={containerRef}>
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loading />
                        <p className="mt-4">Loading 3D model...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 3D Model Container */}
                      <div 
                        ref={modelViewerRef}
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          transform: `
                            rotateX(${modelControls.rotation.x}deg) 
                            rotateY(${modelControls.rotation.y}deg) 
                            rotateZ(${modelControls.rotation.z}deg) 
                            scale(${modelControls.zoom})
                          `
                        }}
                      >
                        {/* Placeholder 3D Model */}
                        <div className="relative">
                          <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center transform rotate-12 animate-pulse">
                            <Box size={64} className="text-white" />
                          </div>
                          
                          {modelControls.showLabels && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                              {selectedModel.title}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Model Controls Overlay */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-black bg-opacity-50 rounded-lg p-3 space-y-2">
                          <button
                            onClick={() => handleModelControl('reset')}
                            className="w-full bg-white bg-opacity-20 text-white p-2 rounded hover:bg-opacity-30 transition-colors flex items-center justify-center"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => handleModelControl('zoom', 0.1)}
                            className="w-full bg-white bg-opacity-20 text-white p-2 rounded hover:bg-opacity-30 transition-colors flex items-center justify-center"
                          >
                            <ZoomIn size={16} />
                          </button>
                          <button
                            onClick={() => handleModelControl('zoom', -0.1)}
                            className="w-full bg-white bg-opacity-20 text-white p-2 rounded hover:bg-opacity-30 transition-colors flex items-center justify-center"
                          >
                            <ZoomOut size={16} />
                          </button>
                          {selectedModel.hasAnimation && (
                            <button
                              onClick={() => handleModelControl('toggleAnimation')}
                              className={`w-full p-2 rounded transition-colors flex items-center justify-center ${
                                modelControls.isAnimating
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                              }`}
                            >
                              {modelControls.isAnimating ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom Controls */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-black bg-opacity-50 rounded-lg p-3 flex items-center space-x-3">
                          <button
                            onClick={() => handleModelControl('toggleWireframe')}
                            className={`p-2 rounded transition-colors ${
                              modelControls.showWireframe
                                ? 'bg-white text-black'
                                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                            }`}
                          >
                            <Layers size={16} />
                          </button>
                          <button
                            onClick={() => handleModelControl('toggleLabels')}
                            className={`p-2 rounded transition-colors ${
                              modelControls.showLabels
                                ? 'bg-white text-black'
                                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                            }`}
                          >
                            <Info size={16} />
                          </button>
                          <button className="bg-white bg-opacity-20 text-white p-2 rounded hover:bg-opacity-30 transition-colors">
                            <Maximize size={16} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Side Panel */}
                <div className="w-80 bg-gray-50 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Model Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Model Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium capitalize">{selectedModel.subject}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{selectedModel.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Difficulty:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedModel.difficulty)}`}>
                            {selectedModel.difficulty}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">File Size:</span>
                          <span className="font-medium">{selectedModel.downloadSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Views:</span>
                          <span className="font-medium">{selectedModel.viewCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Learning Objectives */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Learning Objectives</h3>
                      <ul className="space-y-2">
                        {selectedModel.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">How to Use</h3>
                      <ul className="space-y-2">
                        {selectedModel.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tags */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedModel.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
                        <Download size={16} className="mr-2" />
                        Download Model
                      </button>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                        <BookOpen size={16} className="mr-2" />
                        Related Chapter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add 3D Model Button (admin/teacher only) */}
        {user && (user.role === 'admin' || user.role === 'teacher' || (typeof hasPermission === 'function' && hasPermission('manage_models3d'))) && (
          <button
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => { setShowAddModelModal(true); setModelForm({ title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', tags: [], downloadSize: '', viewCount: 0, hasAnimation: false, fileUrl: '', learningObjectives: [], instructions: [] }); }}
          >
            + Add 3D Model
          </button>
        )}
        {/* CRUD Feedback */}
        {modelCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
        {modelCrudSuccess && <div className="text-green-600 mb-2">{modelCrudSuccess}</div>}
        {modelCrudError && <div className="text-red-600 mb-2">{modelCrudError}</div>}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {models.length} model{models.length !== 1 ? 's' : ''} available
            </h2>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-black text-sm"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {selectedSubject !== 'all' && (
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-black text-sm"
                >
                  <option value="all">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Models Grid/List */}
        {models.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          `}>
            {models.map((model) => (
              <div
                key={model.id}
                className={`
                  bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer
                  ${viewMode === 'list' ? 'flex' : ''}
                `}
                onClick={() => handleModelSelect(model)}
              >
                {/* Thumbnail */}
                <div className={`
                  relative ${viewMode === 'list' ? 'w-48 h-32' : 'aspect-video'}
                  bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center
                `}>
                  <Box size={viewMode === 'list' ? 32 : 48} className="text-blue-500" />
                  
                  {/* Overlay Info */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(model.difficulty)}`}>
                      {model.difficulty}
                    </span>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(model.id);
                      }}
                      className={`p-1 rounded-full transition-colors ${
                        favorites.includes(model.id)
                          ? 'bg-yellow-500 text-white'
                          : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
                      }`}
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>

                  {model.hasAnimation && (
                    <div className="absolute bottom-2 left-2">
                      <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
                        <Play size={12} className="mr-1" />
                        Animated
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{model.title}</h3>
                    <div className="flex items-center text-yellow-500 ml-2">
                      <Star size={14} className="mr-1" />
                      <span className="text-sm font-medium">{model.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {model.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {model.duration} min
                      </div>
                      <div className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        {model.viewCount}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {model.downloadSize}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {model.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {model.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{model.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                {user && (user.role === 'admin' || user.role === 'teacher' || (typeof hasPermission === 'function' && hasPermission('manage_models3d'))) && (
                  <div className="absolute top-2 right-10 flex gap-2 z-10">
                    <button
                      className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                      onClick={(e) => { e.stopPropagation(); setShowEditModelModal(true); setEditModel(model); setModelForm({ ...model }); }}
                    >Edit</button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={(e) => { e.stopPropagation(); handleDeleteModel(model.id); }}
                    >Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Box size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Models Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or explore different subjects.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit 3D Model Modal */}
      {(showAddModelModal || showEditModelModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Box className="w-6 h-6 mr-3 text-blue-600" />
                  {showAddModelModal ? 'Add New 3D Model' : 'Edit 3D Model'}
                </h2>
                <button
                  onClick={() => { 
                    setShowAddModelModal(false); 
                    setShowEditModelModal(false); 
                    setEditModel(null); 
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={e => { e.preventDefault(); showAddModelModal ? handleAddModel() : handleEditModel(); }}>
              <div className="px-6 py-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Basic Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">3D Model Title *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      placeholder="Enter an engaging title for your 3D model" 
                      value={modelForm.title} 
                      onChange={e => setModelForm(f => ({ ...f, title: e.target.value }))} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea 
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" 
                      placeholder="Describe what students will learn from this 3D model..." 
                      value={modelForm.description} 
                      onChange={e => setModelForm(f => ({ ...f, description: e.target.value }))} 
                      required 
                    />
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Configuration
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={120}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={modelForm.duration} 
                        onChange={e => setModelForm(f => ({ ...f, duration: parseInt(e.target.value) }))} 
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={modelForm.difficulty} 
                        onChange={e => setModelForm(f => ({ ...f, difficulty: e.target.value }))}
                      >
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">File Size</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        placeholder="e.g. 15.2 MB"
                        value={modelForm.downloadSize} 
                        onChange={e => setModelForm(f => ({ ...f, downloadSize: e.target.value }))} 
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Tags & Properties
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      placeholder="anatomy, molecule, physics, interactive" 
                      value={modelForm.tags.join(', ')} 
                      onChange={e => setModelForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} 
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={modelForm.hasAnimation}
                      onChange={e => setModelForm(f => ({ ...f, hasAnimation: e.target.checked }))}
                    />
                    <span className="ml-2 text-sm text-gray-700">Has Animation</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" 
                    onClick={() => { 
                      setShowAddModelModal(false); 
                      setShowEditModelModal(false); 
                      setEditModel(null); 
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={modelCrudLoading || !modelForm.title || !modelForm.description}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                  >
                    {modelCrudLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Box className="w-4 h-4 mr-2" />
                        {showAddModelModal ? 'Create 3D Model' : 'Save Changes'}
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

export default Models3D;