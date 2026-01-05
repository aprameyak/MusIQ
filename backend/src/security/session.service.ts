import { getDatabasePool } from '../database/connection';
import { logger } from '../config/logger';

export interface SessionData {
  userId: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionService {
  private pool = getDatabasePool();
  private readonly maxSessions = 5;

  async createSession(userId: string, _deviceId?: string, _ipAddress?: string, _userAgent?: string): Promise<string> {
    // Check current session count
    const activeSessions = await this.pool.query(
      `SELECT COUNT(*) as count
       FROM refresh_tokens
       WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
      [userId]
    );

    const sessionCount = parseInt(activeSessions.rows[0].count);

    // If max sessions reached, revoke oldest session
    if (sessionCount >= this.maxSessions) {
      await this.revokeOldestSession(userId);
    }

    // Session is created via refresh token in auth service
    // This service just manages session limits
    logger.info('Session created', { userId, deviceId: _deviceId });
    return 'session-created';
  }

  async revokeSession(token: string): Promise<void> {
    await this.pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1',
      [token]
    );

    logger.info('Session revoked', { token: token.substring(0, 10) + '...' });
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
      [userId]
    );

    logger.info('All sessions revoked', { userId });
  }

  async revokeOldestSession(userId: string): Promise<void> {
    const result = await this.pool.query(
      `SELECT id FROM refresh_tokens
       WHERE user_id = $1 AND revoked_at IS NULL
       ORDER BY created_at ASC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length > 0) {
      await this.pool.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
        [result.rows[0].id]
      );

      logger.info('Oldest session revoked', { userId });
    }
  }

  async getActiveSessions(userId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT id, device_id, ip_address, user_agent, created_at, expires_at
       FROM refresh_tokens
       WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  async cleanupExpiredSessions(): Promise<void> {
    const result = await this.pool.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE revoked_at IS NULL AND expires_at < NOW()`
    );

    logger.info('Expired sessions cleaned up', { count: result.rowCount });
  }
}

