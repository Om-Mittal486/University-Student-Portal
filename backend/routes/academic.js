const express = require('express');
const router = express.Router();
const db = require('../config/db');

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized.' });
  next();
};

// GET subjects for student (mapped by program and semester)
router.get('/subjects', requireAuth, async (req, res) => {
  try {
    const { program, semester } = req.session.user;
    const [rows] = await db.query(
      `SELECT subject_code, subject_name, credits, type, semester, program
       FROM subjects
       WHERE program = ? AND semester = ?
       ORDER BY type, subject_code`,
      [program, semester]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET timetable
router.get('/timetable', requireAuth, async (req, res) => {
  try {
    const regNum = req.session.user.registerNumber;
    const [rows] = await db.query(
      `SELECT t.day_of_week, t.period_number, t.start_time, t.end_time, t.subject_code, su.subject_name, t.room_number
       FROM timetable t
       LEFT JOIN subjects su ON t.subject_code = su.subject_code
       WHERE t.register_number = ?
       ORDER BY FIELD(t.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), t.period_number`,
      [regNum]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET attendance details
router.get('/attendance', requireAuth, async (req, res) => {
  try {
    const regNum = req.session.user.registerNumber;
    const [rows] = await db.query(
      `SELECT a.subject_code, su.subject_name, su.type, a.total_classes, a.attended_classes,
              a.od_classes, a.ml_classes, a.percentage
       FROM attendance a
       JOIN subjects su ON a.subject_code = su.subject_code
       WHERE a.register_number = ?
       ORDER BY a.subject_code`,
      [regNum]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET OD/ML details
router.get('/od-ml', requireAuth, async (req, res) => {
  try {
    const regNum = req.session.user.registerNumber;
    const [rows] = await db.query(
      `SELECT id, leave_type, from_date, to_date, reason, status, approved_by, submitted_at
       FROM od_ml
       WHERE register_number = ?
       ORDER BY submitted_at DESC`,
      [regNum]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
