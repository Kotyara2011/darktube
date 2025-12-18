'use client';

import React, { useRef, useState, useCallback } from 'react';

interface VideoProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  previewThumbnails?: string[];
  className?: string;
}

export const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  previewThumbnails = [],
  className = ''
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getTimeFromPosition = useCallback((clientX: number): number => {
    if (!progressRef.current) return 0;
    
    const rect = progressRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return position * duration;
  }, [duration]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = position * duration;
    
    setHoverTime(time);
    setHoverPosition(e.clientX - rect.left);

    if (isDragging) {
      onSeek(time);
    }
  }, [duration, isDragging, onSeek]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const time = getTimeFromPosition(e.clientX);
    onSeek(time);
  }, [getTimeFromPosition, onSeek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
    setIsDragging(false);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getPreviewThumbnail = (time: number): string | null => {
    if (previewThumbnails.length === 0 || duration === 0) return null;
    
    const index = Math.floor((time / duration) * previewThumbnails.length);
    return previewThumbnails[Math.min(index, previewThumbnails.length - 1)];
  };

  return (
    <div className={`px-4 ${className}`}>
      <div
        ref={progressRef}
        className="relative h-2 bg-white bg-opacity-30 rounded-full cursor-pointer group"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Progress Track */}
        <div className="absolute inset-0 bg-white bg-opacity-30 rounded-full" />
        
        {/* Progress Fill */}
        <div
          className="absolute left-0 top-0 h-full bg-dt-orange rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />

        {/* Hover Preview */}
        {hoverTime !== null && (
          <>
            {/* Preview Thumbnail */}
            {getPreviewThumbnail(hoverTime) && (
              <div
                className="absolute bottom-4 transform -translate-x-1/2 pointer-events-none"
                style={{ left: `${hoverPosition}px` }}
              >
                <div className="bg-dt-black rounded-lg p-2 shadow-lg">
                  <img
                    src={getPreviewThumbnail(hoverTime)!}
                    alt="Preview"
                    className="w-32 h-18 object-cover rounded"
                  />
                  <div className="text-white text-xs text-center mt-1">
                    {formatTime(hoverTime)}
                  </div>
                </div>
              </div>
            )}

            {/* Hover Indicator */}
            <div
              className="absolute top-0 w-1 h-full bg-dt-orange opacity-75"
              style={{ left: `${(hoverTime / duration) * 100}%` }}
            />
          </>
        )}

        {/* Progress Handle */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-dt-orange rounded-full transition-all duration-150 ${
            isDragging || hoverTime !== null ? 'scale-125 opacity-100' : 'scale-0 opacity-0'
          } group-hover:scale-125 group-hover:opacity-100`}
          style={{ left: `calc(${progress}% - 8px)` }}
        />

        {/* Buffer Indicators (if available) */}
        {/* This would show buffered ranges */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Buffered segments would be rendered here */}
        </div>

        {/* Chapter Markers (if available) */}
        {/* This would show chapter divisions */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Chapter markers would be rendered here */}
        </div>
      </div>

      {/* Time Tooltip */}
      {hoverTime !== null && !getPreviewThumbnail(hoverTime) && (
        <div
          className="absolute bottom-4 transform -translate-x-1/2 pointer-events-none"
          style={{ left: `${hoverPosition}px` }}
        >
          <div className="bg-dt-black bg-opacity-90 text-white text-xs px-2 py-1 rounded">
            {formatTime(hoverTime)}
          </div>
        </div>
      )}
    </div>
  );
};