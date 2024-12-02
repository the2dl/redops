const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: 'localhost',
  port: process.env.POSTGRES_PORT || 5431,
  database: process.env.POSTGRES_DB
});

// Add connection test
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL');
    client.release();
    return true;
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
    throw err;
  }
}

const initializeDatabase = async () => {
  try {
    // Drop existing trigger if it exists
    await pool.query(`
      DROP TRIGGER IF EXISTS update_operations_updated_at ON operations;
    `);

    // Create the trigger function if it doesn't exist
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create the trigger
    await pool.query(`
      CREATE TRIGGER update_operations_updated_at
        BEFORE UPDATE ON operations
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    `);

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = { pool, initializeDatabase }; 