const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/config');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const passport = require('passport');

// Initialize Azure AD configuration from database
async function initializeAzureAD() {
  try {
    console.log('[Azure AD] Initializing configuration...');
    const result = await pool.query('SELECT * FROM azure_config WHERE is_enabled = true LIMIT 1');
    
    if (result.rows[0]) {
      const config = result.rows[0];
      console.log('[Azure AD] Found configuration:', {
        clientID: config.client_id ? '✓' : '✗',
        tenantID: config.tenant_id ? '✓' : '✗',
        clientSecret: config.client_secret ? '✓' : '✗',
        redirectUri: config.redirect_uri
      });

      const azureConfig = {
        identityMetadata: `https://login.microsoftonline.com/${config.tenant_id}/v2.0/.well-known/openid-configuration`,
        clientID: config.client_id,
        responseType: 'code id_token',
        responseMode: 'form_post',
        redirectUrl: config.redirect_uri,
        allowHttpForRedirectUrl: true,
        clientSecret: config.client_secret,
        validateIssuer: true,
        issuer: `https://login.microsoftonline.com/${config.tenant_id}/v2.0`,
        passReqToCallback: false,
        scope: ['profile', 'email', 'openid'],
        loggingLevel: 'info',
        loggingNoPII: false,
        useCookieInsteadOfSession: false,
        cookieEncryptionKeys: [
          { key: process.env.SESSION_SECRET || 'your-secret-key', iv: '12345678' }
        ]
      };

      passport.use('azuread-openidconnect', new OIDCStrategy(azureConfig,
        async (profile, done) => {
          try {
            console.log('[Azure AD] Profile received:', {
              oid: profile.oid,
              displayName: profile.displayName,
              email: profile._json.email,
              raw: profile._json
            });

            // First try to find user by azure_id, then by email
            let user = await pool.query(
              'SELECT * FROM users WHERE azure_id = $1 OR email = $2',
              [profile.oid, profile._json.email]
            );

            if (!user.rows[0]) {
              // New user - create account
              console.log('[Azure AD] Creating new user for:', profile.displayName);
              user = await pool.query(
                `INSERT INTO users (username, email, azure_id, auth_provider, is_active) 
                 VALUES ($1, $2, $3, 'azure', true) 
                 RETURNING *`,
                [profile.displayName, profile._json.email, profile.oid]
              );
            } else if (!user.rows[0].azure_id) {
              // Existing user by email - link Azure account
              console.log('[Azure AD] Linking Azure to existing account:', user.rows[0].username);
              user = await pool.query(
                `UPDATE users 
                 SET azure_id = $1, auth_provider = 'azure'
                 WHERE id = $2 
                 RETURNING *`,
                [profile.oid, user.rows[0].id]
              );
            } else {
              console.log('[Azure AD] Found existing user:', user.rows[0].username);
            }

            return done(null, user.rows[0]);
          } catch (error) {
            console.error('[Azure AD] Error in profile callback:', error);
            return done(error);
          }
        }
      ));

      console.log('[Azure AD] Configuration completed successfully');
      return true;
    }
    console.log('[Azure AD] No enabled configuration found');
    return false;
  } catch (error) {
    console.error('[Azure AD] Initialization error:', error);
    return false;
  }
}

// Check Azure AD status
router.get('/azure-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT is_enabled FROM azure_config LIMIT 1');
    res.json({ isEnabled: result.rows[0]?.is_enabled || false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check Azure AD status' });
  }
});

