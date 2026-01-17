import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

export function getDatabasePool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    const isSupabase = connectionString.includes('supabase.co');
    pool = new Pool({
      connectionString,
      ssl: isSupabase ? {
        rejectUnauthorized: false
      } : connectionString.includes('sslmode=require') ? {
        rejectUnauthorized: false
      } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  return pool;
}

export async function testConnection(): Promise<boolean> {
  try {
    const testPool = getDatabasePool();
    await testPool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

