import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { ratingLimiter } from '../middleware/rate-limit.middleware';
import { validate, postValidation, createPostWithMusicItemValidation } from '../middleware/validation.middleware';
import { getDatabasePool } from '../database/connection';
import { CustomError } from '../middleware/error.middleware';
import { logger } from '../config/logger';

const router = Router();
const pool = getDatabasePool();

router.post(
  '/',
  ratingLimiter,
  authMiddleware,
  validate(postValidation),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { musicItemId, rating, text } = req.body;

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

      if (existingRating.rows.length > 0) {
        await pool.query(
          `UPDATE ratings 
           SET rating = $1, updated_at = NOW()
           WHERE user_id = $2 AND music_item_id = $3
           RETURNING *`,
          [rating, req.userId, musicItemId]
        );
      } else {
        await pool.query(
          `INSERT INTO ratings (user_id, music_item_id, rating, tags)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [req.userId, musicItemId, rating, JSON.stringify([])]
        );
      }

      const postResult = await pool.query(
        `INSERT INTO posts (user_id, music_item_id, rating, text)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.userId, musicItemId, rating, text || null]
      );

      const userResult = await pool.query(
        'SELECT username FROM users WHERE id = $1',
        [req.userId]
      );

      const musicItemDetailResult = await pool.query(
        `SELECT id, type, title, artist, image_url, spotify_id, apple_music_id, metadata
         FROM music_items WHERE id = $1`,
        [musicItemId]
      );

      const musicItem = musicItemDetailResult.rows[0];

      logger.info('Post created', {
        userId: req.userId,
        musicItemId,
        rating,
        postId: postResult.rows[0].id
      });

      res.json({
        success: true,
        data: {
          post: {
            id: postResult.rows[0].id,
            username: userResult.rows[0].username,
            text: postResult.rows[0].text,
            rating: postResult.rows[0].rating,
            musicItem: {
              id: musicItem.id,
              type: musicItem.type,
              title: musicItem.title,
              artist: musicItem.artist,
              imageUrl: musicItem.image_url,
              spotifyId: musicItem.spotify_id,
              appleMusicId: musicItem.apple_music_id,
              metadata: musicItem.metadata
            },
            createdAt: postResult.rows[0].created_at
          }
        },
        message: 'Post created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/create',
  ratingLimiter,
  authMiddleware,
  validate(createPostWithMusicItemValidation),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { name, category, rating, text } = req.body;

      let musicItemResult = await pool.query(
        'SELECT id FROM music_items WHERE LOWER(title) = LOWER($1) AND type = $2',
        [name.trim(), category]
      );

      let musicItemId: string;
      
      if (musicItemResult.rows.length > 0) {
        musicItemId = musicItemResult.rows[0].id;
      } else {
        const artistValue = category === 'artist' ? name.trim() : '';
        const insertResult = await pool.query(
          `INSERT INTO music_items (type, title, artist)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [category, name.trim(), artistValue]
        );
        musicItemId = insertResult.rows[0].id;
      }
      const existingRating = await pool.query(
        'SELECT id FROM ratings WHERE user_id = $1 AND music_item_id = $2',
        [req.userId, musicItemId]
      );

      if (existingRating.rows.length > 0) {
        await pool.query(
          `UPDATE ratings 
           SET rating = $1, updated_at = NOW()
           WHERE user_id = $2 AND music_item_id = $3`,
          [rating, req.userId, musicItemId]
        );
      } else {
        await pool.query(
          `INSERT INTO ratings (user_id, music_item_id, rating, tags)
           VALUES ($1, $2, $3, $4)`,
          [req.userId, musicItemId, rating, JSON.stringify([])]
        );
      }

      const postResult = await pool.query(
        `INSERT INTO posts (user_id, music_item_id, rating, text)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.userId, musicItemId, rating, text || null]
      );

      const userResult = await pool.query(
        'SELECT username FROM users WHERE id = $1',
        [req.userId]
      );

      const musicItemDetailResult = await pool.query(
        `SELECT id, type, title, artist, image_url, spotify_id, apple_music_id, metadata
         FROM music_items WHERE id = $1`,
        [musicItemId]
      );

      const musicItem = musicItemDetailResult.rows[0];

      logger.info('Post created with new music item', {
        userId: req.userId,
        musicItemId,
        rating,
        postId: postResult.rows[0].id
      });

      res.json({
        success: true,
        data: {
          post: {
            id: postResult.rows[0].id,
            username: userResult.rows[0].username,
            text: postResult.rows[0].text,
            rating: postResult.rows[0].rating,
            musicItem: {
              id: musicItem.id,
              type: musicItem.type,
              title: musicItem.title,
              artist: musicItem.artist,
              imageUrl: musicItem.image_url,
              spotifyId: musicItem.spotify_id,
              appleMusicId: musicItem.apple_music_id,
              metadata: musicItem.metadata
            },
            createdAt: postResult.rows[0].created_at
          }
        },
        message: 'Post created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/feed',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const result = await pool.query(
        `SELECT 
          p.id,
          p.rating,
          p.text,
          p.created_at,
          u.username,
          mi.id as music_item_id,
          mi.type,
          mi.title,
          mi.artist,
          mi.image_url,
          mi.spotify_id,
          mi.apple_music_id,
          mi.metadata
         FROM posts p
         JOIN users u ON p.user_id = u.id
         JOIN music_items mi ON p.music_item_id = mi.id
         WHERE u.deleted_at IS NULL
         ORDER BY p.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await pool.query(
        'SELECT COUNT(*) as total FROM posts p JOIN users u ON p.user_id = u.id WHERE u.deleted_at IS NULL'
      );

      const total = parseInt(countResult.rows[0].total);
      const hasMore = offset + limit < total;
      const nextPage = hasMore ? page + 1 : null;

      const posts = result.rows.map((row: any) => ({
        id: row.id,
        username: row.username,
        text: row.text,
        rating: row.rating,
        musicItem: {
          id: row.music_item_id,
          type: row.type,
          title: row.title,
          artist: row.artist,
          imageUrl: row.image_url,
          spotifyId: row.spotify_id,
          appleMusicId: row.apple_music_id,
          metadata: row.metadata
        },
        createdAt: row.created_at
      }));

      res.json({
        success: true,
        data: {
          data: posts,
          pagination: {
            page,
            limit,
            total,
            hasMore,
            nextPage
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
