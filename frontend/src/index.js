import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Performance monitoring (optional)
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Import styles
import './styles/globals.css';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring function
function sendToAnalytics(metric) {
  // In a real app, you would send these metrics to your analytics service
  // Examples: Google Analytics, Amplitude, Mixpanel, etc.
  console.log('Performance Metric:', metric);
  
  // Example implementation for Google Analytics
  // if (window.gtag) {
  //   window.gtag('event', metric.name, {
  //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //     event_category: 'Web Vitals',
  //     event_label: metric.id,
  //     non_interaction: true,
  //   });
  // }
}

// Measure and report web vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// Service worker registration (for PWA capabilities)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // In production, send to error reporting service
  // Example: Sentry.captureException(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // In production, send to error reporting service
  // Example: Sentry.captureException(event.reason);
});

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // React DevTools integration
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools detected');
  }
  
  // Performance monitoring in development
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('Performance entry:', entry);
    }
  });
  
  observer.observe({ entryTypes: ['navigation', 'resource'] });
}

// Accessibility helpers
if (process.env.NODE_ENV === 'development') {
  // Check for accessibility issues
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  }).catch(() => {
    // axe-core is optional, fail silently
  });
}

export default root;