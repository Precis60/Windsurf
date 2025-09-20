import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all support tickets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT s.id, s.subject, s.description, s.status, s.priority, s.category,
             s.created_at, s.updated_at, s.resolved_at,
             u.first_name, u.last_name, u.email, u.company
      FROM support_tickets s
      JOIN users u ON s.customer_id = u.id
    `;
    
    const queryParams = [];
    const conditions = [];
    let paramCount = 0;

    // Filter by customer if regular user
    if (req.user.role === 'customer') {
      paramCount++;
      conditions.push(`s.customer_id = $${paramCount}`);
      queryParams.push(req.user.id);
    }

    if (status) {
      paramCount++;
      conditions.push(`s.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (priority) {
      paramCount++;
      conditions.push(`s.priority = $${paramCount}`);
      queryParams.push(priority);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY s.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM support_tickets s';
    const countParams = [];
    let countParamCount = 0;

    if (req.user.role === 'customer') {
      countQuery += ' WHERE s.customer_id = $1';
      countParams.push(req.user.id);
      countParamCount = 1;
    }

    if (status) {
      countParamCount++;
      countQuery += req.user.role === 'customer' ? ' AND' : ' WHERE';
      countQuery += ` s.status = $${countParamCount}`;
      countParams.push(status);
    }

    const countResult = await query(countQuery, countParams);
    const totalTickets = parseInt(countResult.rows[0].count);

    res.json({
      tickets: result.rows.map(ticket => ({
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        customer: {
          firstName: ticket.first_name,
          lastName: ticket.last_name,
          email: ticket.email,
          company: ticket.company
        },
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        resolvedAt: ticket.resolved_at
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTickets / limit),
        totalTickets,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch support tickets' } 
    });
  }
});

// Create new support ticket
router.post('/', authenticateToken, [
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('category').optional().isIn(['technical', 'billing', 'general', 'feature_request']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { subject, description, priority = 'medium', category = 'general' } = req.body;
    
    // Use authenticated user as customer
    const customerId = req.user.role === 'customer' ? req.user.id : req.body.customerId;

    if (!customerId) {
      return res.status(400).json({ 
        error: { message: 'Customer ID is required' } 
      });
    }

    const result = await query(
      `INSERT INTO support_tickets (customer_id, subject, description, priority, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, subject, description, status, priority, category, created_at`,
      [customerId, subject, description, priority, category]
    );

    const ticket = result.rows[0];

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        createdAt: ticket.created_at
      }
    });

  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to create support ticket' } 
    });
  }
});

// Get single support ticket
router.get('/:id', authenticateToken, [
  param('id').isInt().withMessage('Invalid ticket ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const ticketId = req.params.id;
    
    let queryText = `
      SELECT s.id, s.subject, s.description, s.status, s.priority, s.category,
             s.notes, s.created_at, s.updated_at, s.resolved_at,
             u.first_name, u.last_name, u.email, u.phone, u.company
      FROM support_tickets s
      JOIN users u ON s.customer_id = u.id
      WHERE s.id = $1
    `;
    
    const queryParams = [ticketId];

    // Customers can only see their own tickets
    if (req.user.role === 'customer') {
      queryText += ' AND s.customer_id = $2';
      queryParams.push(req.user.id);
    }

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Support ticket not found' } 
      });
    }

    const ticket = result.rows[0];

    // Get ticket responses
    const responsesResult = await query(
      `SELECT id, message, created_by_staff, created_at, staff_name
       FROM support_responses 
       WHERE ticket_id = $1 
       ORDER BY created_at ASC`,
      [ticketId]
    );

    res.json({
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        notes: ticket.notes,
        customer: {
          firstName: ticket.first_name,
          lastName: ticket.last_name,
          email: ticket.email,
          phone: ticket.phone,
          company: ticket.company
        },
        responses: responsesResult.rows.map(response => ({
          id: response.id,
          message: response.message,
          createdByStaff: response.created_by_staff,
          staffName: response.staff_name,
          createdAt: response.created_at
        })),
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        resolvedAt: ticket.resolved_at
      }
    });

  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch support ticket' } 
    });
  }
});

// Add response to support ticket
router.post('/:id/responses', authenticateToken, [
  param('id').isInt().withMessage('Invalid ticket ID'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const ticketId = req.params.id;
    const { message } = req.body;

    // Check if ticket exists and user has permission
    let checkQuery = 'SELECT customer_id, status FROM support_tickets WHERE id = $1';
    const checkParams = [ticketId];

    if (req.user.role === 'customer') {
      checkQuery += ' AND customer_id = $2';
      checkParams.push(req.user.id);
    }

    const ticketCheck = await query(checkQuery, checkParams);

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Support ticket not found' } 
      });
    }

    const ticket = ticketCheck.rows[0];

    if (ticket.status === 'closed') {
      return res.status(400).json({ 
        error: { message: 'Cannot add response to closed ticket' } 
      });
    }

    // Add response
    const isStaff = req.user.role === 'admin' || req.user.role === 'staff';
    const staffName = isStaff ? `${req.user.firstName} ${req.user.lastName}` : null;

    const result = await query(
      `INSERT INTO support_responses (ticket_id, message, created_by_staff, staff_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, message, created_by_staff, staff_name, created_at`,
      [ticketId, message, isStaff, staffName]
    );

    // Update ticket status and timestamp
    const newStatus = isStaff ? 'in_progress' : 'open';
    await query(
      'UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2',
      [newStatus, ticketId]
    );

    const response = result.rows[0];

    res.status(201).json({
      message: 'Response added successfully',
      response: {
        id: response.id,
        message: response.message,
        createdByStaff: response.created_by_staff,
        staffName: response.staff_name,
        createdAt: response.created_at
      }
    });

  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to add response' } 
    });
  }
});

// Update support ticket (staff/admin only)
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), [
  param('id').isInt().withMessage('Invalid ticket ID'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const ticketId = req.params.id;
    const { status, priority, notes } = req.body;

    // Check if ticket exists
    const ticketCheck = await query('SELECT id FROM support_tickets WHERE id = $1', [ticketId]);

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Support ticket not found' } 
      });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (status !== undefined) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(status);
      
      // Set resolved_at if status is resolved or closed
      if (status === 'resolved' || status === 'closed') {
        paramCount++;
        updateFields.push(`resolved_at = $${paramCount}`);
        updateValues.push(new Date());
      }
    }
    
    if (priority !== undefined) {
      paramCount++;
      updateFields.push(`priority = $${paramCount}`);
      updateValues.push(priority);
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
    updateValues.push(ticketId);

    const result = await query(
      `UPDATE support_tickets SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, subject, status, priority, notes, updated_at, resolved_at`,
      updateValues
    );

    const ticket = result.rows[0];
    res.json({
      message: 'Support ticket updated successfully',
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        notes: ticket.notes,
        updatedAt: ticket.updated_at,
        resolvedAt: ticket.resolved_at
      }
    });

  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to update support ticket' } 
    });
  }
});

export default router;
