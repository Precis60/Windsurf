import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT a.id, a.title, a.description, a.appointment_date, a.duration_minutes,
             a.status, a.notes, a.created_at, a.updated_at,
             u.first_name, u.last_name, u.email, u.phone, u.company
      FROM appointments a
      JOIN users u ON a.customer_id = u.id
    `;
    
    const queryParams = [];
    const conditions = [];
    let paramCount = 0;

    // Filter by customer if regular user
    if (req.user.role === 'customer') {
      paramCount++;
      conditions.push(`a.customer_id = $${paramCount}`);
      queryParams.push(req.user.id);
    }

    if (status) {
      paramCount++;
      conditions.push(`a.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (date_from) {
      paramCount++;
      conditions.push(`a.appointment_date >= $${paramCount}`);
      queryParams.push(date_from);
    }

    if (date_to) {
      paramCount++;
      conditions.push(`a.appointment_date <= $${paramCount}`);
      queryParams.push(date_to);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY a.appointment_date ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM appointments a';
    const countParams = [];
    let countParamCount = 0;

    if (req.user.role === 'customer') {
      countQuery += ' WHERE a.customer_id = $1';
      countParams.push(req.user.id);
      countParamCount = 1;
    }

    if (status) {
      countParamCount++;
      countQuery += req.user.role === 'customer' ? ' AND' : ' WHERE';
      countQuery += ` a.status = $${countParamCount}`;
      countParams.push(status);
    }

    const countResult = await query(countQuery, countParams);
    const totalAppointments = parseInt(countResult.rows[0].count);

    res.json({
      appointments: result.rows.map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        appointmentDate: appointment.appointment_date,
        durationMinutes: appointment.duration_minutes,
        status: appointment.status,
        notes: appointment.notes,
        customer: {
          firstName: appointment.first_name,
          lastName: appointment.last_name,
          email: appointment.email,
          phone: appointment.phone,
          company: appointment.company
        },
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalAppointments / limit),
        totalAppointments,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch appointments' } 
    });
  }
});

// Create new appointment
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('durationMinutes').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('customerId').optional().isInt().withMessage('Invalid customer ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const { title, description, appointmentDate, durationMinutes, customerId } = req.body;
    
    // Determine customer ID
    let finalCustomerId;
    
    if (req.user.role === 'customer') {
      // If user is a customer, use their ID
      finalCustomerId = req.user.id;
    } else if (customerId) {
      // If admin/staff provided a customerId, use it
      finalCustomerId = customerId;
    } else {
      // For admin/staff without customerId, create appointment without customer link
      finalCustomerId = null;
    }

    // Check if customer exists (only if customerId is provided)
    if (finalCustomerId) {
      const customerCheck = await query(
        'SELECT id FROM users WHERE id = $1 AND role = \'customer\'',
        [finalCustomerId]
      );

      if (customerCheck.rows.length === 0) {
        return res.status(404).json({ 
          error: { message: 'Customer not found' } 
        });
      }
    }

    // Check for conflicting appointments
    const conflictCheck = await query(
      `SELECT id FROM appointments 
       WHERE appointment_date < ($1::timestamp + INTERVAL '${durationMinutes} minutes')
       AND (appointment_date + INTERVAL '1 minute' * duration_minutes) > $1::timestamp
       AND status NOT IN ('cancelled', 'completed')`,
      [appointmentDate]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: { message: 'Time slot conflicts with existing appointment' } 
      });
    }

    const result = await query(
      `INSERT INTO appointments (customer_id, title, description, appointment_date, duration_minutes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, appointment_date, duration_minutes, status, created_at`,
      [finalCustomerId, title, description, appointmentDate, durationMinutes]
    );

    const appointment = result.rows[0];

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: {
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        appointmentDate: appointment.appointment_date,
        durationMinutes: appointment.duration_minutes,
        status: appointment.status,
        createdAt: appointment.created_at
      }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to create appointment' } 
    });
  }
});

