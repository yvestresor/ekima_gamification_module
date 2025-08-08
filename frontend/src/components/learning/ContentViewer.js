// src/components/learning/ContentViewer.js

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  FileText, 
  CheckCircle,
  Eye,
  Beaker,
  Zap,
  RotateCcw,
  Forward,
  Rewind,
  Settings,
  Download,
  BookOpen,
  Lightbulb,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

/**
 * ContentViewer component for displaying various types of learning content
 * Supports videos, text, experiments, simulations, and interactive elements
 */
const ContentViewer = ({ 
  content, 
  onComplete, 
  isCompleted = false,
  autoPlay = false,
  className = '' 
}) => {
  // State for different content types
  const [isVideoPlaying, setIsVideoPlaying] = useState(autoPlay);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoVolume, setVideoVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);
  const [experimentState, setExperimentState] = useState('idle');
  const [simulationParams, setSimulationParams] = useState({});

  // Refs
  const videoRef = useRef(null);
  const contentRef = useRef(null);
  const readingRef = useRef(null);

  // Content type handlers
  const handleVideoPlay = () => {
    if (videoRef.current) {
      setIsVideoPlaying(true);
      videoRef.current.play();
    }
  };

  const handleVideoPause = () => {
    if (videoRef.current) {
      setIsVideoPlaying(false);
      videoRef.current.pause();
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
      
      // Mark as viewed if 80% watched
      const progress = (videoRef.current.currentTime / videoDuration) * 100;
      if (progress >= 80 && !hasViewed) {
        setHasViewed(true);
        if (onComplete && !isCompleted) {
          onComplete();
        }
      }
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVideoVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setVideoCurrentTime(time);
    }
  };

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      if (readingRef.current) {
        const element = readingRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        setReadingProgress(Math.min(progress, 100));
        
        if (progress >= 90 && !hasViewed) {
          setHasViewed(true);
          if (onComplete && !isCompleted) {
            onComplete();
          }
        }
      }
    };

    if (readingRef.current) {
      readingRef.current.addEventListener('scroll', handleScroll);
      return () => {
        if (readingRef.current) {
          readingRef.current.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [onComplete, isCompleted, hasViewed]);

  // Auto-complete for interactive content after sufficient interaction
  useEffect(() => {
    if (content?.type === 'interactive' && interactionCount >= 5 && !hasViewed) {
      setHasViewed(true);
      if (onComplete && !isCompleted) {
        onComplete();
      }
    }
  }, [interactionCount, content?.type, onComplete, isCompleted, hasViewed]);

  // Format time for video controls
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle experiment actions
  const runExperiment = () => {
    setExperimentState('running');
    setInteractionCount(prev => prev + 1);
    
    // Simulate experiment running
    setTimeout(() => {
      setExperimentState('completed');
      if (!hasViewed) {
        setHasViewed(true);
        if (onComplete && !isCompleted) {
          onComplete();
        }
      }
    }, 3000);
  };

  const resetExperiment = () => {
    setExperimentState('idle');
    setInteractionCount(prev => prev + 1);
  };

  // Handle simulation parameter changes
  const updateSimulationParam = (param, value) => {
    setSimulationParams(prev => ({ ...prev, [param]: value }));
    setInteractionCount(prev => prev + 1);
  };

  // Render based on content type
  const renderContent = () => {
    if (!content) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <AlertCircle size={48} className="mr-4" />
          <div>
            <h3 className="text-lg font-medium">No content available</h3>
            <p className="text-sm">This section doesn't have any content yet.</p>
          </div>
        </div>
      );
    }

    switch (content.type) {
      case 'video':
        return (
          <div className="space-y-4">
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full aspect-video"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onEnded={() => {
                  setIsVideoPlaying(false);
                  if (!hasViewed) {
                    setHasViewed(true);
                    if (onComplete && !isCompleted) {
                      onComplete();
                    }
                  }
                }}
              >
                <source src={content.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4">
                  {/* Play/Pause */}
                  <button
                    onClick={isVideoPlaying ? handleVideoPause : handleVideoPlay}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isVideoPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>

                  {/* Time Display */}
                  <span className="text-white text-sm">
                    {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                  </span>

                  {/* Progress Bar */}
                  <div className="flex-1">
                    <div className="relative">
                      <div className="w-full h-1 bg-white/30 rounded-full">
                        <div
                          className="h-1 bg-blue-500 rounded-full transition-all"
                          style={{ width: `${(videoCurrentTime / videoDuration) * 100}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={videoDuration}
                        value={videoCurrentTime}
                        onChange={(e) => seekTo(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={videoVolume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-16"
                    />
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
              {content.description && (
                <p className="text-gray-600">{content.description}</p>
              )}
              {content.transcript && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                    View Transcript
                  </summary>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {content.transcript}
                  </div>
                </details>
              )}
            </div>
          </div>
        );

      case 'text':
      case 'reading':
        return (
          <div className="space-y-4">
            {/* Reading Progress */}
            <div className="sticky top-0 bg-white z-10 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                <span className="text-sm text-gray-600">
                  {Math.round(readingProgress)}% read
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>

            {/* Reading Content */}
            <div
              ref={readingRef}
              className="max-h-96 overflow-y-auto prose prose-sm max-w-none"
            >
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
            </div>

            {/* Reading Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <Lightbulb size={16} className="mr-1" />
                  Key Points
                </button>
                {content.downloadUrl && (
                  <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                    <Download size={16} className="mr-1" />
                    Download
                  </button>
                )}
              </div>
              
              {!isCompleted && hasViewed && (
                <button
                  onClick={() => onComplete && onComplete()}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        );

      case 'experiment':
        return (
          <div className="space-y-6">
            {/* Experiment Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Beaker size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
              <p className="text-gray-600">{content.description}</p>
            </div>

            {/* Experiment Interface */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-center mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  experimentState === 'idle' ? 'bg-gray-200 text-gray-700' :
                  experimentState === 'running' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {experimentState === 'idle' && 'Ready to Start'}
                  {experimentState === 'running' && 'Experiment Running...'}
                  {experimentState === 'completed' && 'Experiment Complete!'}
                </div>
              </div>

              {/* Experiment Controls */}
              <div className="flex justify-center space-x-4">
                {experimentState === 'idle' && (
                  <button
                    onClick={runExperiment}
                    className="flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    <Play size={20} className="mr-2" />
                    Start Experiment
                  </button>
                )}

                {experimentState === 'running' && (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    Running experiment...
                  </div>
                )}

                {experimentState === 'completed' && (
                  <button
                    onClick={resetExperiment}
                    className="flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    <RotateCcw size={20} className="mr-2" />
                    Run Again
                  </button>
                )}
              </div>

              {/* Experiment Results */}
              {experimentState === 'completed' && content.results && (
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-3">Results</h4>
                  <div dangerouslySetInnerHTML={{ __html: content.results }} />
                </div>
              )}
            </div>

            {/* Experiment Instructions */}
            {content.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <BookOpen size={16} className="mr-2" />
                  Instructions
                </h4>
                <div className="text-blue-800 text-sm">
                  <div dangerouslySetInnerHTML={{ __html: content.instructions }} />
                </div>
              </div>
            )}
          </div>
        );

      case 'simulation':
        return (
          <div className="space-y-6">
            {/* Simulation Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
              <p className="text-gray-600">{content.description}</p>
            </div>

            {/* Simulation Interface */}
            <div className="bg-gray-900 rounded-xl p-6 text-white">
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Zap size={48} className="mx-auto mb-2 text-purple-400" />
                  <p className="text-gray-300">Interactive Simulation</p>
                  <p className="text-sm text-gray-500">Click parameters to interact</p>
                </div>
              </div>

              {/* Simulation Controls */}
              {content.parameters && (
                <div className="grid grid-cols-2 gap-4">
                  {content.parameters.map((param) => (
                    <div key={param.name} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {param.label}: {simulationParams[param.name] || param.default}
                      </label>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={simulationParams[param.name] || param.default}
                        onChange={(e) => updateSimulationParam(param.name, parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simulation Info */}
            {content.learningPoints && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                  <Lightbulb size={16} className="mr-2" />
                  Learning Points
                </h4>
                <ul className="text-yellow-800 text-sm space-y-1">
                  {content.learningPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
              <p className="text-gray-600">{content.description}</p>
            </div>

            {/* Interactive Content Area */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center">
              <div className="space-y-4">
                <div className="text-6xl mb-4">🧠</div>
                <p className="text-lg text-gray-700">Interactive learning content</p>
                <p className="text-sm text-gray-600">
                  Interactions: {interactionCount}/5 (Complete 5 to proceed)
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
                  <button
                    onClick={() => setInteractionCount(prev => prev + 1)}
                    className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Option A
                  </button>
                  <button
                    onClick={() => setInteractionCount(prev => prev + 1)}
                    className="bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Option B
                  </button>
                  <button
                    onClick={() => setInteractionCount(prev => prev + 1)}
                    className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Option C
                  </button>
                  <button
                    onClick={() => setInteractionCount(prev => prev + 1)}
                    className="bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Option D
                  </button>
                </div>
              </div>
            </div>

            {hasViewed && (
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                  <CheckCircle size={16} className="mr-2" />
                  Interactive content completed!
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Unsupported content type: {content.type}</p>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`} ref={contentRef}>
      {renderContent()}
      
      {/* Completion Status */}
      {isCompleted && (
        <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle size={20} className="text-green-600 mr-2" />
          <span className="text-green-800 font-medium">Content completed!</span>
        </div>
      )}
    </div>
  );
};

export default ContentViewer;