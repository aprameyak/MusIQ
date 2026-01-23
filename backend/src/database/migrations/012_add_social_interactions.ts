import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Table for post likes
    await knex.schema.createTable('post_likes', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable().index();
        table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE').notNullable().index();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['user_id', 'post_id']);
    });

    // Table for post comments
    await knex.schema.createTable('post_comments', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable().index();
        table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE').notNullable().index();
        table.text('text').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Table for post reposts (shares)
    await knex.schema.createTable('post_reposts', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable().index();
        table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE').notNullable().index();
        table.text('text').nullable(); // Optional commentary on the repost
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('post_reposts');
    await knex.schema.dropTableIfExists('post_comments');
    await knex.schema.dropTableIfExists('post_likes');
}
