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

async function initializeDatabase() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    
    console.log('Initializing database...');
    const sqlFile = await fs.readFile(path.join(__dirname, 'init.sql'), 'utf8');
    await pool.query(sqlFile);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = { pool, initializeDatabase }; 