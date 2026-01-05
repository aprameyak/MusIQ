import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getDatabasePool } from '../database/connection';

const router = Router();
const pool = getDatabasePool();

router.get(
  '/albums',
  authMiddleware,
  async (req, res, next) => {
    try {
      const timeframe = req.query.timeframe as string || 'all_time';
      
      let timeFilter = '';
      if (timeframe === 'week') {
        timeFilter = "AND r.created_at > NOW() - INTERVAL '7 days'";
      } else if (timeframe === 'month') {
        timeFilter = "AND r.created_at > NOW() - INTERVAL '30 days'";
      } else if (timeframe === 'year') {
        timeFilter = "AND r.created_at > NOW() - INTERVAL '365 days'";
      }

      const result = await pool.query(
        `SELECT 
          mi.*,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as rating_count,
          ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(r.rating), 0) DESC, COUNT(r.id) DESC) as rank
         FROM music_items mi
         LEFT JOIN ratings r ON mi.id = r.music_item_id ${timeFilter}
         WHERE mi.type = 'album'
         GROUP BY mi.id
         ORDER BY rating DESC, rating_count DESC
         LIMIT 100`,
        []
      );

      const rankings = result.rows.map((row, index) => ({
        id: row.id,
        rank: index + 1,
        title: row.title,
        artist: row.artist,
        imageUrl: row.image_url,
        rating: parseFloat(row.rating) || 0,
        ratingCount: parseInt(row.rating_count) || 0,
        isNew: false, 
        change: 0 
      }));

      res.json({
        success: true,
        data: rankings
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/songs',
  authMiddleware,
  async (req, res, next) => {
    try {
      const timeframe = req.query.timeframe as string || 'all_time';
      
      let timeFilter = '';
      if (timeframe === 'week') {
        timeFilter = "AND r.created_at > NOW() - INTERVAL '7 days'";
      } else if (timeframe === 'month') {
        timeFilter = "AND r.created_at > NOW() - INTERVAL '30 days'";
      } else if (timeframe === 'year') {
        timeFilter = "AND r.created_at > NOW() - INTERVAL '365 days'";
      }

      const result = await pool.query(
        `SELECT 
          mi.*,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as rating_count,
          ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(r.rating), 0) DESC, COUNT(r.id) DESC) as rank
         FROM music_items mi
         LEFT JOIN ratings r ON mi.id = r.music_item_id ${timeFilter}
         WHERE mi.type = 'song'
         GROUP BY mi.id
         ORDER BY rating DESC, rating_count DESC
         LIMIT 100`,
        []
      );

      const rankings = result.rows.map((row, index) => ({
        id: row.id,
        rank: index + 1,
        title: row.title,
        artist: row.artist,
        imageUrl: row.image_url,
        rating: parseFloat(row.rating) || 0,
        ratingCount: parseInt(row.rating_count) || 0,
        isNew: false,
        change: 0
      }));

      res.json({
        success: true,
        data: rankings
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/artists',
  authMiddleware,
  async (req, res, next) => {
    try {
      const timeframe = req.query.timeframe as string || 'all_time';
      
      let timeFilter = '';
      if (timeframe === 'week') {
        timeFilter = "AND r.created_at > NOW() - INTERVAL '7 days'";
      } else if (timeframe === 'month') {
        timeFilter = "AND r.created_at > NOW() - INTERVAL '30 days'";
      } else if (timeframe === 'year') {
        timeFilter = "AND r.created_at > NOW() - INTERVAL '365 days'";
      }

      const result = await pool.query(
        `SELECT 
          mi.*,
          COALESCE(AVG(r.rating), 0) as rating,
          COUNT(r.id) as rating_count,
          ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(r.rating), 0) DESC, COUNT(r.id) DESC) as rank
         FROM music_items mi
         LEFT JOIN ratings r ON mi.id = r.music_item_id ${timeFilter}
         WHERE mi.type = 'artist'
         GROUP BY mi.id
         ORDER BY rating DESC, rating_count DESC
         LIMIT 100`,
        []
      );

      const rankings = result.rows.map((row, index) => ({
        id: row.id,
        rank: index + 1,
        title: row.title,
        artist: row.artist,
        imageUrl: row.image_url,
        rating: parseFloat(row.rating) || 0,
        ratingCount: parseInt(row.rating_count) || 0,
        isNew: false,
        change: 0
      }));

      res.json({
        success: true,
        data: rankings
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
