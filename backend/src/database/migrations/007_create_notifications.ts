import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable().index();
    table.string('type').notNullable(); 
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.boolean('read').defaultTo(false).notNullable().index();
    table.jsonb('metadata').nullable();
    table.timestamps(true, true);
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notifications');
}