// Setup endpoint updated to handle Azure config
router.post('/setup', async (req, res) => {
  const { admin, azure } = req.body;
  
  try {
    await pool.query('BEGIN');

    // Check if setup has already been completed
    const setupCheck = await pool.query('SELECT is_initialized FROM setup_status LIMIT 1 FOR UPDATE');
    if (setupCheck.rows[0].is_initialized) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Setup already completed' });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const userResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1, $2, $3, true) RETURNING id, username, email, is_admin',
      [admin.username, admin.email, hashedPassword]
    );

    // Update Azure config if enabled
    if (azure.isEnabled) {
      await pool.query(
        `UPDATE azure_config 
         SET client_id = $1, tenant_id = $2, client_secret = $3, redirect_uri = $4, 
             is_enabled = true, updated_by = $5
         WHERE id = (SELECT id FROM azure_config LIMIT 1)`,
        [azure.clientId, azure.tenantId, azure.clientSecret, azure.redirectUri, userResult.rows[0].id]
      );

      // Initialize Azure AD with new config
      await initializeAzureAD();
    }

    // Update setup status
    await pool.query(
      'UPDATE setup_status SET is_initialized = true, initialized_at = NOW(), initialized_by = $1',
      [userResult.rows[0].id]
    );

    await pool.query('COMMIT');

    // Generate token
    const token = jwt.sign(
      { 
        id: userResult.rows[0].id,
        username: userResult.rows[0].username,
        isAdmin: userResult.rows[0].is_admin,
        tokenVersion: 1
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: userResult.rows[0].id,
        username: userResult.rows[0].username,
        isAdmin: userResult.rows[0].is_admin
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Setup failed' });
  }
});

// Initialize Azure AD and set up routes if enabled
(async () => {
  if (await initializeAzureAD()) {
    // Azure AD routes
    router.get('/azure',
      (req, res, next) => {
        console.log('[Azure AD] Starting authentication...');
        next();
      },
      passport.authenticate('azuread-openidconnect', { 
        failureRedirect: '/login',
        failureMessage: true
      })
    );

    router.post('/azure/callback',
      (req, res, next) => {
        console.log('[Azure AD] Received callback:', {
          method: req.method,
          body: req.body,
          query: req.query,
          headers: req.headers,
          error: req.body.error,
          errorDescription: req.body.error_description
        });

        // Check for error in callback
        if (req.body.error) {
          console.error('[Azure AD] Error in callback:', {
            error: req.body.error,
            description: req.body.error_description
          });
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(req.body.error_description || req.body.error)}`);
        }

        next();
      },
      passport.authenticate('azuread-openidconnect', { 
        failureRedirect: '/login',
        failureMessage: true,
        failWithError: true
      }),
      async (req, res) => {
        try {
          console.log('[Azure AD] Authentication successful for user:', req.user?.username);
          const token = jwt.sign(
            { 
              id: req.user.id,
              username: req.user.username,
              tokenVersion: req.user.token_version,
              tokenType: 'auth'
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );

          res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${token}`);
        } catch (error) {
          console.error('[Azure AD] Callback error:', error);
          res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
      }
    );
  }
})();

// Add error handler for authentication failures
router.use((err, req, res, next) => {
  console.error('[Azure AD] Authentication error:', err);
  res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(err.message)}`);
});

// Check if setup is required
router.get('/setup-required', async (req, res) => {
  try {
    const result = await pool.query('SELECT is_initialized FROM setup_status LIMIT 1');
    res.json({ setupRequired: !result.rows[0].is_initialized });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get user with minimal required fields
    const result = await pool.query(
      'SELECT id, username, password_hash, is_admin, is_active FROM users WHERE username = $1',
      [username]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Update last_login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        tokenVersion: user.token_version,
        tokenType: 'auth'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Note: is_admin is sent in response but not stored in JWT
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        isAdmin: user.is_admin 
      } 
    });
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

// Add middleware to verify admin status
const verifyAdmin = async (req, res, next) => {
  try {
    // Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with all claims
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', {
      audience: 'redops-api',
      issuer: 'redops-auth'
    });

    // Double check against database
    const userResult = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!userResult.rows[0] || !userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Use the middleware for admin-only routes
router.get('/admin/something', verifyAdmin, (req, res) => {
  // Admin-only endpoint
});

// Add the /me endpoint
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get fresh user data from database
    const result = await pool.query(
      'SELECT id, username, email, is_admin, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 