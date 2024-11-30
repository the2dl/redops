const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/config');

// Check if setup is required
router.get('/setup-required', async (req, res) => {
  try {
    const result = await pool.query('SELECT is_initialized FROM setup_status LIMIT 1');
    res.json({ setupRequired: !result.rows[0].is_initialized });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Initial setup
router.post('/setup', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Check if setup has already been completed
    const setupCheck = await pool.query('SELECT is_initialized FROM setup_status LIMIT 1');
    if (setupCheck.rows[0].is_initialized) {
      return res.status(400).json({ error: 'Setup already completed' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const userResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1, $2, $3, true) RETURNING id',
      [username, email, hashedPassword]
    );

    // Update setup status
    await pool.query(
      'UPDATE setup_status SET is_initialized = true, initialized_at = NOW(), initialized_by = $1',
      [userResult.rows[0].id]
    );

    res.json({ message: 'Setup completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Setup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.is_admin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, isAdmin: user.is_admin } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if username or email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Modified to RETURNING all needed fields
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, is_admin',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    // Generate JWT token, just like in login
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.is_admin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return the same response format as login
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        isAdmin: user.is_admin 
      },
      message: 'Registration successful' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router; 