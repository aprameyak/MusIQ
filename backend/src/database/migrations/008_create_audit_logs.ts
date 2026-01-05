import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL').nullable().index();
    table.string('action').notNullable();
    table.string('resource_type').nullable();
    table.uuid('resource_id').nullable();
    table.string('ip_address').nullable();
    table.string('user_agent').nullable();
    table.jsonb('metadata').nullable();
    table.timestamps(true, true);
    table.index('created_at');
    table.index(['user_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
}

