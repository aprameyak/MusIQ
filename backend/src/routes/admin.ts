import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { runETLJobManually } from '../jobs/music-etl.job';
import { logger } from '../config/logger';

const router = Router();

router.post(
  '/etl/run',
  authMiddleware,
  requireRole('admin'),
  async (req: AuthRequest, res, next) => {
    try {
      logger.info('Manual ETL job triggered', { userId: req.userId });
      
      runETLJobManually()
        .then(() => {
          logger.info('Manual ETL job completed');
        })
        .catch((error) => {
          logger.error('Manual ETL job failed', { error });
        });

      res.json({
        success: true,
        message: 'ETL job started. Check logs for progress.',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

