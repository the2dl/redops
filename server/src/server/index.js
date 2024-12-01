const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const authRoutes = require('../../routes/auth');
const { pool, initializeDatabase } = require('../../db/config');

const app = express();
const PORT = process.env.PORT || 3001;

// Verify environment variables
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.session) {
    console.log('Session:', {
      id: req.session.id,
      isAuthenticated: req.isAuthenticated?.(),
      user: req.user?.id
    });
  }
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add session and passport middleware BEFORE your routes
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

// JWT Strategy Configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

console.log('JWT Secret configured:', !!process.env.JWT_SECRET); // Debug log (don't log the actual secret)

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [jwt_payload.id]);
    if (result.rows[0]) {
      return done(null, result.rows[0]);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        FRONTEND_URL: process.env.FRONTEND_URL,
        DB_PORT: process.env.POSTGRES_PORT,
        // Add other non-sensitive configs here
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 