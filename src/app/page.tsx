'use client';

import React, { useEffect, useState } from 'react';
import { VideoGrid } from '@/components/Video/VideoGrid';
import { VideoCard } from '@/components/Video/VideoCard';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/app/providers';
import { usePageAnalytics } from '@/hooks/useVideoAnalytics';
import { Video } from '@/types';

interface ContentRow {
  id: string;
  title: string;
  videos: Video[];
  type: 'trending' | 'recommended' | 'subscriptions' | 'continue-watching';
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const { sessionId } = usePageAnalytics('homepage');
  const [contentRows, setContentRows] = useState<ContentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomepageContent();
  }, [isAuthenticated, user]);

  const loadHomepageContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = isAuthenticated 
        ? '/api/recommendations/homepage'
        : '/api/videos/trending';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (isAuthenticated) {
        const token = localStorage.getItem('darktube_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(endpoint, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load content');
      }

      if (isAuthenticated) {
        // Authenticated user gets personalized rows
        setContentRows(data.rows || []);
      } else {
        // Anonymous user gets trending content
        setContentRows([
          {
            id: 'trending',
            title: 'Trending',
            videos: data.videos || [],
            type: 'trending'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading homepage content:', error);
      setError(error instanceof Error ? error.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-dt-red text-xl">⚠️</div>
        <div className="text-dt-white text-lg">Something went wrong</div>
        <div className="text-dt-light-gray text-center max-w-md">{error}</div>
        <button
          onClick={loadHomepageContent}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dt-black">
      {/* Main Content */}
      <div className="pt-4 pb-8">
        {/* Welcome Message for New Users */}
        {!isAuthenticated && (
          <div className="mb-8 px-6">
            <div className="bg-gradient-to-r from-dt-orange to-dt-orange-muted rounded-lg p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">Welcome to DarkTube</h1>
              <p className="text-lg opacity-90 mb-4">
                Dive deeper into content that matters. Discover videos from creators who prioritize quality over clicks.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/auth/register" className="btn-secondary bg-white text-dt-orange hover:bg-gray-100">
                  Sign Up
                </a>
                <a href="/trending" className="btn-ghost border-white text-white hover:bg-white hover:text-dt-orange">
                  Explore Trending
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Content Rows */}
        <div className="space-y-8">
          {contentRows.map((row) => (
            <ContentRowComponent key={row.id} row={row} />
          ))}
        </div>

        {/* Empty State */}
        {contentRows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="text-6xl">📺</div>
            <div className="text-dt-white text-xl font-semibold">No content available</div>
            <div className="text-dt-light-gray text-center max-w-md">
              {isAuthenticated 
                ? "Subscribe to channels to see personalized recommendations here."
                : "Check back later for trending content."
              }
            </div>
            {isAuthenticated && (
              <a href="/trending" className="btn-primary">
                Explore Trending
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Content Row Component
interface ContentRowProps {
  row: ContentRow;
}

const ContentRowComponent: React.FC<ContentRowProps> = ({ row }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Show limited videos on mobile, more on desktop
  const visibleVideos = showAll ? row.videos : row.videos.slice(0, 6);

  if (row.videos.length === 0) {
    return null;
  }

  return (
    <section className="px-6">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-dt-white text-xl font-semibold">{row.title}</h2>
        {row.videos.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-dt-orange hover:text-dt-orange-muted text-sm font-medium transition-colors"
          >
            {showAll ? 'Show Less' : `Show All (${row.videos.length})`}
          </button>
        )}
      </div>

      {/* Video Grid */}
      <VideoGrid videos={visibleVideos} />
    </section>
  );
};