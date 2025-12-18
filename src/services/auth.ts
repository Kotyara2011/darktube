import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/database';
import { User, UserPreferences } from '@/types';
import { generateAvatarUrl } from '@/utils/avatar';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  countryRegion?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static readonly BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    const { username, email, password, countryRegion } = data;

    // Validate input data
    await this.validateRegistrationData(data);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new Error('Email already registered');
      }
      if (existingUser.username === username.toLowerCase()) {
        throw new Error('Username already taken');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // Generate default avatar
    const profileAvatar = generateAvatarUrl(username);

    // Default preferences
    const defaultPreferences: UserPreferences = {
      theme: 'dark',
      autoplay: true,
      language: 'en',
      playback_speed: 1.0,
      subtitle_preferences: 'auto',
      privacy_settings: {
        show_watch_history: true,
        show_subscriptions: true,
        allow_comments: true
      }
    };

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        profileAvatar,
        countryRegion,
        preferences: defaultPreferences as any,
      }
    });

    // Generate tokens
    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: this.formatUser(user),
      token,
      refreshToken
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: this.formatUser(user),
      token,
      refreshToken
    };
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return this.formatUser(user);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET + '_refresh') as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newToken = this.generateToken(user.id);
      return { token: newToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const allowedUpdates = ['username', 'biography', 'countryRegion', 'preferences'];
    const filteredUpdates: any = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = (updates as any)[key];
      }
    });

    // Check username uniqueness if updating username
    if (filteredUpdates.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: filteredUpdates.username.toLowerCase(),
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        throw new Error('Username already taken');
      }

      filteredUpdates.username = filteredUpdates.username.toLowerCase();
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: filteredUpdates
    });

    return this.formatUser(user);
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    this.validatePassword(newPassword);

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Password is incorrect');
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });
  }

  /**
   * Generate JWT token
   */
  private static generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  /**
   * Generate refresh token
   */
  private static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.JWT_SECRET + '_refresh',
      { expiresIn: '30d' }
    );
  }

  /**
   * Format user object for response
   */
  private static formatUser(user: any): User {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      profileAvatar: user.profileAvatar,
      bannerImage: user.bannerImage,
      biography: user.biography,
      countryRegion: user.countryRegion,
      joinedTimestamp: user.joinedTimestamp,
      isVerifiedCreator: user.isVerifiedCreator,
      preferences: user.preferences as UserPreferences
    };
  }

  /**
   * Validate registration data
   */
  private static async validateRegistrationData(data: RegisterData): Promise<void> {
    const { username, email, password } = data;

    // Username validation
    if (!username || username.length < 3 || username.length > 50) {
      throw new Error('Username must be between 3 and 50 characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }

    // Email validation
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Please provide a valid email address');
    }

    // Password validation
    this.validatePassword(password);
  }

  /**
   * Validate password strength
   */
  private static validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter, one uppercase letter, and one number');
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}