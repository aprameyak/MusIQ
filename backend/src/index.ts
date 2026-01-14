import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorMiddleware } from './middleware/error.middleware';
import { securityMiddleware } from './middleware/security.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import { logger } from './config/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(helmet());
app.use(securityMiddleware);

const corsOptions = {
  origin: process.env.CORS_ORIGIN === '*' ? true : (process.env.CORS_ORIGIN || '*'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-Signature-Ed25519', 'X-Signature-Timestamp']
};

app.use(cors(corsOptions));

import { applyHpp } from './middleware/security.middleware';
app.use(applyHpp);


app.use(express.json({
  limit: '10mb',
  verify: (req: express.Request, _res: express.Response, buf: Buffer) => {
    const url = req.url || req.originalUrl || req.path;
    if (url.includes('webhooks') || url.includes('interactions')) {
      (req as any).rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(rateLimitMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import authRoutes from './routes/auth';
import oauthRoutes from './routes/oauth';
import profileRoutes from './routes/profile';
import musicRoutes from './routes/music';
import ratingRoutes from './routes/ratings';
import rankingRoutes from './routes/rankings';
import socialRoutes from './routes/social';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhooks';

app.use('/api/auth', authRoutes);
app.use('/api/auth/oauth', oauthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use('/interactions', webhookRoutes);

app.use(errorMiddleware);

import { testConnection } from './database/connection';
import { startETLScheduler } from './jobs/music-etl.job';

app.listen(PORT, async () => {
  logger.info('Service: musiq-api');
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  const dbConnected = await testConnection();
  if (dbConnected) {
    logger.info('Database connection established');
  } else {
    logger.error('Database connection failed - check DATABASE_URL');
  }

  if (process.env.ENABLE_ETL === 'true') {
    startETLScheduler();
  }
});

export default app;
