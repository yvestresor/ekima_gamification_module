// src/services/content.js

/**
 * Content management service for the Ekima Learning Platform
 * Handles content delivery, caching, offline support, and media management
 */

// Content cache configuration
const CACHE_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 100 * 1024 * 1024, // 100MB
  storageKey: 'ekima_content_cache',
  offlineStorageKey: 'ekima_offline_content'
};

// Content types and their configurations
const CONTENT_TYPES = {
  video: {
    formats: ['mp4', 'webm'],
    qualities: ['720p', '480p', '360p'],
    defaultQuality: '480p',
    chunkSize: 1024 * 1024, // 1MB chunks for progressive loading
    cachePriority: 'high'
  },
  text: {
    formats: ['html', 'markdown'],
    cachePriority: 'medium',
    preload: true
  },
  image: {
    formats: ['webp', 'jpg', 'png'],
    sizes: ['large', 'medium', 'small', 'thumbnail'],
    defaultSize: 'medium',
    cachePriority: 'medium'
  },
  audio: {
    formats: ['mp3', 'ogg'],
    qualities: ['high', 'medium', 'low'],
    defaultQuality: 'medium',
    cachePriority: 'low'
  },
  model3d: {
    formats: ['glb', 'gltf'],
    compressionLevels: ['high', 'medium', 'low'],
    defaultCompression: 'medium',
    cachePriority: 'low'
  },
  document: {
    formats: ['pdf', 'html'],
    cachePriority: 'medium'
  }
};

class ContentService {
  constructor() {
    this.cache = new Map();
    this.downloadQueue = [];
    this.isOnline = navigator.onLine;
    this.qualitySettings = this.loadQualitySettings();
    this.offlineContent = this.loadOfflineContent();
    
    // Initialize service
    this.init();
  }

  /**
   * Initialize content service
   */
  init() {
    // Load cached content from localStorage
    this.loadCacheFromStorage();
    
    // Set up network listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processDownloadQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Set up periodic cache cleanup
    setInterval(() => {
      this.cleanupCache();
    }, 60 * 60 * 1000); // Every hour
    
    // Preload critical content
    this.preloadCriticalContent();
  }

  /**
   * Get content by ID with caching and quality optimization
   */
  async getContent(contentId, options = {}) {
    const cacheKey = this.generateCacheKey(contentId, options);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cachedContent = this.cache.get(cacheKey);
      if (this.isCacheValid(cachedContent)) {
        console.log('Content served from cache:', contentId);
        return cachedContent.data;
      }
    }

    // Check offline storage
    if (!this.isOnline && this.offlineContent.has(contentId)) {
      console.log('Content served from offline storage:', contentId);
      return this.offlineContent.get(contentId);
    }

