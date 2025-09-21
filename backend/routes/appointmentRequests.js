import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { query } from '../config/database.js';
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
      }))
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
