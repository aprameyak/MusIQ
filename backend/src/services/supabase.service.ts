import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../config/logger';
import { CustomError } from '../middleware/error.middleware';

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    user_metadata: {
      first_name?: string;
      last_name?: string;
    };
  };
}

class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }

    this.client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async getUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    try {
      let page = 1;
      const perPage = 1000;

      while (true) {
        const { data, error } = await this.client.auth.admin.listUsers({
          page,
          perPage
        });

        if (error) {
          logger.error('Supabase list users error', { error: error.message });
          return null;
        }

        const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (user) {
          return { id: user.id, email: user.email || email };
        }

        if (!data.users || data.users.length < perPage) {
          break;
        }

        page++;
      }

      return null;
    } catch (error) {
      logger.error('Unexpected error getting user by email from Supabase', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async createAuthUser(email: string, password: string, metadata: { first_name?: string; last_name?: string }): Promise<string> {
    try {
      const { data, error } = await this.client.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: metadata.first_name || '',
          last_name: metadata.last_name || ''
        }
      });

      if (error) {
        logger.error('Supabase create user error', { error: error.message, email, errorCode: error.status });

        if (error.message.includes('already registered') ||
          error.message.includes('already exists') ||
          error.message.includes('User already registered') ||
          error.status === 422) {

          const existingUser = await this.getUserByEmail(email);
          if (existingUser) {
            logger.warn('User exists in Supabase but signup was attempted', {
              email,
              supabaseAuthId: existingUser.id,
              message: 'User should try logging in instead'
            });
            throw new CustomError('This email is already registered. Please try logging in instead.', 409);
          }

          throw new CustomError('This email is already registered. Please try logging in instead.', 409);
        }

        if (error.message.includes('Password')) {
          throw new CustomError('Password does not meet requirements', 400);
        }

        throw new CustomError(`Failed to create user: ${error.message}`, 400);
      }

      if (!data.user) {
        throw new CustomError('Failed to create user: No user data returned', 500);
      }

      logger.info('Supabase user created', { userId: data.user.id, email });
      return data.user.id;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Unexpected error creating Supabase user', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Failed to create user account', 500);
    }
  }

  async signInWithPassword(email: string, password: string): Promise<SupabaseSession> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('Supabase sign in error', { error: error.message, email });

        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid')) {
          throw new CustomError('Invalid email or password', 401);
        }

        throw new CustomError(`Login failed: ${error.message}`, 401);
      }

      if (!data.session || !data.user) {
        throw new CustomError('Login failed: No session data returned', 500);
      }

      logger.info('Supabase user signed in', { userId: data.user.id, email });

      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in || 3600,
        token_type: data.session.token_type || 'bearer',
        user: {
          id: data.user.id,
          email: data.user.email || email,
          email_confirmed_at: data.user.email_confirmed_at ?? null,
          user_metadata: data.user.user_metadata as { first_name?: string; last_name?: string }
        }
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Unexpected error signing in Supabase user', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Login failed', 500);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email);

      if (error) {
        logger.error('Supabase password reset email error', { error: error.message, email });
        throw new CustomError(`Failed to send password reset email: ${error.message}`, 400);
      }

      logger.info('Supabase password reset email sent', { email });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Unexpected error sending password reset email', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Failed to send password reset email', 500);
    }
  }





  async updateUserMetadata(authId: string, metadata: { first_name?: string; last_name?: string }): Promise<void> {
    try {
      const { error } = await this.client.auth.admin.updateUserById(authId, {
        user_metadata: metadata
      });

      if (error) {
        logger.error('Supabase update metadata error', { error: error.message, authId });
        throw new CustomError(`Failed to update user metadata: ${error.message}`, 400);
      }

      logger.info('Supabase user metadata updated', { authId });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Unexpected error updating user metadata', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Failed to update user metadata', 500);
    }
  }

  async updateUserEmail(authId: string, newEmail: string): Promise<void> {
    try {
      const { error } = await this.client.auth.admin.updateUserById(authId, {
        email: newEmail,
        email_confirm: false
      });

      if (error) {
        logger.error('Supabase update email error', { error: error.message, authId });

        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          throw new CustomError('This email is already registered', 409);
        }

        throw new CustomError(`Failed to update email: ${error.message}`, 400);
      }

      logger.info('Supabase user email updated', { authId, newEmail });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Unexpected error updating user email', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Failed to update email', 500);
    }
  }

  async getUserByAuthId(authId: string): Promise<{ id: string; email: string; email_confirmed_at: string | null; user_metadata: any } | null> {
    try {
      const { data, error } = await this.client.auth.admin.getUserById(authId);

      if (error) {
        logger.error('Supabase get user error', { error: error.message, authId });
        return null;
      }

      if (!data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email || '',
        email_confirmed_at: data.user.email_confirmed_at ?? null,
        user_metadata: data.user.user_metadata
      };
    } catch (error) {
      logger.error('Unexpected error getting user by auth ID', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async revokeSession(accessToken: string): Promise<void> {
    try {
      const { error } = await this.client.auth.admin.signOut(accessToken);

      if (error) {
        logger.error('Supabase revoke session error', { error: error.message });
      } else {
        logger.info('Supabase session revoked');
      }
    } catch (error) {
      logger.error('Unexpected error revoking session', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  async verifyAccessToken(accessToken: string): Promise<{ userId: string; email: string; emailVerified: boolean } | null> {
    try {
      const { data, error } = await this.client.auth.getUser(accessToken);

      if (error || !data.user) {
        return null;
      }

      return {
        userId: data.user.id,
        email: data.user.email || '',
        emailVerified: !!data.user.email_confirmed_at
      };
    } catch (error) {
      logger.error('Unexpected error verifying access token', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async verifyOtp(tokenHash: string, type: 'recovery' | 'signup' | 'email_change' | 'magiclink'): Promise<{ user: any; session: any }> {
    try {
      const anonClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
      const { data, error } = await anonClient.auth.verifyOtp({ token_hash: tokenHash, type });

      if (error) {
        logger.error('Supabase verify OTP error', { error: error.message, type });
        throw new CustomError(`Failed to verify OTP: ${error.message}`, 400);
      }

      logger.info('OTP verified successfully', { type, userId: data.user?.id });
      return data;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Unexpected error verifying OTP', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Failed to verify OTP', 500);
    }
  }

  async updatePassword(accessToken: string, newPassword: string): Promise<void> {
    try {
      const anonClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      });
      const { error } = await anonClient.auth.updateUser({ password: newPassword });

      if (error) {
        logger.error('Supabase update password error', { error: error.message });
        throw new CustomError(`Failed to update password: ${error.message}`, 400);
      }

      logger.info('Password updated successfully');
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Unexpected error updating password', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Failed to update password', 500);
    }
  }

  async updateUserPassword(authId: string, newPassword: string): Promise<void> {
    try {
      const { error } = await this.client.auth.admin.updateUserById(authId, {
        password: newPassword
      });

      if (error) {
        logger.error('Supabase admin update password error', { error: error.message, authId });
        throw new CustomError(`Failed to update password: ${error.message}`, 400);
      }

      logger.info('Password updated successfully for user', { authId });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Unexpected error updating user password', { error: error instanceof Error ? error.message : String(error) });
      throw new CustomError('Failed to update password', 500);
    }
  }
}

export const supabaseService = new SupabaseService();
