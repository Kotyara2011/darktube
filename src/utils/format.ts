/**
 * Utility functions for formatting data in DarkTube
 */

/**
 * Format duration in seconds to MM:SS or HH:MM:SS format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format view count with appropriate suffixes (K, M, B)
 */
export function formatViewCount(views: number): string {
  if (views < 1000) {
    return views.toString();
  } else if (views < 1000000) {
    return `${(views / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  } else if (views < 1000000000) {
    return `${(views / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  } else {
    return `${(views / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
  }
}

/**
 * Format subscriber count with appropriate suffixes
 */
export function formatSubscriberCount(subscribers: number): string {
  return formatViewCount(subscribers); // Same logic as view count
}

/**
 * Format time ago from a date
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2629746) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31556952) {
    const months = Math.floor(diffInSeconds / 2629746);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31556952);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format currency (for revenue display)
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with commas for thousands separator
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(targetDate);
}

/**
 * Format date and time to readable string
 */
export function formatDateTime(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(targetDate);
}

/**
 * Format video quality label
 */
export function formatQuality(quality: string): string {
  const qualityMap: Record<string, string> = {
    '144p': '144p',
    '240p': '240p',
    '360p': '360p',
    '480p': '480p',
    '720p': '720p HD',
    '1080p': '1080p HD',
    '1440p': '1440p QHD',
    '2160p': '4K UHD',
    '4K': '4K UHD',
    'auto': 'Auto'
  };

  return qualityMap[quality] || quality;
}

/**
 * Format bitrate for display
 */
export function formatBitrate(bitrate: number): string {
  if (bitrate < 1000) {
    return `${bitrate} kbps`;
  } else {
    return `${(bitrate / 1000).toFixed(1)} Mbps`;
  }
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format username with @ prefix
 */
export function formatUsername(username: string): string {
  return username.startsWith('@') ? username : `@${username}`;
}

/**
 * Format channel URL
 */
export function formatChannelUrl(channelId: string, customUrl?: string): string {
  if (customUrl) {
    return `/c/${customUrl}`;
  }
  return `/channel/${channelId}`;
}

/**
 * Format video URL with timestamp
 */
export function formatVideoUrl(videoId: string, timestamp?: number): string {
  const baseUrl = `/watch?v=${videoId}`;
  if (timestamp && timestamp > 0) {
    return `${baseUrl}&t=${Math.floor(timestamp)}s`;
  }
  return baseUrl;
}

/**
 * Format search query for URL
 */
export function formatSearchUrl(query: string, filters?: Record<string, string>): string {
  const params = new URLSearchParams();
  params.set('q', query);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
  }
  
  return `/search?${params.toString()}`;
}

/**
 * Format playlist URL
 */
export function formatPlaylistUrl(playlistId: string, videoId?: string): string {
  const baseUrl = `/playlist?list=${playlistId}`;
  if (videoId) {
    return `${baseUrl}&v=${videoId}`;
  }
  return baseUrl;
}

/**
 * Parse and format video description with clickable timestamps
 */
export function formatVideoDescription(description: string): string {
  // Convert timestamps (MM:SS or HH:MM:SS) to clickable links
  const timestampRegex = /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/g;
  
  return description.replace(timestampRegex, (match, hours, minutes, seconds) => {
    const totalSeconds = (hours ? parseInt(hours) * 3600 : 0) + 
                        parseInt(minutes) * 60 + 
                        parseInt(seconds);
    
    return `<button class="text-dt-orange hover:text-dt-orange-muted transition-colors" onclick="seekToTime(${totalSeconds})">${match}</button>`;
  });
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Format loading state text
 */
export function formatLoadingText(action: string): string {
  const actions: Record<string, string> = {
    'loading': 'Loading...',
    'uploading': 'Uploading...',
    'processing': 'Processing...',
    'saving': 'Saving...',
    'deleting': 'Deleting...',
    'publishing': 'Publishing...',
  };
  
  return actions[action] || `${action}...`;
}