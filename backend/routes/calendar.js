import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// Minimal customers list for calendar (admin/staff only)
router.get('/customers', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { search = '' } = req.query;
    let sql = `
      SELECT id, first_name, last_name, company
      FROM users
      WHERE role = 'customer' AND is_active = true
    `;
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (first_name ILIKE $1 OR last_name ILIKE $1 OR company ILIKE $1)`;
    }
    sql += ' ORDER BY last_name ASC, first_name ASC LIMIT 500';

    const result = await query(sql, params);
    res.json({
      customers: result.rows.map(r => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        company: r.company || ''
      }))
    });
  } catch (err) {
    console.error('Calendar customers error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch calendar customers' } });
  }
});

export default router;
