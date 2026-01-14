import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabasePool } from '../database/connection';
import { logger } from '../config/logger';
import { CustomError } from '../middleware/error.middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash?: string;
  email_verified: boolean;
  mfa_enabled: boolean;
  role: string;
  oauth_provider?: string;
  oauth_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export class AuthService {
  private pool = getDatabasePool();
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  }

  async signup(email: string, username: string, password: string): Promise<AuthTokens> {
    
    const existingUser = await this.pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      throw new CustomError('User with this email or username already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);

    const result = await this.pool.query(
      `INSERT INTO users (email, username, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, role, created_at, updated_at`,
      [email, username, passwordHash, 'user']
    );

    const user = result.rows[0];

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.storeRefreshToken(user.id, tokens.refreshToken, null, null, null);

    logger.info('User signed up', { userId: user.id, email });

    return tokens;
  }

  async login(email: string, password: string, deviceId?: string, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    
    const result = await this.pool.query(
      'SELECT id, email, username, password_hash, role, mfa_enabled FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (result.rows.length === 0) {
      throw new CustomError('Invalid email or password', 401);
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      throw new CustomError('Invalid email or password', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new CustomError('Invalid email or password', 401);
    }

    if (user.mfa_enabled) {
      
      logger.warn('User has MFA enabled but MFA verification is not implemented', { userId: user.id });
    }

    await this.pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.storeRefreshToken(user.id, tokens.refreshToken, deviceId, ipAddress, userAgent);

    logger.info('User logged in', { userId: user.id, email });

    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    
    try {
      jwt.verify(refreshToken, this.jwtRefreshSecret);
    } catch (error: unknown) {
      throw new CustomError('Invalid refresh token', 401);
    }

    const tokenResult = await this.pool.query(
      `SELECT rt.*, u.id as user_id, u.email, u.role
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.revoked_at IS NULL AND rt.expires_at > NOW() AND u.deleted_at IS NULL`,
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      throw new CustomError('Invalid or expired refresh token', 401);
    }

    const tokenData = tokenResult.rows[0];

    await this.pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
      [tokenData.id]
    );

    const tokens = await this.generateTokens(tokenData.user_id, tokenData.email, tokenData.role);

    await this.storeRefreshToken(
      tokenData.user_id,
      tokens.refreshToken,
      tokenData.device_id,
      tokenData.ip_address,
      tokenData.user_agent
    );

    logger.info('Token refreshed', { userId: tokenData.user_id });

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1',
      [refreshToken]
    );

    logger.info('User logged out');
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT id, email, username, email_verified, mfa_enabled, role, oauth_provider, oauth_id, last_login_at, created_at, updated_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT id, email, username, email_verified, mfa_enabled, role, oauth_provider, oauth_id, last_login_at, created_at, updated_at
       FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const payload = {
      userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000)
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      jwtid: uuidv4()
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { userId, jti: uuidv4() },
      this.jwtRefreshSecret,
      { expiresIn: this.jwtRefreshExpiresIn } as jwt.SignOptions
    );

    const expiresIn = this.parseExpiresIn(this.jwtExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer'
    };
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
    deviceId: string | null | undefined,
    ipAddress: string | null | undefined,
    userAgent: string | null | undefined
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    await this.pool.query(
      `INSERT INTO refresh_tokens (user_id, token, device_id, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, token, deviceId, ipAddress, userAgent, expiresAt]
    );
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/(\d+)([smhd])/);
    if (!match) return 900; 

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 900;
    }
  }
}
