import { Pool, PoolConfig } from 'pg';
import { logger } from '../config/logger';

let pool: Pool | null = null;

export const getDatabasePool = (): Pool => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const isSupabase = connectionString.includes('supabase.co');
    const config: PoolConfig = {
      connectionString,
      ssl: isSupabase ? {
        rejectUnauthorized: false
      } : connectionString.includes('sslmode=require') ? {
        rejectUnauthorized: false
      } : undefined,
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
      allowExitOnIdle: false,
    };

    pool = new Pool(config);

    pool.on('error', (err: NodeJS.ErrnoException) => {
      logger.error('Unexpected database pool error', {
        message: err.message,
        code: err.code,
        service: 'musiq-api'
      });
      
      if (err.code === '57P01' || err.code === '57P02' || err.code === '57P03') {
        logger.warn('Database connection terminated, pool will reconnect automatically', {
          service: 'musiq-api'
        });
      }
    });

    pool.on('connect', (_client: any) => {
      logger.debug('Database connection established', {
        totalCount: pool?.totalCount,
        idleCount: pool?.idleCount,
        waitingCount: pool?.waitingCount,
        service: 'musiq-api'
      });
    });

    pool.on('remove', () => {
      logger.debug('Database connection removed from pool', {
        totalCount: pool?.totalCount,
        idleCount: pool?.idleCount,
        service: 'musiq-api'
      });
    });

    logger.info('Database pool created', {
      max: config.max,
      min: config.min,
      service: 'musiq-api'
    });
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

export const queryWithRetry = async <T = any>(
  queryText: string,
  params?: any[],
  maxRetries: number = 3
): Promise<T[]> => {
  const pool = getDatabasePool();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query(queryText, params);
      return result.rows;
    } catch (error: any) {
      lastError = error;
      
      const isConnectionError = 
        error.code === '57P01' || 
        error.code === '57P02' || 
        error.code === '57P03' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('Connection terminated') ||
        error.message?.includes('Connection closed');

      if (isConnectionError && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        logger.warn(`Database query failed, retrying (attempt ${attempt}/${maxRetries})`, {
          error: error.message,
          code: error.code,
          delay,
          service: 'musiq-api'
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('Database query failed after retries');
};

