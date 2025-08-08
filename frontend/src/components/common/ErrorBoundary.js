import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const errorReport = {
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // In a real app, you would send this to your error reporting service
    console.log('Error Report:', errorReport);
    
    // Copy to clipboard for user
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert('Error details copied to clipboard'))
      .catch(() => alert('Could not copy error details'));
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message?.includes('fetch') || 
                            this.state.error?.message?.includes('network');
      
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {isNetworkError ? 'Connection Problem' : 'Oops! Something went wrong'}
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 mb-6">
              {isNetworkError ? (
                "We're having trouble connecting to our servers. Please check your internet connection and try again."
              ) : (
                "An unexpected error occurred while loading this page. Our team has been notified and we're working to fix it."
              )}
            </p>

            {/* Error Details (Development Only) */}
            {isDevelopment && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
                <pre className="text-sm text-red-600 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                disabled={this.state.retryCount >= 3}
              >
                <RefreshCw className="w-4 h-4" />
                <span>
                  {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                </span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>

              {/* Report Error Button */}
              <button
                onClick={this.handleReportError}
                className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2 flex items-center justify-center space-x-2 transition-colors"
              >
                <Bug className="w-4 h-4" />
                <span>Report this issue</span>
              </button>
            </div>

            {/* Retry Count Warning */}
            {this.state.retryCount > 0 && this.state.retryCount < 3 && (
              <p className="text-sm text-yellow-600 mt-4">
                Retry attempt {this.state.retryCount}/3
              </p>
            )}

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Need help?</h3>
              <p className="text-sm text-gray-600">
                If this problem persists, please contact our support team at{' '}
                <a href="mailto:support@ekima.com" className="text-orange-600 hover:text-orange-700">
                  support@ekima.com
                </a>
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 max-w-lg w-full text-center">
            <details className="bg-white rounded-lg border p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Technical Information
              </summary>
              <div className="text-left text-xs text-gray-600 space-y-2">
                <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                <p><strong>Page:</strong> {window.location.pathname}</p>
                <p><strong>Browser:</strong> {navigator.userAgent.split(' ')[0]}</p>
                {isDevelopment && (
                  <p><strong>Environment:</strong> Development</p>
                )}
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for functional components
export const withErrorBoundary = (Component, fallback = null) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const handleError = (error, errorInfo = {}) => {
    // In a real app, send to error reporting service
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // You could also trigger a global error state or show a toast
    // dispatch({ type: 'GLOBAL_ERROR', payload: { error, errorInfo } });
  };

  const handleAsyncError = (asyncFn) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        handleError(error, { context: 'async operation' });
        throw error; // Re-throw so calling code can handle it
      }
    };
  };

  return { handleError, handleAsyncError };
};

export default ErrorBoundary;