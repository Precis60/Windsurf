import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer_id } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT p.id, p.name, p.description, p.status, p.budget, p.start_date, 
             p.end_date, p.created_at, p.updated_at,
             u.first_name, u.last_name, u.email, u.company
      FROM projects p
      JOIN users u ON p.customer_id = u.id
    `;
    
    const queryParams = [];
    const conditions = [];
    let paramCount = 0;

    // Filter by customer if regular user
    if (req.user.role === 'customer') {
      paramCount++;
      conditions.push(`p.customer_id = $${paramCount}`);
      queryParams.push(req.user.id);
    } else if (customer_id) {
      paramCount++;
      conditions.push(`p.customer_id = $${paramCount}`);
      queryParams.push(customer_id);
    }

    if (status) {
      paramCount++;
      conditions.push(`p.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM projects p';
    const countParams = [];
    let countParamCount = 0;

    if (req.user.role === 'customer') {
      countQuery += ' WHERE p.customer_id = $1';
      countParams.push(req.user.id);
      countParamCount = 1;
    } else if (customer_id) {
      countQuery += ' WHERE p.customer_id = $1';
      countParams.push(customer_id);
      countParamCount = 1;
    }

    if (status) {
      countParamCount++;
      countQuery += (countParamCount === 1) ? ' WHERE' : ' AND';
      countQuery += ` p.status = $${countParamCount}`;
      countParams.push(status);
    }

    const countResult = await query(countQuery, countParams);
    const totalProjects = parseInt(countResult.rows[0].count);

    res.json({
      projects: result.rows.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget,
        startDate: project.start_date,
        endDate: project.end_date,
        customer: {
          firstName: project.first_name,
          lastName: project.last_name,
          email: project.email,
          company: project.company
        },
        createdAt: project.created_at,
        updatedAt: project.updated_at
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProjects / limit),
        totalProjects,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch projects' } 
    });
  }
});

// Create new project (staff/admin only)
router.post('/', authenticateToken, requireRole(['admin', 'staff']), [
  body('name').trim().isLength({ min: 1 }).withMessage('Project name is required'),
  body('description').optional().trim(),
  body('customerId').isInt().withMessage('Valid customer ID is required'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { name, description, customerId, budget, startDate, endDate } = req.body;

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

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ 
        error: { message: 'Start date cannot be after end date' } 
      });
    }

    const result = await query(
      `INSERT INTO projects (customer_id, name, description, budget, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, status, budget, start_date, end_date, created_at`,
      [customerId, name, description, budget, startDate, endDate]
    );

    const project = result.rows[0];

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget,
        startDate: project.start_date,
        endDate: project.end_date,
        createdAt: project.created_at
      }
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to create project' } 
    });
  }
});

// Get single project
router.get('/:id', authenticateToken, [
  param('id').isInt().withMessage('Invalid project ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const projectId = req.params.id;
    
    let queryText = `
      SELECT p.id, p.name, p.description, p.status, p.budget, p.start_date, 
             p.end_date, p.notes, p.created_at, p.updated_at,
             u.first_name, u.last_name, u.email, u.phone, u.company
      FROM projects p
      JOIN users u ON p.customer_id = u.id
      WHERE p.id = $1
    `;
    
    const queryParams = [projectId];

    // Customers can only see their own projects
    if (req.user.role === 'customer') {
      queryText += ' AND p.customer_id = $2';
      queryParams.push(req.user.id);
    }

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Project not found' } 
      });
    }

    const project = result.rows[0];
    res.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget,
        startDate: project.start_date,
        endDate: project.end_date,
        notes: project.notes,
        customer: {
          firstName: project.first_name,
          lastName: project.last_name,
          email: project.email,
          phone: project.phone,
          company: project.company
        },
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch project' } 
    });
  }
});

// Update project
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), [
  param('id').isInt().withMessage('Invalid project ID'),
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Project name cannot be empty'),
  body('description').optional().trim(),
  body('status').optional().isIn(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const projectId = req.params.id;
    const { name, description, status, budget, startDate, endDate, notes } = req.body;

    // Check if project exists
    const projectCheck = await query('SELECT id FROM projects WHERE id = $1', [projectId]);

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Project not found' } 
      });
    }

    // Validate date range if both dates are provided
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ 
        error: { message: 'Start date cannot be after end date' } 
      });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
    }
    
    if (description !== undefined) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
    }
    
    if (status !== undefined) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(status);
    }
    
    if (budget !== undefined) {
      paramCount++;
      updateFields.push(`budget = $${paramCount}`);
      updateValues.push(budget);
    }
    
    if (startDate !== undefined) {
      paramCount++;
      updateFields.push(`start_date = $${paramCount}`);
      updateValues.push(startDate);
    }
    
    if (endDate !== undefined) {
      paramCount++;
      updateFields.push(`end_date = $${paramCount}`);
      updateValues.push(endDate);
    }
    
    if (notes !== undefined) {
      paramCount++;
      updateFields.push(`notes = $${paramCount}`);
      updateValues.push(notes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: { message: 'No fields provided for update' } 
      });
    }

    paramCount++;
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(projectId);

    const result = await query(
      `UPDATE projects SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, name, description, status, budget, start_date, end_date, notes, updated_at`,
      updateValues
    );

    const project = result.rows[0];
    res.json({
      message: 'Project updated successfully',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget,
        startDate: project.start_date,
        endDate: project.end_date,
        notes: project.notes,
        updatedAt: project.updated_at
      }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to update project' } 
    });
  }
});

// Delete project (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), [
  param('id').isInt().withMessage('Invalid project ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const projectId = req.params.id;

    const result = await query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Project not found' } 
      });
    }

    res.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to delete project' } 
    });
  }
});

export default router;
