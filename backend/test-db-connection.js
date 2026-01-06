const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_SBvbsU9VH5aO@ep-misty-violet-ad365g0a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW() as time, version() as version')
  .then(result => {
    console.log('✅ Database connection successful!');
    console.log('Time:', result.rows[0].time);
    console.log('PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    pool.end();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    pool.end();
    process.exit(1);
  });
