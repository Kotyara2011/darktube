'use client';

import React from 'react';
import { VideoCard } from './VideoCard';
import { Video } from '@/types';

interface VideoGridProps {
  videos: Video[];
  columns?: 'auto' | 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  showChannel?: boolean;
  showDuration?: boolean;
  showViews?: boolean;
  showDate?: boolean;
  className?: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  columns = 'auto',
  gap = 'md',
  showChannel = true,
  showDuration = true,
  showViews = true,
  showDate = true,
  className = ''
}) => {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-4xl">📹</div>
        <div className="text-dt-light-gray text-lg">No videos found</div>
      </div>
    );
  }

  const getGridClasses = () => {
    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6'
    };

    if (columns === 'auto') {
      return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${gapClasses[gap]}`;
    }

    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    };

    return `grid ${columnClasses[columns]} ${gapClasses[gap]}`;
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          showChannel={showChannel}
          showDuration={showDuration}
          showViews={showViews}
          showDate={showDate}
        />
      ))}
    </div>
  );
};