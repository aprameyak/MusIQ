import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    
    await knex.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm');

    
    await knex.raw('CREATE INDEX IF NOT EXISTS music_items_title_trgm_idx ON music_items USING gin (title gin_trgm_ops)');
    await knex.raw('CREATE INDEX IF NOT EXISTS music_items_artist_trgm_idx ON music_items USING gin (artist gin_trgm_ops)');
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw('DROP INDEX IF EXISTS music_items_title_trgm_idx');
    await knex.raw('DROP INDEX IF EXISTS music_items_artist_trgm_idx');
    
}
