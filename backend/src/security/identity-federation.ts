import { getDatabasePool } from '../database/connection';
import { AuthService } from '../services/auth.service';
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
  private authService = new AuthService();

  async authenticateWithApple(_idToken: string, userIdentifier?: string): Promise<any> {
    // TODO: Verify Apple JWT token
    // For now, this is a placeholder
    logger.info('Apple Sign In attempted', { userIdentifier });
    
    throw new CustomError('Apple Sign In not yet fully implemented', 501);
  }

  async authenticateWithGoogle(_accessToken: string, _idToken?: string): Promise<any> {
    // TODO: Verify Google token and fetch user info
    // For now, this is a placeholder
    logger.info('Google Sign In attempted');
    
    throw new CustomError('Google Sign In not yet fully implemented', 501);
  }

  async authenticateWithSpotify(_accessToken: string, _refreshToken?: string): Promise<any> {
    // TODO: Verify Spotify token and fetch user info
    // For now, this is a placeholder
    logger.info('Spotify OAuth attempted');
    
    throw new CustomError('Spotify OAuth not yet fully implemented', 501);
  }

  async findOrCreateOAuthUser(oauthUser: OAuthUser): Promise<any> {
    // Check if user exists with this OAuth ID
    const existingUser = await this.pool.query(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2 AND deleted_at IS NULL',
      [oauthUser.provider, oauthUser.id]
    );

    if (existingUser.rows.length > 0) {
      // User exists, return tokens
      const user = existingUser.rows[0];
      const tokens = await this.authService.login(
        user.email,
        '', // No password for OAuth users
        undefined,
        undefined,
        undefined
      );
      return { user, tokens };
    }

    // Check if email already exists
    const emailUser = await this.pool.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [oauthUser.email]
    );

    if (emailUser.rows.length > 0) {
      // Link OAuth account to existing user
      await this.pool.query(
        'UPDATE users SET oauth_provider = $1, oauth_id = $2 WHERE id = $3',
        [oauthUser.provider, oauthUser.id, emailUser.rows[0].id]
      );

      const tokens = await this.authService.login(
        emailUser.rows[0].email,
        '',
        undefined,
        undefined,
        undefined
      );
      return { user: emailUser.rows[0], tokens };
    }

    // Create new user
    const username = oauthUser.email.split('@')[0] + '_' + oauthUser.provider;
    const result = await this.pool.query(
      `INSERT INTO users (email, username, oauth_provider, oauth_id, email_verified, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [oauthUser.email, username, oauthUser.provider, oauthUser.id, true, 'user']
    );

    const newUser = result.rows[0];
    const tokens = await this.authService.login(
      newUser.email,
      '',
      undefined,
      undefined,
      undefined
    );

    logger.info('OAuth user created', { userId: newUser.id, provider: oauthUser.provider });
    return { user: newUser, tokens };
  }
}

