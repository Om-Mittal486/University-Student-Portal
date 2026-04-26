const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  next();
};

// GET Student Profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const regNum = req.session.user.registerNumber;
    const [rows] = await db.query(
      `SELECT register_number, full_name, institution, semester, program, section,
              specialization, dob, gender, phone, email, father_name, mother_name, blood_group, address
       FROM students WHERE register_number = ?`,
      [regNum]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
