import { Pool, PoolConfig } from 'pg';
import { logger } from '../config/logger';

let pool: Pool | null = null;

export const getDatabasePool = (): Pool => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const config: PoolConfig = {
      connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Neon DB
      },
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

    pool = new Pool(config);

    pool.on('error', (err) => {
      logger.error('Unexpected database pool error', err);
    });

    pool.on('connect', () => {
      logger.debug('Database connection established');
    });

    logger.info('Database pool created');
  }

  return pool;
};

export const closeDatabasePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const testPool = getDatabasePool();
    const result = await testPool.query('SELECT NOW()');
    logger.info('Database connection test successful', { time: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Database connection test failed', error);
    return false;
  }
};

