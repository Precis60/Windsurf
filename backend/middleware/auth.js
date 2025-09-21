import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: { message: 'Access token required' } 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists in database
    const result = await query(
      'SELECT id, email, role, is_active, first_name, last_name FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: { message: 'User not found' } 
      });
    }

    const user = result.rows[0];
    
    if (!user.is_active) {
      return res.status(401).json({ 
        error: { message: 'User account is deactivated' } 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    };
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({ 
      error: { message: 'Invalid or expired token' } 
    });
  }
};

export const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: { message: 'Authentication required' } 
      });
    }

    const userRole = req.user.role;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!rolesArray.includes(userRole)) {
      return res.status(403).json({ 
        error: { message: 'Insufficient permissions' } 
      });
    }

    next();
  };
};
