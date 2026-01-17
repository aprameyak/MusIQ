import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('music_items', (table) => {
    table.uuid('mbid').nullable();
    table.index('mbid');
  });

  await knex.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS music_items_mbid_unique 
    ON music_items (mbid) 
    WHERE mbid IS NOT NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('music_items', (table) => {
    table.dropIndex('mbid');
    table.dropColumn('mbid');
  });
}
