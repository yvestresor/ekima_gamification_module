// src/components/recommendations/LearningPath.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin,
  CheckCircle,
  Lock,
  Clock,
  Target,
  TrendingUp,
  Award,
  ChevronRight,
  Star,
  BookOpen,
  Zap,
  Calendar,
  Users,
  Lightbulb,
  ArrowRight,
  BarChart3,
  PlayCircle,
  Flag
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../../context/ProgressContext';
import { useRecommendations } from '../../context/RecommendationContext';
import { useGamification } from '../../hooks/useGamification';

// Import components
import ProgressTracker from '../learning/ProgressTracker';

// Import utilities
import { formatDuration } from '../../utils/dateUtils';
import { calculatePathProgress } from '../../utils/progressCalculator';

const LearningPath = ({ 
  pathId, 
  variant = 'full', // 'full', 'compact', 'mini'
  showControls = true,
  maxItems = null,
  onPathComplete = null
}) => {
  const navigate = useNavigate();
  
  // State
  const [selectedPath, setSelectedPath] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Contexts and hooks
  const { userProgress } = useProgress();
  const { getPersonalizedPath, generateAdaptivePath } = useRecommendations();
  const { levelInfo, totalXP } = useGamification();

  // Mock learning paths data (in real app, would come from API)
  const [learningPaths] = useState({
    'beginner_math': {
      id: 'beginner_math',
      title: 'Mathematics Foundations',
      description: 'Build strong mathematical foundations from basic arithmetic to algebra',
      difficulty: 'beginner',
      estimatedTime: 240, // minutes
      totalXP: 800,
      prerequisite: null,
      tags: ['math', 'foundations', 'algebra'],
      steps: [
        {
          id: 'basic_arithmetic',
          type: 'topic',
          title: 'Basic Arithmetic',
          description: 'Addition, subtraction, multiplication, division',
          estimatedTime: 45,
          xpReward: 100,
          required: true,
          status: 'completed', // completed, in_progress, locked, available
          topicId: 'arithmetic_basics',
          subSteps: [
            { id: 'addition', title: 'Addition', completed: true },
            { id: 'subtraction', title: 'Subtraction', completed: true },
            { id: 'multiplication', title: 'Multiplication', completed: false },
            { id: 'division', title: 'Division', completed: false }
          ]
        },
        {
          id: 'fractions_decimals',
          type: 'topic',
          title: 'Fractions and Decimals',
          description: 'Understanding and working with fractions and decimals',
          estimatedTime: 60,
          xpReward: 150,
          required: true,
          status: 'in_progress',
          topicId: 'fractions_decimals',
          subSteps: [
            { id: 'fractions_basics', title: 'Fraction Basics', completed: true },
            { id: 'decimal_conversion', title: 'Decimal Conversion', completed: false },
            { id: 'mixed_numbers', title: 'Mixed Numbers', completed: false }
          ]
        },
        {
          id: 'intro_algebra',
          type: 'topic',
          title: 'Introduction to Algebra',
          description: 'Variables, expressions, and simple equations',
          estimatedTime: 90,
          xpReward: 200,
          required: true,
          status: 'locked',
          topicId: 'algebra_intro',
          prerequisites: ['fractions_decimals']
        },
        {
          id: 'practice_quiz',
          type: 'assessment',
          title: 'Foundation Quiz',
          description: 'Test your understanding of mathematical foundations',
          estimatedTime: 30,
          xpReward: 100,
          required: true,
          status: 'locked',
          minScore: 80,
          prerequisites: ['intro_algebra']
        },
        {
          id: 'advanced_algebra',
          type: 'topic',
          title: 'Advanced Algebra',
          description: 'Quadratic equations, polynomials, and factoring',
          estimatedTime: 120,
          xpReward: 250,
          required: false,
          status: 'locked',
          topicId: 'algebra_advanced',
          prerequisites: ['practice_quiz']
        }
      ],
      milestones: [
        { at: 25, title: 'Arithmetic Master', reward: 'arithmetic_badge' },
        { at: 50, title: 'Fraction Expert', reward: 'fraction_badge' },
        { at: 75, title: 'Algebra Beginner', reward: 'algebra_badge' },
        { at: 100, title: 'Math Foundation Complete', reward: 'foundation_certificate' }
      ]
    },
    'chemistry_basics': {
      id: 'chemistry_basics',
      title: 'Chemistry Fundamentals',
      description: 'Explore the building blocks of matter and chemical reactions',
      difficulty: 'intermediate',
      estimatedTime: 300,
      totalXP: 1000,
      prerequisite: 'beginner_math',
      tags: ['chemistry', 'atoms', 'reactions'],
      steps: [
        {
          id: 'atomic_structure',
          type: 'topic',
          title: 'Atomic Structure',
          description: 'Protons, neutrons, electrons, and electron configuration',
          estimatedTime: 75,
          xpReward: 200,
          required: true,
          status: 'available',
          topicId: 'atomic_structure'
        },
        {
          id: 'periodic_table',
          type: 'topic',
          title: 'Periodic Table',
          description: 'Understanding elements and their properties',
          estimatedTime: 60,
          xpReward: 180,
          required: true,
          status: 'locked',
          topicId: 'periodic_table',
          prerequisites: ['atomic_structure']
        },
        {
          id: 'chemical_bonding',
          type: 'topic',
          title: 'Chemical Bonding',
          description: 'Ionic, covalent, and metallic bonds',
          estimatedTime: 90,
          xpReward: 220,
          required: true,
          status: 'locked',
          topicId: 'chemical_bonding',
          prerequisites: ['periodic_table']
        },
        {
          id: 'lab_experiment',
          type: 'experiment',
          title: 'Acid-Base Lab',
          description: 'Hands-on experiment with acids and bases',
          estimatedTime: 45,
          xpReward: 150,
          required: true,
          status: 'locked',
          experimentId: 'acid_base_lab',
          prerequisites: ['chemical_bonding']
        },
        {
          id: 'final_assessment',
          type: 'assessment',
          title: 'Chemistry Fundamentals Test',
          description: 'Comprehensive test covering all topics',
          estimatedTime: 45,
          xpReward: 200,
          required: true,
          status: 'locked',
          minScore: 85,
          prerequisites: ['lab_experiment']
        }
      ],
      milestones: [
        { at: 20, title: 'Atom Explorer', reward: 'atom_badge' },
        { at: 40, title: 'Element Specialist', reward: 'element_badge' },
        { at: 60, title: 'Bond Master', reward: 'bonding_badge' },
        { at: 80, title: 'Lab Scientist', reward: 'lab_badge' },
        { at: 100, title: 'Chemistry Graduate', reward: 'chemistry_certificate' }
      ]
    }
  });

  // Load learning path
  useEffect(() => {
    const loadPath = async () => {
      setIsLoading(true);
      try {
        if (pathId) {
          // Load specific path
          const path = learningPaths[pathId];
          if (path) {
            setSelectedPath(path);
          }
        } else {
          // Generate personalized path
          const personalizedPath = await generateAdaptivePath(userProgress, levelInfo);
          setSelectedPath(personalizedPath);
        }
      } catch (error) {
        console.error('Error loading learning path:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPath();
  }, [pathId, userProgress, levelInfo]);

  // Calculate path progress
  const pathProgress = selectedPath ? calculatePathProgress(selectedPath, userProgress) : 0;

  // Get step status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-white';
      case 'available': return 'bg-blue-500 text-white';
      case 'locked': return 'bg-gray-300 text-gray-600';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  // Get step icon
  const getStepIcon = (step) => {
    if (step.status === 'completed') return CheckCircle;
    if (step.status === 'locked') return Lock;
    
    switch (step.type) {
      case 'topic': return BookOpen;
      case 'assessment': return Target;
      case 'experiment': return Zap;
      case 'video': return PlayCircle;
      default: return BookOpen;
    }
  };

  // Handle step click
  const handleStepClick = (step) => {
    if (step.status === 'locked') return;
    
    switch (step.type) {
      case 'topic':
        navigate(`/topic/${step.topicId}`);
        break;
      case 'assessment':
        navigate(`/questions?assessment=${step.id}`);
        break;
      case 'experiment':
        navigate(`/experiments?id=${step.experimentId}`);
        break;
      case 'video':
        navigate(`/videos?id=${step.videoId}`);
        break;
      default:
        break;
    }
  };

  // Toggle step expansion
  const toggleStepExpansion = (stepId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedItems(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedPath) {
    return (
      <div className="text-center py-8">
        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600">No learning path available</p>
      </div>
    );
  }

  // Compact variant for sidebars
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <MapPin size={16} className="mr-2 text-blue-500" />
            Learning Path
          </h3>
          <span className="text-sm text-gray-600">{Math.round(pathProgress)}%</span>
        </div>
        
        <ProgressTracker 
          progress={pathProgress}
          size="sm"
          showLabel={false}
          className="mb-3"
        />
        
        <p className="text-sm text-gray-600 mb-3">{selectedPath.title}</p>
        
        <div className="space-y-2">
          {selectedPath.steps.slice(0, 3).map((step, index) => {
            const StepIcon = getStepIcon(step);
            return (
              <div
                key={step.id}
                className={`flex items-center p-2 rounded text-sm cursor-pointer hover:bg-gray-50 ${
                  step.status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handleStepClick(step)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${getStatusColor(step.status)}`}>
                  <StepIcon size={12} />
                </div>
                <span className="flex-1 truncate">{step.title}</span>
                {step.status === 'completed' && <CheckCircle size={14} className="text-green-500" />}
              </div>
            );
          })}
        </div>
        
        {selectedPath.steps.length > 3 && (
          <button
            onClick={() => navigate('/path')}
            className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center"
          >
            View Full Path <ChevronRight size={14} className="ml-1" />
          </button>
        )}
      </div>
    );
  }

  // Mini variant for dashboard widgets
  if (variant === 'mini') {
    const nextStep = selectedPath.steps.find(step => step.status === 'available' || step.status === 'in_progress');
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Next in Path</h4>
          <span className="text-xs text-blue-600">{Math.round(pathProgress)}% complete</span>
        </div>
        
        {nextStep ? (
          <div
            className="flex items-center cursor-pointer hover:bg-white hover:bg-opacity-50 rounded p-2 transition-colors"
            onClick={() => handleStepClick(nextStep)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getStatusColor(nextStep.status)}`}>
              {React.createElement(getStepIcon(nextStep), { size: 16 })}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{nextStep.title}</p>
              <p className="text-xs text-gray-600">{formatDuration(nextStep.estimatedTime)} • {nextStep.xpReward} XP</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        ) : (
          <div className="text-center py-2">
            <CheckCircle size={24} className="mx-auto text-green-500 mb-1" />
            <p className="text-sm text-green-600 font-medium">Path Complete!</p>
          </div>
        )}
      </div>
    );
  }

  // Full variant for dedicated path pages
  return (
    <div className="space-y-6">
      {/* Path Header */}
      <div className="bg-white rounded-xl p-6 border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <MapPin size={24} className="text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{selectedPath.title}</h2>
              <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                selectedPath.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                selectedPath.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedPath.difficulty}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{selectedPath.description}</p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                {formatDuration(selectedPath.estimatedTime)}
              </div>
              <div className="flex items-center">
                <Award size={14} className="mr-1" />
                {selectedPath.totalXP} Total XP
              </div>
              <div className="flex items-center">
                <BookOpen size={14} className="mr-1" />
                {selectedPath.steps.length} Steps
              </div>
              <div className="flex items-center">
                <Users size={14} className="mr-1" />
                {Math.floor(Math.random() * 1000) + 500} Students
              </div>
            </div>
          </div>
          
          <div className="ml-6 text-right">
            <div className="text-3xl font-bold text-blue-600 mb-1">{Math.round(pathProgress)}%</div>
            <div className="text-sm text-gray-600 mb-3">Complete</div>
            <ProgressTracker 
              progress={pathProgress}
              size="lg"
              showLabel={false}
              className="w-32"
            />
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedPath.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Learning Steps */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Learning Steps</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {selectedPath.steps.map((step, index) => {
            const StepIcon = getStepIcon(step);
            const isExpanded = expandedItems.has(step.id);
            const canAccess = step.status !== 'locked';
            
            return (
              <div key={step.id} className={`${!canAccess ? 'opacity-50' : ''}`}>
                <div
                  className={`p-6 hover:bg-gray-50 transition-colors ${canAccess ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => canAccess && handleStepClick(step)}
                >
                  <div className="flex items-center">
                    {/* Step Number & Icon */}
                    <div className="flex items-center mr-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
                        <StepIcon size={18} />
                      </div>
                      <div className="ml-3 text-sm font-medium text-gray-500">
                        Step {index + 1}
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">{step.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {formatDuration(step.estimatedTime)}
                          </div>
                          <div className="flex items-center">
                            <Award size={14} className="mr-1" />
                            {step.xpReward} XP
                          </div>
                          {step.required && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs font-medium">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-1">{step.description}</p>
                      
                      {/* Status indicator */}
                      <div className="flex items-center mt-2">
                        {step.status === 'completed' && (
                          <span className="text-green-600 text-sm font-medium flex items-center">
                            <CheckCircle size={14} className="mr-1" />
                            Completed
                          </span>
                        )}
                        {step.status === 'in_progress' && (
                          <span className="text-yellow-600 text-sm font-medium flex items-center">
                            <Clock size={14} className="mr-1" />
                            In Progress
                          </span>
                        )}
                        {step.status === 'locked' && step.prerequisites && (
                          <span className="text-gray-500 text-sm flex items-center">
                            <Lock size={14} className="mr-1" />
                            Requires: {step.prerequisites.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Expand button for sub-steps */}
                    {step.subSteps && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepExpansion(step.id);
                        }}
                        className="ml-4 p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        <ChevronRight size={16} className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Sub-steps */}
                {step.subSteps && isExpanded && (
                  <div className="px-6 pb-4 bg-gray-50">
                    <div className="ml-10 space-y-2">
                      {step.subSteps.map((subStep, subIndex) => (
                        <div key={subStep.id} className="flex items-center p-2 bg-white rounded border">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                            subStep.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {subStep.completed ? <CheckCircle size={12} /> : <span className="text-xs">{subIndex + 1}</span>}
                          </div>
                          <span className={`text-sm ${subStep.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                            {subStep.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones */}
      {selectedPath.milestones && (
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Flag size={20} className="mr-2 text-purple-500" />
            Milestones & Rewards
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPath.milestones.map((milestone, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  pathProgress >= milestone.at 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{milestone.title}</span>
                  <span className="text-sm text-gray-600">{milestone.at}%</span>
                </div>
                
                <div className="flex items-center">
                  {pathProgress >= milestone.at ? (
                    <CheckCircle size={16} className="text-green-500 mr-2" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                  )}
                  <span className="text-sm text-gray-600">
                    Reward: {milestone.reward.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {showControls && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-black">Ready to Continue?</h3>
              <p className="text-blue-100">
                {pathProgress < 100 
                  ? `You're ${Math.round(pathProgress)}% through this learning path. Keep going!`
                  : 'Congratulations! You\'ve completed this learning path.'
                }
              </p>
            </div>
            
            <div className="flex space-x-3">
              {pathProgress < 100 ? (
                <>
                  <button
                    onClick={() => {
                      const nextStep = selectedPath.steps.find(step => 
                        step.status === 'available' || step.status === 'in_progress'
                      );
                      if (nextStep) handleStepClick(nextStep);
                    }}
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    Continue Learning
                  </button>
                  <button
                    onClick={() => navigate('/progress')}
                    className="border border-white text-white px-6 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    View Progress
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/subjects')}
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    Explore More Subjects
                  </button>
                  <button
                    onClick={() => navigate('/achievements')}
                    className="border border-white text-white px-6 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    View Achievements
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPath;