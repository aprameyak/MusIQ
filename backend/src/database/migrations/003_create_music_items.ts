import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('music_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('type').notNullable(); 
    table.string('title').notNullable().index();
    table.string('artist').notNullable().index();
    table.string('image_url').nullable();
    table.string('spotify_id').unique().nullable();
    table.string('apple_music_id').unique().nullable();
    table.jsonb('metadata').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('music_items');
}
