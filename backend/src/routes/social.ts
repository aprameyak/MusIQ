import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getDatabasePool } from '../database/connection';
import { CustomError } from '../middleware/error.middleware';

const router = Router();
const pool = getDatabasePool();

router.get(
  '/friends',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const result = await pool.query(
        `SELECT 
          u.id,
          u.username,
          u.email,
          f.status,
          COUNT(DISTINCT r1.music_item_id) as shared_artists
         FROM friendships f
         JOIN users u ON f.friend_id = u.id
         LEFT JOIN ratings r1 ON r1.user_id = $1
         LEFT JOIN ratings r2 ON r2.user_id = u.id AND r2.music_item_id = r1.music_item_id
         WHERE f.user_id = $1 AND f.status = 'accepted' AND u.deleted_at IS NULL
         GROUP BY u.id, u.username, u.email, f.status`,
        [req.userId]
      );

      const friends = await Promise.all(result.rows.map(async (row) => {
        const compatibilityResult = await pool.query(
          `SELECT 
            COUNT(*) as shared_ratings,
            AVG(ABS(r1.rating - r2.rating)) as avg_rating_diff
           FROM ratings r1
           JOIN ratings r2 ON r1.music_item_id = r2.music_item_id
           WHERE r1.user_id = $1 AND r2.user_id = $2`,
          [req.userId, row.id]
        );

        const sharedRatings = parseInt(compatibilityResult.rows[0]?.shared_ratings || '0');
        const avgDiff = parseFloat(compatibilityResult.rows[0]?.avg_rating_diff || '10');
        const compatibility = Math.max(0, Math.min(100, 100 - (avgDiff * 10) + (sharedRatings * 2)));

        return {
          id: row.id,
          name: row.username,
          username: `@${row.username}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.username}`,
          compatibility: Math.round(compatibility),
          topGenre: 'Hip-Hop', 
          sharedArtists: parseInt(row.shared_artists) || 0,
          status: row.status
        };
      }));

      res.json({
        success: true,
        data: friends
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/follow/:userId',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { userId } = req.params;

      if (userId === req.userId) {
        throw new CustomError('Cannot follow yourself', 400);
      }

      const userResult = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new CustomError('User not found', 404);
      }

      const existingResult = await pool.query(
        'SELECT id, status FROM friendships WHERE user_id = $1 AND friend_id = $2',
        [req.userId, userId]
      );

      if (existingResult.rows.length > 0) {
        const existing = existingResult.rows[0];
        if (existing.status === 'accepted') {
          res.json({
            success: true,
            message: 'Already following this user'
          });
          return;
        } else if (existing.status === 'pending') {
          await pool.query(
            'UPDATE friendships SET status = $1 WHERE id = $2',
            ['accepted', existing.id]
          );
        }
      } else {
        await pool.query(
          'INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, $3)',
          [req.userId, userId, 'pending']
        );
      }

      res.json({
        success: true,
        message: 'Follow request sent'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/compatibility/:userId',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { userId } = req.params;

      const result = await pool.query(
        `SELECT 
          COUNT(*) as shared_ratings,
          AVG(ABS(r1.rating - r2.rating)) as avg_rating_diff
         FROM ratings r1
         JOIN ratings r2 ON r1.music_item_id = r2.music_item_id
         WHERE r1.user_id = $1 AND r2.user_id = $2`,
        [req.userId, userId]
      );

      const sharedRatings = parseInt(result.rows[0]?.shared_ratings || '0');
      const avgDiff = parseFloat(result.rows[0]?.avg_rating_diff || '10');
      const compatibility = Math.max(0, Math.min(100, 100 - (avgDiff * 10) + (sharedRatings * 2)));

      res.json({
        success: true,
        data: {
          compatibility: Math.round(compatibility)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/compare/:userId',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { userId } = req.params;

      const sharedResult = await pool.query(
        `SELECT COUNT(DISTINCT r1.music_item_id) as shared_count
         FROM ratings r1
         JOIN ratings r2 ON r1.music_item_id = r2.music_item_id
         WHERE r1.user_id = $1 AND r2.user_id = $2`,
        [req.userId, userId]
      );

      const compatibilityResult = await pool.query(
        `SELECT 
          COUNT(*) as shared_ratings,
          AVG(ABS(r1.rating - r2.rating)) as avg_rating_diff
         FROM ratings r1
         JOIN ratings r2 ON r1.music_item_id = r2.music_item_id
         WHERE r1.user_id = $1 AND r2.user_id = $2`,
        [req.userId, userId]
      );

      const sharedRatings = parseInt(compatibilityResult.rows[0]?.shared_ratings || '0');
      const avgDiff = parseFloat(compatibilityResult.rows[0]?.avg_rating_diff || '10');
      const compatibility = Math.max(0, Math.min(100, 100 - (avgDiff * 10) + (sharedRatings * 2)));

      res.json({
        success: true,
        data: {
          compatibility: Math.round(compatibility),
          sharedArtists: parseInt(sharedResult.rows[0]?.shared_count || '0'),
          sharedGenres: [] 
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