// Get single appointment
router.get('/:id', authenticateToken, [
  param('id').isInt().withMessage('Invalid appointment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const appointmentId = req.params.id;
    
    let queryText = `
      SELECT a.id, a.title, a.description, a.appointment_date, a.duration_minutes,
             a.status, a.notes, a.created_at, a.updated_at,
             u.first_name, u.last_name, u.email, u.phone, u.company
      FROM appointments a
      JOIN users u ON a.customer_id = u.id
      WHERE a.id = $1
    `;
    
    const queryParams = [appointmentId];

    // Customers can only see their own appointments
    if (req.user.role === 'customer') {
      queryText += ' AND a.customer_id = $2';
      queryParams.push(req.user.id);
    }

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Appointment not found' } 
      });
    }

    const appointment = result.rows[0];
    res.json({
      appointment: {
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        appointmentDate: appointment.appointment_date,
        durationMinutes: appointment.duration_minutes,
        status: appointment.status,
        notes: appointment.notes,
        customer: {
          firstName: appointment.first_name,
          lastName: appointment.last_name,
          email: appointment.email,
          phone: appointment.phone,
          company: appointment.company
        },
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      }
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch appointment' } 
    });
  }
});

// Update appointment
router.put('/:id', authenticateToken, [
  param('id').isInt().withMessage('Invalid appointment ID'),
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('appointmentDate').optional().isISO8601().withMessage('Valid appointment date is required'),
  body('durationMinutes').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const appointmentId = req.params.id;
    const { title, description, appointmentDate, durationMinutes, status, notes } = req.body;

    // Check if appointment exists and user has permission
    let checkQuery = 'SELECT customer_id FROM appointments WHERE id = $1';
    const checkParams = [appointmentId];

    if (req.user.role === 'customer') {
      checkQuery += ' AND customer_id = $2';
      checkParams.push(req.user.id);
    }

    const appointmentCheck = await query(checkQuery, checkParams);

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Appointment not found' } 
      });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (title !== undefined) {
      paramCount++;
      updateFields.push(`title = $${paramCount}`);
      updateValues.push(title);
    }
    
    if (description !== undefined) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
    }
    
    if (appointmentDate !== undefined) {
      paramCount++;
      updateFields.push(`appointment_date = $${paramCount}`);
      updateValues.push(appointmentDate);
    }
    
    if (durationMinutes !== undefined) {
      paramCount++;
      updateFields.push(`duration_minutes = $${paramCount}`);
      updateValues.push(durationMinutes);
    }
    
    if (status !== undefined) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(status);
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
    updateValues.push(appointmentId);

    const result = await query(
      `UPDATE appointments SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, title, description, appointment_date, duration_minutes, status, notes, updated_at`,
      updateValues
    );

    const appointment = result.rows[0];
    res.json({
      message: 'Appointment updated successfully',
      appointment: {
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        appointmentDate: appointment.appointment_date,
        durationMinutes: appointment.duration_minutes,
        status: appointment.status,
        notes: appointment.notes,
        updatedAt: appointment.updated_at
      }
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to update appointment' } 
    });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, [
  param('id').isInt().withMessage('Invalid appointment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { message: 'Validation failed', details: errors.array() } 
      });
    }

    const appointmentId = req.params.id;

    let deleteQuery = 'DELETE FROM appointments WHERE id = $1';
    const deleteParams = [appointmentId];

    // Customers can only delete their own appointments
    if (req.user.role === 'customer') {
      deleteQuery += ' AND customer_id = $2';
      deleteParams.push(req.user.id);
    }

    deleteQuery += ' RETURNING id';

    const result = await query(deleteQuery, deleteParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: { message: 'Appointment not found' } 
      });
    }

    res.json({ message: 'Appointment deleted successfully' });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to delete appointment' } 
    });
  }
});

export default router;
