'use client';

import { useCallback, useRef, useEffect } from 'react';

interface AnalyticsEvent {
  type: string;
  videoId: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  data: Record<string, any>;
}

export const useVideoAnalytics = (videoId: string) => {
  const sessionId = useRef<string>(generateSessionId());
  const viewTracked = useRef<boolean>(false);
  const progressEvents = useRef<Set<number>>(new Set());
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimeout = useRef<NodeJS.Timeout | null>(null);

  // Flush events to server
  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    const events = [...eventQueue.current];
    eventQueue.current = [];

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events on failure
      eventQueue.current.unshift(...events);
    }
  }, []);

  // Queue an analytics event
  const queueEvent = useCallback((type: string, data: Record<string, any> = {}) => {
    const event: AnalyticsEvent = {
      type,
      videoId,
      sessionId: sessionId.current,
      timestamp: new Date(),
      data: {
        ...data,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer,
        page_url: window.location.href,
      }
    };

    eventQueue.current.push(event);

    // Schedule flush
    if (flushTimeout.current) {
      clearTimeout(flushTimeout.current);
    }
    
    flushTimeout.current = setTimeout(flushEvents, 5000); // Flush every 5 seconds
  }, [videoId, flushEvents]);

  // Track video view (once per session)
  const trackView = useCallback(() => {
    if (viewTracked.current) return;
    
    viewTracked.current = true;
    queueEvent('video_view', {
      video_id: videoId,
      view_start_time: Date.now(),
    });
  }, [videoId, queueEvent]);

  // Track video progress
  const trackProgress = useCallback((currentTime: number, duration: number) => {
    if (duration === 0) return;

    const progressPercent = Math.floor((currentTime / duration) * 100);
    
    // Track progress milestones (25%, 50%, 75%, 95%)
    const milestones = [25, 50, 75, 95];
    for (const milestone of milestones) {
      if (progressPercent >= milestone && !progressEvents.current.has(milestone)) {
        progressEvents.current.add(milestone);
        queueEvent('video_progress', {
          video_id: videoId,
          progress_percent: milestone,
          current_time: currentTime,
          duration: duration,
        });
      }
    }

    // Track detailed progress every 30 seconds for retention analysis
    const thirtySecondMark = Math.floor(currentTime / 30) * 30;
    const retentionKey = `retention_${thirtySecondMark}`;
    
    if (!progressEvents.current.has(retentionKey)) {
      progressEvents.current.add(retentionKey);
      queueEvent('video_retention', {
        video_id: videoId,
        time_marker: thirtySecondMark,
        current_time: currentTime,
        duration: duration,
        retention_rate: currentTime / duration,
      });
    }
  }, [videoId, queueEvent]);

  // Track user interactions
  const trackInteraction = useCallback((interaction: string, data: Record<string, any> = {}) => {
    queueEvent('video_interaction', {
      video_id: videoId,
      interaction_type: interaction,
      ...data,
    });
  }, [videoId, queueEvent]);

  // Track engagement events
  const trackEngagement = useCallback((engagement: string, data: Record<string, any> = {}) => {
    queueEvent('video_engagement', {
      video_id: videoId,
      engagement_type: engagement,
      ...data,
    });
  }, [videoId, queueEvent]);

  // Track errors
  const trackError = useCallback((error: string, data: Record<string, any> = {}) => {
    queueEvent('video_error', {
      video_id: videoId,
      error_type: error,
      ...data,
    });
  }, [videoId, queueEvent]);

  // Flush events on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (eventQueue.current.length > 0) {
        // Use sendBeacon for reliable delivery on page unload
        const events = [...eventQueue.current];
        navigator.sendBeacon(
          '/api/analytics/events',
          JSON.stringify({ events })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (flushTimeout.current) {
        clearTimeout(flushTimeout.current);
      }
    };
  }, []);

  // Periodic flush
  useEffect(() => {
    const interval = setInterval(flushEvents, 30000); // Flush every 30 seconds
    return () => clearInterval(interval);
  }, [flushEvents]);

  return {
    trackView,
    trackProgress,
    trackInteraction,
    trackEngagement,
    trackError,
    flushEvents,
  };
};

// Generate unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Hook for tracking page views
export const usePageAnalytics = (pageName: string) => {
  const sessionId = useRef<string>(generateSessionId());

  useEffect(() => {
    // Track page view
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{
          type: 'page_view',
          sessionId: sessionId.current,
          timestamp: new Date(),
          data: {
            page_name: pageName,
            page_url: window.location.href,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
          }
        }]
      }),
    }).catch(console.error);
  }, [pageName]);

  return { sessionId: sessionId.current };
};

// Hook for tracking search analytics
export const useSearchAnalytics = () => {
  const trackSearch = useCallback((query: string, results: number, filters?: Record<string, any>) => {
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{
          type: 'search',
          sessionId: generateSessionId(),
          timestamp: new Date(),
          data: {
            search_query: query,
            results_count: results,
            filters: filters || {},
            page_url: window.location.href,
          }
        }]
      }),
    }).catch(console.error);
  }, []);

  const trackSearchClick = useCallback((query: string, videoId: string, position: number) => {
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{
          type: 'search_click',
          sessionId: generateSessionId(),
          timestamp: new Date(),
          data: {
            search_query: query,
            video_id: videoId,
            click_position: position,
            page_url: window.location.href,
          }
        }]
      }),
    }).catch(console.error);
  }, []);

  return {
    trackSearch,
    trackSearchClick,
  };
};