// src/pages/Videos.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  FastForward,
  Rewind,
  Settings,
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
  Calendar,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  Headphones,
  Subtitles,
  Monitor,
  Smartphone
} from 'lucide-react';

// Import contexts and hooks
import { useProgress } from '../context/ProgressContext';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';
import { contentAPI, videoAPI } from '../services/api';

// Import components
import Loading from '../components/common/Loading';
import ProgressTracker from '../components/learning/ProgressTracker';

// Import utilities
import { formatDate, formatDuration } from '../utils/dateUtils';

const Videos = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [videos, setVideos] = useState([]);
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);

  // Contexts and hooks
  const { userProgress, updateVideoProgress } = useProgress();
  const { addXP } = useGamification();
  const { user, hasPermission } = useAuth();

  // Add CRUD state for videos
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [editVideo, setEditVideo] = useState(null);
  const [videoCrudLoading, setVideoCrudLoading] = useState(false);
  const [videoCrudError, setVideoCrudError] = useState(null);
  const [videoCrudSuccess, setVideoCrudSuccess] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    duration: 10,
    difficulty: 'easy',
    tags: [],
    videoUrl: '',
    thumbnail: '',
    instructor: '',
    instructorAvatar: '',
    xpReward: 10,
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

  // Load videos when filters change
  useEffect(() => {
    let params = {};
    if (selectedTopic !== 'all') params.topicId = selectedTopic;
    if (selectedSubject !== 'all') params.subjectId = selectedSubject;
    if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
    if (selectedDuration !== 'all') params.duration = selectedDuration;
    if (searchQuery) params.q = searchQuery;
    videoAPI.getAll(params)
      .then(res => setVideos(res.data))
      .catch(() => setVideos([]));
  }, [selectedSubject, selectedTopic, selectedDifficulty, selectedDuration, searchQuery]);

  // Load favorites and watched videos
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('ekima_video_favorites') || '[]');
    const savedWatched = JSON.parse(localStorage.getItem('ekima_watched_videos') || '[]');
    setFavorites(savedFavorites);
    setWatchedVideos(new Set(savedWatched));
  }, []);

  // Video player effects
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => handleVideoComplete();

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [selectedVideo]);

  // Handle video selection
  const handleVideoSelect = async (video) => {
    setSelectedVideo(video);
    setIsLoading(true);
    setWatchStartTime(Date.now());
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Track video start
      await updateVideoProgress(video.id, {
        started: true,
        startedAt: new Date().toISOString(),
        watchTime: 0
      });
      
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video completion
  const handleVideoComplete = async () => {
    if (!selectedVideo || !watchStartTime) return;
    
    const watchTime = Math.floor((Date.now() - watchStartTime) / 1000);
    
    try {
      // Mark as watched
      const newWatched = new Set([...watchedVideos, selectedVideo.id]);
      setWatchedVideos(newWatched);
      localStorage.setItem('ekima_watched_videos', JSON.stringify([...newWatched]));
      
      // Update progress
      await updateVideoProgress(selectedVideo.id, {
        completed: true,
        completedAt: new Date().toISOString(),
        watchTime,
        progress: 100
      });
      
      // Award XP
      await addXP(selectedVideo.xpReward, 'video_completed');
      
      console.log(`Video completed! +${selectedVideo.xpReward} XP earned`);
      
    } catch (error) {
      console.error('Error completing video:', error);
    }
  };

  // Video player controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const changePlaybackRate = (rate) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  // Toggle favorite
  const toggleFavorite = (videoId) => {
    const newFavorites = favorites.includes(videoId)
      ? favorites.filter(id => id !== videoId)
      : [...favorites, videoId];
    
    setFavorites(newFavorites);
    localStorage.setItem('ekima_video_favorites', JSON.stringify(newFavorites));
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
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

  // CRUD handlers for videos
  const handleAddVideo = async () => {
    setVideoCrudLoading(true); setVideoCrudError(null); setVideoCrudSuccess(null);
    try {
      await videoAPI.create(videoForm);
      setVideoCrudSuccess('Video added successfully');
      setShowAddVideoModal(false);
      setVideoForm({ title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', tags: [], videoUrl: '', thumbnail: '', instructor: '', instructorAvatar: '', xpReward: 10 });
      // Refresh videos
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (selectedDuration !== 'all') params.duration = selectedDuration;
      if (searchQuery) params.q = searchQuery;
      const res = await videoAPI.getAll(params);
      setVideos(res.data);
    } catch (err) {
      setVideoCrudError('Failed to add video');
    } finally {
      setVideoCrudLoading(false);
    }
  };
  const handleEditVideo = async () => {
    setVideoCrudLoading(true); setVideoCrudError(null); setVideoCrudSuccess(null);
    try {
      await videoAPI.update(editVideo._id, videoForm);
      setVideoCrudSuccess('Video updated successfully');
      setShowEditVideoModal(false);
      setEditVideo(null);
      setVideoForm({ title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', tags: [], videoUrl: '', thumbnail: '', instructor: '', instructorAvatar: '', xpReward: 10 });
      // Refresh videos
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (selectedDuration !== 'all') params.duration = selectedDuration;
      if (searchQuery) params.q = searchQuery;
      const res = await videoAPI.getAll(params);
      setVideos(res.data);
    } catch (err) {
      setVideoCrudError('Failed to update video');
    } finally {
      setVideoCrudLoading(false);
    }
  };
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    setVideoCrudLoading(true); setVideoCrudError(null); setVideoCrudSuccess(null);
    try {
      await videoAPI.delete(videoId);
      setVideoCrudSuccess('Video deleted successfully');
      // Refresh videos
      let params = {};
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (selectedDuration !== 'all') params.duration = selectedDuration;
      if (searchQuery) params.q = searchQuery;
      const res = await videoAPI.getAll(params);
      setVideos(res.data);
    } catch (err) {
      setVideoCrudError('Failed to delete video');
    } finally {
      setVideoCrudLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Educational Videos</h1>
              <p className="text-gray-600 mt-1">Learn with high-quality video content from expert instructors</p>
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search videos..."
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

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="w-full max-w-6xl mx-4">
            {/* Video Container */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="aspect-video flex items-center justify-center">
                  <Loading />
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full aspect-video"
                    poster={selectedVideo.thumbnail}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={selectedVideo.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        value={currentTime}
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-white text-sm mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button onClick={togglePlay} className="text-white hover:text-gray-300">
                          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <button onClick={toggleMute} className="text-white hover:text-gray-300">
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.1}
                            value={isMuted ? 0 : volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="w-20 h-1"
                          />
                        </div>

                        <select
                          value={playbackRate}
                          onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                          className="bg-black text-white border border-gray-600 rounded px-2 py-1 text-sm"
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowCaptions(!showCaptions)}
                          className={`text-white hover:text-gray-300 ${showCaptions ? 'bg-white bg-opacity-20 rounded p-1' : ''}`}
                        >
                          <Subtitles size={20} />
                        </button>
                        
                        <button className="text-white hover:text-gray-300">
                          <Settings size={20} />
                        </button>
                        
                        <button className="text-white hover:text-gray-300">
                          <Maximize size={20} />
                        </button>
                        
                        <button
                          onClick={() => setSelectedVideo(null)}
                          className="text-white hover:text-gray-300"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chapter Markers */}
                  {selectedVideo.chapters && (
                    <div className="absolute left-4 top-4">
                      <select
                        onChange={(e) => handleSeek(parseInt(e.target.value))}
                        className="bg-black bg-opacity-50 text-white border border-gray-600 rounded px-3 py-1 text-sm"
                      >
                        <option value="">Jump to chapter...</option>
                        {selectedVideo.chapters.map((chapter, index) => (
                          <option key={index} value={chapter.time}>
                            {chapter.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-b-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedVideo.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <img
                        src={selectedVideo.instructorAvatar}
                        alt={selectedVideo.instructor}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      {selectedVideo.instructor}
                    </div>
                    <div className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      {selectedVideo.viewCount.toLocaleString()} views
                    </div>
                    <div className="flex items-center">
                      <Star size={14} className="mr-1 text-yellow-500" />
                      {selectedVideo.rating}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDuration(selectedVideo.duration / 60, true)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleFavorite(selectedVideo.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(selectedVideo.id)
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Bookmark size={20} />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 size={20} />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download size={20} />
                  </button>
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
              <Play className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
                <p className="text-sm text-gray-600">Total Videos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(videos.reduce((sum, v) => sum + v.duration, 0) / 3600)}h
                </p>
                <p className="text-sm text-gray-600">Total Duration</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(videos.map(v => v.instructor).filter(Boolean)).size}
                </p>
                <p className="text-sm text-gray-600">Expert Instructors</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{watchedVideos.size}</p>
                <p className="text-sm text-gray-600">Watched</p>
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

            {/* Duration Filter */}
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-black"
            >
              <option value="all">All Durations</option>
              <option value="short">Short (≤5 min)</option>
              <option value="medium">Medium (5-15 min)</option>
              <option value="long">Long ({'>'}15 min)</option>
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

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {videos.length} of {videos.length} videos
          </p>
        </div>

        {/* Add Video Button (admin/teacher only) */}
        {user && (user.role === 'admin' || user.role === 'teacher' || (typeof hasPermission === 'function' && hasPermission('manage_videos'))) && (
          <button
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => { setShowAddVideoModal(true); setVideoForm({ title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', tags: [], videoUrl: '', thumbnail: '', instructor: '', instructorAvatar: '', xpReward: 10 }); }}
          >
            + Add Video
          </button>
        )}
        {/* CRUD Feedback */}
        {videoCrudLoading && <div className="text-blue-600 mb-2">Processing...</div>}
        {videoCrudSuccess && <div className="text-green-600 mb-2">{videoCrudSuccess}</div>}
        {videoCrudError && <div className="text-red-600 mb-2">{videoCrudError}</div>}

        {/* Videos Grid/List */}
        {videos.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          `}>
            {videos.map((video) => (
              <div
                key={video.id}
                className={`
                  bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer
                  ${viewMode === 'list' ? 'flex' : ''}
                `}
                onClick={() => handleVideoSelect(video)}
              >
                {/* Thumbnail */}
                <div className={`
                  relative ${viewMode === 'list' ? 'w-64 h-36' : 'aspect-video'}
                  bg-gray-200 flex items-center justify-center
                `}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <PlayCircle size={viewMode === 'list' ? 32 : 48} className="text-blue-500" />
                  </div>
                  
                  {/* Overlay Info */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
                      {video.difficulty}
                    </span>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(video.id);
                      }}
                      className={`p-1 rounded-full transition-colors ${
                        favorites.includes(video.id)
                          ? 'bg-yellow-500 text-white'
                          : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
                      }`}
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>

                  <div className="absolute bottom-2 right-2">
                    <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {formatDuration(video.duration / 60, true)}
                    </div>
                  </div>

                  {watchedVideos.has(video.id) && (
                    <div className="absolute bottom-2 left-2">
                      <CheckCircle size={16} className="text-green-500 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center text-yellow-500 ml-2">
                      <Star size={14} className="mr-1" />
                      <span className="text-sm font-medium">{video.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <img
                        src={video.instructorAvatar}
                        alt={video.instructor}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      {video.instructor}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Eye size={12} className="mr-1" />
                        {video.viewCount.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Award size={12} className="mr-1" />
                        {video.xpReward} XP
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {video.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {video.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{video.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                {user && (user.role === 'admin' || user.role === 'teacher' || (typeof hasPermission === 'function' && hasPermission('manage_videos'))) && (
                  <div className="absolute top-2 right-10 flex gap-2 z-10">
                    <button
                      className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                      onClick={(e) => { e.stopPropagation(); setShowEditVideoModal(true); setEditVideo(video); setVideoForm({ ...video }); }}
                    >Edit</button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video.id); }}
                    >Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Play size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or explore different subjects.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Choose from our extensive library of educational videos created by expert instructors to enhance your understanding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/progress')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                View My Progress
              </button>
              <button 
                onClick={() => navigate('/subjects')}
                className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
              >
                Browse Subjects
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Video Modal (simple version, you can expand fields as needed) */}
      {(showAddVideoModal || showEditVideoModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">{showAddVideoModal ? 'Add Video' : 'Edit Video'}</h2>
            <form onSubmit={e => { e.preventDefault(); showAddVideoModal ? handleAddVideo() : handleEditVideo(); }}>
              <input type="text" className="w-full mb-2 p-2 border rounded" placeholder="Title" value={videoForm.title} onChange={e => setVideoForm(f => ({ ...f, title: e.target.value }))} required />
              <textarea className="w-full mb-2 p-2 border rounded" placeholder="Description" value={videoForm.description} onChange={e => setVideoForm(f => ({ ...f, description: e.target.value }))} required />
              <input type="number" className="w-full mb-2 p-2 border rounded" placeholder="Duration (min)" value={videoForm.duration} onChange={e => setVideoForm(f => ({ ...f, duration: Number(e.target.value) }))} required />
              <select className="w-full mb-2 p-2 border rounded" value={videoForm.difficulty} onChange={e => setVideoForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input type="text" className="w-full mb-2 p-2 border rounded" placeholder="Tags (comma separated)" value={videoForm.tags.join(', ')} onChange={e => setVideoForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()) }))} />
              <input type="text" className="w-full mb-2 p-2 border rounded" placeholder="Video URL" value={videoForm.videoUrl} onChange={e => setVideoForm(f => ({ ...f, videoUrl: e.target.value }))} required />
              <input type="text" className="w-full mb-2 p-2 border rounded" placeholder="Thumbnail URL" value={videoForm.thumbnail} onChange={e => setVideoForm(f => ({ ...f, thumbnail: e.target.value }))} />
              {/* Add more fields as needed */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => { setShowAddVideoModal(false); setShowEditVideoModal(false); setEditVideo(null); }}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{showAddVideoModal ? 'Add' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;