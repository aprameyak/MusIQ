import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getDatabasePool } from '../database/connection';
import { CustomError } from '../middleware/error.middleware';
import { AuthService } from '../services/auth.service';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();
const pool = getDatabasePool();
const authService = new AuthService();

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

router.get(
  '/taste',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

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

      const tasteScore = Math.round(
        (parseFloat(stats.avg_rating) || 0) * 10 +
        Math.min(parseInt(stats.total_ratings) / 10, 50)
      );

      const genreResult = await pool.query(
        `SELECT 
          jsonb_array_elements_text(mi.metadata->'genres') as genre,
          COUNT(*) as count,
          AVG(r.rating) as avg_rating
         FROM ratings r
         JOIN music_items mi ON r.music_item_id = mi.id
         WHERE r.user_id = $1 
         AND mi.metadata->'genres' IS NOT NULL
         AND jsonb_typeof(mi.metadata->'genres') = 'array'
         GROUP BY genre
         ORDER BY count DESC, avg_rating DESC
         LIMIT 10`,
        [req.userId]
      );

      const genreAffinity: Record<string, number> = {};
      if (genreResult.rows.length > 0) {
        const maxCount = Math.max(...genreResult.rows.map((r: any) => parseInt(r.count || '0')), 1);
        genreResult.rows.forEach((row: any) => {
          const genre = row.genre;
          const count = parseInt(row.count || '0');
          if (genre && typeof genre === 'string') {
            const score = Math.round((count / maxCount) * 100);
            genreAffinity[genre] = Math.max(genreAffinity[genre] || 0, score);
          }
        });
      }

      const decadeResult = await pool.query(
        `SELECT 
          mi.metadata->>'release_date' as release_date,
          COUNT(*) as count,
          AVG(r.rating) as avg_rating
         FROM ratings r
         JOIN music_items mi ON r.music_item_id = mi.id
         WHERE r.user_id = $1 AND mi.metadata->>'release_date' IS NOT NULL
         GROUP BY mi.metadata->>'release_date'
         ORDER BY count DESC`,
        [req.userId]
      );

      const decadePreference: Record<string, number> = {};
      const decadeCounts: Record<string, number> = {};

      decadeResult.rows.forEach((row: any) => {
        const releaseDate = row.release_date;
        if (releaseDate && typeof releaseDate === 'string') {
          const yearMatch = releaseDate.match(/^(\d{4})/);
          if (yearMatch) {
            const year = parseInt(yearMatch[1]);
            const decade = `${Math.floor(year / 10)}0s`;
            const count = parseInt(row.count || '0');
            decadeCounts[decade] = (decadeCounts[decade] || 0) + count;
          }
        }
      });

      if (Object.keys(decadeCounts).length > 0) {
        const maxDecadeCount = Math.max(...Object.values(decadeCounts), 1);
        Object.keys(decadeCounts).forEach(decade => {
          decadePreference[decade] = Math.round((decadeCounts[decade] / maxDecadeCount) * 100);
        });
      }

      const tagResult = await pool.query(
        `SELECT 
          jsonb_array_elements_text(r.tags) as tag,
          COUNT(*) as count,
          AVG(r.rating) as avg_rating
         FROM ratings r
         WHERE r.user_id = $1 AND r.tags IS NOT NULL AND jsonb_array_length(r.tags) > 0
         GROUP BY tag
         ORDER BY count DESC
         LIMIT 20`,
        [req.userId]
      );

      const attributes: Record<string, number> = {};
      if (tagResult.rows.length > 0) {
        const maxTagCount = Math.max(...tagResult.rows.map((r: any) => parseInt(r.count || '0')), 1);
        tagResult.rows.forEach((row: any) => {
          const tag = row.tag;
          const count = parseInt(row.count || '0');
          if (tag && typeof tag === 'string') {
            attributes[tag] = Math.round((count / maxTagCount) * 100);
          }
        });
      }

      const controversyResult = await pool.query(
        `SELECT 
          STDDEV(r.rating) as rating_stddev,
          COUNT(*) as total
         FROM ratings r
         WHERE r.user_id = $1`,
        [req.userId]
      );

      const stddev = parseFloat(controversyResult.rows[0]?.rating_stddev || '0');
      const controversyAffinity = Math.min(100, Math.max(0, Math.round(stddev * 10)));

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
          controversyAffinity
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/',
  authMiddleware,
  validate([
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Valid email address is required')
      .normalizeEmail()
      .toLowerCase(),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores')
  ]),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { email, firstName, lastName, username } = req.body;

      if (!email && firstName === undefined && lastName === undefined && !username) {
        throw new CustomError('At least one field must be provided for update', 400);
      }

      await authService.updateProfile(req.userId, email, firstName, lastName);

      if (username) {
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [username, req.userId]
        );

        if (existingUser.rows.length > 0) {
          throw new CustomError('Username already taken', 409);
        }

        await pool.query(
          'UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2',
          [username, req.userId]
        );
      }

      const userResult = await pool.query(
        `SELECT id, email, username, first_name, last_name, email_verified, mfa_enabled, role, oauth_provider, oauth_id, last_login_at, created_at, updated_at
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

router.get(
  '/search',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const query = req.query.q as string;
      if (!query || query.length < 2) {
        throw new CustomError('Search query must be at least 2 characters', 400);
      }

      const result = await pool.query(
        `SELECT id, username, email
         FROM users
         WHERE username ILIKE $1 
         AND id != $2 
         AND deleted_at IS NULL
         LIMIT 20`,
        [`%${query}%`, req.userId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

