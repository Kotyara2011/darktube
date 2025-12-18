'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Video, Channel } from '@/types';
import { formatDuration, formatViewCount, formatTimeAgo } from '@/utils/format';

interface VideoCardProps {
  video: Video;
  channel?: Channel;
  showChannel?: boolean;
  showDuration?: boolean;
  showViews?: boolean;
  showDate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  channel,
  showChannel = true,
  showDuration = true,
  showViews = true,
  showDate = true,
  size = 'md',
  layout = 'vertical',
  className = ''
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    
    // Start preview after 1 second of hovering
    previewTimeoutRef.current = setTimeout(() => {
      setPreviewPlaying(true);
    }, 1000);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setPreviewPlaying(false);
    
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'max-w-xs',
          thumbnail: 'h-32',
          title: 'text-sm',
          meta: 'text-xs'
        };
      case 'lg':
        return {
          container: 'max-w-md',
          thumbnail: 'h-48',
          title: 'text-lg',
          meta: 'text-sm'
        };
      default:
        return {
          container: 'max-w-sm',
          thumbnail: 'h-40',
          title: 'text-base',
          meta: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const thumbnailUrl = video.thumbnailUrl || '/default-thumbnail.jpg';
  const videoUrl = `/watch?v=${video.id}`;
  const channelUrl = channel ? `/channel/${channel.id}` : '#';

  if (layout === 'horizontal') {
    return (
      <div 
        className={`video-card flex space-x-3 ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Thumbnail */}
        <Link href={videoUrl} className="flex-shrink-0">
          <div className="relative w-40 h-24 video-thumbnail">
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover rounded-lg"
            />
            
            {/* Duration Badge */}
            {showDuration && video.durationSeconds && (
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                {formatDuration(video.durationSeconds)}
              </div>
            )}

            {/* Preview Progress Bar */}
            {previewPlaying && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-dt-orange bg-opacity-80 rounded-b-lg">
                <div className="h-full bg-dt-orange rounded-b-lg animate-pulse"></div>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={videoUrl}>
            <h3 className="video-title text-sm line-clamp-2 mb-1">
              {video.title}
            </h3>
          </Link>

          {/* Channel Info */}
          {showChannel && channel && (
            <Link href={channelUrl} className="block mb-1">
              <div className="text-dt-light-gray text-xs hover:text-dt-orange transition-colors">
                {channel.channelName}
              </div>
            </Link>
          )}

          {/* Video Meta */}
          <div className="video-meta text-xs">
            {showViews && (
              <span>{formatViewCount(Number(video.viewCount))} views</span>
            )}
            {showViews && showDate && <span> • </span>}
            {showDate && (
              <span>{formatTimeAgo(video.publishTimestamp || video.uploadTimestamp)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`video-card ${sizeClasses.container} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail */}
      <Link href={videoUrl}>
        <div className={`video-thumbnail ${sizeClasses.thumbnail} relative`}>
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          
          {/* Duration Badge */}
          {showDuration && video.durationSeconds && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.durationSeconds)}
            </div>
          )}

          {/* Preview Progress Bar */}
          {previewPlaying && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-dt-orange bg-opacity-80">
              <div className="h-full bg-dt-orange animate-pulse"></div>
            </div>
          )}

          {/* Hover Overlay */}
          {isHovering && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="w-12 h-12 bg-dt-orange bg-opacity-90 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Video Info */}
      <div className="video-info">
        {/* Channel Avatar & Title */}
        <div className="flex space-x-3">
          {showChannel && channel && (
            <Link href={channelUrl} className="flex-shrink-0">
              <img
                src={channel.branding?.logo || '/default-avatar.png'}
                alt={channel.channelName}
                className="channel-avatar"
              />
            </Link>
          )}

          <div className="flex-1 min-w-0">
            {/* Title */}
            <Link href={videoUrl}>
              <h3 className={`video-title ${sizeClasses.title} mb-1`}>
                {video.title}
              </h3>
            </Link>

            {/* Channel Name */}
            {showChannel && channel && (
              <Link href={channelUrl} className="block mb-1">
                <div className={`text-dt-light-gray ${sizeClasses.meta} hover:text-dt-orange transition-colors`}>
                  {channel.channelName}
                </div>
              </Link>
            )}

            {/* Video Meta */}
            <div className={`video-meta ${sizeClasses.meta}`}>
              {showViews && (
                <span>{formatViewCount(Number(video.viewCount))} views</span>
              )}
              {showViews && showDate && <span> • </span>}
              {showDate && (
                <span>{formatTimeAgo(video.publishTimestamp || video.uploadTimestamp)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};