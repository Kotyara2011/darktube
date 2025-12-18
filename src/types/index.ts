// Core Types for DarkTube Platform

export interface User {
  id: string;
  username: string;
  email: string;
  profileAvatar?: string;
  bannerImage?: string;
  biography?: string;
  countryRegion?: string;
  joinedTimestamp: Date;
  isVerifiedCreator: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  autoplay: boolean;
  language: string;
  playback_speed: number;
  subtitle_preferences: 'auto' | 'on' | 'off';
  privacy_settings?: {
    show_watch_history: boolean;
    show_subscriptions: boolean;
    allow_comments: boolean;
  };
}

export interface Channel {
  id: string;
  ownerUserId: string;
  channelName: string;
  customUrl?: string;
  description?: string;
  branding: ChannelBranding;
  subscriptionCount: number;
  createdTimestamp: Date;
}

export interface ChannelBranding {
  primary_color: string;
  logo?: string;
  banner?: string;
  featured_trailer?: string;
}

export interface Video {
  id: string;
  uploaderChannelId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  language: string;
  categoryTags: string[];
  primaryCategory?: string;
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'SCHEDULED';
  uploadTimestamp: Date;
  publishTimestamp?: Date;
  status: 'PROCESSING' | 'PROCESSING_FAILED' | 'LIVE' | 'PUBLISHED';
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
}

export interface VideoPlayerProps {
  videoId: string;
  autoplay?: boolean;
  startTime?: number;
  quality?: 'auto' | '144p' | '360p' | '720p' | '1080p' | '4K';
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  quality: string;
  subtitles: boolean;
  cinemaMode: boolean;
  isLoading: boolean;
  error?: string;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  parentCommentId?: string;
  content: string;
  timestamp: Date;
  upvoteCount: number;
  downvoteCount: number;
  isPinned: boolean;
  isHearted: boolean;
  user?: User;
  replies?: Comment[];
}

export interface Subscription {
  id: string;
  subscriberUserId: string;
  channelId: string;
  subscribedTimestamp: Date;
  notificationLevel: 'ALL' | 'PERSONALIZED' | 'NONE';
}

export interface Like {
  id: string;
  userId: string;
  videoId: string;
  isLike: boolean; // true for like, false for dislike
  timestamp: Date;
}

export interface WatchHistory {
  id: string;
  userId: string;
  videoId: string;
  watchedAt: Date;
  watchDuration: number;
  completed: boolean;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  videos?: PlaylistVideo[];
}

export interface PlaylistVideo {
  id: string;
  playlistId: string;
  videoId: string;
  position: number;
  addedAt: Date;
  video?: Video;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'NEW_VIDEO'
  | 'COMMENT_REPLY'
  | 'COMMENT_HEART'
  | 'NEW_SUBSCRIBER'
  | 'VIDEO_LIKED'
  | 'SYSTEM_ANNOUNCEMENT';

// Analytics Types
export interface AnalyticsData {
  viewCount: number;
  subscriberCount: number;
  revenueEstimate: number;
  topVideos: VideoMetrics[];
  audienceRetention: RetentionData[];
  trafficSources: TrafficSource[];
  demographics: DemographicData;
}

export interface VideoMetrics {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  averageViewDuration: number;
  clickThroughRate: number;
  revenue: number;
}

export interface RetentionData {
  timestamp: number; // seconds into video
  retentionRate: number; // percentage of viewers still watching
}

export interface TrafficSource {
  source: string;
  percentage: number;
  views: number;
}

export interface DemographicData {
  ageGroups: Record<string, number>;
  genders: Record<string, number>;
  countries: Record<string, number>;
  devices: Record<string, number>;
}

// Search Types
export interface SearchFilters {
  uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year';
  duration?: 'short' | 'medium' | 'long'; // <4m, 4-20m, >20m
  sortBy?: 'relevance' | 'upload_date' | 'view_count' | 'rating';
  category?: string;
}

export interface SearchResult {
  videos: Video[];
  channels: Channel[];
  totalResults: number;
  hasMore: boolean;
  nextCursor?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Upload Types
export interface VideoUploadData {
  title: string;
  description?: string;
  categoryTags: string[];
  primaryCategory: string;
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'SCHEDULED';
  publishTimestamp?: Date;
  thumbnailFile?: File;
  language: string;
}

export interface UploadProgress {
  percentage: number;
  stage: 'uploading' | 'processing' | 'complete' | 'error';
  message: string;
  estimatedTimeRemaining?: number;
}

// Recommendation Types
export interface RecommendationRequest {
  userId?: string;
  videoId?: string;
  limit?: number;
  excludeWatched?: boolean;
}

export interface RecommendationResponse {
  videos: Video[];
  algorithm: 'collaborative' | 'content-based' | 'trending' | 'mixed';
  confidence: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

export interface NotificationMessage extends WebSocketMessage {
  type: 'notification';
  payload: Notification;
}

export interface ViewCountUpdate extends WebSocketMessage {
  type: 'view_count_update';
  payload: {
    videoId: string;
    viewCount: number;
  };
}

// Error Types
export interface DarkTubeError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

// Configuration Types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  upload: {
    maxFileSize: number;
    allowedFormats: string[];
    chunkSize: number;
  };
  player: {
    defaultQuality: string;
    autoplay: boolean;
    previewDuration: number;
  };
  analytics: {
    batchSize: number;
    flushInterval: number;
  };
}