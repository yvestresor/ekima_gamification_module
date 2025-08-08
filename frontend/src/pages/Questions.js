// src/pages/Questions.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Target,
  Clock,
  CheckCircle,
  X,
  RotateCcw,
  Play,
  Pause,
  BookOpen,
  Award,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Star,
  Zap,
  AlertCircle,
  Lightbulb,
  Eye,
  EyeOff,
  BarChart3,
  Calendar,
  Trophy,
  Flame
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../context/ProgressContext';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';

// Import components
import ProgressTracker from '../components/learning/ProgressTracker';
import Loading from '../components/common/Loading';

// Import utilities
import { formatDate, formatDuration } from '../utils/dateUtils';
import { quizAttemptAPI, questionAPI, contentAPI } from '../services/api';

const Questions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all');
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [questionType, setQuestionType] = useState('all');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizMode, setQuizMode] = useState('practice'); // practice, quiz, exam
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showHints, setShowHints] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Add CRUD state for questions
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [questionCrudLoading, setQuestionCrudLoading] = useState(false);
  const [questionCrudError, setQuestionCrudError] = useState(null);
  const [questionCrudSuccess, setQuestionCrudSuccess] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question: '',
    subject: '',
    topic: '',
    difficulty: 'easy',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1,
    timeLimit: 60,
    explanation: '',
  });

  // Contexts and hooks
  const { userProgress, updateQuizProgress } = useProgress();
  const { completeQuiz, addXP } = useGamification();
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

  // Load questions when filters change
  useEffect(() => {
    // You may want to filter by topic, subject, or both depending on your backend
    let params = {};
    if (selectedTopic !== 'all') params.topicId = selectedTopic;
    if (selectedSubject !== 'all') params.subjectId = selectedSubject;
    if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
    if (questionType !== 'all') params.type = questionType;
    questionAPI.getAll(params)
      .then(res => setQuestions(res.data))
      .catch(() => setQuestions([]));
  }, [selectedSubject, selectedTopic, selectedDifficulty, questionType]);

  // Filter questions based on current filters
  const getFilteredQuestions = () => {
    return questions.filter(q => {
      const matchesSubject = selectedSubject === 'all' || q.subject === selectedSubject;
      const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;
      const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      const matchesType = questionType === 'all' || q.type === questionType;
      const matchesSearch = !searchQuery || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSubject && matchesTopic && matchesDifficulty && matchesType && matchesSearch;
    });
  };

  const filteredQuestions = getFilteredQuestions();

  // Timer effect
  useEffect(() => {
    let timer;
    if (isQuizActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isQuizActive) {
      handleQuizSubmit();
    }
    return () => clearInterval(timer);
  }, [isQuizActive, timeLeft]);

  // Start quiz
  const startQuiz = (mode = 'practice') => {
    setQuizMode(mode);
    setIsQuizActive(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizResults(null);
    
    // Set timer based on mode
    const totalTime = mode === 'exam' ? 
      filteredQuestions.reduce((sum, q) => sum + q.timeLimit, 0) :
      mode === 'quiz' ? 
      Math.min(filteredQuestions.length * 60, 1800) : // Max 30 minutes
      0; // No timer for practice
    
    setTimeLeft(totalTime);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Navigate questions
  const goToQuestion = (index) => {
    setCurrentQuestion(Math.max(0, Math.min(index, filteredQuestions.length - 1)));
  };

  // Submit quiz
  const handleQuizSubmit = async () => {
    setIsQuizActive(false);
    
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    const results = filteredQuestions.map(question => {
      const userAnswer = selectedAnswers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }
      totalPoints += question.points;
      
      return {
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation
      };
    });
    
    const score = Math.round((correctAnswers / filteredQuestions.length) * 100);
    const xpEarned = Math.round(earnedPoints * 2); // XP = points * 2
    
    const quizResult = {
      score,
      correctAnswers,
      totalQuestions: filteredQuestions.length,
      earnedPoints,
      totalPoints,
      xpEarned,
      timeTaken: quizMode === 'practice' ? 0 : (
        (quizMode === 'exam' ? 
          filteredQuestions.reduce((sum, q) => sum + q.timeLimit, 0) :
          Math.min(filteredQuestions.length * 60, 1800)
        ) - timeLeft
      ),
      results
    };
    
    setQuizResults(quizResult);
    setShowResults(true);
    
    // Update progress and gamification
    try {
      await completeQuiz(score, filteredQuestions.length, quizResult.timeTaken / 60, 1);
      await updateQuizProgress(selectedSubject, selectedTopic, quizResult);
    } catch (err) {
      console.error('Error updating quiz progress:', err);
    }
  };

  // Reset quiz
  const resetQuiz = () => {
    setIsQuizActive(false);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizResults(null);
    setTimeLeft(0);
  };

  // Get topics for selected subject
  const getTopicsForSubject = () => {
    if (selectedSubject === 'all') return [];
    return topics.map(topic => ({ id: topic.id, name: topic.name }));
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // CRUD handlers for questions
  const handleAddQuestion = async () => {
    setQuestionCrudLoading(true); setQuestionCrudError(null); setQuestionCrudSuccess(null);
    try {
      await questionAPI.create(questionForm);
      setQuestionCrudSuccess('Question added successfully');
      setShowAddQuestionModal(false);
      setQuestionForm({ question: '', subject: '', topic: '', difficulty: 'easy', type: 'multiple_choice', options: ['', '', '', ''], correctAnswer: 0, points: 1, timeLimit: 60, explanation: '' });
      // Refresh questions
      let params = {};
      if (selectedTopic !== 'all') params.topicId = selectedTopic;
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (questionType !== 'all') params.type = questionType;
      const res = await questionAPI.getAll(params);
      setQuestions(res.data);
    } catch (err) {
      setQuestionCrudError('Failed to add question');
    } finally {
      setQuestionCrudLoading(false);
    }
  };
  const handleEditQuestion = async () => {
    setQuestionCrudLoading(true); setQuestionCrudError(null); setQuestionCrudSuccess(null);
    try {
      await questionAPI.update(editQuestion._id, questionForm);
      setQuestionCrudSuccess('Question updated successfully');
      setShowEditQuestionModal(false);
      setEditQuestion(null);
      setQuestionForm({ question: '', subject: '', topic: '', difficulty: 'easy', type: 'multiple_choice', options: ['', '', '', ''], correctAnswer: 0, points: 1, timeLimit: 60, explanation: '' });
      // Refresh questions
      let params = {};
      if (selectedTopic !== 'all') params.topicId = selectedTopic;
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (questionType !== 'all') params.type = questionType;
      const res = await questionAPI.getAll(params);
      setQuestions(res.data);
    } catch (err) {
      setQuestionCrudError('Failed to update question');
    } finally {
      setQuestionCrudLoading(false);
    }
  };
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    setQuestionCrudLoading(true); setQuestionCrudError(null); setQuestionCrudSuccess(null);
    try {
      await questionAPI.delete(questionId);
      setQuestionCrudSuccess('Question deleted successfully');
      // Refresh questions
      let params = {};
      if (selectedTopic !== 'all') params.topicId = selectedTopic;
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (questionType !== 'all') params.type = questionType;
      const res = await questionAPI.getAll(params);
      setQuestions(res.data);
    } catch (err) {
      setQuestionCrudError('Failed to delete question');
    } finally {
      setQuestionCrudLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Practice Questions</h1>
              <p className="text-gray-600 mt-1">Test your knowledge with targeted practice</p>
            </div>

            {!isQuizActive && (
              <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                <button
                  onClick={() => startQuiz('practice')}
                  disabled={filteredQuestions.length === 0}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play size={16} className="mr-2" />
                  Practice Mode
                </button>
                <button
                  onClick={() => startQuiz('quiz')}
                  disabled={filteredQuestions.length === 0}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Target size={16} className="mr-2" />
                  Timed Quiz
                </button>
                <button
                  onClick={() => startQuiz('exam')}
                  disabled={filteredQuestions.length === 0}
                  className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Award size={16} className="mr-2" />
                  Exam Mode
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results View */}
        {showResults && quizResults && (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <div className="text-center mb-8">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 ${
                  quizResults.score >= 80 ? 'bg-green-500' :
                  quizResults.score >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  {quizResults.score}%
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                <p className="text-gray-600">
                  You answered {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correctly
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{quizResults.score}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{quizResults.xpEarned}</div>
                  <div className="text-sm text-gray-600">XP Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{quizResults.earnedPoints}</div>
                  <div className="text-sm text-gray-600">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {quizMode === 'practice' ? '--' : formatDuration(quizResults.timeTaken / 60, true)}
                  </div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetQuiz}
                  className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <RotateCcw size={16} className="mr-2" />
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/progress')}
                  className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 size={16} className="mr-2" />
                  View Progress
                </button>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h3>
              <div className="space-y-4">
                {quizResults.results.map((result, index) => (
                  <div 
                    key={result.questionId}
                    className={`p-4 rounded-lg border-2 ${
                      result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                      <div className={`flex items-center text-sm font-medium ${
                        result.isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.isCorrect ? (
                          <CheckCircle size={16} className="mr-1" />
                        ) : (
                          <X size={16} className="mr-1" />
                        )}
                        {result.isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{result.question}</p>
                    
                    {!result.isCorrect && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Your answer:</strong> {
                            filteredQuestions[index].options[result.userAnswer] || 'No answer'
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Correct answer:</strong> {
                            filteredQuestions[index].options[result.correctAnswer]
                          }
                        </p>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <strong>Explanation:</strong> {result.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Interface */}
        {isQuizActive && !showResults && (
          <div className="space-y-6">
            {/* Quiz Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {filteredQuestions.length}
                  </div>
                  <div className="w-64">
                    <ProgressTracker 
                      progress={((currentQuestion + 1) / filteredQuestions.length) * 100}
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {quizMode !== 'practice' && (
                    <div className={`flex items-center text-lg font-bold ${
                      timeLeft < 60 ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      <Clock size={20} className="mr-2" />
                      {formatTime(timeLeft)}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className={`p-2 rounded-lg transition-colors ${
                      showHints ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {showHints ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  
                  <button
                    onClick={resetQuiz}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Current Question */}
            {filteredQuestions.length > 0 && (
              <div className="bg-white rounded-xl p-8 shadow-sm border">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        filteredQuestions[currentQuestion].difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        filteredQuestions[currentQuestion].difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {filteredQuestions[currentQuestion].difficulty}
                      </span>
                      <span>{filteredQuestions[currentQuestion].points} points</span>
                    </div>
                    
                    {quizMode !== 'practice' && (
                      <div className="text-sm text-gray-600">
                        {filteredQuestions[currentQuestion].timeLimit}s recommended
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {filteredQuestions[currentQuestion].question}
                  </h3>

                  {showHints && filteredQuestions[currentQuestion].hint && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center text-yellow-800">
                        <Lightbulb size={16} className="mr-2" />
                        <span className="font-medium">Hint:</span>
                      </div>
                      <p className="text-yellow-700 text-sm mt-1">
                        {filteredQuestions[currentQuestion].hint}
                      </p>
                    </div>
                  )}
                </div>

                {/* Answer Options */}
                <div className="space-y-3 mb-6">
                  {filteredQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(filteredQuestions[currentQuestion].id, index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        selectedAnswers[filteredQuestions[currentQuestion].id] === index
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                          selectedAnswers[filteredQuestions[currentQuestion].id] === index
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {selectedAnswers[filteredQuestions[currentQuestion].id] === index && (
                            <CheckCircle size={14} />
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => goToQuestion(currentQuestion - 1)}
                    disabled={currentQuestion === 0}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex space-x-2">
                    {filteredQuestions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          index === currentQuestion
                            ? 'bg-blue-500 text-white'
                            : selectedAnswers[filteredQuestions[index].id] !== undefined
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestion === filteredQuestions.length - 1 ? (
                    <button
                      onClick={handleQuizSubmit}
                      className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => goToQuestion(currentQuestion + 1)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Browser (when not in quiz mode) */}
        {!isQuizActive && !showResults && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Filter size={16} className="mr-1" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${showFilters ? '' : 'hidden lg:grid'}`}>
                {/* Subject Filter */}
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedTopic('all');
                  }}
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
                  disabled={selectedSubject === 'all'}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-black"
                >
                  <option value="all">All Topics</option>
                  {getTopicsForSubject().map(topic => (
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

                {/* Question Type Filter */}
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-black"
                >
                  <option value="all">All Types</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                </select>

                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Found {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Add Question Button (admin/teacher only) */}
            {user && (user.role === 'admin' || user.role === 'teacher' || (typeof hasPermission === 'function' && hasPermission('manage_questions'))) && (
              <button
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => { setShowAddQuestionModal(true); setQuestionForm({ question: '', subject: '', topic: '', difficulty: 'easy', type: 'multiple_choice', options: ['', '', '', ''], correctAnswer: 0, points: 1, timeLimit: 60, explanation: '' }); }}
              >
                + Add Question
              </button>
            )}
            {/* CRUD Feedback */}
            {questionCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
            {questionCrudSuccess && <div className="text-green-600 mb-2">{questionCrudSuccess}</div>}
            {questionCrudError && <div className="text-red-600 mb-2">{questionCrudError}</div>}

            {/* Question List */}
            {filteredQuestions.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Available Questions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {filteredQuestions.map((question, index) => (
                    <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-600">#{index + 1}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {question.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">
                              {question.subject} • {question.topic}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>
                          <div className="text-sm text-gray-600">
                            {question.points} points • {question.timeLimit}s time limit
                          </div>
                        </div>
                        <div className="ml-4">
                          <Target size={20} className="text-blue-500" />
                        </div>
                      </div>
                      {user && (user.role === 'admin' || user.role === 'teacher' || (typeof hasPermission === 'function' && hasPermission('manage_questions'))) && (
                        <div className="flex gap-2 mt-2">
                          <button
                            className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                            onClick={() => { setShowEditQuestionModal(true); setEditQuestion(question); setQuestionForm({ ...question }); }}
                          >Edit</button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >Delete</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
                <Target size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters to find questions that match your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal (simple version, you can expand fields as needed) */}
      {(showAddQuestionModal || showEditQuestionModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">{showAddQuestionModal ? 'Add Question' : 'Edit Question'}</h2>
            <form onSubmit={e => { e.preventDefault(); showAddQuestionModal ? handleAddQuestion() : handleEditQuestion(); }}>
              <input type="text" className="w-full mb-2 p-2 border rounded" placeholder="Question" value={questionForm.question} onChange={e => setQuestionForm(f => ({ ...f, question: e.target.value }))} required />
              <select className="w-full mb-2 p-2 border rounded" value={questionForm.difficulty} onChange={e => setQuestionForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select className="w-full mb-2 p-2 border rounded" value={questionForm.type} onChange={e => setQuestionForm(f => ({ ...f, type: e.target.value }))}>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="short_answer">Short Answer</option>
              </select>
              {questionForm.type === 'multiple_choice' && questionForm.options.map((opt, idx) => (
                <input key={idx} type="text" className="w-full mb-2 p-2 border rounded" placeholder={`Option ${idx + 1}`} value={opt} onChange={e => setQuestionForm(f => { const opts = [...f.options]; opts[idx] = e.target.value; return { ...f, options: opts }; })} required />
              ))}
              {questionForm.type === 'multiple_choice' && (
                <select className="w-full mb-2 p-2 border rounded" value={questionForm.correctAnswer} onChange={e => setQuestionForm(f => ({ ...f, correctAnswer: Number(e.target.value) }))}>
                  {questionForm.options.map((opt, idx) => (
                    <option key={idx} value={idx}>{`Correct: Option ${idx + 1}`}</option>
                  ))}
                </select>
              )}
              <input type="number" className="w-full mb-2 p-2 border rounded" placeholder="Points" value={questionForm.points} onChange={e => setQuestionForm(f => ({ ...f, points: Number(e.target.value) }))} required />
              <input type="number" className="w-full mb-2 p-2 border rounded" placeholder="Time Limit (seconds)" value={questionForm.timeLimit} onChange={e => setQuestionForm(f => ({ ...f, timeLimit: Number(e.target.value) }))} required />
              <textarea className="w-full mb-2 p-2 border rounded" placeholder="Explanation (optional)" value={questionForm.explanation} onChange={e => setQuestionForm(f => ({ ...f, explanation: e.target.value }))} />
              {/* Add more fields as needed */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => { setShowAddQuestionModal(false); setShowEditQuestionModal(false); setEditQuestion(null); }}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{showAddQuestionModal ? 'Add' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;