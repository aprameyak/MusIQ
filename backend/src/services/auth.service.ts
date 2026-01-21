

import { getDatabasePool } from '../database/connection';
import { logger } from '../config/logger';
import { CustomError } from '../middleware/error.middleware';
import { supabaseService } from './supabase.service';

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
  first_name?: string;
  last_name?: string;
  supabase_auth_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  emailVerified?: boolean;
}

export class AuthService {
  private pool = getDatabasePool();


  constructor() {

  }

  async signup(email: string, username: string, password: string, firstName: string, lastName: string): Promise<void> {
    try {
    const existingUser = await this.pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
        const existing = existingUser.rows[0];
        const emailCheck = await this.pool.query('SELECT email FROM users WHERE id = $1', [existing.id]);
        if (emailCheck.rows[0]?.email?.toLowerCase() === email.toLowerCase()) {
          throw new CustomError('This email is already registered', 409);
        }
      throw new CustomError('Username already exists', 409);
    }

      let supabaseAuthId: string;
      try {
        supabaseAuthId = await supabaseService.createAuthUser(
          email.toLowerCase(),
          password,
          { first_name: firstName, last_name: lastName }
        );
      } catch (error: any) {
        if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
          const existingSupabaseUser = await supabaseService.getUserByEmail(email.toLowerCase());
          if (existingSupabaseUser) {
            logger.warn('User exists in Supabase but not in local database', { email, supabaseAuthId: existingSupabaseUser.id });
            throw new CustomError('This email is already registered. Please try logging in instead.', 409);
          }
        }
        throw error;
      }

    const result = await this.pool.query(
        `INSERT INTO users (email, username, password_hash, role, first_name, last_name, supabase_auth_id, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, email, username, role, created_at, updated_at`,
        [email.toLowerCase(), username, null, 'user', firstName, lastName, supabaseAuthId, true]
    );

    const user = result.rows[0];

      logger.info('User signed up', { userId: user.id, username, email, supabaseAuthId });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error during signup', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Failed to create user account', 500);
    }
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    try {
      const user = await this.getUserByEmail(email.toLowerCase());
      
      if (!user) {
        throw new CustomError('Invalid email or password', 401);
      }

      if (user.supabase_auth_id) {
        const supabaseSession = await supabaseService.signInWithPassword(email.toLowerCase(), password);
        
        await this.pool.query(
          'UPDATE users SET last_login_at = NOW() WHERE id = $1',
          [user.id]
        );

        logger.info('User logged in with Supabase', { userId: user.id, email });

        return {
          accessToken: supabaseSession.access_token,
          refreshToken: supabaseSession.refresh_token,
          expiresIn: supabaseSession.expires_in,
          tokenType: supabaseSession.token_type,
          emailVerified: !!supabaseSession.user.email_confirmed_at
        };
      } else {
        // Fallback for legacy users if they exist, though we are moving to Supabase only
        throw new CustomError('Legacy user authentication not supported.', 400);
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error during login', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Login failed', 500);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await supabaseService.sendPasswordResetEmail(email);
      logger.info('Password reset email sent', { email });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error sending password reset email', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Failed to send password reset email', 500);
    }
  }





  async refreshToken(_refreshToken: string): Promise<AuthTokens> {
    try {
      // Supabase handles refresh tokens automatically on the client-side
      // The backend will mostly just validate the session token.
      // If a new session token is needed, the client should use Supabase client's refresh mechanism.
      throw new CustomError('Refresh token handled by Supabase client', 400);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error during token refresh', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Token refresh failed', 500);
    }
  }

  async logout(): Promise<void> {
    // Supabase handles logout on the client side, revoking the session
    // This backend logout might be used for specific server-side session invalidation if custom sessions are implemented
    logger.info('User logout initiated (backend only, client handles Supabase session)');
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT id, email, username, email_verified, mfa_enabled, role, oauth_provider, oauth_id, first_name, last_name, supabase_auth_id, last_login_at, created_at, updated_at
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
      `SELECT id, email, username, email_verified, mfa_enabled, role, oauth_provider, oauth_id, first_name, last_name, supabase_auth_id, last_login_at, created_at, updated_at
       FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async verifyUserEmail(supabaseAuthId: string): Promise<void> {
    try {
      await this.pool.query(
        'UPDATE users SET email_verified = true, updated_at = NOW() WHERE supabase_auth_id = $1',
        [supabaseAuthId]
      );
      logger.info('User email verified in local database', { supabaseAuthId });
    } catch (error) {
      logger.error('Error verifying user email in local database', { error: error instanceof Error ? error.message : String(error), supabaseAuthId });
      throw new CustomError('Failed to verify email', 500);
    }
  }



  async updateProfile(userId: string, email?: string, firstName?: string, lastName?: string): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      let emailVerificationNeeded = false;
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (email && email.toLowerCase() !== user.email.toLowerCase()) {
        if (!user.supabase_auth_id) {
          throw new CustomError('Cannot update email for legacy user', 400);
        }

        const emailCheck = await this.getUserByEmail(email.toLowerCase());
        if (emailCheck && emailCheck.id !== userId) {
          throw new CustomError('This email is already registered', 409);
        }

        await supabaseService.updateUserEmail(user.supabase_auth_id, email.toLowerCase());
        updates.push(`email = $${paramCount++}`);
        values.push(email.toLowerCase());
        emailVerificationNeeded = true;
      }

      if (firstName !== undefined && firstName !== user.first_name) {
        updates.push(`first_name = $${paramCount++}`);
        values.push(firstName);
      }

      if (lastName !== undefined && lastName !== user.last_name) {
        updates.push(`last_name = $${paramCount++}`);
        values.push(lastName);
      }

      if (updates.length === 0) {
        return user;
      }

      if (user.supabase_auth_id && (firstName !== undefined || lastName !== undefined)) {
        const metadata: any = {};
        if (firstName !== undefined) metadata.first_name = firstName;
        if (lastName !== undefined) metadata.last_name = lastName;
        await supabaseService.updateUserMetadata(user.supabase_auth_id, metadata);
      }

      updates.push(`updated_at = NOW()`);
      if (emailVerificationNeeded) {
        updates.push(`email_verified = false`);
      }

      values.push(userId);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      
      const result = await this.pool.query(query, values);
      const updatedUser = result.rows[0];

      logger.info('Profile updated', { userId, emailChanged: !!email, emailVerificationNeeded });

      return updatedUser;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error updating profile', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Failed to update profile', 500);
    }
  }


}
