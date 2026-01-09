import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ratings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable().index();
    table.uuid('music_item_id').references('id').inTable('music_items').onDelete('CASCADE').notNullable().index();
    table.integer('rating').notNullable().checkBetween([1, 10]);
    table.jsonb('tags').defaultTo('[]');
    table.timestamps(true, true);
    table.unique(['user_id', 'music_item_id']);
  });

  await knex.schema.raw('CREATE INDEX idx_ratings_user_music ON ratings(user_id, music_item_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ratings');
}

