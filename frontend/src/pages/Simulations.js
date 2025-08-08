// src/pages/Simulations.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Zap,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Maximize,
  Download,
  Share2,
  Bookmark,
  Clock,
  Eye,
  Star,
  Search,
  Filter,
  Grid,
  List,
  BookOpen,
  Award,
  Target,
  Users,
  Activity,
  ChevronRight,
  CheckCircle,
  Sliders,
  MousePointer,
  Layers,
  BarChart3,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  Info,
  Cpu,
  Gauge,
  Timer
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../context/ProgressContext';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';
import { contentAPI, simulationAPI } from '../services/api';

// Import components
import Loading from '../components/common/Loading';
import ProgressTracker from '../components/learning/ProgressTracker';

// Import utilities
import { formatDate, formatDuration } from '../utils/dateUtils';

const Simulations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all');
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [completedSimulations, setCompletedSimulations] = useState(new Set());
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [simulationState, setSimulationState] = useState('idle');
  const [simulationTime, setSimulationTime] = useState(0);
  const [parameters, setParameters] = useState({});
  const [results, setResults] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Refs
  const simulationCanvasRef = useRef(null);
  const timerRef = useRef(null);

  // Contexts and hooks
  const { userProgress, updateSimulationProgress } = useProgress();
  const { addXP } = useGamification();
  const { user, hasPermission } = useAuth();

  // Add CRUD state for simulations
  const [showAddSimulationModal, setShowAddSimulationModal] = useState(false);
  const [showEditSimulationModal, setShowEditSimulationModal] = useState(false);
  const [editSimulation, setEditSimulation] = useState(null);
  const [simulationCrudLoading, setSimulationCrudLoading] = useState(false);
  const [simulationCrudError, setSimulationCrudError] = useState(null);
  const [simulationCrudSuccess, setSimulationCrudSuccess] = useState(null);
  const [simulationForm, setSimulationForm] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    duration: 10,
    difficulty: 'easy',
    xpReward: 10,
    tags: [],
    parameters: {},
    instructions: [],
    objectives: [],
    instructor: '',
    instructorAvatar: '',
    type: 'physics_simulation',
    hasGraphing: false,
    hasDataExport: false,
    isInteractive: true,
  });

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

  // Load simulations when filters change
  useEffect(() => {
    let params = {};
    if (selectedTopic !== 'all') params.topicId = selectedTopic;
    if (selectedSubject !== 'all') params.subjectId = selectedSubject;
    if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
    if (selectedType !== 'all') params.type = selectedType;
    simulationAPI.getAll(params)
      .then(res => setSimulations(res.data))
      .catch(() => setSimulations([]));
  }, [selectedSubject, selectedTopic, selectedDifficulty, selectedType]);

  // Filter simulations
  const getFilteredSimulations = () => {
    return simulations.filter(sim => {
      const matchesSubject = selectedSubject === 'all' || sim.subject === selectedSubject;
      const matchesDifficulty = selectedDifficulty === 'all' || sim.difficulty === selectedDifficulty;
      const matchesType = selectedType === 'all' || sim.type === selectedType;
      const matchesSearch = !searchQuery || 
        sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesSubject && matchesDifficulty && matchesType && matchesSearch;
    });
  };

  const filteredSimulations = getFilteredSimulations().sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      case 'oldest':
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      case 'popular':
        return b.usageCount - a.usageCount;
      case 'rating':
        return b.rating - a.rating;
      case 'duration':
        return a.duration - b.duration;
      default:
        return 0;
    }
  });

  // Load favorites and completed simulations
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('ekima_simulation_favorites') || '[]');
    const savedCompleted = JSON.parse(localStorage.getItem('ekima_completed_simulations') || '[]');
    setFavorites(savedFavorites);
    setCompletedSimulations(new Set(savedCompleted));
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSimulationTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Handle simulation selection
  const handleSimulationSelect = async (simulation) => {
    setSelectedSimulation(simulation);
    setIsLoading(true);
    setSessionStartTime(Date.now());
    setParameters(getDefaultParameters(simulation));
    setSimulationState('idle');
    setSimulationTime(0);
    setCurrentStep(0);
    setResults([]);
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Track simulation start
      await updateSimulationProgress(simulation.id, {
        started: true,
        startedAt: new Date().toISOString(),
        sessionTime: 0
      });
      
    } catch (error) {
      console.error('Error loading simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get default parameters
  const getDefaultParameters = (simulation) => {
    const defaults = {};
    Object.entries(simulation.parameters || {}).forEach(([key, config]) => {
      defaults[key] = config.default;
    });
    return defaults;
  };

  // Start simulation
  const startSimulation = () => {
    setIsRunning(true);
    setSimulationState('running');
    setSimulationTime(0);
    
    // Simulate data generation
    const interval = setInterval(() => {
      const newDataPoint = generateSimulationData();
      setResults(prev => [...prev, newDataPoint]);
      
      if (results.length >= 100) { // Stop after 100 data points
        completeSimulation();
        clearInterval(interval);
      }
    }, 200);
  };

  // Generate simulation data
  const generateSimulationData = () => {
    const timestamp = Date.now();
    
    switch (selectedSimulation?.type) {
      case 'physics_simulation':
        return {
          timestamp,
          time: simulationTime / 10,
          x: parameters.initial_velocity * Math.cos(parameters.launch_angle * Math.PI / 180) * (simulationTime / 10),
          y: parameters.initial_velocity * Math.sin(parameters.launch_angle * Math.PI / 180) * (simulationTime / 10) - 0.5 * parameters.gravity * Math.pow(simulationTime / 10, 2),
          velocity_x: parameters.initial_velocity * Math.cos(parameters.launch_angle * Math.PI / 180),
          velocity_y: parameters.initial_velocity * Math.sin(parameters.launch_angle * Math.PI / 180) - parameters.gravity * (simulationTime / 10)
        };
      case 'chemistry_simulation':
        return {
          timestamp,
          time: simulationTime,
          concentration_A: parameters.concentration_A * Math.exp(-0.1 * simulationTime),
          concentration_B: parameters.concentration_B * Math.exp(-0.1 * simulationTime),
          product_formation: (parameters.concentration_A + parameters.concentration_B) * (1 - Math.exp(-0.1 * simulationTime)),
          reaction_rate: 0.1 * Math.exp(-0.1 * simulationTime) * Math.exp((parameters.temperature - 298) / 50)
        };
      case 'biology_simulation':
        const time = simulationTime / 10;
        return {
          timestamp,
          time,
          prey_population: parameters.prey_initial * (1 + 0.1 * Math.sin(time * 0.1)),
          predator_population: parameters.predator_initial * (1 + 0.05 * Math.cos(time * 0.1)),
          carrying_capacity: parameters.carrying_capacity
        };
      default:
        return {
          timestamp,
          value: Math.sin(simulationTime * 0.1) * 50 + 50 + Math.random() * 10 - 5
        };
    }
  };

  // Complete simulation
  const completeSimulation = async () => {
    setIsRunning(false);
    setSimulationState('completed');
    
    try {
      // Mark as completed
      const newCompleted = new Set([...completedSimulations, selectedSimulation.id]);
      setCompletedSimulations(newCompleted);
      localStorage.setItem('ekima_completed_simulations', JSON.stringify([...newCompleted]));
      
      // Calculate session time
      const sessionTime = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 60000) : 0;
      
      // Update progress
      await updateSimulationProgress(selectedSimulation.id, {
        completed: true,
        completedAt: new Date().toISOString(),
        sessionTime,
        parameters,
        results: results.slice(-10) // Save last 10 data points
      });
      
      // Award XP
      await addXP(selectedSimulation.xpReward, 'simulation_completed');
      
      console.log(`Simulation completed! +${selectedSimulation.xpReward} XP earned`);
      
    } catch (error) {
      console.error('Error completing simulation:', error);
    }
  };

  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setSimulationState('idle');
    setSimulationTime(0);
    setResults([]);
    setCurrentStep(0);
    setParameters(getDefaultParameters(selectedSimulation));
  };

  // Toggle favorite
  const toggleFavorite = (simulationId) => {
    const newFavorites = favorites.includes(simulationId)
      ? favorites.filter(id => id !== simulationId)
      : [...favorites, simulationId];
    
    setFavorites(newFavorites);
    localStorage.setItem('ekima_simulation_favorites', JSON.stringify(newFavorites));
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // CRUD handlers for simulations
  const handleAddSimulation = async () => {
    setSimulationCrudLoading(true); setSimulationCrudError(null); setSimulationCrudSuccess(null);
    try {
      await simulationAPI.create(simulationForm);
      setSimulationCrudSuccess('Simulation added successfully');
      setShowAddSimulationModal(false);
      setSimulationForm({
        title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', xpReward: 10, tags: [], parameters: {}, instructions: [], objectives: [], instructor: '', instructorAvatar: '', type: 'physics_simulation', hasGraphing: false, hasDataExport: false, isInteractive: true
      });
      // Refresh simulations
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      const res = await simulationAPI.getAll(params);
      setSimulations(res.data);
    } catch (err) {
      setSimulationCrudError('Failed to add simulation');
    } finally {
      setSimulationCrudLoading(false);
    }
  };
  const handleEditSimulation = async () => {
    setSimulationCrudLoading(true); setSimulationCrudError(null); setSimulationCrudSuccess(null);
    try {
      await simulationAPI.update(editSimulation._id, simulationForm);
      setSimulationCrudSuccess('Simulation updated successfully');
      setShowEditSimulationModal(false);
      setEditSimulation(null);
      setSimulationForm({
        title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', xpReward: 10, tags: [], parameters: {}, instructions: [], objectives: [], instructor: '', instructorAvatar: '', type: 'physics_simulation', hasGraphing: false, hasDataExport: false, isInteractive: true
      });
      // Refresh simulations
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      const res = await simulationAPI.getAll(params);
      setSimulations(res.data);
    } catch (err) {
      setSimulationCrudError('Failed to update simulation');
    } finally {
      setSimulationCrudLoading(false);
    }
  };
  const handleDeleteSimulation = async (simulationId) => {
    if (!window.confirm('Are you sure you want to delete this simulation?')) return;
    setSimulationCrudLoading(true); setSimulationCrudError(null); setSimulationCrudSuccess(null);
    try {
      await simulationAPI.delete(simulationId);
      setSimulationCrudSuccess('Simulation deleted successfully');
      // Refresh simulations
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      const res = await simulationAPI.getAll(params);
      setSimulations(res.data);
    } catch (err) {
      setSimulationCrudError('Failed to delete simulation');
    } finally {
      setSimulationCrudLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interactive Simulations</h1>
              <p className="text-gray-600 mt-1">Explore concepts through hands-on interactive simulations</p>
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search simulations..."
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

      {/* Simulation Interface Modal */}
      {selectedSimulation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedSimulation.title}</h2>
                  <p className="text-gray-600 text-sm">{selectedSimulation.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleFavorite(selectedSimulation.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.includes(selectedSimulation.id)
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
                  onClick={() => setSelectedSimulation(null)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex h-[600px]">
              {/* Simulation Area */}
              <div className="flex-1 relative bg-gray-900">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loading />
                      <p className="mt-4">Loading simulation...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Simulation Canvas */}
                    <div 
                      ref={simulationCanvasRef}
                      className="w-full h-full flex items-center justify-center relative"
                    >
                      {/* Simulation Visualization */}
                      <div className="text-center text-white">
                        {simulationState === 'idle' && (
                          <div>
                            <Cpu size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Ready to start simulation</p>
                            <p className="text-sm opacity-75">Adjust parameters and click Start</p>
                          </div>
                        )}
                        
                        {simulationState === 'running' && (
                          <div>
                            <div className="relative">
                              <Activity size={64} className="mx-auto mb-4 animate-pulse" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                            </div>
                            <p className="text-lg">Simulation running...</p>
                            <p className="text-sm opacity-75">
                              {results.length} data points collected
                            </p>
                            <div className="mt-4 w-64 mx-auto">
                              <ProgressTracker 
                                progress={(results.length / 100) * 100}
                                color="blue"
                                size="sm"
                                showLabel={false}
                              />
                            </div>
                          </div>
                        )}
                        
                        {simulationState === 'completed' && (
                          <div>
                            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                            <p className="text-lg">Simulation Complete!</p>
                            <p className="text-sm opacity-75">
                              +{selectedSimulation.xpReward} XP earned
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Timer Overlay */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-black bg-opacity-50 rounded-lg p-3 text-white">
                          <div className="flex items-center space-x-2">
                            <Timer size={16} />
                            <span className="font-mono">{formatTime(simulationTime)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Controls Overlay */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-black bg-opacity-50 rounded-lg p-3 flex items-center space-x-3">
                          {simulationState === 'idle' && (
                            <button
                              onClick={startSimulation}
                              className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <Play size={20} />
                            </button>
                          )}
                          
                          {simulationState === 'running' && (
                            <button
                              onClick={() => setIsRunning(false)}
                              className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              <Pause size={20} />
                            </button>
                          )}
                          
                          <button
                            onClick={resetSimulation}
                            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <RotateCcw size={20} />
                          </button>
                          
                          <button className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors">
                            <Settings size={20} />
                          </button>
                          
                          {selectedSimulation.hasDataExport && (
                            <button className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition-colors">
                              <Download size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Side Panel */}
              <div className="w-96 bg-gray-50 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Simulation Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Simulation Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedSimulation.duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedSimulation.difficulty)}`}>
                          {selectedSimulation.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">XP Reward:</span>
                        <span className="font-medium text-green-600">+{selectedSimulation.xpReward}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usage Count:</span>
                        <span className="font-medium">{selectedSimulation.usageCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parameters */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Sliders size={16} className="mr-2" />
                      Parameters
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(selectedSimulation.parameters || {}).map(([key, config]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {config.unit && ` (${config.unit})`}
                          </label>
                          <input
                            type="range"
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            value={parameters[key] || config.default}
                            onChange={(e) => setParameters(prev => ({
                              ...prev,
                              [key]: parseFloat(e.target.value)
                            }))}
                            className="w-full"
                            disabled={isRunning}
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{config.min}</span>
                            <span className="font-medium">{parameters[key] || config.default} {config.unit}</span>
                            <span>{config.max}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  {showInstructions && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Info size={16} className="mr-2" />
                        Instructions
                      </h3>
                      <ol className="space-y-2">
                        {selectedSimulation.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Target size={16} className="mr-2" />
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {selectedSimulation.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Lightbulb size={14} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Results Summary */}
                  {results.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <BarChart3 size={16} className="mr-2" />
                        Live Results
                      </h3>
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Data Points:</span>
                            <span className="font-medium">{results.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Runtime:</span>
                            <span className="font-medium">{formatTime(simulationTime)}</span>
                          </div>
                          {results.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Latest Value:</span>
                              <span className="font-medium">
                                {typeof results[results.length - 1]?.value === 'number' 
                                  ? results[results.length - 1].value.toFixed(2)
                                  : 'Multiple'
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{simulations.length}</p>
                <p className="text-sm text-gray-600">Total Simulations</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(simulations.reduce((sum, s) => sum + s.duration, 0) / 60)}h
                </p>
                <p className="text-sm text-gray-600">Total Content</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {simulations.reduce((sum, s) => sum + s.usageCount, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Usage</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedSimulations.size}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-black"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-black"
            >
              <option value="all">All Topics</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-black"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-black"
            >
              <option value="all">All Types</option>
              <option value="physics_simulation">Physics</option>
              <option value="chemistry_simulation">Chemistry</option>
              <option value="biology_simulation">Biology</option>
              <option value="math_simulation">Mathematics</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-black"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="duration">Shortest First</option>
            </select>
          </div>
        </div>

        {/* Add Simulation Button (admin/teacher only) */}
        {user && (user.role === 'admin' || user.role === 'teacher' || (typeof hasPermission === 'function' && hasPermission('manage_simulations'))) && (
          <button
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => { setShowAddSimulationModal(true); setSimulationForm({ title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', xpReward: 10, tags: [], parameters: {}, instructions: [], objectives: [], instructor: '', instructorAvatar: '', type: 'physics_simulation', hasGraphing: false, hasDataExport: false, isInteractive: true }); }}
          >
            + Add Simulation
          </button>
        )}
        {/* CRUD Feedback */}
        {simulationCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
        {simulationCrudSuccess && <div className="text-green-600 mb-2">{simulationCrudSuccess}</div>}
        {simulationCrudError && <div className="text-red-600 mb-2">{simulationCrudError}</div>}

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {filteredSimulations.length} of {simulations.length} simulations
          </p>
        </div>

        {/* Simulations Grid/List */}
        {filteredSimulations.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredSimulations.map((simulation) => (
              <div
                key={simulation.id}
                className={`
                  bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer
                  ${viewMode === 'list' ? 'flex' : ''}
                `}
                onClick={() => handleSimulationSelect(simulation)}
              >
                {/* Thumbnail */}
                <div className={`
                  relative ${viewMode === 'list' ? 'w-64 h-36' : 'aspect-video'}
                  bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center
                `}>
                  <Zap size={viewMode === 'list' ? 32 : 48} className="text-blue-500" />
                  
                  {/* Overlay Info */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(simulation.difficulty)}`}>
                      {simulation.difficulty}
                    </span>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(simulation.id);
                      }}
                      className={`p-1 rounded-full transition-colors ${
                        favorites.includes(simulation.id)
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
                      {simulation.duration}min
                    </div>
                  </div>

                  {completedSimulations.has(simulation.id) && (
                    <div className="absolute bottom-2 right-2">
                      <CheckCircle size={16} className="text-green-500 bg-white rounded-full" />
                    </div>
                  )}

                  {simulation.isInteractive && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center">
                        <MousePointer size={12} className="mr-1" />
                        Interactive
                      </div>
                    </div>
                  )}

                  {user && (user.role === 'admin' || user.role === 'teacher' || (typeof hasPermission === 'function' && hasPermission('manage_simulations'))) && (
                    <div className="absolute top-2 right-10 flex gap-2 z-10">
                      <button
                        className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                        onClick={(e) => { e.stopPropagation(); setShowEditSimulationModal(true); setEditSimulation(simulation); setSimulationForm({ ...simulation }); }}
                      >Edit</button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={(e) => { e.stopPropagation(); handleDeleteSimulation(simulation.id); }}
                      >Delete</button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{simulation.title}</h3>
                    <div className="flex items-center text-yellow-500 ml-2">
                      <Star size={14} className="mr-1" />
                      <span className="text-sm font-medium">{simulation.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {simulation.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <img
                        src={simulation.instructorAvatar}
                        alt={simulation.instructor}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      {simulation.instructor}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Eye size={12} className="mr-1" />
                        {simulation.usageCount.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Award size={12} className="mr-1" />
                        {simulation.xpReward} XP
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex items-center space-x-2 mb-3">
                    {simulation.hasGraphing && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center">
                        <BarChart3 size={10} className="mr-1" />
                        Graphs
                      </span>
                    )}
                    {simulation.hasDataExport && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center">
                        <Download size={10} className="mr-1" />
                        Export
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {simulation.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {simulation.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{simulation.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Zap size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Simulations Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or explore different subjects.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Exploring?</h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Dive into our interactive simulations and experience science, math, and technology concepts firsthand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/progress')}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                View My Progress
              </button>
              <button 
                onClick={() => navigate('/experiments')}
                className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                Try Experiments
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Simulation Modal (simple version, you can expand fields as needed) */}
      {(showAddSimulationModal || showEditSimulationModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">{showAddSimulationModal ? 'Add Simulation' : 'Edit Simulation'}</h2>
            <form onSubmit={e => { e.preventDefault(); showAddSimulationModal ? handleAddSimulation() : handleEditSimulation(); }}>
              <input type="text" className="w-full mb-2 p-2 border rounded" placeholder="Title" value={simulationForm.title} onChange={e => setSimulationForm(f => ({ ...f, title: e.target.value }))} required />
              <textarea className="w-full mb-2 p-2 border rounded" placeholder="Description" value={simulationForm.description} onChange={e => setSimulationForm(f => ({ ...f, description: e.target.value }))} required />
              <input type="number" className="w-full mb-2 p-2 border rounded" placeholder="Duration (min)" value={simulationForm.duration} onChange={e => setSimulationForm(f => ({ ...f, duration: Number(e.target.value) }))} required />
              <select className="w-full mb-2 p-2 border rounded" value={simulationForm.difficulty} onChange={e => setSimulationForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input type="number" className="w-full mb-2 p-2 border rounded" placeholder="XP Reward" value={simulationForm.xpReward} onChange={e => setSimulationForm(f => ({ ...f, xpReward: Number(e.target.value) }))} required />
              <input type="text" className="w-full mb-2 p-2 border rounded" placeholder="Tags (comma separated)" value={simulationForm.tags.join(', ')} onChange={e => setSimulationForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()) }))} />
              {/* Add more fields as needed */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => { setShowAddSimulationModal(false); setShowEditSimulationModal(false); setEditSimulation(null); }}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{showAddSimulationModal ? 'Add' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Simulations;