const express = require('express');
const router = express.Router();
const db = require('../config/db');

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized.' });
  next();
};

// GET current semester internal marks
router.get('/internal-marks', requireAuth, async (req, res) => {
  try {
    const regNum = req.session.user.registerNumber;
    const [rows] = await db.query(
      `SELECT mi.subject_code, su.subject_name, mi.exam_type, mi.max_marks, mi.marks_obtained, mi.semester, mi.academic_year
       FROM marks_internal mi
       JOIN subjects su ON mi.subject_code = su.subject_code
       WHERE mi.register_number = ? AND mi.semester = (
         SELECT MAX(semester) FROM marks_internal WHERE register_number = ?
       )
       ORDER BY mi.subject_code, mi.exam_type`,
      [regNum, regNum]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET previous internal marks (all past semesters)
router.get('/previous-internal-marks', requireAuth, async (req, res) => {
  try {
    const regNum = req.session.user.registerNumber;
    const [rows] = await db.query(
      `SELECT mi.subject_code, su.subject_name, mi.exam_type, mi.max_marks, mi.marks_obtained, mi.semester, mi.academic_year
       FROM marks_internal mi
       JOIN subjects su ON mi.subject_code = su.subject_code
       WHERE mi.register_number = ? AND mi.semester < (
         SELECT MAX(semester) FROM marks_internal WHERE register_number = ?
       )
       ORDER BY mi.semester DESC, mi.subject_code, mi.exam_type`,
      [regNum, regNum]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET external/semester results
router.get('/semester-results', requireAuth, async (req, res) => {
  try {
    const regNum = req.session.user.registerNumber;
    const [rows] = await db.query(
      `SELECT me.subject_code, su.subject_name, su.credits, me.max_marks, me.marks_obtained,
              me.grade, me.grade_points, me.result, me.semester, me.academic_year
       FROM marks_external me
       JOIN subjects su ON me.subject_code = su.subject_code
       WHERE me.register_number = ?
       ORDER BY me.semester DESC, me.subject_code`,
      [regNum]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
