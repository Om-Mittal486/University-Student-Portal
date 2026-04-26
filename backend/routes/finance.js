const express = require('express');
const router = express.Router();
const db = require('../config/db');

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized.' });
  next();
};

// GET fee details (paid + pending)
router.get('/fees', requireAuth, async (req, res) => {
  try {
    const regNum = req.session.user.registerNumber;
    const [rows] = await db.query(
      `SELECT id, fee_type, amount, due_date, paid_date, status, transaction_id, payment_mode, academic_year
       FROM fees WHERE register_number = ? ORDER BY due_date DESC`,
      [regNum]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET announcements
router.get('/announcements', requireAuth, async (req, res) => {
  try {
    const { registerNumber, semester, program } = req.session.user;
    const [rows] = await db.query(
      `SELECT * FROM announcements 
       WHERE target_type = 'all' 
       OR (target_type = 'individual' AND target_register = ?)
       OR (target_type = 'group' AND (target_semester = ? OR target_semester IS NULL) AND (target_program = ? OR target_program IS NULL))
       ORDER BY is_important DESC, posted_at DESC`,
      [registerNumber, semester, program]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET hostel details
router.get('/hostel', requireAuth, async (req, res) => {
  try {
    const regNum = req.session.user.registerNumber;
    const [rows] = await db.query(
      `SELECT * FROM hostel WHERE register_number = ?`,
      [regNum]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET transport details
router.get('/transport', requireAuth, async (req, res) => {
  try {
    const regNum = req.session.user.registerNumber;
    const [rows] = await db.query(
      `SELECT * FROM transport WHERE register_number = ?`,
      [regNum]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
