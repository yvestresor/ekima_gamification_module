// src/pages/Chapter.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Target,
  Award,
  FileText,
  Beaker,
  Zap,
  Volume2,
  VolumeX,
  Maximize,
  ArrowLeft,
  ArrowRight,
  Home,
  BarChart3,
  Lightbulb,
  HelpCircle
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../context/ProgressContext';
import { useGamification } from '../hooks/useGamification';

// Import components
import ContentViewer from '../components/learning/ContentViewer';
import Loading from '../components/common/Loading';

// Import services and utilities
import { contentAPI, quizAttemptAPI } from '../services/api';
import { calculateChapterXP } from '../utils/progressCalculator';

const Chapter = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [studyStartTime, setStudyStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [isStudying, setIsStudying] = useState(true);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [userNotes, setUserNotes] = useState('');

  // Refs
  const timerRef = useRef(null);

  // Contexts and hooks
  const { userProgress, updateChapterProgress } = useProgress();
  const { completeChapter, addXP } = useGamification();

  // Timer effect
  useEffect(() => {
    if (isStudying) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 60000); // Update every minute
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isStudying]);

  // Load chapter data
  useEffect(() => {
    const loadChapterData = async () => {
      try {
        setLoading(true);
        const data = await contentAPI.getChapter(chapterId);
        setChapterData(data);
        
        // Load existing progress
        const existingProgress = userProgress?.chapters?.[chapterId];
        if (existingProgress) {
          setTimeSpent(existingProgress.timeSpent || 0);
          setCompletedSections(new Set(existingProgress.completedSections || []));
          setUserNotes(existingProgress.notes || '');
        }
      } catch (err) {
        setError('Failed to load chapter data');
        console.error('Error loading chapter:', err);
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      loadChapterData();
    }
  }, [chapterId, userProgress]);

  // Auto-save progress
  useEffect(() => {
    const saveProgress = async () => {
      if (chapterData && timeSpent > 0) {
        try {
          await updateChapterProgress(chapterId, {
            timeSpent,
            completedSections: Array.from(completedSections),
            notes: userNotes,
            lastStudied: new Date().toISOString(),
            progressPercentage: calculateProgressPercentage()
          });
        } catch (err) {
          console.error('Error saving progress:', err);
        }
      }
    };

    const interval = setInterval(saveProgress, 30000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [chapterId, timeSpent, completedSections, userNotes, chapterData, updateChapterProgress]);

  // Calculate progress percentage
  const calculateProgressPercentage = () => {
    if (!chapterData?.sections) return 0;
    const totalSections = chapterData.sections.length;
    const completed = completedSections.size;
    return totalSections > 0 ? (completed / totalSections) * 100 : 0;
  };

  // Handle section completion
  const handleSectionComplete = (sectionIndex) => {
    setCompletedSections(prev => new Set([...prev, sectionIndex]));
    
    // Auto-advance to next section
    if (sectionIndex < (chapterData?.sections?.length || 0) - 1) {
      setTimeout(() => {
        setCurrentSection(sectionIndex + 1);
      }, 1000);
    } else {
      // All sections completed, show quiz if available
      if (chapterData?.quiz?.length > 0) {
        setShowQuiz(true);
      }
    }
  };

  // Handle quiz submission
  const handleQuizSubmit = async () => {
    try {
      const result = await quizAttemptAPI.create(chapterId, quizAnswers);
      setQuizScore(result.score);
      setQuizSubmitted(true);
      
      // Complete chapter
      const finalTimeSpent = Math.floor((Date.now() - studyStartTime) / 60000) + timeSpent;
      await handleCompleteChapter(finalTimeSpent, result.score);
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  };

  // Handle chapter completion
  const handleCompleteChapter = async (finalTimeSpent, score) => {
    try {
      const result = await completeChapter(chapterData, finalTimeSpent, score);
      
      await updateChapterProgress(chapterId, {
        completed: true,
        timeSpent: finalTimeSpent,
        quizScore: score,
        completedAt: new Date().toISOString(),
        xpEarned: result.xpAdded,
        completedSections: Array.from(completedSections),
        notes: userNotes
      });

      if (result.leveledUp) {
        alert(`🎉 Congratulations! You've reached Level ${result.newLevel}! 🎉`);
      }

      // Show completion modal or navigate
      setTimeout(() => {
        navigate(`/topic/${chapterData.topicId}`);
      }, 3000);
    } catch (err) {
      console.error('Error completing chapter:', err);
    }
  };

  // Navigation helpers
  const goToNextSection = () => {
    if (currentSection < (chapterData?.sections?.length || 0) - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Format time
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error || !chapterData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BookOpen size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested chapter could not be found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Quiz completion state
  if (quizSubmitted && quizScore !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="mb-6">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chapter Completed! 🎉</h1>
            <p className="text-gray-600">Great job finishing this chapter!</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{quizScore}%</div>
              <div className="text-sm text-gray-600">Quiz Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatTime(Math.floor((Date.now() - studyStartTime) / 60000) + timeSpent)}
              </div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {calculateChapterXP(chapterData, Math.floor((Date.now() - studyStartTime) / 60000) + timeSpent, quizScore)}
              </div>
              <div className="text-sm text-gray-600">XP Earned</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/topic/${chapterData.topicId}`)}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Continue to Next Chapter
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Review This Chapter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSectionData = chapterData.sections?.[currentSection];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              {/* Breadcrumb */}
              <div className="flex items-center text-sm text-gray-600">
                <Link to="/dashboard" className="hover:text-blue-600">
                  <Home size={16} />
                </Link>
                <ChevronRight size={14} className="mx-2" />
                <Link to={`/subject/${chapterData.subjectId}`} className="hover:text-blue-600">
                  {chapterData.subjectName}
                </Link>
                <ChevronRight size={14} className="mx-2" />
                <Link to={`/topic/${chapterData.topicId}`} className="hover:text-blue-600">
                  {chapterData.topicName}
                </Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-gray-900 font-medium">{chapterData.name}</span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-1" />
                <span>{formatTime(timeSpent)}</span>
              </div>

              {/* Progress */}
              <div className="flex items-center text-sm text-gray-600">
                <BarChart3 size={16} className="mr-1" />
                <span>{Math.round(calculateProgressPercentage())}%</span>
              </div>

              {/* Pause/Resume */}
              <button
                onClick={() => setIsStudying(!isStudying)}
                className={`p-2 rounded-lg transition-colors ${
                  isStudying ? 'hover:bg-gray-100' : 'bg-orange-100 hover:bg-orange-200'
                }`}
                title={isStudying ? 'Pause timer' : 'Resume timer'}
              >
                {isStudying ? <Pause size={16} /> : <Play size={16} />}
              </button>

              {/* Notes */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle notes"
              >
                <FileText size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgressPercentage()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Section {currentSection + 1} of {chapterData.sections?.length || 0}</span>
              <span>{completedSections.size} completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {showQuiz ? (
              /* Quiz Section */
              <div className="bg-white rounded-xl p-8 shadow-sm border">
                <div className="text-center mb-8">
                  <Award size={48} className="mx-auto text-yellow-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter Quiz</h2>
                  <p className="text-gray-600">
                    Test your understanding of the concepts you've learned
                  </p>
                </div>

                <div className="space-y-6">
                  {chapterData.quiz?.map((question, qIndex) => (
                    <div key={qIndex} className="p-6 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Question {qIndex + 1}: {question.question}
                      </h3>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <label
                            key={oIndex}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question_${qIndex}`}
                              value={oIndex}
                              onChange={(e) => setQuizAnswers(prev => ({
                                ...prev,
                                [qIndex]: parseInt(e.target.value)
                              }))}
                              className="mr-3"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < (chapterData.quiz?.length || 0)}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            ) : (
              /* Content Section */
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Section Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {currentSectionData?.title || 'Loading...'}
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        Section {currentSection + 1} of {chapterData.sections?.length || 0}
                      </p>
                    </div>
                    {completedSections.has(currentSection) && (
                      <CheckCircle size={24} className="text-green-500" />
                    )}
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-6">
                  {currentSectionData && (
                    <ContentViewer
                      content={currentSectionData}
                      onComplete={() => handleSectionComplete(currentSection)}
                      isCompleted={completedSections.has(currentSection)}
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goToPreviousSection}
                      disabled={currentSection === 0}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Previous
                    </button>

                    <div className="flex space-x-2">
                      {chapterData.sections?.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSection(index)}
                          className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                            index === currentSection
                              ? 'bg-blue-500 text-white'
                              : completedSections.has(index)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={goToNextSection}
                      disabled={currentSection >= (chapterData.sections?.length || 0) - 1}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chapter Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Overview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{chapterData.estimatedTime || 30} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty</span>
                  <span className={`font-medium capitalize ${
                    chapterData.difficulty === 'easy' ? 'text-green-600' :
                    chapterData.difficulty === 'medium' ? 'text-yellow-600' :
                    chapterData.difficulty === 'hard' ? 'text-red-600' :
                    'text-purple-600'
                  }`}>
                    {chapterData.difficulty || 'Medium'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">XP Reward</span>
                  <span className="font-medium text-yellow-600">{chapterData.xpReward || 50} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-blue-600">
                    {Math.round(calculateProgressPercentage())}%
                  </span>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            {chapterData.learningObjectives && chapterData.learningObjectives.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target size={20} className="mr-2 text-blue-500" />
                  Objectives
                </h3>
                <ul className="space-y-2">
                  {chapterData.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {showNotes && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText size={20} className="mr-2 text-green-500" />
                  My Notes
                </h3>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Help */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HelpCircle size={20} className="mr-2 text-purple-500" />
                Need Help?
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Lightbulb size={16} className="inline mr-2 text-yellow-500" />
                  Get a hint
                </button>
                <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <FileText size={16} className="inline mr-2 text-blue-500" />
                  View resources
                </button>
                <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <HelpCircle size={16} className="inline mr-2 text-green-500" />
                  Ask for help
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter;