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
import { contentAPI, videoAPI, userAPI, uploadAPI } from '../services/api';

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
  const [selectedTopic, setSelectedTopic] = useState('all');

  // Refs
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);

  // Contexts and hooks
  const progressContext = useProgress();
  const { userProgress, updateVideoProgress } = progressContext || {};
  const gamificationContext = useGamification();
  const { addXP } = gamificationContext || {};
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
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [videoFileMap, setVideoFileMap] = useState(new Map()); // Map video IDs to file objects
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Instructors list (teachers) for admin to pick
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    // Auto-fill for teachers
    if (user && user.role === 'teacher') {
      setVideoForm((f) => ({
        ...f,
        instructor: user.name || user.username || 'Unknown Instructor',
        instructorAvatar: user.profilePic || user.avatar || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    // Fetch teachers for admin dropdown
    const fetchTeachers = async () => {
      try {
        if (!user || user.role !== 'admin') return;
        const res = await userAPI.getAll();
        const list = (res.data || []).filter((u) => (u.role === 'teacher'));
        setInstructors(list);
      } catch (_) {
        setInstructors([]);
      }
    };
    fetchTeachers();
  }, [user]);

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

  // Extract YouTube video id from a URL
  const getYouTubeId = (url = '') => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
    return match?.[1] || null;
  };

  // Helper to normalize backend video objects to UI shape
  const normalizeVideos = (list) => (list || []).map((v) => ({
    ...v,
    id: v.id || v._id || String(Math.random()),
    viewCount: typeof v.viewCount === 'number' ? v.viewCount : 0,
    rating: typeof v.rating === 'number' ? v.rating : 0,
    duration: typeof v.duration === 'number' ? v.duration : 0,
    // detect youtube
    isYouTube: Boolean(getYouTubeId(v.videoUrl || '')),
    youtubeId: getYouTubeId(v.videoUrl || ''),
    isLocalFile: (v.videoUrl || '').startsWith('local-file:'),
    thumbnail: v.thumbnail || (getYouTubeId(v.videoUrl || '') ? `https://img.youtube.com/vi/${getYouTubeId(v.videoUrl || '')}/hqdefault.jpg` : ''),
    xpReward: typeof v.xpReward === 'number' ? v.xpReward : 10,
    difficulty: v.difficulty || 'easy',
    tags: Array.isArray(v.tags) ? v.tags : [],
    instructor: v.instructor || 'Unknown Instructor',
    instructorAvatar: v.instructorAvatar || '',
    chapters: Array.isArray(v.chapters) ? v.chapters : [],
  }));

  // Store all videos (unfiltered)
  const [allVideos, setAllVideos] = useState([]);

  // Load all videos initially
  useEffect(() => {
    videoAPI.getAll()
      .then(res => {
        const normalized = normalizeVideos(res.data);
        setAllVideos(normalized);
      })
      .catch(() => setAllVideos([]));
  }, []); // Only load once

  // Filter and sort videos client-side
  useEffect(() => {
    let filtered = [...allVideos];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(video => 
        video.title?.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query) ||
        video.instructor?.toLowerCase().includes(query) ||
        video.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(video => video.subject === selectedSubject);
    }

    // Apply topic filter
    if (selectedTopic !== 'all') {
      filtered = filtered.filter(video => video.topic === selectedTopic);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(video => video.difficulty === selectedDifficulty);
    }

    // Apply duration filter
    if (selectedDuration !== 'all') {
      filtered = filtered.filter(video => {
        const durationMinutes = (video.duration || 0) / 60;
        switch (selectedDuration) {
          case 'short':
            return durationMinutes <= 5;
          case 'medium':
            return durationMinutes > 5 && durationMinutes <= 15;
          case 'long':
            return durationMinutes > 15;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || b.uploadedAt || 0) - new Date(a.createdAt || a.uploadedAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || a.uploadedAt || 0) - new Date(b.createdAt || b.uploadedAt || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'duration':
        filtered.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
      default:
        break;
    }

    setVideos(filtered);
  }, [allVideos, selectedSubject, selectedTopic, selectedDifficulty, selectedDuration, searchQuery, sortBy]);

  // Load favorites and watched videos
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('ekima_video_favorites') || '[]');
    const savedWatched = JSON.parse(localStorage.getItem('ekima_watched_videos') || '[]');
    setFavorites(savedFavorites);
    setWatchedVideos(new Set(savedWatched));
  }, []);

  // Video player effects
  useEffect(() => {
    // For YouTube embeds we do not attach native video listeners
    if (selectedVideo?.isYouTube) return;
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => handleVideoComplete();

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    // Store the current blob URL for cleanup
    let currentBlobUrl = null;
    if (selectedVideo?.isLocalFile && selectedVideoFile) {
      currentBlobUrl = video.src;
    }

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
      
      // Clean up blob URL when video changes or component unmounts
      if (currentBlobUrl && currentBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [selectedVideo, selectedVideoFile]);

  // Handle video selection
  const handleVideoSelect = async (video) => {
    setSelectedVideo(video);
    setIsLoading(true);
    setWatchStartTime(Date.now());
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Track video start (if progress tracking is available)
      if (updateVideoProgress && typeof updateVideoProgress === 'function') {
        await updateVideoProgress(video.id, {
          started: true,
          startedAt: new Date().toISOString(),
          watchTime: 0
        });
      }
      
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
      
      // Update progress (if progress tracking is available)
      if (updateVideoProgress && typeof updateVideoProgress === 'function') {
        await updateVideoProgress(selectedVideo.id, {
          completed: true,
          completedAt: new Date().toISOString(),
          watchTime,
          progress: 100
        });
      }
      
      // Award XP (if gamification is available)
      if (addXP && typeof addXP === 'function') {
        await addXP(selectedVideo.xpReward, 'video_completed');
      }
      
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

  // Get video URL for playback (handles local files and regular URLs)
  const getVideoPlaybackUrl = (video) => {
    if (!video || !video.videoUrl) {
      console.warn('No video or videoUrl provided');
      return '';
    }

    if (video.isLocalFile) {
      // For local files, check if we have the file in our map
      const file = videoFileMap.get(video.videoUrl);
      if (file) {
        const blobUrl = URL.createObjectURL(file);
        console.log('Created blob URL for local file:', blobUrl);
        return blobUrl;
      }
      
      // Fallback: check if it's the currently selected file from the form
      if (selectedVideoFile && video.videoUrl.includes(selectedVideoFile.name)) {
        const blobUrl = URL.createObjectURL(selectedVideoFile);
        console.log('Created blob URL for selected video file:', blobUrl);
        return blobUrl;
      }
      
      // If we don't have the file, return empty (video won't play)
      console.warn('Local file not found in videoFileMap:', video.videoUrl);
      return '';
    }
    // For regular URLs (including YouTube), return as-is
    console.log('Using regular video URL:', video.videoUrl);
    return video.videoUrl;
  };

  // CRUD handlers for videos
  const handleAddVideo = async () => {
    setVideoCrudLoading(true); setVideoCrudError(null); setVideoCrudSuccess(null);
    try {
      // If empty instructor, default to current user (teacher/admin)
      const payload = { ...videoForm };
      // Try to enrich from YouTube metadata
      const yid = getYouTubeId(payload.videoUrl || '');
      if (yid) {
        try {
          const meta = await videoAPI.getMetadata(payload.videoUrl);
          const md = meta.data || {};
          if (!payload.thumbnail && md.thumbnail) payload.thumbnail = md.thumbnail;
          if ((!payload.title || payload.title.trim().length === 0) && md.title) payload.title = md.title;
          if (!payload.duration && typeof md.durationSeconds === 'number') payload.duration = md.durationSeconds;
        } catch (_) {}
      }
      if (!payload.instructor && user) {
        payload.instructor = user.name || user.username || 'Unknown Instructor';
      }
      if (!payload.instructorAvatar && user && (user.profilePic || user.avatar)) {
        payload.instructorAvatar = user.profilePic || user.avatar;
      }
      await videoAPI.create(payload);
      setVideoCrudSuccess('Video added successfully');
      setShowAddVideoModal(false);
      setVideoForm({ title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', tags: [], videoUrl: '', thumbnail: '', instructor: '', instructorAvatar: '', xpReward: 10 });
      setSelectedVideoFile(null);
      // Refresh videos
      const res = await videoAPI.getAll();
      const normalized = normalizeVideos(res.data);
      setAllVideos(normalized);
    } catch (err) {
      setVideoCrudError('Failed to add video');
    } finally {
      setVideoCrudLoading(false);
    }
  };
  const handleEditVideo = async () => {
    setVideoCrudLoading(true); setVideoCrudError(null); setVideoCrudSuccess(null);
    try {
      const payload2 = { ...videoForm };
      const yid2 = getYouTubeId(payload2.videoUrl || '');
      if (yid2) {
        try {
          const meta = await videoAPI.getMetadata(payload2.videoUrl);
          const md = meta.data || {};
          if (!payload2.thumbnail && md.thumbnail) payload2.thumbnail = md.thumbnail;
          if ((!payload2.title || payload2.title.trim().length === 0) && md.title) payload2.title = md.title;
          if (!payload2.duration && typeof md.durationSeconds === 'number') payload2.duration = md.durationSeconds;
        } catch (_) {}
      }
      if (!payload2.instructor && user) {
        payload2.instructor = user.name || user.username || 'Unknown Instructor';
      }
      if (!payload2.instructorAvatar && user && (user.profilePic || user.avatar)) {
        payload2.instructorAvatar = user.profilePic || user.avatar;
      }
      await videoAPI.update(editVideo._id, payload2);
      setVideoCrudSuccess('Video updated successfully');
      setShowEditVideoModal(false);
      setEditVideo(null);
      setVideoForm({ title: '', description: '', subject: '', topic: '', duration: 10, difficulty: 'easy', tags: [], videoUrl: '', thumbnail: '', instructor: '', instructorAvatar: '', xpReward: 10 });
      setSelectedVideoFile(null);
      // Refresh videos
      const res = await videoAPI.getAll();
      const normalized = normalizeVideos(res.data);
      setAllVideos(normalized);
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
      const res = await videoAPI.getAll();
      const normalized = normalizeVideos(res.data);
      setAllVideos(normalized);
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
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center overflow-y-auto z-50">
          <div className="w-full max-w-6xl mx-4 my-8">
            {/* Modal Header */}
            <div className="bg-white rounded-t-lg px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">{selectedVideo.title}</h3>
              <div className="flex items-center gap-2">
                {user && (user.role === 'admin' || user.role === 'teacher' || (typeof hasPermission === 'function' && hasPermission('manage_videos'))) && (
                  <>
                    <button
                      onClick={() => {
                        setShowEditVideoModal(true);
                        setEditVideo(selectedVideo);
                        setVideoForm({
                          title: selectedVideo.title || '',
                          description: selectedVideo.description || '',
                          subject: selectedVideo.subject || '',
                          topic: selectedVideo.topic || '',
                          duration: Number(selectedVideo.duration || 0),
                          difficulty: selectedVideo.difficulty || 'easy',
                          tags: Array.isArray(selectedVideo.tags) ? selectedVideo.tags : [],
                          videoUrl: selectedVideo.videoUrl || '',
                          thumbnail: selectedVideo.thumbnail || '',
                          instructor: selectedVideo.instructor || '',
                          instructorAvatar: selectedVideo.instructorAvatar || '',
                          xpReward: Number(selectedVideo.xpReward || 10),
                        });
                      }}
                      className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => { await handleDeleteVideo(selectedVideo.id); setSelectedVideo(null); }}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
            {/* Video Container */}
            <div className="relative bg-black rounded-b-lg overflow-hidden">
              {isLoading ? (
                <div className="aspect-video flex items-center justify-center">
                  <Loading />
                </div>
              ) : (
                <>
                  {selectedVideo.isYouTube ? (
                    <iframe
                      className="w-full aspect-video"
                      src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0`}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (() => {
                    const videoSrc = getVideoPlaybackUrl(selectedVideo);
                    
                    if (!videoSrc) {
                      return (
                        <div className="w-full aspect-video bg-gray-800 flex items-center justify-center text-white">
                          <div className="text-center">
                            <p className="text-lg mb-2">⚠️ Video not available</p>
                            <p className="text-sm text-gray-300">
                              {selectedVideo.isLocalFile ? 
                                'Local file not found. Please re-upload the video.' : 
                                'Invalid video URL or format not supported.'
                              }
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <video
                        key={selectedVideo.id} // Force re-render when video changes
                        ref={videoRef}
                        className="w-full aspect-video"
                        poster={selectedVideo.thumbnail}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onError={(e) => {
                          console.error('Video error:', e);
                          console.error('Video src:', e.target.src);
                          console.error('Selected video:', selectedVideo);
                        }}
                        onLoadStart={() => {
                          console.log('Video loading started for:', selectedVideo.title);
                        }}
                        controls
                        src={videoSrc}
                      >
                        Your browser does not support the video tag.
                      </video>
                    );
                  })()}

                  {/* Video Controls Overlay */}
                  {!selectedVideo.isYouTube && (
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
                  )}

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
            <div className="bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedVideo.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedVideo.instructorAvatar ? (
                          <img 
                            src={selectedVideo.instructorAvatar} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {selectedVideo.instructor?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="ml-2">
                        {selectedVideo.instructor}
                      </div>
                    </div>
                      <div className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        {Number(selectedVideo.viewCount || 0).toLocaleString()} views
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filters & Sorting
            </h3>
            {(selectedSubject !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || selectedDuration !== 'all' || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setSelectedSubject('all');
                  setSelectedTopic('all');
                  setSelectedDifficulty('all');
                  setSelectedDuration('all');
                  setSortBy('newest');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Reset all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Subject Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={topics.length === 0}
              >
                <option value="all">All Topics</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Durations</option>
                <option value="short">⚡ Short (≤5 min)</option>
                <option value="medium">⏱️ Medium (5-15 min)</option>
                <option value="long">🕐 Long (&gt;15 min)</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="newest">🆕 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="popular">🔥 Most Popular</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="duration">⏰ Shortest First</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedSubject !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || selectedDuration !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                {selectedSubject !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Subject: {subjects.find(s => s.id === selectedSubject)?.name || selectedSubject}
                    <button
                      onClick={() => setSelectedSubject('all')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >×</button>
                  </span>
                )}
                {selectedTopic !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Topic: {topics.find(t => t.id === selectedTopic)?.name || selectedTopic}
                    <button
                      onClick={() => setSelectedTopic('all')}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >×</button>
                  </span>
                )}
                {selectedDifficulty !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Difficulty: {selectedDifficulty}
                    <button
                      onClick={() => setSelectedDifficulty('all')}
                      className="ml-1 text-orange-600 hover:text-orange-800"
                    >×</button>
                  </span>
                )}
                {selectedDuration !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Duration: {selectedDuration}
                    <button
                      onClick={() => setSelectedDuration('all')}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
          <p className="text-gray-600">
              Showing {videos.length} of {allVideos.length} videos
            </p>
            {(selectedSubject !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || selectedDuration !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedSubject('all');
                  setSelectedTopic('all');
                  setSelectedDifficulty('all');
                  setSelectedDuration('all');
                  setSearchQuery('');
                  setSortBy('newest');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          {videos.length !== allVideos.length && (
            <div className="text-sm text-gray-500">
              {allVideos.length - videos.length} videos filtered out
            </div>
          )}
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
                      {(Number(video.duration || 0) / 60).toFixed(0)}m
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
                    <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                        {video.instructorAvatar ? (
                          <img 
                            src={video.instructorAvatar} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {video.instructor?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="ml-2">
                        {video.instructor}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Eye size={12} className="mr-1" />
                        {Number(video.viewCount || 0).toLocaleString()}
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

      {/* Add/Edit Video Modal */}
      {(showAddVideoModal || showEditVideoModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showAddVideoModal ? 'Add New Video' : 'Edit Video'}
                </h2>
                <button
                  onClick={() => { 
                    setShowAddVideoModal(false); 
                    setShowEditVideoModal(false); 
                    setEditVideo(null); 
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
            <form onSubmit={e => { e.preventDefault(); showAddVideoModal ? handleAddVideo() : handleEditVideo(); }}>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Title *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      placeholder="Enter an engaging title for your video" 
                      value={videoForm.title} 
                      onChange={e => setVideoForm(f => ({ ...f, title: e.target.value }))} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea 
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" 
                      placeholder="Describe what students will learn from this video..." 
                      value={videoForm.description} 
                      onChange={e => setVideoForm(f => ({ ...f, description: e.target.value }))} 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={videoForm.difficulty} 
                        onChange={e => setVideoForm(f => ({ ...f, difficulty: e.target.value }))}
                      >
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      
                      {/* Tag input with chips display */}
                      <div className="border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {videoForm.tags && videoForm.tags.length > 0 && videoForm.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  const newTags = videoForm.tags.filter((_, i) => i !== index);
                                  setVideoForm(f => ({ ...f, tags: newTags }));
                                }}
                                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        
                      <input 
                        type="text" 
                          className="w-full border-0 outline-none focus:ring-0 p-1" 
                          placeholder={videoForm.tags && videoForm.tags.length > 0 ? "Add another tag..." : "Type tags and press Enter or use commas"} 
                          onKeyDown={e => {
                            const value = e.target.value.trim();
                            
                            if (e.key === 'Enter' && value) {
                              e.preventDefault();
                              // Add the current input as a tag
                              const existingTags = Array.isArray(videoForm.tags) ? videoForm.tags : [];
                              if (!existingTags.includes(value)) {
                                setVideoForm(f => ({ ...f, tags: [...existingTags, value] }));
                              }
                              e.target.value = '';
                            } else if (e.key === 'Backspace' && !value && videoForm.tags && videoForm.tags.length > 0) {
                              // Remove last tag if input is empty and backspace is pressed
                              e.preventDefault();
                              const newTags = videoForm.tags.slice(0, -1);
                              setVideoForm(f => ({ ...f, tags: newTags }));
                            }
                          }}
                          onChange={e => {
                            const value = e.target.value;
                            // Check if user typed a comma
                            if (value.includes(',')) {
                              const parts = value.split(',');
                              const newTag = parts[0].trim();
                              const remaining = parts.slice(1).join(',');
                              
                              if (newTag) {
                                const existingTags = Array.isArray(videoForm.tags) ? videoForm.tags : [];
                                if (!existingTags.includes(newTag)) {
                                  setVideoForm(f => ({ ...f, tags: [...existingTags, newTag] }));
                                }
                              }
                              
                              // Set the remaining text back to input
                              e.target.value = remaining;
                            }
                          }}
                          onBlur={e => {
                            const value = e.target.value.trim();
                            if (value) {
                              const existingTags = Array.isArray(videoForm.tags) ? videoForm.tags : [];
                              if (!existingTags.includes(value)) {
                                setVideoForm(f => ({ ...f, tags: [...existingTags, value] }));
                              }
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Type a tag and press Enter, or use commas to separate multiple tags. Press Backspace to remove the last tag.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructor Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Instructor
                  </h3>

                  {user && user.role === 'admin' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Instructor *</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        value={videoForm.instructor}
                        onChange={(e) => {
                          const selected = instructors.find(i => (i.name || i.username) === e.target.value);
                          setVideoForm(f => ({
                            ...f,
                            instructor: e.target.value,
                            instructorAvatar: selected?.profilePic || selected?.avatar || f.instructorAvatar,
                          }));
                        }}
                        required
                      >
                        <option value="">Choose a teacher...</option>
                        {instructors.map(t => (
                          <option key={t._id} value={t.name || t.username}>
                            {(t.name || t.username)} {t.email && `(${t.email})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                      <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{videoForm.instructor || 'You'}</p>
                          <p className="text-sm text-gray-500">Video Instructor</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Video File
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      
                      <div className="mt-4">
                        <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer font-medium transition-colors">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Choose Video File
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              // Validate file size (max 500MB)
                              const maxSize = 500 * 1024 * 1024; // 500MB in bytes
                              if (file.size > maxSize) {
                                alert('File size must be less than 500MB');
                                return;
                              }
                              
                              try {
                                setUploadingFile(true);
                                setUploadProgress(0);
                                
                                // Store the file reference
                                setSelectedVideoFile(file);
                                
                                // Simulate upload progress
                                const simulateUpload = () => {
                                  return new Promise((resolve) => {
                                    let progress = 0;
                                    const interval = setInterval(() => {
                                      progress += Math.random() * 20;
                                      if (progress >= 100) {
                                        progress = 100;
                                        clearInterval(interval);
                                        
                                        // Get video duration
                                        const video = document.createElement('video');
                                        video.preload = 'metadata';
                                        video.onloadedmetadata = () => {
                                          const duration = video.duration;
                                          // Clean up the temporary URL
                                          URL.revokeObjectURL(video.src);
                                          resolve({ duration });
                                        };
                                        video.onerror = () => {
                                          console.warn('Could not load video metadata, using default duration');
                                          URL.revokeObjectURL(video.src);
                                          resolve({ duration: 0 });
                                        };
                                        video.src = URL.createObjectURL(file);
                                      } else {
                                        setUploadProgress(Math.round(progress));
                                      }
                                    }, 100);
                                  });
                                };
                                
                                const result = await simulateUpload();
                                const { duration } = result;
                                
                                // Create a unique ID for this file and store it in the map
                                const fileId = `local-file:${Date.now()}-${file.name}`;
                                
                                // Store the file in our video file map
                                setVideoFileMap(prevMap => {
                                  const newMap = new Map(prevMap);
                                  newMap.set(fileId, file);
                                  return newMap;
                                });
                                
                                // Use file ID as a reference and store duration
                                setVideoForm(f => ({ 
                                  ...f, 
                                  videoUrl: fileId,
                                  duration: duration ? Math.round(duration) : f.duration,
                                  title: f.title || file.name.replace(/\.[^/.]+$/, "") // Use filename as title if empty
                                }));
                              } catch (err) {
                                console.error('Upload error:', err);
                                alert('Failed to process video: ' + (err.message || 'Unknown error'));
                              } finally {
                                setUploadingFile(false);
                                setUploadProgress(0);
                              }
                            }}
                          />
                        </label>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600">
                        MP4, WEBM, OGG, or MOV up to 500MB
                      </p>
                    </div>

                    {uploadingFile && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {!uploadingFile && videoForm.videoUrl && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                            <span className="text-sm text-green-700 font-medium">Video ready for upload</span>
                        </div>
                          <button
                            type="button"
                            onClick={() => {
                              // Remove from file map if it's a local file
                              if (videoForm.videoUrl.startsWith('local-file:')) {
                                setVideoFileMap(prevMap => {
                                  const newMap = new Map(prevMap);
                                  newMap.delete(videoForm.videoUrl);
                                  return newMap;
                                });
                              }
                              setVideoForm(f => ({ ...f, videoUrl: '', thumbnail: '' }));
                              setSelectedVideoFile(null);
                            }}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          File selected: {videoForm.videoUrl.startsWith('local-file:') ? 
                            (selectedVideoFile?.name || videoForm.videoUrl.split('-').pop() || 'Local video file') : 
                            videoForm.videoUrl
                          }
                        </p>
                        {videoForm.duration > 0 && (
                          <p className="text-xs text-green-600">Duration: {Math.round(videoForm.duration / 60 * 10) / 10} minutes</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (Alternative)</label>
                    <input 
                      type="url" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                      placeholder="https://example.com/video.mp4" 
                      value={videoForm.videoUrl} 
                      onChange={e => setVideoForm(f => ({ ...f, videoUrl: e.target.value }))} 
                    />
                    <p className="text-xs text-gray-500 mt-1">Or paste a direct video URL</p>
                  </div>
                </div>

                {/* Video Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Video Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                      <input 
                        type="number" 
                        min={0} 
                        step={0.1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={Math.round((Number(videoForm.duration || 0))/60*10)/10} 
                        onChange={e => setVideoForm(f => ({ ...f, duration: Number(e.target.value) * 60 }))} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">XP Reward</label>
                      <input 
                        type="number" 
                        min={0} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        value={videoForm.xpReward} 
                        onChange={e => setVideoForm(f => ({ ...f, xpReward: Number(e.target.value) }))} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                      <input 
                        type="url" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                        placeholder="https://example.com/thumb.jpg" 
                        value={videoForm.thumbnail} 
                        onChange={e => setVideoForm(f => ({ ...f, thumbnail: e.target.value }))} 
                      />
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
                      setShowAddVideoModal(false); 
                      setShowEditVideoModal(false); 
                      setEditVideo(null); 
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={videoCrudLoading || uploadingFile || !videoForm.title || !videoForm.description}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {videoCrudLoading ? 'Processing...' : (showAddVideoModal ? 'Add Video' : 'Save Changes')}
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

export default Videos;