import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable().index();
    table.string('username').unique().notNullable().index();
    table.string('password_hash').nullable();
    table.boolean('email_verified').defaultTo(false);
    table.boolean('mfa_enabled').defaultTo(false);
    table.string('mfa_secret').nullable();
    table.string('role').defaultTo('user').notNullable();
    table.string('oauth_provider').nullable();
    table.string('oauth_id').nullable();
    table.timestamp('last_login_at').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}

