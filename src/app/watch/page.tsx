'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VideoPlayer } from '@/components/VideoPlayer/VideoPlayer';
import { VideoInfo } from '@/components/Video/VideoInfo';
import { CommentSection } from '@/components/Video/CommentSection';
import { VideoGrid } from '@/components/Video/VideoGrid';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/app/providers';
import { Video, Channel, Comment } from '@/types';

function WatchPageContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoId = searchParams.get('v');
  const startTime = searchParams.get('t');

  useEffect(() => {
    if (videoId) {
      loadVideoData(videoId);
    }
  }, [videoId]);

  const loadVideoData = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load video data
      const videoResponse = await fetch(`/api/videos/${id}`);
      const videoData = await videoResponse.json();

      if (!videoResponse.ok) {
        throw new Error(videoData.error?.message || 'Video not found');
      }

      setVideo(videoData.video);
      setChannel(videoData.channel);

      // Load comments
      const commentsResponse = await fetch(`/api/videos/${id}/comments`);
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }

      // Load related videos
      const relatedResponse = await fetch(`/api/videos/${id}/related`);
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        setRelatedVideos(relatedData.videos || []);
      }

    } catch (error) {
      console.error('Error loading video:', error);
      setError(error instanceof Error ? error.message : 'Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoEnd = () => {
    // Auto-play next video if available
    if (relatedVideos.length > 0) {
      const nextVideo = relatedVideos[0];
      window.location.href = `/watch?v=${nextVideo.id}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dt-black">
        <LoadingSpinner size="lg" text="Loading video..." />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dt-black space-y-4">
        <div className="text-dt-red text-6xl">⚠️</div>
        <div className="text-dt-white text-2xl font-semibold">Video Not Found</div>
        <div className="text-dt-light-gray text-center max-w-md">
          {error || 'The video you are looking for does not exist or has been removed.'}
        </div>
        <a href="/" className="btn-primary">
          Go Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dt-black">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="w-full">
              <VideoPlayer
                videoId={video.id}
                startTime={startTime ? parseInt(startTime) : 0}
                onEnded={handleVideoEnd}
              />
            </div>

            {/* Video Info */}
            <VideoInfo
              video={video}
              channel={channel}
              onVideoUpdate={setVideo}
            />

            {/* Comments Section */}
            <CommentSection
              videoId={video.id}
              comments={comments}
              onCommentsUpdate={setComments}
            />
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h3 className="text-dt-white text-lg font-semibold mb-4">
                Up Next
              </h3>
              
              {relatedVideos.length > 0 ? (
                <div className="space-y-3">
                  {relatedVideos.map((relatedVideo) => (
                    <div key={relatedVideo.id} className="group">
                      <a
                        href={`/watch?v=${relatedVideo.id}`}
                        className="block hover:bg-dt-dark-gray rounded-lg p-2 transition-colors"
                      >
                        <div className="flex space-x-3">
                          {/* Thumbnail */}
                          <div className="relative w-40 h-24 flex-shrink-0">
                            <img
                              src={relatedVideo.thumbnailUrl || '/default-thumbnail.jpg'}
                              alt={relatedVideo.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            {relatedVideo.durationSeconds && (
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                                {Math.floor(relatedVideo.durationSeconds / 60)}:{(relatedVideo.durationSeconds % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-dt-white text-sm font-medium line-clamp-2 group-hover:text-dt-orange transition-colors">
                              {relatedVideo.title}
                            </h4>
                            <div className="text-dt-light-gray text-xs mt-1">
                              {channel?.channelName}
                            </div>
                            <div className="text-dt-light-gray text-xs mt-1">
                              {Number(relatedVideo.viewCount).toLocaleString()} views
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-dt-light-gray text-center py-8">
                  No related videos found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-dt-black">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    }>
      <WatchPageContent />
    </Suspense>
  );
}