import { PrismaClient } from '@prisma/client';
import { MongoClient, Db } from 'mongodb';
import Redis from 'redis';

// Prisma Client (PostgreSQL)
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// MongoDB Client
let mongoClient: MongoClient;
let mongoDb: Db;

export async function connectMongoDB(): Promise<Db> {
  if (mongoDb) {
    return mongoDb;
  }

  try {
    mongoClient = new MongoClient(process.env.MONGODB_URL!);
    await mongoClient.connect();
    mongoDb = mongoClient.db('darktube_metadata');
    console.log('Connected to MongoDB');
    return mongoDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Redis Client
let redisClient: ReturnType<typeof Redis.createClient>;

export async function connectRedis() {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await redisClient.connect();
    console.log('Connected to Redis');
    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
}

// Database connection utilities
export async function connectDatabases() {
  try {
    // Test PostgreSQL connection
    await prisma.$connect();
    console.log('Connected to PostgreSQL');

    // Connect to MongoDB
    await connectMongoDB();

    // Connect to Redis
    await connectRedis();

    console.log('All databases connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Graceful shutdown
export async function disconnectDatabases() {
  try {
    await prisma.$disconnect();
    if (mongoClient) {
      await mongoClient.close();
    }
    if (redisClient) {
      await redisClient.quit();
    }
    console.log('All databases disconnected');
  } catch (error) {
    console.error('Database disconnection error:', error);
  }
}

// MongoDB Collections Types
export interface VideoMetadata {
  _id?: string;
  video_id: string;
  transcript?: {
    language: string;
    segments: Array<{
      start_time: number;
      end_time: number;
      text: string;
    }>;
  };
  subtitle_tracks?: Array<{
    language: string;
    type: 'auto-generated' | 'user-uploaded';
    url: string;
  }>;
  chapters?: Array<{
    title: string;
    start_time: number;
    thumbnail?: string;
  }>;
  engagement_stats: {
    view_count: number;
    like_count: number;
    dislike_count: number;
    comment_count: number;
    average_view_duration: number;
    view_graph: number[]; // retention per second
    impression_clickthrough_rate: number;
    traffic_sources: Record<string, number>;
  };
  processing_metadata?: {
    original_filename: string;
    file_size: number;
    encoding_profiles: Array<{
      quality: string;
      codec: string;
      bitrate: number;
      url: string;
    }>;
    thumbnails: Array<{
      size: string;
      url: string;
    }>;
  };
}

export interface AnalyticsEvent {
  _id?: string;
  event_type: string;
  video_id?: string;
  user_id?: string;
  session_id: string;
  timestamp: Date;
  metadata: Record<string, any>;
}