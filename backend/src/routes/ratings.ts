import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { ratingLimiter } from '../middleware/rate-limit.middleware';
import { validate, ratingValidation } from '../middleware/validation.middleware';
import { getDatabasePool } from '../database/connection';
import { CustomError } from '../middleware/error.middleware';
import { logger } from '../config/logger';

const router = Router();
const pool = getDatabasePool();

router.post(
  '/',
  ratingLimiter,
  authMiddleware,
  validate(ratingValidation),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { musicItemId, rating, tags } = req.body;

      const musicItemResult = await pool.query(
        'SELECT id FROM music_items WHERE id = $1',
        [musicItemId]
      );

      if (musicItemResult.rows.length === 0) {
        throw new CustomError('Music item not found', 404);
      }

      const existingRating = await pool.query(
        'SELECT id FROM ratings WHERE user_id = $1 AND music_item_id = $2',
        [req.userId, musicItemId]
      );

      let ratingResult;
      if (existingRating.rows.length > 0) {

        ratingResult = await pool.query(
          `UPDATE ratings 
           SET rating = $1, tags = $2, updated_at = NOW()
           WHERE user_id = $3 AND music_item_id = $4
           RETURNING *`,
          [rating, JSON.stringify(tags || []), req.userId, musicItemId]
        );
      } else {

        ratingResult = await pool.query(
          `INSERT INTO ratings (user_id, music_item_id, rating, tags)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [req.userId, musicItemId, rating, JSON.stringify(tags || [])]
        );
      }

      await pool.query(
        `UPDATE music_items 
         SET updated_at = NOW()
         WHERE id = $1`,
        [musicItemId]
      );

      logger.info('Rating submitted', {
        userId: req.userId,
        musicItemId,
        rating
      });

      res.json({
        success: true,
        data: {
          rating: {
            id: ratingResult.rows[0].id,
            userId: ratingResult.rows[0].user_id,
            musicItemId: ratingResult.rows[0].music_item_id,
            rating: ratingResult.rows[0].rating,
            tags: ratingResult.rows[0].tags,
            createdAt: ratingResult.rows[0].created_at,
            updatedAt: ratingResult.rows[0].updated_at
          }
        },
        message: 'Rating submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:musicItemId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { musicItemId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const result = await pool.query(
        `SELECT 
          r.*,
          u.username,
          u.id as user_id
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.music_item_id = $1 AND u.deleted_at IS NULL
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [musicItemId, limit, offset]
      );

      const ratings = result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        musicItemId: row.music_item_id,
        rating: row.rating,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.json({
        success: true,
        data: ratings
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/user/:userId',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      if (userId !== req.userId && req.userRole !== 'admin') {
        throw new CustomError('Forbidden', 403);
      }

      const result = await pool.query(
        `SELECT 
          r.*,
          mi.title,
          mi.artist,
          mi.type,
          mi.image_url
         FROM ratings r
         JOIN music_items mi ON r.music_item_id = mi.id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const ratings = result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        musicItemId: row.music_item_id,
        rating: row.rating,
        tags: row.tags,
        musicItem: {
          title: row.title,
          artist: row.artist,
          type: row.type,
          imageUrl: row.image_url
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.json({
        success: true,
        data: ratings
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

