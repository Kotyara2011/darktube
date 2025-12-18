'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VideoPlayerProps, VideoPlayerState } from '@/types';
import { VideoControls } from './VideoControls';
import { VideoProgressBar } from './VideoProgressBar';
import { VideoQualitySelector } from './VideoQualitySelector';
import { VideoSubtitles } from './VideoSubtitles';
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  autoplay = false,
  startTime = 0,
  quality = 'auto',
  onTimeUpdate,
  onEnded,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    quality: quality,
    subtitles: false,
    cinemaMode: false,
    isLoading: true
  });

  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [videoSources, setVideoSources] = useState<Record<string, string>>({});
  const [previewThumbnails, setPreviewThumbnails] = useState<string[]>([]);

  // Analytics hook
  const { trackView, trackProgress, trackInteraction } = useVideoAnalytics(videoId);

  // Load video sources and metadata
  useEffect(() => {
    const loadVideoData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Fetch video sources and metadata
        const response = await fetch(`/api/videos/${videoId}/sources`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to load video');
        }

        setVideoSources(data.sources);
        setPreviewThumbnails(data.thumbnails || []);
        
        // Set initial video source based on quality preference
        if (videoRef.current && data.sources[quality] || data.sources['720p'] || data.sources['360p']) {
          const sourceUrl = data.sources[quality] || data.sources['720p'] || data.sources['360p'];
          videoRef.current.src = sourceUrl;
        }

        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Error loading video:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to load video'
        }));
        onError?.(error instanceof Error ? error.message : 'Failed to load video');
      }
    };

    if (videoId) {
      loadVideoData();
    }
  }, [videoId, quality, onError]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setState(prev => ({ 
        ...prev, 
        duration: video.duration,
        isLoading: false 
      }));
      
      // Set start time if specified
      if (startTime > 0) {
        video.currentTime = startTime;
      }

      // Autoplay if enabled
      if (autoplay) {
        video.play().catch(console.error);
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      setState(prev => ({ ...prev, currentTime }));
      onTimeUpdate?.(currentTime);
      trackProgress(currentTime, video.duration);
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
      trackInteraction('play', { currentTime: video.currentTime });
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      trackInteraction('pause', { currentTime: video.currentTime });
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      trackInteraction('ended', { duration: video.duration });
      onEnded?.();
    };

    const handleVolumeChange = () => {
      setState(prev => ({ ...prev, volume: video.volume }));
    };

    const handleError = () => {
      const error = 'Video playback error';
      setState(prev => ({ ...prev, error, isLoading: false }));
      onError?.(error);
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
    };
  }, [autoplay, startTime, onTimeUpdate, onEnded, onError, trackProgress, trackInteraction]);

  // Track initial view
  useEffect(() => {
    if (videoId && !state.isLoading) {
      trackView();
    }
  }, [videoId, state.isLoading, trackView]);

  // Auto-hide controls
  useEffect(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    if (showControls && state.isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
    }

    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [showControls, state.isPlaying]);

  // Control handlers
  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  }, [state.isPlaying]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    trackInteraction('seek', { from: state.currentTime, to: time });
  }, [state.currentTime, trackInteraction]);

  const handleVolumeChange = useCallback((volume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = volume === 0;
  }, []);

  const handleQualityChange = useCallback((newQuality: string) => {
    const video = videoRef.current;
    if (!video || !videoSources[newQuality]) return;

    const currentTime = video.currentTime;
    const wasPlaying = state.isPlaying;

    video.src = videoSources[newQuality];
    video.currentTime = currentTime;

    if (wasPlaying) {
      video.play().catch(console.error);
    }

    setState(prev => ({ ...prev, quality: newQuality }));
    trackInteraction('quality_change', { quality: newQuality });
  }, [videoSources, state.isPlaying, trackInteraction]);

  const handleSubtitleToggle = useCallback(() => {
    setState(prev => ({ ...prev, subtitles: !prev.subtitles }));
    trackInteraction('subtitles_toggle', { enabled: !state.subtitles });
  }, [state.subtitles, trackInteraction]);

  const handleCinemaMode = useCallback(() => {
    setState(prev => ({ ...prev, cinemaMode: !prev.cinemaMode }));
    trackInteraction('cinema_mode', { enabled: !state.cinemaMode });
  }, [state.cinemaMode, trackInteraction]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const video = videoRef.current;
    if (!video) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        handlePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleSeek(Math.max(0, video.currentTime - 10));
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleSeek(Math.min(video.duration, video.currentTime + 10));
        break;
      case 'ArrowUp':
        e.preventDefault();
        handleVolumeChange(Math.min(1, video.volume + 0.1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleVolumeChange(Math.max(0, video.volume - 0.1));
        break;
      case 'KeyF':
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          containerRef.current?.requestFullscreen();
        }
        break;
      case 'KeyC':
        e.preventDefault();
        handleSubtitleToggle();
        break;
      case 'KeyT':
        e.preventDefault();
        handleCinemaMode();
        break;
    }
  }, [handlePlayPause, handleSeek, handleVolumeChange, handleSubtitleToggle, handleCinemaMode]);

  // Keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (state.error) {
    return (
      <div className="relative w-full aspect-video bg-dt-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-dt-red text-xl mb-2">⚠️</div>
          <div className="text-dt-white text-lg mb-2">Video Error</div>
          <div className="text-dt-light-gray">{state.error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-dt-black group ${
        state.cinemaMode ? 'fixed inset-0 z-50 aspect-auto' : ''
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Loading Spinner */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dt-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dt-orange"></div>
        </div>
      )}

      {/* Big Play Button */}
      {!state.isPlaying && !state.isLoading && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center group-hover:bg-black group-hover:bg-opacity-20 transition-colors"
        >
          <div className="w-20 h-20 bg-dt-orange bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all transform hover:scale-110">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </button>
      )}

      {/* Progress Bar */}
      <VideoProgressBar
        currentTime={state.currentTime}
        duration={state.duration}
        onSeek={handleSeek}
        previewThumbnails={previewThumbnails}
        className={`absolute bottom-16 left-0 right-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Controls */}
      <VideoControls
        isPlaying={state.isPlaying}
        volume={state.volume}
        quality={state.quality}
        subtitles={state.subtitles}
        cinemaMode={state.cinemaMode}
        currentTime={state.currentTime}
        duration={state.duration}
        onPlayPause={handlePlayPause}
        onVolumeChange={handleVolumeChange}
        onQualityChange={handleQualityChange}
        onSubtitleToggle={handleSubtitleToggle}
        onCinemaMode={handleCinemaMode}
        availableQualities={Object.keys(videoSources)}
        className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Subtitles */}
      {state.subtitles && (
        <VideoSubtitles
          videoId={videoId}
          currentTime={state.currentTime}
          language="en"
        />
      )}

      {/* Cinema Mode Overlay */}
      {state.cinemaMode && (
        <button
          onClick={handleCinemaMode}
          className="absolute top-4 right-4 text-white hover:text-dt-orange transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};