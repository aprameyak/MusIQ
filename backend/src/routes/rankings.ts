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

      const previousTimeFilter = timeframe === 'week' 
        ? "AND r.created_at > NOW() - INTERVAL '14 days' AND r.created_at <= NOW() - INTERVAL '7 days'"
        : timeframe === 'month'
        ? "AND r.created_at > NOW() - INTERVAL '60 days' AND r.created_at <= NOW() - INTERVAL '30 days'"
        : timeframe === 'year'
        ? "AND r.created_at > NOW() - INTERVAL '730 days' AND r.created_at <= NOW() - INTERVAL '365 days'"
        : '';

      const previousRankingsResult = previousTimeFilter ? await pool.query(
        `SELECT 
          mi.id,
          ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(r.rating), 0) DESC, COUNT(r.id) DESC) as rank
         FROM music_items mi
         LEFT JOIN ratings r ON mi.id = r.music_item_id ${previousTimeFilter}
         WHERE mi.type = 'album'
         GROUP BY mi.id
         ORDER BY COALESCE(AVG(r.rating), 0) DESC, COUNT(r.id) DESC
         LIMIT 100`,
        []
      ) : { rows: [] };

      const previousRankMap = new Map(
        previousRankingsResult.rows.map((r: any) => [r.id, parseInt(r.rank)])
      );

      const isNewThreshold = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : timeframe === 'year' ? 365 : 365;
      const newItemsResult = await pool.query(
        `SELECT DISTINCT music_item_id as id
         FROM ratings
         WHERE created_at > NOW() - INTERVAL '${isNewThreshold} days'`,
        []
      );
      const newItemIds = new Set(newItemsResult.rows.map((r: any) => r.id));

      const rankings = result.rows.map((row, index) => {
        const currentRank = index + 1;
        const previousRank = previousRankMap.get(row.id);
        const change = previousRank ? previousRank - currentRank : 0;
        const isNew = newItemIds.has(row.id);

        return {
          id: row.id,
          rank: currentRank,
          title: row.title,
          artist: row.artist,
          imageUrl: row.image_url,
          rating: parseFloat(row.rating) || 0,
          ratingCount: parseInt(row.rating_count) || 0,
          isNew,
          change
        };
      });

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

      const previousTimeFilter = timeframe === 'week' 
        ? "AND r.created_at > NOW() - INTERVAL '14 days' AND r.created_at <= NOW() - INTERVAL '7 days'"
        : timeframe === 'month'
        ? "AND r.created_at > NOW() - INTERVAL '60 days' AND r.created_at <= NOW() - INTERVAL '30 days'"
        : timeframe === 'year'
        ? "AND r.created_at > NOW() - INTERVAL '730 days' AND r.created_at <= NOW() - INTERVAL '365 days'"
        : '';

      const previousRankingsResult = previousTimeFilter ? await pool.query(
        `SELECT 
          mi.id,
          ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(r.rating), 0) DESC, COUNT(r.id) DESC) as rank
         FROM music_items mi
         LEFT JOIN ratings r ON mi.id = r.music_item_id ${previousTimeFilter}
         WHERE mi.type = 'song'
         GROUP BY mi.id
         ORDER BY COALESCE(AVG(r.rating), 0) DESC, COUNT(r.id) DESC
         LIMIT 100`,
        []
      ) : { rows: [] };

      const previousRankMap = new Map(
        previousRankingsResult.rows.map((r: any) => [r.id, parseInt(r.rank)])
      );

      const isNewThreshold = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : timeframe === 'year' ? 365 : 365;
      const newItemsResult = await pool.query(
        `SELECT DISTINCT music_item_id as id
         FROM ratings
         WHERE created_at > NOW() - INTERVAL '${isNewThreshold} days'`,
        []
      );
      const newItemIds = new Set(newItemsResult.rows.map((r: any) => r.id));

      const rankings = result.rows.map((row, index) => {
        const currentRank = index + 1;
        const previousRank = previousRankMap.get(row.id);
        const change = previousRank ? previousRank - currentRank : 0;
        const isNew = newItemIds.has(row.id);

        return {
          id: row.id,
          rank: currentRank,
          title: row.title,
          artist: row.artist,
          imageUrl: row.image_url,
          rating: parseFloat(row.rating) || 0,
          ratingCount: parseInt(row.rating_count) || 0,
          isNew,
          change
        };
      });

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

      const previousTimeFilter = timeframe === 'week' 
        ? "AND r.created_at > NOW() - INTERVAL '14 days' AND r.created_at <= NOW() - INTERVAL '7 days'"
        : timeframe === 'month'
        ? "AND r.created_at > NOW() - INTERVAL '60 days' AND r.created_at <= NOW() - INTERVAL '30 days'"
        : timeframe === 'year'
        ? "AND r.created_at > NOW() - INTERVAL '730 days' AND r.created_at <= NOW() - INTERVAL '365 days'"
        : '';

      const previousRankingsResult = previousTimeFilter ? await pool.query(
        `SELECT 
          mi.id,
          ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(r.rating), 0) DESC, COUNT(r.id) DESC) as rank
         FROM music_items mi
         LEFT JOIN ratings r ON mi.id = r.music_item_id ${previousTimeFilter}
         WHERE mi.type = 'artist'
         GROUP BY mi.id
         ORDER BY COALESCE(AVG(r.rating), 0) DESC, COUNT(r.id) DESC
         LIMIT 100`,
        []
      ) : { rows: [] };

      const previousRankMap = new Map(
        previousRankingsResult.rows.map((r: any) => [r.id, parseInt(r.rank)])
      );

      const isNewThreshold = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : timeframe === 'year' ? 365 : 365;
      const newItemsResult = await pool.query(
        `SELECT DISTINCT music_item_id as id
         FROM ratings
         WHERE created_at > NOW() - INTERVAL '${isNewThreshold} days'`,
        []
      );
      const newItemIds = new Set(newItemsResult.rows.map((r: any) => r.id));

      const rankings = result.rows.map((row, index) => {
        const currentRank = index + 1;
        const previousRank = previousRankMap.get(row.id);
        const change = previousRank ? previousRank - currentRank : 0;
        const isNew = newItemIds.has(row.id);

        return {
          id: row.id,
          rank: currentRank,
          title: row.title,
          artist: row.artist,
          imageUrl: row.image_url,
          rating: parseFloat(row.rating) || 0,
          ratingCount: parseInt(row.rating_count) || 0,
          isNew,
          change
        };
      });

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

