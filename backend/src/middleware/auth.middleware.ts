import { Request, Response, NextFunction } from 'express';
import { CustomError } from './error.middleware';
import { getDatabasePool } from '../database/connection';
import { supabaseService } from '../services/supabase.service';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const pool = getDatabasePool();

    const supabaseUser = await supabaseService.verifyAccessToken(token);

    if (!supabaseUser) {
      throw new CustomError('Invalid or expired token', 401);
    }

    const userResult = await pool.query(
      'SELECT id, email, role, email_verified FROM users WHERE supabase_auth_id = $1 AND deleted_at IS NULL',
      [supabaseUser.userId]
    );

    if (userResult.rows.length === 0) {
      throw new CustomError('User not found', 401);
    }

    const user = userResult.rows[0];


    if (supabaseUser.emailVerified && !user.email_verified) {
      await pool.query(
        'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1',
        [user.id]
      );
    }

    req.userId = user.id;
    req.userEmail = user.email;
    req.userRole = user.role;

    next();
  } catch (error) {
    next(error);
  }
};
