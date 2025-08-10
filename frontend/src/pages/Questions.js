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

      {/* Add/Edit Question Modal */}
      {(showAddQuestionModal || showEditQuestionModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-blue-600" />
                  {showAddQuestionModal ? 'Add New Question' : 'Edit Question'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddQuestionModal(false);
                    setShowEditQuestionModal(false);
                    setEditQuestion(null);
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
            <form onSubmit={e => { e.preventDefault(); showAddQuestionModal ? handleAddQuestion() : handleEditQuestion(); }}>
              <div className="px-6 py-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Question Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                    <textarea 
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" 
                      placeholder="Enter your question here. Make it clear and specific..." 
                      value={questionForm.question} 
                      onChange={e => setQuestionForm(f => ({ ...f, question: e.target.value }))} 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={questionForm.subject} 
                        onChange={e => setQuestionForm(f => ({ ...f, subject: e.target.value }))} 
                        required
                      >
                        <option value="">Choose a subject...</option>
                        {subjects.map(subj => (
                          <option key={subj._id} value={subj._id}>{subj.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={questionForm.topic} 
                        onChange={e => setQuestionForm(f => ({ ...f, topic: e.target.value }))} 
                        disabled={!questionForm.subject}
                      >
                        <option value="">Choose a topic...</option>
                        {topics.map(topic => (
                          <option key={topic._id} value={topic._id}>{topic.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Question Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Question Configuration
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Type *</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={questionForm.type} 
                        onChange={e => setQuestionForm(f => ({ ...f, type: e.target.value }))}
                      >
                        <option value="multiple_choice">📝 Multiple Choice</option>
                        <option value="true_false">✅ True/False</option>
                        <option value="short_answer">💭 Short Answer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={questionForm.difficulty} 
                        onChange={e => setQuestionForm(f => ({ ...f, difficulty: e.target.value }))}
                      >
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Points *</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={questionForm.points} 
                        onChange={e => setQuestionForm(f => ({ ...f, points: parseInt(e.target.value) }))} 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (seconds)</label>
                    <input 
                      type="number" 
                      min={10} 
                      max={600}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      value={questionForm.timeLimit} 
                      onChange={e => setQuestionForm(f => ({ ...f, timeLimit: parseInt(e.target.value) }))} 
                      required 
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended time for students to answer this question</p>
                  </div>
                </div>

                {/* Answer Options (Multiple Choice) */}
                {questionForm.type === 'multiple_choice' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Answer Options
                    </h3>

                    <div className="space-y-3">
                      {questionForm.options.map((opt, idx) => (
                        <div key={idx}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Option {idx + 1} {idx < 2 && <span className="text-red-500">*</span>}
                          </label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                            placeholder={`Enter option ${idx + 1}...`} 
                            value={opt} 
                            onChange={e => setQuestionForm(f => { 
                              const opts = [...f.options]; 
                              opts[idx] = e.target.value; 
                              return { ...f, options: opts }; 
                            })} 
                            required={idx < 2}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={questionForm.correctAnswer} 
                        onChange={e => setQuestionForm(f => ({ ...f, correctAnswer: parseInt(e.target.value) }))}
                      >
                        {questionForm.options.map((opt, idx) => (
                          <option key={idx} value={idx} disabled={!opt.trim()}>
                            {opt.trim() ? `✓ Option ${idx + 1}: ${opt.substring(0, 30)}${opt.length > 30 ? '...' : ''}` : `Option ${idx + 1} (empty)`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* True/False Options */}
                {questionForm.type === 'true_false' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Correct Answer
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          questionForm.correctAnswer === 0
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setQuestionForm(f => ({ ...f, correctAnswer: 0 }))}
                      >
                        <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">True</div>
                      </button>
                      <button
                        type="button"
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          questionForm.correctAnswer === 1
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setQuestionForm(f => ({ ...f, correctAnswer: 1 }))}
                      >
                        <X className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">False</div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Additional Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                    <textarea 
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" 
                      placeholder="Provide an explanation for the correct answer. This will be shown to students after they answer..." 
                      value={questionForm.explanation} 
                      onChange={e => setQuestionForm(f => ({ ...f, explanation: e.target.value }))} 
                    />
                    <p className="text-xs text-gray-500 mt-1">Help students understand why the answer is correct</p>
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
                      setShowAddQuestionModal(false);
                      setShowEditQuestionModal(false);
                      setEditQuestion(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={questionCrudLoading || !questionForm.question || !questionForm.subject}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                  >
                    {questionCrudLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        {showAddQuestionModal ? 'Create Question' : 'Save Changes'}
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

export default Questions;