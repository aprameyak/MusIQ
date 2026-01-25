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

      const musicItemResult = await pool.query(
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

router.post(
  '/:id/like',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { id } = req.params;

      const postResult = await pool.query(
        'SELECT user_id FROM posts WHERE id = $1',
        [id]
      );

      if (postResult.rows.length === 0) {
        throw new CustomError('Post not found', 404);
      }

      try {
        await pool.query(
          'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)',
          [req.userId, id]
        );

        if (postResult.rows[0].user_id !== req.userId) {
          const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [req.userId]);
          const username = userResult.rows[0]?.username || 'Someone';

          await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, metadata)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              postResult.rows[0].user_id,
              'post_like',
              'New Like',
              `${username} liked your post`,
              JSON.stringify({ postId: id, likedBy: req.userId })
            ]
          );
        }
      } catch (err: any) {
        if (err.code === '23505') {

          res.json({ success: true, message: 'Post already liked' });
          return;
        }
        throw err;
      }

      res.json({
        success: true,
        message: 'Post liked successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id/like',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2 RETURNING *',
        [req.userId, id]
      );

      if (result.rows.length === 0) {
        throw new CustomError('Post not liked', 404);
      }

      res.json({
        success: true,
        message: 'Post unliked successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/comments',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { id } = req.params;

      const result = await pool.query(
        `SELECT pc.*, u.username
         FROM post_comments pc
         JOIN users u ON pc.user_id = u.id
         WHERE pc.post_id = $1
         ORDER BY pc.created_at ASC`,
        [id]
      );

      const comments = result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        username: row.username,
        text: row.text,
        createdAt: row.created_at
      }));

      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/comment',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { id } = req.params;
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new CustomError('Comment text is required', 400);
      }

      const postResult = await pool.query(
        'SELECT user_id FROM posts WHERE id = $1',
        [id]
      );

      if (postResult.rows.length === 0) {
        throw new CustomError('Post not found', 404);
      }

      const commentResult = await pool.query(
        `INSERT INTO post_comments (user_id, post_id, text)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [req.userId, id, text.trim()]
      );

      if (postResult.rows[0].user_id !== req.userId) {
        const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [req.userId]);
        const username = userResult.rows[0]?.username || 'Someone';

        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            postResult.rows[0].user_id,
            'post_comment',
            'New Comment',
            `${username} commented on your post`,
            JSON.stringify({ postId: id, commentId: commentResult.rows[0].id, commentedBy: req.userId })
          ]
        );
      }

      res.json({
        success: true,
        data: {
          id: commentResult.rows[0].id,
          text: commentResult.rows[0].text,
          createdAt: commentResult.rows[0].created_at
        },
        message: 'Comment added successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/share',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { id } = req.params;
      const { text } = req.body;

      const postResult = await pool.query(
        'SELECT user_id FROM posts WHERE id = $1',
        [id]
      );

      if (postResult.rows.length === 0) {
        throw new CustomError('Post not found', 404);
      }

      const repostResult = await pool.query(
        `INSERT INTO post_reposts (user_id, post_id, text)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [req.userId, id, text || null]
      );

      if (postResult.rows[0].user_id !== req.userId) {
        const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [req.userId]);
        const username = userResult.rows[0]?.username || 'Someone';

        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            postResult.rows[0].user_id,
            'post_repost',
            'New Repost',
            `${username} reposted your post`,
            JSON.stringify({ postId: id, repostId: repostResult.rows[0].id, repostedBy: req.userId })
          ]
        );
      }

      res.json({
        success: true,
        data: {
          id: repostResult.rows[0].id,
          text: repostResult.rows[0].text,
          createdAt: repostResult.rows[0].created_at
        },
        message: 'Post shared successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
