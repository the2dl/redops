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

    // Verify token with strict options
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', {
      audience: 'redops-api',
      issuer: 'redops-auth'
    }) as JWTPayload;

    // Verify user exists and status in database
    const userResult = await pool.query(
      'SELECT is_admin, token_version FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (!userResult.rows[0]) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Verify token version matches
    if (userResult.rows[0].token_version !== decoded.tokenVersion) {
      return res.status(401).json({ error: 'Token expired' });
    }

    // Add user to request
    req.user = {
      ...decoded,
      isAdmin: userResult.rows[0].is_admin // Always use DB value, not token
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
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