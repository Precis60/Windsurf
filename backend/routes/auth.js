import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('phone').optional().isMobilePhone(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { email, password, firstName, lastName, phone, role = 'customer' } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: { message: 'User with this email already exists' } 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, hashedPassword, firstName, lastName, phone, role]
    );

    const user = result.rows[0];

    // Generate JWT token with safe fallback to avoid 500 if JWT_SECRET is missing
    const jwtSecret = process.env.JWT_SECRET || 'dev-fallback-jwt-secret-change-me';
    if (!process.env.JWT_SECRET) {
      // One-time warning per process
      if (!global.__JWT_SECRET_WARNED__) {
        console.warn('⚠️  JWT_SECRET is not set. Using fallback secret. Set JWT_SECRET in environment for production.');
        global.__JWT_SECRET_WARNED__ = true;
      }
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: { message: 'Registration failed' } 
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: { message: 'Invalid credentials' } 
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ 
        error: { message: 'Account is deactivated' } 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: { message: 'Invalid credentials' } 
      });
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate JWT token with safe fallback to avoid 500 if JWT_SECRET is missing
    const jwtSecret = process.env.JWT_SECRET || 'dev-fallback-jwt-secret-change-me';
    if (!process.env.JWT_SECRET) {
      if (!global.__JWT_SECRET_WARNED__) {
        console.warn('⚠️  JWT_SECRET is not set. Using fallback secret. Set JWT_SECRET in environment for production.');
        global.__JWT_SECRET_WARNED__ = true;
      }
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: { message: 'Login failed' } 
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone, role, created_at, last_login 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'User not found' } 
      });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch profile' } 
    });
  }
});

// Logout (client-side token removal, server-side could implement token blacklisting)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;

// Admin password reset (emergency) protected by ADMIN_RESET_TOKEN
// Usage: send header "x-reset-token: <ADMIN_RESET_TOKEN>" and body { email, newPassword }
router.post('/admin-reset-password', [
  body('email').isEmail().normalizeEmail(),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
    }

    const headerToken = req.headers['x-reset-token'];
    if (!headerToken || headerToken !== process.env.ADMIN_RESET_TOKEN) {
      return res.status(403).json({ error: { message: 'Invalid reset token' } });
    }

    const { email, newPassword } = req.body;

    // Find user by email
    const result = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2', [hashed, email]);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({ error: { message: 'Failed to reset password' } });
  }
});
