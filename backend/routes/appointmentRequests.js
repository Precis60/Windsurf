import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { query } from '../config/database.js';
import { sendMail } from '../utils/mailer.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List appointment requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT ar.id, ar.title, ar.description, ar.requested_date, ar.duration_minutes,
             ar.status, ar.address, ar.address_place_id, ar.address_lat, ar.address_lng, ar.address_components,
             ar.notes, ar.created_at, ar.updated_at,
             u.first_name, u.last_name, u.email, u.company
      FROM appointment_requests ar
      JOIN users u ON ar.customer_id = u.id
    `;

    const params = [];
    const conditions = [];
    let p = 0;

    if (req.user.role === 'customer') {
      p++; conditions.push(`ar.customer_id = $${p}`); params.push(req.user.id);
    }
    if (status) {
      p++; conditions.push(`ar.status = $${p}`); params.push(status);
    }
    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;

    sql += ` ORDER BY ar.created_at DESC LIMIT $${p + 1} OFFSET $${p + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Count total for pagination
    let countQuery = 'SELECT COUNT(*) FROM appointment_requests ar';
    const countParams = [];
    let cp = 0;
    const countConds = [];
    if (req.user.role === 'customer') {
      cp++; countConds.push(`ar.customer_id = $${cp}`); countParams.push(req.user.id);
    }
    if (status) {
      cp++; countConds.push(`ar.status = $${cp}`); countParams.push(status);
    }
    if (countConds.length) countQuery += ` WHERE ${countConds.join(' AND ')}`;
    const countResult = await query(countQuery, countParams);
    const totalRequests = parseInt(countResult.rows[0].count);

    res.json({
      requests: result.rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        requestedDate: r.requested_date,
        durationMinutes: r.duration_minutes,
        status: r.status,
        address: r.address,
        addressPlaceId: r.address_place_id,
        addressLat: r.address_lat,
        addressLng: r.address_lng,
        addressComponents: r.address_components,
        notes: r.notes,
        customer: { firstName: r.first_name, lastName: r.last_name, email: r.email, company: r.company },
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRequests / limit),
        totalRequests,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('List appointment requests error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch appointment requests' } });
  }
});

// Create appointment request (customers and staff on behalf of)
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('requestedDate').isISO8601().withMessage('Valid requested date is required'),
  body('durationMinutes').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('customerId').optional().isInt(),
  body('address').optional().isString(),
  body('addressPlaceId').optional().isString(),
  body('addressLat').optional().isFloat(),
  body('addressLng').optional().isFloat(),
  body('addressComponents').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
    }

    const { title, description, requestedDate, durationMinutes, customerId, address, addressPlaceId, addressLat, addressLng, addressComponents } = req.body;

    let finalCustomerId;
    if (req.user.role === 'customer') finalCustomerId = req.user.id; else finalCustomerId = customerId;
    if (!finalCustomerId) return res.status(400).json({ error: { message: 'Customer ID is required' } });

    const result = await query(`
      INSERT INTO appointment_requests (
        customer_id, title, description, requested_date, duration_minutes,
        address, address_place_id, address_lat, address_lng, address_components
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
      RETURNING id, title, description, requested_date, duration_minutes, status, address, address_place_id, address_lat, address_lng, address_components, created_at
    `, [finalCustomerId, title, description || null, requestedDate, durationMinutes, address || null, addressPlaceId || null, addressLat ?? null, addressLng ?? null, addressComponents ? JSON.stringify(addressComponents) : null]);

    const r = result.rows[0];

    // Notify admin/staff (if mail configured)
    try {
      await sendMail({
        to: process.env.NOTIFY_ADMIN_EMAIL || process.env.SMTP_USER,
        subject: `New Appointment Request: ${r.title}`,
        text: `A new appointment request has been submitted.\nTitle: ${r.title}\nWhen: ${r.requested_date}\nDuration: ${r.duration_minutes} minutes`,
      });
    } catch (e) {
      console.warn('Email notification skipped/failed:', e?.message);
    }
    res.status(201).json({
      message: 'Appointment request submitted',
      request: {
        id: r.id,
        title: r.title,
        description: r.description,
        requestedDate: r.requested_date,
        durationMinutes: r.duration_minutes,
        status: r.status,
        address: r.address,
        addressPlaceId: r.address_place_id,
        addressLat: r.address_lat,
        addressLng: r.address_lng,
        addressComponents: r.address_components,
        createdAt: r.created_at,
      }
    });
  } catch (err) {
    console.error('Create appointment request error:', err);
    res.status(500).json({ error: { message: 'Failed to submit appointment request' } });
  }
});

export default router;

// Update (moderate) appointment request - staff/admin only
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), [
  param('id').isInt().withMessage('Invalid request ID'),
  body('status').isIn(['pending', 'approved', 'declined']).withMessage('Invalid status'),
  body('createAppointment').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
    }

    const requestId = req.params.id;
    const { status, createAppointment = false } = req.body;

    // Load request
    const reqResult = await query(
      `SELECT * FROM appointment_requests WHERE id = $1`,
      [requestId]
    );
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Appointment request not found' } });
    }
    const ar = reqResult.rows[0];

    let createdAppointment = null;

    if (status === 'approved' && createAppointment) {
      // Create a real appointment from the request
      const apptInsert = await query(
        `INSERT INTO appointments (
          customer_id, title, description, appointment_date, duration_minutes,
          status, notes, created_at, updated_at,
          address, address_place_id, address_lat, address_lng, address_components
        ) VALUES ($1,$2,$3,$4,$5,'scheduled',NULL,NOW(),NOW(),$6,$7,$8,$9,$10)
        RETURNING id, customer_id, title, appointment_date, duration_minutes, status
        `,
        [
          ar.customer_id,
          ar.title,
          ar.description,
          ar.requested_date,
          ar.duration_minutes,
          ar.address,
          ar.address_place_id,
          ar.address_lat,
          ar.address_lng,
          ar.address_components,
        ]
      );
      createdAppointment = apptInsert.rows[0];
    }

    // Update request status
    const upd = await query(
      `UPDATE appointment_requests SET status = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, requestId]
    );

    res.json({
      message: 'Appointment request updated',
      request: upd.rows[0],
      ...(createdAppointment && { appointment: createdAppointment })
    });

    // Notify customer on decision (if mail configured)
    try {
      // Get customer email
      const cust = await query('SELECT email, first_name FROM users WHERE id = $1', [ar.customer_id]);
      const email = cust.rows[0]?.email;
      if (email) {
        await sendMail({
          to: email,
          subject: `Your Appointment Request has been ${status}`,
          text: `Hello ${cust.rows[0]?.first_name || ''},\nYour appointment request "${ar.title}" has been ${status}.` + (createdAppointment ? `\nWe have scheduled it on ${createdAppointment.appointment_date}.` : ''),
        });
      }
    } catch (e) {
      console.warn('Email notification skipped/failed:', e?.message);
    }
  } catch (err) {
    console.error('Moderate appointment request error:', err);
    res.status(500).json({ error: { message: 'Failed to update appointment request' } });
  }
});
