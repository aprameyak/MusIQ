import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('posts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable().index();
    table.uuid('music_item_id').references('id').inTable('music_items').onDelete('CASCADE').notNullable().index();
    table.integer('rating').notNullable().checkBetween([1, 10]);
    table.text('text').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.raw('CREATE INDEX idx_posts_created_at ON posts(created_at DESC)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('posts');
}
