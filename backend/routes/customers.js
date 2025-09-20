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
             created_at, last_login
      FROM users 
      WHERE role = 'customer'
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
    let countQuery = 'SELECT COUNT(*) FROM users WHERE role = \'customer\'';
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
              created_at, last_login
       FROM users 
       WHERE id = $1 AND role = 'customer'`,
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
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone(),
  body('company').optional().trim(),
  body('address').optional().trim()
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

    const { firstName, lastName, phone, company, address } = req.body;
    
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
       WHERE id = $${paramCount} AND role = 'customer'
       RETURNING id, first_name, last_name, email, phone, company, address, updated_at`,
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

    const result = await query(
      'DELETE FROM users WHERE id = $1 AND role = \'customer\' RETURNING id',
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Customer not found' } 
      });
    }

    res.json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to delete customer' } 
    });
  }
});

// Create new customer
router.post('/', authenticateToken, requireRole(['admin', 'staff']), [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('address').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { firstName, lastName, email, phone, company, address } = req.body;

    // Check if customer with this email already exists
    const existingCustomer = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingCustomer.rows.length > 0) {
      return res.status(409).json({ 
        error: { message: 'Customer with this email already exists' } 
      });
    }

    // Create customer (user with role 'customer')
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, phone, company, address, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'customer', NOW())
       RETURNING id, first_name, last_name, email, phone, company, address, created_at`,
      [firstName, lastName, email, phone || null, company || null, address || null]
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

// Update customer
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), [
  param('id').isInt().withMessage('Invalid customer ID'),
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('address').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const customerId = req.params.id;
    const { firstName, lastName, email, phone, company, address } = req.body;

    // Check if customer exists
    const customerCheck = await query(
      'SELECT id FROM users WHERE id = $1 AND role = \'customer\'',
      [customerId]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Customer not found' } 
      });
    }

    // Check if email is being changed and if it conflicts
    if (email) {
      const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, customerId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ 
          error: { message: 'Email already in use by another customer' } 
        });
      }
    }

    // Build update query dynamically
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

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: { message: 'No fields to update' } 
      });
    }

    paramCount++;
    updateValues.push(customerId);

    const result = await query(
      `UPDATE users 
       SET ${updateFields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND role = 'customer'
       RETURNING id, first_name, last_name, email, phone, company, address, updated_at`,
      updateValues
    );

    const updatedCustomer = result.rows[0];

    res.json({
      message: 'Customer updated successfully',
      customer: {
        id: updatedCustomer.id,
        firstName: updatedCustomer.first_name,
        lastName: updatedCustomer.last_name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        company: updatedCustomer.company,
        address: updatedCustomer.address,
        updatedAt: updatedCustomer.updated_at
      }
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to update customer' } 
    });
  }
});

// Delete customer
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
      'SELECT id FROM users WHERE id = $1 AND role = \'customer\'',
      [customerId]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Customer not found' } 
      });
    }

    // Check if customer has active appointments
    const appointmentCheck = await query(
      'SELECT id FROM appointments WHERE customer_id = $1 AND status NOT IN (\'cancelled\', \'completed\')',
      [customerId]
    );

    if (appointmentCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: { message: 'Cannot delete customer with active appointments' } 
      });
    }

    // Soft delete by updating role to 'deleted_customer'
    await query(
      'UPDATE users SET role = \'deleted_customer\', updated_at = NOW() WHERE id = $1',
      [customerId]
    );

    res.json({
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to delete customer' } 
    });
  }
});

export default router;
