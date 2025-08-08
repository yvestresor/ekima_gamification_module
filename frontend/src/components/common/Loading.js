import React from 'react';
import { Loader2, BookOpen, Brain, Zap } from 'lucide-react';

const Loading = ({ 
  type = 'default', 
  size = 'medium', 
  message = '', 
  fullScreen = false,
  overlay = false 
}) => {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-4 h-4';
      case 'medium': return 'w-8 h-8';
      case 'large': return 'w-12 h-12';
      case 'xl': return 'w-16 h-16';
      default: return 'w-8 h-8';
    }
  };

  const getContainerClasses = () => {
    if (fullScreen) {
      return 'fixed inset-0 bg-white flex items-center justify-center z-50';
    }
    if (overlay) {
      return 'absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-40';
    }
    return 'flex items-center justify-center py-8';
  };

  const DefaultLoader = () => (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className={`${getSizeClasses()} text-orange-500 animate-spin`} />
      {message && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  const DotsLoader = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 bg-orange-500 rounded-full animate-bounce`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      {message && (
        <p className="text-gray-600 text-sm font-medium">
          {message}
        </p>
      )}
    </div>
  );

  const PulseLoader = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className={`${getSizeClasses()} bg-orange-500 rounded-full animate-ping absolute`} />
        <div className={`${getSizeClasses()} bg-orange-500 rounded-full`} />
      </div>
      {message && (
        <p className="text-gray-600 text-sm font-medium">
          {message}
        </p>
      )}
    </div>
  );

  const SkeletonLoader = () => (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="h-4 bg-gray-200 rounded-full w-1/2" />
      <div className="h-4 bg-gray-200 rounded-full w-5/6" />
    </div>
  );

  const ProgressLoader = ({ progress = 0 }) => (
    <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-gray-600 text-sm font-medium">
        {message || `Loading... ${progress}%`}
      </p>
    </div>
  );

  const EkimaLoader = () => (
    <div className="flex flex-col items-center space-y-6">
      {/* Animated Logo */}
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
          <BookOpen className="w-8 h-8 text-white animate-pulse" />
        </div>
        
        {/* Floating Icons */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
          <Brain className="w-3 h-3 text-white" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
          <Zap className="w-3 h-3 text-white" />
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Ekima</h3>
        <p className="text-gray-600 text-sm">
          {message || 'Loading your learning experience...'}
        </p>
      </div>
      
      {/* Progress Dots */}
      <div className="flex space-x-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );

  const CardLoader = () => (
    <div className="bg-white rounded-xl border p-6 animate-pulse">
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded-full w-3/4" />
          <div className="h-3 bg-gray-200 rounded-full w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded-full" />
        <div className="h-3 bg-gray-200 rounded-full w-5/6" />
        <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
      </div>
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots': return <DotsLoader />;
      case 'pulse': return <PulseLoader />;
      case 'skeleton': return <SkeletonLoader />;
      case 'progress': return <ProgressLoader />;
      case 'ekima': return <EkimaLoader />;
      case 'card': return <CardLoader />;
      default: return <DefaultLoader />;
    }
  };

  return (
    <div className={getContainerClasses()}>
      {renderLoader()}
    </div>
  );
};

// Specialized loading components for different use cases
export const PageLoader = ({ message = "Loading page..." }) => (
  <Loading type="ekima" size="large" message={message} fullScreen />
);

export const ContentLoader = ({ message = "Loading content..." }) => (
  <Loading type="default" size="medium" message={message} />
);

export const ButtonLoader = ({ message = "Loading..." }) => (
  <Loading type="dots" size="small" message={message} />
);

export const OverlayLoader = ({ message = "Please wait..." }) => (
  <Loading type="pulse" size="large" message={message} overlay />
);

export const SkeletonCard = () => (
  <Loading type="card" />
);

export const ProgressLoader = ({ progress, message }) => (
  <Loading type="progress" message={message} progress={progress} />
);

// Higher-order component for adding loading states
export const withLoading = (Component, LoadingComponent = Loading) => {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <LoadingComponent />;
    }
    return <Component {...props} />;
  };
};

// Hook for managing loading states
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  
  const withLoading = async (asyncFn) => {
    startLoading();
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};

export default Loading;