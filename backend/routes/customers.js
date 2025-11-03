import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all customers (admin/staff only)
router.get('/', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT id, first_name, last_name, email, phone, company, address, 
             role, client_type, notes, created_at, last_login
      FROM users 
      WHERE is_active = true
    `;
    
    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      queryText += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR company ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM users WHERE is_active = true';
    const countParams = [];
    
    if (search) {
      countQuery += ' AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1)';
      countParams.push(`%${search}%`);
    }

    const countResult = await query(countQuery, countParams);
    const totalCustomers = parseInt(countResult.rows[0].count);

    res.json({
      customers: result.rows.map(customer => ({
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        address: customer.address,
        role: customer.role,
        clientType: customer.client_type,
        notes: customer.notes,
        createdAt: customer.created_at,
        lastLogin: customer.last_login
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCustomers / limit),
        totalCustomers,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch customers' } 
    });
  }
});

// Get single customer
router.get('/:id', authenticateToken, [
  param('id').isInt().withMessage('Invalid customer ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const customerId = req.params.id;
    
    // Check if user can access this customer data
    if (req.user.role === 'customer' && req.user.id !== parseInt(customerId)) {
      return res.status(403).json({ 
        error: { message: 'Access denied' } 
      });
    }

    const result = await query(
      `SELECT id, first_name, last_name, email, phone, company, address, 
              role, client_type, notes, created_at, last_login
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Customer not found' } 
      });
    }

    const customer = result.rows[0];
    res.json({
      customer: {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        address: customer.address,
        role: customer.role,
        clientType: customer.client_type,
        notes: customer.notes,
        createdAt: customer.created_at,
        lastLogin: customer.last_login
      }
    });

  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch customer' } 
    });
  }
});

// Update customer
router.put('/:id', authenticateToken, [
  param('id').isInt().withMessage('Invalid customer ID'),
  body('firstName').optional({ nullable: true, checkFalsy: false }).trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional({ nullable: true, checkFalsy: false }).trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('email').optional({ nullable: true, checkFalsy: true }).trim().custom((value) => {
    if (value && value.length > 0) {
      // Only validate email format if a value is provided
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Valid email is required');
      }
    }
    return true;
  }),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim(),
  body('company').optional({ nullable: true, checkFalsy: true }).trim(),
  body('address').optional({ nullable: true, checkFalsy: true }).trim(),
  body('role').optional({ nullable: true, checkFalsy: true }).isIn(['customer', 'staff', 'admin', '']).withMessage('Invalid role'),
  body('clientType').optional({ nullable: true, checkFalsy: true }).trim(),
  body('notes').optional({ nullable: true, checkFalsy: true }).trim(),
  body('password').optional({ nullable: true, checkFalsy: true }).custom((value) => {
    if (value && value.length > 0 && value.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const customerId = req.params.id;
    
    // Check if user can update this customer data
    if (req.user.role === 'customer' && req.user.id !== parseInt(customerId)) {
      return res.status(403).json({ 
        error: { message: 'Access denied' } 
      });
    }

    const { firstName, lastName, email, phone, company, address, role, clientType, notes, password } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (firstName !== undefined) {
      paramCount++;
      updateFields.push(`first_name = $${paramCount}`);
      updateValues.push(firstName);
    }
    
    if (lastName !== undefined) {
      paramCount++;
      updateFields.push(`last_name = $${paramCount}`);
      updateValues.push(lastName);
    }
    
    if (email !== undefined) {
      // Email can be used by multiple customers (for multiple sites)
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(email);
    }
    
    if (phone !== undefined) {
      paramCount++;
      updateFields.push(`phone = $${paramCount}`);
      updateValues.push(phone);
    }
    
    if (company !== undefined) {
      paramCount++;
      updateFields.push(`company = $${paramCount}`);
      updateValues.push(company);
    }
    
    if (address !== undefined) {
      paramCount++;
      updateFields.push(`address = $${paramCount}`);
      updateValues.push(address);
    }
    
    // Only admin can change role
    if (role !== undefined && req.user.role === 'admin') {
      paramCount++;
      updateFields.push(`role = $${paramCount}`);
      updateValues.push(role);
    }
    
    if (clientType !== undefined) {
      paramCount++;
      updateFields.push(`client_type = $${paramCount}`);
      updateValues.push(clientType);
    }
    
    if (notes !== undefined) {
      paramCount++;
      updateFields.push(`notes = $${paramCount}`);
      updateValues.push(notes);
    }
    
    // Update password if provided
    if (password !== undefined && password.length >= 8) {
      const bcrypt = (await import('bcrypt')).default;
      const hashedPassword = await bcrypt.hash(password, 12);
      paramCount++;
      updateFields.push(`password_hash = $${paramCount}`);
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: { message: 'No fields provided for update' } 
      });
    }

    paramCount++;
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(customerId);

    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, first_name, last_name, email, phone, company, address, role, client_type, notes, updated_at`,
      updateValues
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Customer not found' } 
      });
    }

    const customer = result.rows[0];
    res.json({
      message: 'Customer updated successfully',
      customer: {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        address: customer.address,
        role: customer.role,
        clientType: customer.client_type,
        notes: customer.notes,
        updatedAt: customer.updated_at
      }
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to update customer' } 
    });
  }
});

// Delete customer (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), [
  param('id').isInt().withMessage('Invalid customer ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const customerId = req.params.id;

    // Check if customer exists
    const customerCheck = await query(
      "SELECT id FROM users WHERE id = $1 AND is_active = true",
      [customerId]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Customer not found' } 
      });
    }

    // Check if customer has active appointments
    const appointmentCheck = await query(
      "SELECT id FROM appointments WHERE customer_id = $1 AND status NOT IN ('cancelled', 'completed')",
      [customerId]
    );

    if (appointmentCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: { message: 'Cannot delete customer with active appointments' } 
      });
    }

    // Soft delete by setting is_active = false
    await query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [customerId]
    );

    res.json({ message: 'Customer deleted (deactivated) successfully' });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to delete customer' } 
    });
  }
});

// Create new customer (admin/staff only)
router.post('/', authenticateToken, requireRole(['admin', 'staff']), [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('address').optional().trim(),
  body('role').optional().isIn(['customer', 'staff', 'admin']).withMessage('Invalid role'),
  body('clientType').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { firstName, lastName, email, password, phone, company, address, role, clientType, notes } = req.body;

    // Email can be used by multiple customers (for multiple sites)
    // No uniqueness check needed

    // Hash password
    const bcrypt = (await import('bcrypt')).default;
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create customer (user with role 'customer' by default, or specified role if admin)
    const userRole = role || 'customer';
    
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, company, address, role, client_type, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, first_name, last_name, email, phone, company, address, role, client_type, notes, created_at`,
      [firstName, lastName, email, hashedPassword, phone || null, company || null, address || null, userRole, clientType || null, notes || null]
    );

    const newCustomer = result.rows[0];

    res.status(201).json({
      message: 'Customer created successfully',
      customer: {
        id: newCustomer.id,
        firstName: newCustomer.first_name,
        lastName: newCustomer.last_name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        company: newCustomer.company,
        address: newCustomer.address,
        role: newCustomer.role,
        clientType: newCustomer.client_type,
        notes: newCustomer.notes,
        createdAt: newCustomer.created_at
      }
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to create customer' } 
    });
  }
});

export default router;
