import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('mb_artists', (table) => {
    table.uuid('mbid').primary();
    table.text('name').notNullable().index();
    table.text('sort_name').nullable();
    table.text('type').nullable();
    table.text('area').nullable();
    table.text('disambiguation').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('mb_albums', (table) => {
    table.uuid('mbid').primary();
    table.text('title').notNullable().index();
    table.date('release_date').nullable();
    table.text('status').nullable();
    table.text('primary_type').nullable();
    table.specificType('secondary_types', 'text[]').nullable();
    table.text('cover_art_url').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('mb_tracks', (table) => {
    table.uuid('mbid').primary();
    table.text('title').notNullable().index();
    table.integer('length').nullable();
    table.text('disambiguation').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('mb_album_artists', (table) => {
    table.uuid('album_mbid').references('mbid').inTable('mb_albums').onDelete('CASCADE');
    table.uuid('artist_mbid').references('mbid').inTable('mb_artists').onDelete('CASCADE');
    table.text('role').nullable();
    table.primary(['album_mbid', 'artist_mbid', 'role']);
    table.index(['album_mbid']);
    table.index(['artist_mbid']);
  });

  await knex.schema.createTable('mb_album_tracks', (table) => {
    table.uuid('album_mbid').references('mbid').inTable('mb_albums').onDelete('CASCADE');
    table.uuid('track_mbid').references('mbid').inTable('mb_tracks').onDelete('CASCADE');
    table.integer('position').notNullable();
    table.integer('disc_number').defaultTo(1);
    table.primary(['album_mbid', 'track_mbid', 'position', 'disc_number']);
    table.index(['album_mbid']);
    table.index(['track_mbid']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('mb_album_tracks');
  await knex.schema.dropTableIfExists('mb_album_artists');
  await knex.schema.dropTableIfExists('mb_tracks');
  await knex.schema.dropTableIfExists('mb_albums');
  await knex.schema.dropTableIfExists('mb_artists');
}

