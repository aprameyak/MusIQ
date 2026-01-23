import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getDatabasePool } from '../database/connection';
import { CustomError } from '../middleware/error.middleware';
import { searchLimiter } from '../middleware/rate-limit.middleware';

const router = Router();
const pool = getDatabasePool();

router.get(
  '/feed',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const filter = req.query.filter as string || 'trending';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          mi.*,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as rating_count,
          COUNT(CASE WHEN r.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_ratings
        FROM music_items mi
        LEFT JOIN ratings r ON mi.id = r.music_item_id
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCount = 1;

      if (filter === 'forYou' && req.userId) {
        query = `
          WITH user_follows AS (
            SELECT friend_id FROM friendships WHERE user_id = $1 AND status = 'accepted'
          ),
          user_top_genres AS (
            SELECT DISTINCT jsonb_array_elements_text(mi.metadata->'genres') as genre
            FROM ratings r
            JOIN music_items mi ON r.music_item_id = mi.id
            WHERE r.user_id = $1 AND r.rating >= 8
          )
          SELECT 
            mi.*,
            COALESCE(AVG(r.rating), 0) as rating,
            COUNT(r.id) as rating_count,
            COUNT(CASE WHEN r.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_ratings,
            (
              SELECT COUNT(*) FROM ratings r2 
              WHERE r2.music_item_id = mi.id 
              AND r2.user_id IN (SELECT friend_id FROM user_follows)
            ) as friend_rating_count
          FROM music_items mi
          LEFT JOIN ratings r ON mi.id = r.music_item_id
          WHERE 1=1
          AND (
            EXISTS (
              SELECT 1 FROM user_follows uf 
              JOIN ratings r3 ON r3.user_id = uf.friend_id 
              WHERE r3.music_item_id = mi.id
            )
            OR EXISTS (
              SELECT 1 FROM user_top_genres utg
              WHERE mi.metadata->'genres' ? utg.genre
            )
          )
        `;
        queryParams.push(req.userId);
        paramCount++;
      }

      query += ` GROUP BY mi.id ORDER BY `;

      if (filter === 'forYou') {
        query += `friend_rating_count DESC, rating DESC, recent_ratings DESC, mi.created_at DESC`;
      } else if (filter === 'trending') {
        query += `recent_ratings DESC NULLS LAST, rating DESC, rating_count DESC, mi.created_at DESC`;
      } else {
        query += `rating DESC, rating_count DESC, mi.created_at DESC`;
      }

      query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      queryParams.push(limit, offset);

      const result = await pool.query(query, queryParams);

      const items = await Promise.all(result.rows.map(async (row: any) => {
        let trendingChange: number | null = null;
        if (parseInt(row.recent_ratings) > 10) {
          const previousPeriodResult = await pool.query(
            `SELECT COUNT(*) as count
             FROM ratings
             WHERE music_item_id = $1 
             AND created_at > NOW() - INTERVAL '14 days' 
             AND created_at <= NOW() - INTERVAL '7 days'`,
            [row.id]
          );
          const previousCount = parseInt(previousPeriodResult.rows[0]?.count || '0');
          const currentCount = parseInt(row.recent_ratings);
          trendingChange = currentCount - previousCount;
        }

        return {
          id: row.id,
          type: row.type,
          title: row.title,
          artist: row.artist,
          imageUrl: row.image_url,
          rating: parseFloat(row.rating) || 0,
          ratingCount: parseInt(row.rating_count) || 0,
          trending: parseInt(row.recent_ratings) > 10,
          trendingChange,
          spotifyId: row.spotify_id,
          appleMusicId: row.apple_music_id,
          metadata: row.metadata
        };
      }));

      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT 
          mi.*,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as rating_count
         FROM music_items mi
         LEFT JOIN ratings r ON mi.id = r.music_item_id
         WHERE mi.id = $1
         GROUP BY mi.id`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new CustomError('Music item not found', 404);
      }

      const row = result.rows[0];
      const item = {
        id: row.id,
        type: row.type,
        title: row.title,
        artist: row.artist,
        imageUrl: row.image_url,
        rating: parseFloat(row.rating) || 0,
        ratingCount: parseInt(row.rating_count) || 0,
        spotifyId: row.spotify_id,
        appleMusicId: row.apple_music_id,
        metadata: row.metadata
      };

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/search',
  searchLimiter,
  authMiddleware,
  async (req, res, next) => {
    try {
      const rawQuery = req.query.q;
      const query =
        typeof rawQuery === 'string'
          ? rawQuery
          : Array.isArray(rawQuery)
            ? (rawQuery[0] ?? '')
            : '';

      if (!query || (typeof query === 'string' && query.length < 2)) {
        res.json({
          success: true,
          data: []
        });
        return;
      }

      const result = await pool.query(
        `SELECT 
          mi.*,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as rating_count
         FROM music_items mi
         LEFT JOIN ratings r ON mi.id = r.music_item_id
         WHERE 
           mi.title ILIKE $1 OR 
           mi.artist ILIKE $1
         GROUP BY mi.id
         ORDER BY rating DESC
         LIMIT 20`,
        [`%${query}%`]
      );

      const items = result.rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        artist: row.artist,
        imageUrl: row.image_url,
        rating: parseFloat(row.rating) || 0,
        ratingCount: parseInt(row.rating_count) || 0,
        spotifyId: row.spotify_id,
        appleMusicId: row.apple_music_id,
        metadata: row.metadata
      }));

      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