    try {
      // Fetch content from server
      const content = await this.fetchContent(contentId, options);
      
      // Cache the content
      this.cacheContent(cacheKey, content);
      
      return content;
    } catch (error) {
      console.error('Error fetching content:', error);
      
      // Try to serve stale cache as fallback
      if (this.cache.has(cacheKey)) {
        console.log('Serving stale content as fallback:', contentId);
        return this.cache.get(cacheKey).data;
      }
      
      throw error;
    }
  }

  /**
   * Fetch content from server with quality optimization
   */
  async fetchContent(contentId, options = {}) {
    const { type, quality, format } = this.optimizeContentOptions(options);
    
    const url = this.buildContentUrl(contentId, { type, quality, format });
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Accept': this.getAcceptHeader(type),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    
    // Handle different content types
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text/')) {
      return await response.text();
    } else {
      return await response.blob();
    }
  }

  /**
   * Optimize content options based on user settings and network conditions
   */
  optimizeContentOptions(options) {
    const networkSpeed = this.getNetworkSpeed();
    const deviceCapabilities = this.getDeviceCapabilities();
    
    let optimizedOptions = { ...options };
    
    // Optimize video quality based on network and device
    if (options.type === 'video') {
      if (networkSpeed === 'slow' || deviceCapabilities.storage === 'limited') {
        optimizedOptions.quality = '360p';
      } else if (networkSpeed === 'fast' && deviceCapabilities.display === 'high') {
        optimizedOptions.quality = '720p';
      } else {
        optimizedOptions.quality = '480p';
      }
    }
    
    // Optimize image sizes
    if (options.type === 'image') {
      if (deviceCapabilities.display === 'high') {
        optimizedOptions.size = 'large';
      } else if (networkSpeed === 'slow') {
        optimizedOptions.size = 'small';
      } else {
        optimizedOptions.size = 'medium';
      }
    }
    
    // Use WebP for images if supported
    if (options.type === 'image' && this.supportsWebP()) {
      optimizedOptions.format = 'webp';
    }
    
    return optimizedOptions;
  }

  /**
   * Build content URL with parameters
   */
  buildContentUrl(contentId, options) {
    const baseUrl = process.env.REACT_APP_CONTENT_API_URL || '/api/content';
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    return `${baseUrl}/${contentId}?${params.toString()}`;
  }

  /**
   * Cache content with metadata
   */
  cacheContent(cacheKey, content) {
    const cacheEntry = {
      data: content,
      timestamp: Date.now(),
      size: this.calculateContentSize(content),
      accessed: Date.now()
    };
    
    this.cache.set(cacheKey, cacheEntry);
    
    // Save to localStorage for persistence
    this.saveCacheToStorage();
    
    // Clean up if cache is too large
    if (this.getCacheSize() > CACHE_CONFIG.maxSize) {
      this.cleanupCache();
    }
  }

  /**
   * Check if cached content is still valid
   */
  isCacheValid(cacheEntry) {
    const age = Date.now() - cacheEntry.timestamp;
    return age < CACHE_CONFIG.maxAge;
  }

  /**
   * Generate cache key from content ID and options
   */
  generateCacheKey(contentId, options) {
    const optionsString = Object.entries(options)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `${contentId}_${optionsString}`;
  }

  /**
   * Cleanup old and least recently used cache entries
   */
  cleanupCache() {
    const now = Date.now();
    const entriesToRemove = [];
    
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_CONFIG.maxAge) {
        entriesToRemove.push(key);
      }
    }
    
    // Remove least recently used entries if cache is still too large
    if (this.getCacheSize() > CACHE_CONFIG.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.accessed - b.accessed);
      
      let currentSize = this.getCacheSize();
      for (const [key] of sortedEntries) {
        if (currentSize <= CACHE_CONFIG.maxSize * 0.8) break; // Clean to 80% of max
        
        const entry = this.cache.get(key);
        currentSize -= entry.size;
        entriesToRemove.push(key);
      }
    }
    
    // Remove entries
    entriesToRemove.forEach(key => this.cache.delete(key));
    
    // Update storage
    this.saveCacheToStorage();
    
    console.log(`Cache cleanup: removed ${entriesToRemove.length} entries`);
  }

  /**
   * Calculate cache size
   */
  getCacheSize() {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  /**
   * Calculate content size (approximate)
   */
  calculateContentSize(content) {
    if (typeof content === 'string') {
      return content.length * 2; // UTF-16 encoding
    } else if (content instanceof Blob) {
      return content.size;
    } else if (typeof content === 'object') {
      return JSON.stringify(content).length * 2;
    }
    return 0;
  }

  /**
   * Preload critical content
   */
  async preloadCriticalContent() {
    const criticalContent = [
      // Dashboard content
      'dashboard_overview',
      'user_progress_summary',
      
      // Navigation assets
      'navigation_icons',
      'logo_assets',
      
      // Common UI elements
      'loading_animations',
      'error_messages'
    ];
    
    for (const contentId of criticalContent) {
      try {
        await this.getContent(contentId, { priority: 'high' });
      } catch (error) {
        console.warn('Failed to preload critical content:', contentId, error);
      }
    }
  }

  /**
   * Download content for offline use
   */
  async downloadForOffline(contentId, options = {}) {
    try {
      const content = await this.getContent(contentId, options);
      
      // Store in offline storage
      this.offlineContent.set(contentId, content);
      this.saveOfflineContent();
      
      return true;
    } catch (error) {
      console.error('Failed to download content for offline:', error);
      return false;
    }
  }

  /**
   * Download chapter content for offline use
   */
  async downloadChapterForOffline(chapterId) {
    const chapter = await this.getChapterById(chapterId);
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const downloadPromises = [];
    
    // Download text content
    if (chapter.content) {
      downloadPromises.push(
        this.downloadForOffline(`chapter_${chapterId}_content`, { type: 'text' })
      );
    }
    
    // Download videos
    if (chapter.videos) {
      chapter.videos.forEach(videoId => {
        downloadPromises.push(
          this.downloadForOffline(videoId, { type: 'video', quality: this.qualitySettings.video })
        );
      });
    }
    
    // Download images
    if (chapter.images) {
      chapter.images.forEach(imageId => {
        downloadPromises.push(
          this.downloadForOffline(imageId, { type: 'image', size: 'medium' })
        );
      });
    }
    
    // Download quiz content
    if (chapter.quiz) {
      downloadPromises.push(
        this.downloadForOffline(`chapter_${chapterId}_quiz`, { type: 'text' })
      );
    }
    
    const results = await Promise.allSettled(downloadPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    return {
      total: downloadPromises.length,
      successful,
      failed: downloadPromises.length - successful
    };
  }

  /**
   * Get offline content availability
   */
  getOfflineAvailability() {
    const availability = {
      subjects: {},
      totalSize: 0,
      contentCount: 0
    };
    
    // Analyze offline content by subject
    for (const [contentId, content] of this.offlineContent.entries()) {
      const size = this.calculateContentSize(content);
      availability.totalSize += size;
      availability.contentCount++;
      
      // Parse subject from content ID (simplified)
      const match = contentId.match(/^(\w+)_/);
      if (match) {
        const subject = match[1];
        if (!availability.subjects[subject]) {
          availability.subjects[subject] = { count: 0, size: 0 };
        }
        availability.subjects[subject].count++;
        availability.subjects[subject].size += size;
      }
    }
    
    return availability;
  }

  /**
   * Clear offline content
   */
  clearOfflineContent(subjectId = null) {
    if (subjectId) {
      // Clear specific subject
      const keysToRemove = [];
      for (const contentId of this.offlineContent.keys()) {
        if (contentId.startsWith(`${subjectId}_`)) {
          keysToRemove.push(contentId);
        }
      }
      keysToRemove.forEach(key => this.offlineContent.delete(key));
    } else {
      // Clear all offline content
      this.offlineContent.clear();
    }
    
    this.saveOfflineContent();
  }

  /**
   * Get network speed estimation
   */
  getNetworkSpeed() {
    // Use Network Information API if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection.effectiveType) {
        switch (connection.effectiveType) {
          case 'slow-2g':
          case '2g':
            return 'slow';
          case '3g':
            return 'medium';
          case '4g':
            return 'fast';
          default:
            return 'medium';
        }
      }
    }
    
    // Fallback to medium speed
    return 'medium';
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities() {
    return {
      display: window.devicePixelRatio > 1 ? 'high' : 'standard',
      storage: navigator.storage && navigator.storage.estimate ? 'unlimited' : 'limited',
      memory: navigator.deviceMemory || 4 // GB
    };
  }

  /**
   * Check WebP support
   */
  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Get auth token
   */
  getAuthToken() {
    return localStorage.getItem('ekima_auth_token') || '';
  }

  /**
   * Get accept header for content type
   */
  getAcceptHeader(type) {
    switch (type) {
      case 'video':
        return 'video/mp4,video/webm';
      case 'image':
        return this.supportsWebP() ? 'image/webp,image/*' : 'image/*';
      case 'audio':
        return 'audio/mpeg,audio/ogg';
      case 'text':
        return 'text/html,text/plain,application/json';
      default:
        return '*/*';
    }
  }

  /**
   * Load quality settings from localStorage
   */
  loadQualitySettings() {
    try {
      const settings = localStorage.getItem('ekima_quality_settings');
      return settings ? JSON.parse(settings) : {
        video: 'auto',
        image: 'auto',
        audio: 'medium'
      };
    } catch (error) {
      console.error('Error loading quality settings:', error);
      return { video: 'auto', image: 'auto', audio: 'medium' };
    }
  }

  /**
   * Save quality settings
   */
  saveQualitySettings(settings) {
    this.qualitySettings = settings;
    localStorage.setItem('ekima_quality_settings', JSON.stringify(settings));
  }

  /**
   * Load cache from localStorage
   */
  loadCacheFromStorage() {
    try {
      const cacheData = localStorage.getItem(CACHE_CONFIG.storageKey);
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        this.cache = new Map(parsed);
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
      this.cache = new Map();
    }
  }

  /**
   * Save cache to localStorage
   */
  saveCacheToStorage() {
    try {
      const cacheArray = Array.from(this.cache.entries());
      localStorage.setItem(CACHE_CONFIG.storageKey, JSON.stringify(cacheArray));
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }

  /**
   * Load offline content from localStorage
   */
  loadOfflineContent() {
    try {
      const offlineData = localStorage.getItem(CACHE_CONFIG.offlineStorageKey);
      if (offlineData) {
        const parsed = JSON.parse(offlineData);
        return new Map(parsed);
      }
    } catch (error) {
      console.error('Error loading offline content:', error);
    }
    return new Map();
  }

  /**
   * Save offline content to localStorage
   */
  saveOfflineContent() {
    try {
      const offlineArray = Array.from(this.offlineContent.entries());
      localStorage.setItem(CACHE_CONFIG.offlineStorageKey, JSON.stringify(offlineArray));
    } catch (error) {
      console.error('Error saving offline content:', error);
    }
  }

  /**
   * Get chapter by ID from curriculum map
   */
  async getChapterById(chapterId) {
    try {
      // Adjust to your actual API method
      const res = await contentAPI.getChapter(chapterId);
      return res.data;
    } catch (err) {
      console.error('Error fetching chapter:', err);
      return null;
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.cache.clear();
    this.clearOfflineContent();
    localStorage.removeItem(CACHE_CONFIG.storageKey);
    localStorage.removeItem(CACHE_CONFIG.offlineStorageKey);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.getCacheSize(),
      cacheEntries: this.cache.size,
      offlineContentSize: Array.from(this.offlineContent.values())
        .reduce((total, content) => total + this.calculateContentSize(content), 0),
      offlineContentCount: this.offlineContent.size,
      networkStatus: this.isOnline ? 'online' : 'offline'
    };
  }
}

// Create singleton instance
const contentService = new ContentService();

// Export service and helper functions
export default contentService;

export const getContent = (contentId, options) => contentService.getContent(contentId, options);
export const downloadForOffline = (contentId, options) => contentService.downloadForOffline(contentId, options);
export const downloadChapterForOffline = (chapterId) => contentService.downloadChapterForOffline(chapterId);
export const getOfflineAvailability = () => contentService.getOfflineAvailability();
export const clearOfflineContent = (subjectId) => contentService.clearOfflineContent(subjectId);
export const getCacheStats = () => contentService.getCacheStats();
export const clearAllCaches = () => contentService.clearAllCaches();