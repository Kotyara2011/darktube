'use client';

import React, { useState } from 'react';
import { VideoQualitySelector } from './VideoQualitySelector';
import { VolumeControl } from './VolumeControl';

interface VideoControlsProps {
  isPlaying: boolean;
  volume: number;
  quality: string;
  subtitles: boolean;
  cinemaMode: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onQualityChange: (quality: string) => void;
  onSubtitleToggle: () => void;
  onCinemaMode: () => void;
  availableQualities: string[];
  className?: string;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  volume,
  quality,
  subtitles,
  cinemaMode,
  currentTime,
  duration,
  onPlayPause,
  onVolumeChange,
  onQualityChange,
  onSubtitleToggle,
  onCinemaMode,
  availableQualities,
  className = ''
}) => {
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    // This would be handled by the parent component
    // onSpeedChange?.(speed);
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className={`bg-gradient-to-t from-black via-black/80 to-transparent p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center space-x-4">
          {/* Play/Pause Button */}
          <button
            onClick={onPlayPause}
            className="text-white hover:text-dt-orange transition-colors p-1"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Volume Control */}
          <VolumeControl
            volume={volume}
            onVolumeChange={onVolumeChange}
          />

          {/* Time Display */}
          <div className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Playback Speed */}
          <div className="relative">
            <button
              className="text-white hover:text-dt-orange transition-colors px-2 py-1 text-sm"
              onClick={() => {
                const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
                const currentIndex = speeds.indexOf(playbackSpeed);
                const nextIndex = (currentIndex + 1) % speeds.length;
                handleSpeedChange(speeds[nextIndex]);
              }}
            >
              {playbackSpeed}x
            </button>
          </div>

          {/* Subtitles Toggle */}
          <button
            onClick={onSubtitleToggle}
            className={`p-2 rounded transition-colors ${
              subtitles 
                ? 'text-dt-orange bg-dt-orange bg-opacity-20' 
                : 'text-white hover:text-dt-orange'
            }`}
            aria-label="Toggle subtitles"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3zM9 12h6M9 16h6"/>
            </svg>
          </button>

          {/* Quality Selector */}
          <VideoQualitySelector
            currentQuality={quality}
            availableQualities={availableQualities}
            onQualityChange={onQualityChange}
          />

          {/* Cinema Mode Toggle */}
          <button
            onClick={onCinemaMode}
            className={`p-2 rounded transition-colors ${
              cinemaMode 
                ? 'text-dt-orange bg-dt-orange bg-opacity-20' 
                : 'text-white hover:text-dt-orange'
            }`}
            aria-label="Toggle cinema mode"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3z"/>
            </svg>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleFullscreen}
            className="text-white hover:text-dt-orange transition-colors p-2"
            aria-label="Toggle fullscreen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};