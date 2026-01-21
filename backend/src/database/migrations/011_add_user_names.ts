import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('first_name').nullable();
    table.string('last_name').nullable();
    table.uuid('supabase_auth_id').nullable();
  });

  await knex.schema.raw('CREATE INDEX idx_users_supabase_auth_id ON users(supabase_auth_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('first_name');
    table.dropColumn('last_name');
    table.dropColumn('supabase_auth_id');
  });
}
