import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from './error.middleware';
import { getDatabasePool } from '../database/connection';

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
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      throw new CustomError('Invalid or expired token', 401);
    }

    // Verify user still exists and is not deleted
    const pool = getDatabasePool();
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      throw new CustomError('User not found', 401);
    }

    const user = userResult.rows[0];

    // Attach user info to request
    req.userId = user.id;
    req.userEmail = user.email;
    req.userRole = user.role;

    next();
  } catch (error) {
    next(error);
  }
};

