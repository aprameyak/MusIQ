import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('friendships', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable().index();
    table.uuid('friend_id').references('id').inTable('users').onDelete('CASCADE').notNullable().index();
    table.string('status').defaultTo('pending').notNullable(); // 'pending', 'accepted', 'blocked'
    table.timestamps(true, true);
    table.unique(['user_id', 'friend_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('friendships');
}

