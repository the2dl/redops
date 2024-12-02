import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db/config';

interface JWTPayload {
  id: number;
  username: string;
  isAdmin: boolean;
  tokenVersion: number;
  tokenType: string;
  aud: string;
  iss: string;
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with more lenient options
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;

    // Verify user exists and status in database
    const userResult = await pool.query(
      'SELECT is_admin, token_version, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!userResult.rows[0] || !userResult.rows[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Add user to request
    req.user = {
      ...decoded,
      isAdmin: userResult.rows[0].is_admin
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;

    // Always check DB for current admin status
    const userResult = await pool.query(
      'SELECT is_admin, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!userResult.rows[0] || !userResult.rows[0].is_active) {
      return res.status(403).json({ error: 'Account inactive or not found' });
    }

    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 