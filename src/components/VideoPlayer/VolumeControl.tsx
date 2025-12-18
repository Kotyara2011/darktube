'use client';

import React, { useState, useRef, useCallback } from 'react';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange
}) => {
  const [showSlider, setShowSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isMuted = volume === 0;

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowSlider(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      timeoutRef.current = setTimeout(() => {
        setShowSlider(false);
      }, 300);
    }
  }, [isDragging]);

  const handleVolumeClick = useCallback(() => {
    // Toggle mute/unmute
    onVolumeChange(isMuted ? 0.5 : 0);
  }, [isMuted, onVolumeChange]);

  const getVolumeFromPosition = useCallback((clientY: number): number => {
    if (!sliderRef.current) return volume;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height));
    return position;
  }, [volume]);

  const handleSliderMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const newVolume = getVolumeFromPosition(e.clientY);
    onVolumeChange(newVolume);
  }, [getVolumeFromPosition, onVolumeChange]);

  const handleSliderMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newVolume = getVolumeFromPosition(e.clientY);
      onVolumeChange(newVolume);
    }
  }, [isDragging, getVolumeFromPosition, onVolumeChange]);

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      );
    } else if (volume < 0.3) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
        </svg>
      );
    } else if (volume < 0.7) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      );
    }
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Volume Icon Button */}
      <button
        onClick={handleVolumeClick}
        className="text-white hover:text-dt-orange transition-colors p-1"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </button>

      {/* Volume Slider */}
      {showSlider && (
        <div className="absolute left-8 bottom-0 mb-2">
          <div className="bg-dt-dark-gray bg-opacity-90 rounded-lg p-2 shadow-lg">
            <div
              ref={sliderRef}
              className="relative w-6 h-24 bg-white bg-opacity-30 rounded-full cursor-pointer"
              onMouseDown={handleSliderMouseDown}
              onMouseMove={handleSliderMouseMove}
              onMouseUp={handleSliderMouseUp}
            >
              {/* Volume Track */}
              <div className="absolute inset-x-0 bottom-0 bg-dt-orange rounded-full transition-all duration-150"
                   style={{ height: `${volume * 100}%` }} />
              
              {/* Volume Handle */}
              <div
                className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-dt-orange rounded-full transition-all duration-150"
                style={{ bottom: `calc(${volume * 100}% - 6px)` }}
              />
            </div>
            
            {/* Volume Percentage */}
            <div className="text-white text-xs text-center mt-2">
              {Math.round(volume * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};