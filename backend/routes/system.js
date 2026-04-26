const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware for auth
const requireAuth = (req, res, next) => {
  if (!req.session.user && !req.session.admin) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.admin) return res.status(401).json({ success: false, message: 'Admin required' });
  next();
};

// ============================================
// SYSTEM SETTINGS
// ============================================
router.get('/settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM system_settings');
    const settings = {};
    rows.forEach(r => settings[r.setting_key] = (r.setting_value === 'true'));
    res.json({ success: true, data: settings });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error' });
  }
});

router.post('/settings', requireAdmin, async (req, res) => {
  const settings = req.body; // e.g. { hostel_booking_enabled: true, ... }
  try {
    for (const [key, val] of Object.entries(settings)) {
      await db.query('UPDATE system_settings SET setting_value=? WHERE setting_key=?', [val ? 'true' : 'false', key]);
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// ============================================
// EVENTS
// ============================================
router.get('/events', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY event_date DESC');
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/events', requireAdmin, async (req, res) => {
  const { title, description, event_date, venue, organizer } = req.body;
  try {
    await db.query('INSERT INTO events (title, description, event_date, venue, organizer) VALUES (?,?,?,?,?)', 
      [title, description, event_date, venue, organizer]);
    res.json({ success: true, message: 'Event added' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/events/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM events WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Event deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ============================================
// SAP POINTS 
// ============================================
router.get('/sap', requireAuth, async (req, res) => {
  try {
    let query = 'SELECT * FROM sap_points';
    let params = [];
    if (req.session.user) {
      query += ' WHERE register_number = ?';
      params.push(req.session.user.registerNumber);
    }
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/sap', requireAuth, async (req, res) => {
  const { register_number, activity_name, activity_type, points, approved } = req.body;
  try {
    await db.query('INSERT INTO sap_points (register_number, activity_name, activity_type, points, approved) VALUES (?,?,?,?,?)',
      [register_number, activity_name, activity_type, points, approved || 0]);
    res.json({ success: true, message: 'SAP entry added' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/sap/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM sap_points WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'SAP entry deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ============================================
// FEEDBACK
// ============================================
router.get('/feedback', requireAuth, async (req, res) => {
  try {
    let query = 'SELECT * FROM feedbacks ORDER BY submitted_at DESC';
    let params = [];
    if (req.session.user) {
      query = 'SELECT * FROM feedbacks WHERE register_number = ? ORDER BY submitted_at DESC';
      params.push(req.session.user.registerNumber);
    }
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/feedback', requireAuth, async (req, res) => {
  const { subject, message, category } = req.body;
  const regNum = req.session.user ? req.session.user.registerNumber : req.body.register_number;
  try {
    await db.query('INSERT INTO feedbacks (register_number, subject, message, category) VALUES (?,?,?,?)',
      [regNum, subject, message, category]);
    res.json({ success: true, message: 'Feedback submitted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/feedback/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM feedbacks WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
