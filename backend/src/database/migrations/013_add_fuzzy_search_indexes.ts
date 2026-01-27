import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
    
    await pool.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');

    
    await pool.query('CREATE INDEX IF NOT EXISTS music_items_title_trgm_idx ON music_items USING gin (title gin_trgm_ops)');
    await pool.query('CREATE INDEX IF NOT EXISTS music_items_artist_trgm_idx ON music_items USING gin (artist gin_trgm_ops)');
}

export async function down(pool: Pool): Promise<void> {
    await pool.query('DROP INDEX IF EXISTS music_items_title_trgm_idx');
    await pool.query('DROP INDEX IF EXISTS music_items_artist_trgm_idx');
    
}
