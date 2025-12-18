'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, useNotifications } from '@/app/providers';
import { Video, Channel } from '@/types';
import { formatViewCount, formatTimeAgo } from '@/utils/format';

interface VideoInfoProps {
  video: Video;
  channel: Channel | null;
  onVideoUpdate?: (video: Video) => void;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({
  video,
  channel,
  onVideoUpdate
}) => {
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const likeRatio = video.likeCount + video.dislikeCount > 0
    ? (video.likeCount / (video.likeCount + video.dislikeCount)) * 100
    : 0;

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in to subscribe to channels',
      });
      return;
    }

    if (!channel) return;

    setIsLoading(true);
    try {
      const endpoint = isSubscribed
        ? `/api/channels/${channel.id}/unsubscribe`
        : `/api/channels/${channel.id}/subscribe`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('darktube_token')}`,
        },
      });

      if (response.ok) {
        setIsSubscribed(!isSubscribed);
        addNotification({
          type: 'success',
          title: isSubscribed ? 'Unsubscribed' : 'Subscribed',
          message: isSubscribed
            ? `Unsubscribed from ${channel.channelName}`
            : `Subscribed to ${channel.channelName}`,
        });
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update subscription',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in to like videos',
      });
      return;
    }

    try {
      const response = await fetch(`/api/videos/${video.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('darktube_token')}`,
        },
        body: JSON.stringify({ isLike: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(true);
        if (onVideoUpdate) {
          onVideoUpdate({ ...video, likeCount: data.likeCount, dislikeCount: data.dislikeCount });
        }
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in to dislike videos',
      });
      return;
    }

    try {
      const response = await fetch(`/api/videos/${video.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('darktube_token')}`,
        },
        body: JSON.stringify({ isLike: false }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(false);
        if (onVideoUpdate) {
          onVideoUpdate({ ...video, likeCount: data.likeCount, dislikeCount: data.dislikeCount });
        }
      }
    } catch (error) {
      console.error('Error disliking video:', error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/watch?v=${video.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description || '',
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      addNotification({
        type: 'success',
        title: 'Link Copied',
        message: 'Video link copied to clipboard',
        duration: 2000,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Title and Stats */}
      <div>
        <h1 className="text-dt-white text-2xl font-bold mb-2">
          {video.title}
        </h1>
        <div className="flex items-center text-dt-light-gray text-sm space-x-2">
          <span>{formatViewCount(Number(video.viewCount))} views</span>
          <span>•</span>
          <span>{formatTimeAgo(video.publishTimestamp || video.uploadTimestamp)}</span>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between border-t border-b border-dt-charcoal py-3">
        {/* Like/Dislike */}
        <div className="flex items-center space-x-2">
          {/* Like Ratio Bar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked === true
                  ? 'bg-dt-orange text-white'
                  : 'bg-dt-dark-gray text-dt-light-gray hover:text-dt-orange hover:bg-dt-charcoal'
              }`}
            >
              <svg className="w-5 h-5" fill={isLiked === true ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="font-medium">Like</span>
            </button>

            <button
              onClick={handleDislike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked === false
                  ? 'bg-dt-orange text-white'
                  : 'bg-dt-dark-gray text-dt-light-gray hover:text-dt-orange hover:bg-dt-charcoal'
              }`}
            >
              <svg className="w-5 h-5" fill={isLiked === false ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
              <span className="font-medium">Dislike</span>
            </button>

            {/* Like Ratio Bar */}
            <div className="w-32 h-1 bg-dt-charcoal rounded-full overflow-hidden">
              <div
                className="h-full bg-dt-orange transition-all duration-300"
                style={{ width: `${likeRatio}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center space-x-2 px-4 py-2 bg-dt-dark-gray text-dt-light-gray hover:text-dt-orange hover:bg-dt-charcoal rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="font-medium">Share</span>
        </button>
      </div>

      {/* Channel Info */}
      {channel && (
        <div className="flex items-center justify-between bg-dt-dark-gray rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <Link href={`/channel/${channel.id}`}>
              <img
                src={channel.branding?.logo || '/default-avatar.png'}
                alt={channel.channelName}
                className="w-12 h-12 rounded-full border-2 border-dt-orange object-cover"
              />
            </Link>
            <div>
              <Link href={`/channel/${channel.id}`}>
                <h3 className="text-dt-white font-semibold hover:text-dt-orange transition-colors">
                  {channel.channelName}
                </h3>
              </Link>
              <div className="text-dt-light-gray text-sm">
                {formatViewCount(channel.subscriptionCount)} subscribers
              </div>
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isSubscribed
                ? 'bg-dt-charcoal text-dt-white hover:bg-dt-dark-gray'
                : 'bg-dt-orange text-white hover:bg-dt-orange-muted animate-pulse-orange'
            }`}
          >
            {isLoading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>
      )}

      {/* Description */}
      {video.description && (
        <div className="bg-dt-dark-gray rounded-lg p-4">
          <div className={`text-dt-white whitespace-pre-wrap ${
            showFullDescription ? '' : 'line-clamp-3'
          }`}>
            {video.description}
          </div>
          {video.description.length > 200 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-dt-orange hover:text-dt-orange-muted font-medium mt-2 transition-colors"
            >
              {showFullDescription ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};