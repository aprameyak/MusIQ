import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getDatabasePool } from '../database/connection';
import { CustomError } from '../middleware/error.middleware';

const router = Router();
const pool = getDatabasePool();

router.get(
  '/',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const result = await pool.query(
        `SELECT * FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
      );

      const notifications = result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        message: row.message,
        read: row.read,
        metadata: row.metadata,
        createdAt: row.created_at
      }));

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id/read',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const { id } = req.params;

      const result = await pool.query(
        `UPDATE notifications
         SET read = true
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, req.userId]
      );

      if (result.rows.length === 0) {
        throw new CustomError('Notification not found', 404);
      }

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/read-all',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      await pool.query(
        `UPDATE notifications
         SET read = true
         WHERE user_id = $1 AND read = false`,
        [req.userId]
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

