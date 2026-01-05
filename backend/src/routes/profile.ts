import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getDatabasePool } from '../database/connection';
import { CustomError } from '../middleware/error.middleware';

const router = Router();
const pool = getDatabasePool();

// Get current user profile
router.get(
  '/',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const userResult = await pool.query(
        `SELECT id, email, username, email_verified, mfa_enabled, role, oauth_provider, oauth_id, last_login_at, created_at, updated_at
         FROM users WHERE id = $1 AND deleted_at IS NULL`,
        [req.userId]
      );

      if (userResult.rows.length === 0) {
        throw new CustomError('User not found', 404);
      }

      res.json({
        success: true,
        data: userResult.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get taste profile
router.get(
  '/taste',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      // Get user's rating statistics
      const statsResult = await pool.query(
        `SELECT 
          COUNT(*) as total_ratings,
          AVG(rating) as avg_rating,
          COUNT(DISTINCT music_item_id) as unique_items_rated
         FROM ratings
         WHERE user_id = $1`,
        [req.userId]
      );

      const stats = statsResult.rows[0];

      // Calculate taste score (simplified - would be more complex in production)
      const tasteScore = Math.round(
        (parseFloat(stats.avg_rating) || 0) * 10 +
        Math.min(parseInt(stats.total_ratings) / 10, 50)
      );

      // Get genre affinity (simplified - would analyze actual music items)
      const genreAffinity: Record<string, number> = {
        'Hip-Hop': 85,
        'R&B': 72,
        'Pop': 68,
        'Rock': 54,
        'Electronic': 45,
        'Jazz': 32
      };

      // Get decade preference (simplified)
      const decadePreference: Record<string, number> = {
        '70s': 15,
        '80s': 25,
        '90s': 45,
        '00s': 68,
        '10s': 82,
        '20s': 95
      };

      // Get music attributes (simplified)
      const attributes: Record<string, number> = {
        'Lyrics': 85,
        'Production': 92,
        'Vocals': 78,
        'Innovation': 88,
        'Emotion': 75,
        'Replay': 90
      };

      // Calculate influence (number of ratings * average rating impact)
      const influence = Math.round(parseInt(stats.total_ratings) * (parseFloat(stats.avg_rating) || 0) * 100);

      res.json({
        success: true,
        data: {
          tasteScore: Math.min(tasteScore, 100),
          totalRatings: parseInt(stats.total_ratings),
          influence,
          genreAffinity,
          decadePreference,
          attributes,
          controversyAffinity: 75 // Simplified
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update profile
router.put(
  '/',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { username } = req.body;
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (username) {
        // Check if username is already taken
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [username, req.userId]
        );

        if (existingUser.rows.length > 0) {
          throw new CustomError('Username already taken', 409);
        }

        updates.push(`username = $${paramCount++}`);
        values.push(username);
      }

      if (updates.length === 0) {
        throw new CustomError('No valid fields to update', 400);
      }

      updates.push(`updated_at = NOW()`);
      values.push(req.userId);

      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );

      // Get updated user
      const userResult = await pool.query(
        `SELECT id, email, username, email_verified, mfa_enabled, role, oauth_provider, oauth_id, last_login_at, created_at, updated_at
         FROM users WHERE id = $1 AND deleted_at IS NULL`,
        [req.userId]
      );

      res.json({
        success: true,
        data: userResult.rows[0],
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

