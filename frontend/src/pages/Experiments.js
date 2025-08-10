// src/pages/Experiments.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Beaker,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  Download,
  Share2,
  Bookmark,
  Clock,
  Award,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Thermometer,
  Droplet,
  Wind,
  Lightbulb,
  Search,
  Filter,
  Grid,
  List,
  Star,
  BookOpen,
  Timer
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../context/ProgressContext';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';
import { contentAPI, experimentAPI } from '../services/api';

// Import components
import Loading from '../components/common/Loading';
import ProgressTracker from '../components/learning/ProgressTracker';

// Import utilities
import { formatDate, formatDuration } from '../utils/dateUtils';

const Experiments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all');
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [experimentState, setExperimentState] = useState('idle');
  const [experimentData, setExperimentData] = useState({});
  const [experimentParameters, setExperimentParameters] = useState({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [experimentTimer, setExperimentTimer] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [experiments, setExperiments] = useState([]);
  
  // Refs
  const experimentCanvasRef = useRef(null);
  const timerRef = useRef(null);

  // Contexts and hooks
  const { userProgress, updateExperimentProgress } = useProgress();
  const { addXP, completeChapter } = useGamification();
  const { user, hasPermission } = useAuth();

  // CRUD state for experiments
  const [showAddExperimentModal, setShowAddExperimentModal] = useState(false);
  const [showEditExperimentModal, setShowEditExperimentModal] = useState(false);
  const [editExperiment, setEditExperiment] = useState(null);
  const [experimentCrudLoading, setExperimentCrudLoading] = useState(false);
  const [experimentCrudError, setExperimentCrudError] = useState(null);
  const [experimentCrudSuccess, setExperimentCrudSuccess] = useState(null);
  const [experimentForm, setExperimentForm] = useState({ title: '', description: '', subject: '', duration: 10, difficulty: 'easy', xpReward: 10, tags: [], parameters: {}, steps: [] });

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

  // Load experiments when filters change
  useEffect(() => {
    let params = {};
    if (selectedSubject !== 'all') params.subjectId = selectedSubject;
    if (searchQuery) params.q = searchQuery;
    experimentAPI.getAll(params)
      .then(res => setExperiments(res.data))
      .catch(() => setExperiments([]));
  }, [selectedSubject, searchQuery]);

  // Filter experiments
  const getFilteredExperiments = () => {
    return experiments.filter(exp => {
      const matchesSubject = selectedSubject === 'all' || exp.subject === selectedSubject;
      const matchesSearch = !searchQuery || 
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesSubject && matchesSearch;
    });
  };

  const filteredExperiments = getFilteredExperiments();

  // Load favorites
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('ekima_experiment_favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setExperimentTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Handle experiment selection
  const handleExperimentSelect = (experiment) => {
    setSelectedExperiment(experiment);
    setExperimentState('idle');
    setExperimentData({});
    setExperimentParameters(getDefaultParameters(experiment));
    setExperimentTimer(0);
    setIsRunning(false);
  };

  // Get default parameters for experiment
  const getDefaultParameters = (experiment) => {
    const defaults = {};
    Object.entries(experiment.parameters || {}).forEach(([key, config]) => {
      defaults[key] = config.default;
    });
    return defaults;
  };

  // Start experiment
  const startExperiment = async () => {
    if (!selectedExperiment) return;

    setIsRunning(true);
    setExperimentState('running');
    setExperimentTimer(0);
    
    // Simulate experiment execution
    const duration = selectedExperiment.duration * 1000; // Convert to milliseconds
    
    // Generate experiment data points
    const dataPoints = [];
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      setTimeout(() => {
        const progress = i / steps;
        const newDataPoint = generateExperimentData(selectedExperiment, experimentParameters, progress);
        
        setExperimentData(prev => ({
          ...prev,
          progress: progress * 100,
          currentStep: Math.floor(progress * selectedExperiment.steps.length),
          data: [...(prev.data || []), newDataPoint]
        }));
        
        if (i === steps) {
          completeExperiment();
        }
      }, (duration / steps) * i);
    }
  };

  // Generate experiment data
  const generateExperimentData = (experiment, parameters, progress) => {
    // Mock data generation based on experiment type
    const timestamp = Date.now();
    
    switch (experiment.subject) {
      case 'chemistry':
        return {
          timestamp,
          ph: 7 + Math.sin(progress * Math.PI) * 3,
          temperature: parameters.temperature + Math.random() * 2 - 1,
          volume: parameters.base_concentration * progress * 50
        };
      case 'physics':
        return {
          timestamp,
          position: Math.sin(progress * Math.PI * 4) * parameters.length,
          velocity: Math.cos(progress * Math.PI * 4) * parameters.length * 2,
          period: 2 * Math.PI * Math.sqrt(parameters.length / 9.81)
        };
      case 'biology':
        return {
          timestamp,
          cellCount: Math.floor(50 + progress * 200 + Math.random() * 20),
          stainIntensity: Math.min(100, progress * 120),
          magnification: parameters.magnification
        };
      default:
        return {
          timestamp,
          value: progress * 100 + Math.random() * 10 - 5
        };
    }
  };

  // Complete experiment
  const completeExperiment = async () => {
    setIsRunning(false);
    setExperimentState('completed');
    
    try {
      // Award XP
      await addXP(selectedExperiment.xpReward, 'experiment_completed');
      
      // Update progress
      await updateExperimentProgress(selectedExperiment.id, {
        completed: true,
        completedAt: new Date().toISOString(),
        timeSpent: experimentTimer,
        parameters: experimentParameters,
        data: experimentData
      });
      
      console.log(`Experiment ${selectedExperiment.title} completed!`);
      
    } catch (error) {
      console.error('Error completing experiment:', error);
    }
  };

  // Reset experiment
  const resetExperiment = () => {
    setIsRunning(false);
    setExperimentState('idle');
    setExperimentData({});
    setExperimentTimer(0);
  };

  // Toggle favorite
  const toggleFavorite = (experimentId) => {
    const newFavorites = favorites.includes(experimentId)
      ? favorites.filter(id => id !== experimentId)
      : [...favorites, experimentId];
    
    setFavorites(newFavorites);
    localStorage.setItem('ekima_experiment_favorites', JSON.stringify(newFavorites));
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

  // CRUD handlers for experiments
  const handleAddExperiment = async () => {
    setExperimentCrudLoading(true); setExperimentCrudError(null); setExperimentCrudSuccess(null);
    try {
      await experimentAPI.create(experimentForm);
      setExperimentCrudSuccess('Experiment added successfully');
      setShowAddExperimentModal(false);
      setExperimentForm({ title: '', description: '', subject: '', duration: 10, difficulty: 'easy', xpReward: 10, tags: [], parameters: {}, steps: [] });
      // Refresh experiments
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (searchQuery) params.q = searchQuery;
      const res = await experimentAPI.getAll(params);
      setExperiments(res.data);
    } catch (err) {
      setExperimentCrudError('Failed to add experiment');
    } finally {
      setExperimentCrudLoading(false);
    }
  };
  const handleEditExperiment = async () => {
    setExperimentCrudLoading(true); setExperimentCrudError(null); setExperimentCrudSuccess(null);
    try {
      await experimentAPI.update(editExperiment._id, experimentForm);
      setExperimentCrudSuccess('Experiment updated successfully');
      setShowEditExperimentModal(false);
      setEditExperiment(null);
      setExperimentForm({ title: '', description: '', subject: '', duration: 10, difficulty: 'easy', xpReward: 10, tags: [], parameters: {}, steps: [] });
      // Refresh experiments
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (searchQuery) params.q = searchQuery;
      const res = await experimentAPI.getAll(params);
      setExperiments(res.data);
    } catch (err) {
      setExperimentCrudError('Failed to update experiment');
    } finally {
      setExperimentCrudLoading(false);
    }
  };
  const handleDeleteExperiment = async (experimentId) => {
    if (!window.confirm('Are you sure you want to delete this experiment?')) return;
    setExperimentCrudLoading(true); setExperimentCrudError(null); setExperimentCrudSuccess(null);
    try {
      await experimentAPI.delete(experimentId);
      setExperimentCrudSuccess('Experiment deleted successfully');
      // Refresh experiments
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (searchQuery) params.q = searchQuery;
      const res = await experimentAPI.getAll(params);
      setExperiments(res.data);
    } catch (err) {
      setExperimentCrudError('Failed to delete experiment');
    } finally {
      setExperimentCrudLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Science Experiments</h1>
              <p className="text-gray-600 mt-1">Explore science through hands-on interactive experiments</p>
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search experiments..."
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

      {/* Experiment Interface Modal */}
      {selectedExperiment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Beaker size={24} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedExperiment.title}</h2>
                  <p className="text-gray-600 text-sm">{selectedExperiment.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleFavorite(selectedExperiment.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.includes(selectedExperiment.id)
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
                  onClick={() => setSelectedExperiment(null)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex h-[600px]">
              {/* Experiment Area */}
              <div className="flex-1 relative bg-gray-900">
                {/* Experiment Canvas */}
                <div 
                  ref={experimentCanvasRef}
                  className="w-full h-full flex items-center justify-center relative"
                >
                  {/* Experiment Visualization */}
                  <div className="text-center text-white">
                    {experimentState === 'idle' && (
                      <div>
                        <Beaker size={64} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Ready to start experiment</p>
                        <p className="text-sm opacity-75">Click Start to begin</p>
                      </div>
                    )}
                    
                    {experimentState === 'running' && (
                      <div>
                        <div className="relative">
                          <Beaker size={64} className="mx-auto mb-4 animate-pulse" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        </div>
                        <p className="text-lg">Experiment in progress...</p>
                        <p className="text-sm opacity-75">
                          Step {experimentData.currentStep + 1 || 1} of {selectedExperiment.steps.length}
                        </p>
                        <div className="mt-4 w-64 mx-auto">
                          <ProgressTracker 
                            progress={experimentData.progress || 0}
                            color="green"
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                      </div>
                    )}
                    
                    {experimentState === 'completed' && (
                      <div>
                        <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                        <p className="text-lg">Experiment Complete!</p>
                        <p className="text-sm opacity-75">
                          +{selectedExperiment.xpReward} XP earned
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Timer and Controls Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-black bg-opacity-50 rounded-lg p-3 text-white">
                      <div className="flex items-center space-x-2">
                        <Timer size={16} />
                        <span className="font-mono">
                          {Math.floor(experimentTimer / 60).toString().padStart(2, '0')}:
                          {(experimentTimer % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Experiment Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black bg-opacity-50 rounded-lg p-3 flex items-center space-x-3">
                      {experimentState === 'idle' && (
                        <button
                          onClick={startExperiment}
                          className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Play size={20} />
                        </button>
                      )}
                      
                      {experimentState === 'running' && (
                        <button
                          onClick={() => setIsRunning(false)}
                          className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          <Pause size={20} />
                        </button>
                      )}
                      
                      <button
                        onClick={resetExperiment}
                        className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <RotateCcw size={20} />
                      </button>
                      
                      <button className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors">
                        <Settings size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Panel */}
              <div className="w-96 bg-gray-50 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Experiment Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Experiment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedExperiment.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedExperiment.difficulty)}`}>
                          {selectedExperiment.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">XP Reward:</span>
                        <span className="font-medium text-green-600">+{selectedExperiment.xpReward}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completions:</span>
                        <span className="font-medium">{selectedExperiment.completions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parameters */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Parameters</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedExperiment.parameters || {}).map(([key, config]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {config.unit && ` (${config.unit})`}
                          </label>
                          {config.options ? (
                            <select
                              value={experimentParameters[key]}
                              onChange={(e) => setExperimentParameters(prev => ({
                                ...prev,
                                [key]: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              disabled={isRunning}
                            >
                              {config.options.map(option => (
                                <option key={option} value={option}>
                                  {option.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="range"
                              min={config.min}
                              max={config.max}
                              step={config.step}
                              value={experimentParameters[key]}
                              onChange={(e) => setExperimentParameters(prev => ({
                                ...prev,
                                [key]: parseFloat(e.target.value)
                              }))}
                              className="w-full"
                              disabled={isRunning}
                            />
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Current: {experimentParameters[key]} {config.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  {showInstructions && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
                      <ol className="space-y-2">
                        {selectedExperiment.steps.map((step, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0 ${
                              experimentData.currentStep >= index
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                            <span className={experimentData.currentStep >= index ? 'text-gray-900' : 'text-gray-600'}>
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Learning Objectives</h3>
                    <ul className="space-y-2">
                      {selectedExperiment.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Target size={14} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Safety Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <AlertTriangle size={16} className="text-orange-500 mr-2" />
                      Safety Notes
                    </h3>
                    <ul className="space-y-2">
                      {selectedExperiment.safety.map((note, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Experiment Button (admin/teacher only) */}
        {user && (hasPermission?.('manage_experiments') || user.role === 'admin' || user.role === 'teacher') && (
          <button
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => { setShowAddExperimentModal(true); setExperimentForm({ title: '', description: '', subject: '', duration: 10, difficulty: 'easy', xpReward: 10, tags: [], parameters: {}, steps: [] }); }}
          >
            + Add Experiment
          </button>
        )}
        {/* CRUD Feedback */}
        {experimentCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
        {experimentCrudSuccess && <div className="text-green-600 mb-2">{experimentCrudSuccess}</div>}
        {experimentCrudError && <div className="text-red-600 mb-2">{experimentCrudError}</div>}
        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredExperiments.length} experiment{filteredExperiments.length !== 1 ? 's' : ''} available
            </h2>
            
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
          </div>
        </div>

        {/* Experiments Grid/List */}
        {filteredExperiments.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredExperiments.map((experiment) => (
              <div
                key={experiment.id}
                className={`
                  bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer
                  ${viewMode === 'list' ? 'flex' : ''}
                `}
                onClick={() => handleExperimentSelect(experiment)}
              >
                {/* Thumbnail */}
                <div className={`
                  relative ${viewMode === 'list' ? 'w-48 h-32' : 'aspect-video'}
                  bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center
                `}>
                  <Beaker size={viewMode === 'list' ? 32 : 48} className="text-green-500" />
                  
                  {/* Overlay Info */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(experiment.difficulty)}`}>
                      {experiment.difficulty}
                    </span>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(experiment.id);
                      }}
                      className={`p-1 rounded-full transition-colors ${
                        favorites.includes(experiment.id)
                          ? 'bg-yellow-500 text-white'
                          : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
                      }`}
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2">
                    <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
                      <Clock size={12} className="mr-1" />
                      {experiment.duration}min
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{experiment.title}</h3>
                    <div className="flex items-center text-yellow-500 ml-2">
                      <Star size={14} className="mr-1" />
                      <span className="text-sm font-medium">{experiment.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {experiment.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Award size={14} className="mr-1" />
                        {experiment.xpReward} XP
                      </div>
                      <div className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        {experiment.completions}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {experiment.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {experiment.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{experiment.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Beaker size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Experiments Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or explore different subjects.
            </p>
          </div>
        )}
      </div>
      {/* Add/Edit Experiment Modal */}
      {(showAddExperimentModal || showEditExperimentModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Beaker className="w-6 h-6 mr-3 text-green-600" />
                  {showAddExperimentModal ? 'Add New Experiment' : 'Edit Experiment'}
                </h2>
                <button
                  onClick={() => { 
                    setShowAddExperimentModal(false); 
                    setShowEditExperimentModal(false); 
                    setEditExperiment(null); 
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
            <form onSubmit={e => { e.preventDefault(); showAddExperimentModal ? handleAddExperiment() : handleEditExperiment(); }}>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experiment Title *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      placeholder="Enter an engaging title for your experiment" 
                      value={experimentForm.title} 
                      onChange={e => setExperimentForm({ ...experimentForm, title: e.target.value })} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea 
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" 
                      placeholder="Describe what students will learn and discover from this experiment..." 
                      value={experimentForm.description} 
                      onChange={e => setExperimentForm({ ...experimentForm, description: e.target.value })} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      value={experimentForm.subject} 
                      onChange={e => setExperimentForm({ ...experimentForm, subject: e.target.value })} 
                      required
                    >
                      <option value="">Choose a subject...</option>
                      {subjects.map(subj => (
                        <option key={subj._id} value={subj._id}>{subj.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experiment Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        max={180}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={experimentForm.duration} 
                        onChange={e => setExperimentForm({ ...experimentForm, duration: parseInt(e.target.value) })} 
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={experimentForm.difficulty} 
                        onChange={e => setExperimentForm({ ...experimentForm, difficulty: e.target.value })}
                      >
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">XP Reward</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={500}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={experimentForm.xpReward} 
                        onChange={e => setExperimentForm({ ...experimentForm, xpReward: parseInt(e.target.value) })} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Tags and Categorization */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Tags & Categories
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      placeholder="chemistry, reactions, acid-base, laboratory" 
                      value={experimentForm.tags.join(', ')} 
                      onChange={e => setExperimentForm({ ...experimentForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} 
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate tags with commas to help students find this experiment</p>
                  </div>
                </div>

                {/* Experiment Design */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                    </svg>
                    Experiment Design
                  </h3>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Advanced Configuration</h4>
                        <p className="text-sm text-blue-700">
                          Additional experiment parameters, steps, and learning objectives can be configured after creation in the detailed experiment editor.
                        </p>
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
                      setShowAddExperimentModal(false); 
                      setShowEditExperimentModal(false); 
                      setEditExperiment(null); 
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={experimentCrudLoading || !experimentForm.title || !experimentForm.description || !experimentForm.subject}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                  >
                    {experimentCrudLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Beaker className="w-4 h-4 mr-2" />
                        {showAddExperimentModal ? 'Create Experiment' : 'Save Changes'}
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

export default Experiments;