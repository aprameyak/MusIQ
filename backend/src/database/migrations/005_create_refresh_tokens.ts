import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable().index();
    table.string('token').unique().notNullable().index();
    table.string('device_id').nullable();
    table.string('ip_address').nullable();
    table.string('user_agent').nullable();
    table.timestamp('expires_at').notNullable().index();
    table.timestamp('revoked_at').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('refresh_tokens');
}
