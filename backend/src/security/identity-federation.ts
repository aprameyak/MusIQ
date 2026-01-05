import { getDatabasePool } from '../database/connection';
import { logger } from '../config/logger';
import { CustomError } from '../middleware/error.middleware';

export interface OAuthUser {
  id: string;
  email: string;
  name?: string;
  provider: 'apple' | 'google' | 'spotify';
}

export class IdentityFederationService {
  private pool = getDatabasePool();

  async authenticateWithApple(_idToken: string, userIdentifier?: string): Promise<any> {
    
    logger.info('Apple Sign In attempted', { userIdentifier });
    
    throw new CustomError('Apple Sign In not yet fully implemented', 501);
  }

  async authenticateWithGoogle(_accessToken: string, _idToken?: string): Promise<any> {
    
    logger.info('Google Sign In attempted');
    
    throw new CustomError('Google Sign In not yet fully implemented', 501);
  }

  async authenticateWithSpotify(_accessToken: string, _refreshToken?: string): Promise<any> {
    
    logger.info('Spotify OAuth attempted');
    
    throw new CustomError('Spotify OAuth not yet fully implemented', 501);
  }

  async findOrCreateOAuthUser(oauthUser: OAuthUser): Promise<{ user: any; tokens: any }> {
    
    const existingUser = await this.pool.query(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2 AND deleted_at IS NULL',
      [oauthUser.provider, oauthUser.id]
    );

    if (existingUser.rows.length > 0) {
      
      const user = existingUser.rows[0];
      
      await this.pool.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [user.id]
      );
      
      const { AuthService } = await import('../services/auth.service');
      const authService = new AuthService();
      const tokens = await authService.generateTokens(user.id, user.email, user.role);
      
      await this.pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')
         ON CONFLICT (token) DO NOTHING`,
        [user.id, tokens.refreshToken]
      );
      
      return { user, tokens };
    }

    const emailUser = await this.pool.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [oauthUser.email]
    );

    if (emailUser.rows.length > 0) {
      
      await this.pool.query(
        'UPDATE users SET oauth_provider = $1, oauth_id = $2, last_login_at = NOW() WHERE id = $3',
        [oauthUser.provider, oauthUser.id, emailUser.rows[0].id]
      );

      const user = emailUser.rows[0];
      const { AuthService } = await import('../services/auth.service');
      const authService = new AuthService();
      const tokens = await authService.generateTokens(user.id, user.email, user.role);
      
      await this.pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')
         ON CONFLICT (token) DO NOTHING`,
        [user.id, tokens.refreshToken]
      );
      
      return { user, tokens };
    }

    let username = oauthUser.email.split('@')[0] + '_' + oauthUser.provider;
    
    let uniqueUsername = username;
    let counter = 1;
    while (true) {
      const existing = await this.pool.query(
        'SELECT id FROM users WHERE username = $1',
        [uniqueUsername]
      );
      if (existing.rows.length === 0) break;
      uniqueUsername = `${username}${counter}`;
      counter++;
    }
    
    const result = await this.pool.query(
      `INSERT INTO users (email, username, oauth_provider, oauth_id, email_verified, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [oauthUser.email, uniqueUsername, oauthUser.provider, oauthUser.id, true, 'user']
    );

    const newUser = result.rows[0];
    const { AuthService } = await import('../services/auth.service');
    const authService = new AuthService();
    const tokens = await authService.generateTokens(newUser.id, newUser.email, newUser.role);
    
    await this.pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [newUser.id, tokens.refreshToken]
    );

    logger.info('OAuth user created', { userId: newUser.id, provider: oauthUser.provider });
    return { user: newUser, tokens };
  }
}
