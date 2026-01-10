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

      if (filter === 'trending') {
        query += ` AND r.created_at > NOW() - INTERVAL '7 days'`;
      } else if (filter === 'forYou') {
        
      }

      query += ` GROUP BY mi.id ORDER BY `;

      if (filter === 'trending') {
        query += `recent_ratings DESC, rating DESC`;
      } else {
        query += `rating DESC, rating_count DESC`;
      }

      query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      queryParams.push(limit, offset);

      const result = await pool.query(query, queryParams);

      const items = await Promise.all(result.rows.map(async (row) => {
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
      const query = req.query.q as string;

      if (!query || query.length < 2) {
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

      const items = result.rows.map(row => ({
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
