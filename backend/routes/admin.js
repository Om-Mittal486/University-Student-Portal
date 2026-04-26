const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// ─── Admin Auth Middleware ───────────────────────────────
const requireAdmin = (req, res, next) => {
  if (!req.session.admin) return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  next();
};

// ─── Admin Login ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required.' });

  // Demo hard-coded admin (works without DB admin_users table)
  const DEMO_ADMINS = {
    'admin':      { password: 'admin@srmap2024', full_name: 'System Administrator',  role: 'superadmin' },
    'registrar':  { password: 'registrar@2024',  full_name: 'Academic Registrar',     role: 'registrar'  },
  };

  const demo = DEMO_ADMINS[username];
  if (demo && demo.password === password) {
    req.session.admin = { username, fullName: demo.full_name, role: demo.role };
    return res.json({ success: true, admin: req.session.admin });
  }

  // Try DB lookup
  try {
    const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ? AND is_active = 1', [username]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [rows[0].id]);
    req.session.admin = { username: rows[0].username, fullName: rows[0].full_name, role: rows[0].role };
    res.json({ success: true, admin: req.session.admin });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.admin = null;
  res.json({ success: true });
});

router.get('/session', (req, res) => {
  if (req.session.admin) res.json({ loggedIn: true, admin: req.session.admin });
  else res.json({ loggedIn: false });
});

// ─── DASHBOARD STATS ─────────────────────────────────────
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [[{ total_students }]] = await db.query('SELECT COUNT(*) AS total_students FROM students');
    const [[{ total_announcements }]] = await db.query('SELECT COUNT(*) AS total_announcements FROM announcements');
    const [[{ pending_fees }]] = await db.query('SELECT COUNT(*) AS pending_fees FROM fees WHERE status="Pending"');
    const [[{ total_subjects }]] = await db.query('SELECT COUNT(*) AS total_subjects FROM subjects');
    res.json({ success: true, data: { total_students, total_announcements, pending_fees, total_subjects } });
  } catch (e) {
    res.json({ success: true, data: { total_students: 5, total_announcements: 5, pending_fees: 2, total_subjects: 13 } });
  }
});

// ─── STUDENT CRUD ─────────────────────────────────────────
router.get('/students', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students ORDER BY register_number');
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error.' });
  }
});

router.get('/students/:regNum', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students WHERE register_number = ?', [req.params.regNum]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error.' });
  }
});

router.put('/students/:regNum', requireAdmin, async (req, res) => {
  const { full_name, institution, semester, program, section, specialization, dob, gender, phone, email, father_name, mother_name, blood_group, address } = req.body;
  try {
    await db.query(
      `UPDATE students SET full_name=?, institution=?, semester=?, program=?, section=?, specialization=?,
       dob=?, gender=?, phone=?, email=?, father_name=?, mother_name=?, blood_group=?, address=?
       WHERE register_number=?`,
      [full_name, institution, semester, program, section, specialization, dob, gender, phone, email, father_name, mother_name, blood_group, address, req.params.regNum]
    );
    res.json({ success: true, message: 'Student updated.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

router.post('/students', requireAdmin, async (req, res) => {
  const { register_number, full_name, institution, semester, program, section, specialization, dob, gender, phone, email, father_name, mother_name, blood_group } = req.body;
  try {
    await db.query(
      `INSERT INTO students (register_number, full_name, institution, semester, program, section, specialization, dob, gender, phone, email, father_name, mother_name, blood_group)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [register_number, full_name, institution, semester, program, section, specialization, dob, gender, phone, email, father_name, mother_name, blood_group]
    );
    // Create login with default password = DOB DDMMYYYY
    const d = new Date(dob);
    const plain = `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}${d.getFullYear()}`;
    const hash = await bcrypt.hash(plain, 10);
    await db.query('INSERT INTO login_credentials (register_number, password_hash) VALUES (?,?)', [register_number, hash]);
    res.json({ success: true, message: 'Student added.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/students/bulk-upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (let row of results) {
          const { register_number, full_name, dob, gender, phone, email, program, semester } = row;
          if (!register_number || !full_name) continue;
          await db.query(
            `INSERT IGNORE INTO students (register_number, full_name, dob, gender, phone, email, program, semester)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [register_number, full_name, dob || null, gender || null, phone || null, email || null, program || null, semester || null]
          );
          // Auto create login credentials
          if (dob) {
            const d = new Date(dob);
            if (!isNaN(d.valueOf())) {
              const plain = `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}${d.getFullYear()}`;
              const hash = await bcrypt.hash(plain, 10);
              await db.query('INSERT IGNORE INTO login_credentials (register_number, password_hash) VALUES (?,?)', [register_number, hash]);
            }
          }
        }
        res.json({ success: true, message: `Successfully processed ${results.length} records.` });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      } finally {
        fs.unlinkSync(req.file.path); // remove temp file
      }
    });
});

router.delete('/students/:regNum', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM students WHERE register_number = ?', [req.params.regNum]);
    res.json({ success: true, message: 'Student deleted.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
});

// ─── ATTENDANCE CRUD ──────────────────────────────────────
router.get('/attendance/:regNum', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, su.subject_name FROM attendance a JOIN subjects su ON a.subject_code=su.subject_code WHERE a.register_number=?`,
      [req.params.regNum]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error.' });
  }
});

router.put('/attendance/:id', requireAdmin, async (req, res) => {
  const { total_classes, attended_classes, od_classes, ml_classes } = req.body;
  try {
    await db.query('UPDATE attendance SET total_classes=?, attended_classes=?, od_classes=?, ml_classes=? WHERE id=?',
      [total_classes, attended_classes, od_classes, ml_classes, req.params.id]);
    res.json({ success: true, message: 'Attendance updated.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

// ─── MARKS CRUD ───────────────────────────────────────────
router.get('/marks/internal/:regNum', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT mi.*, su.subject_name FROM marks_internal mi JOIN subjects su ON mi.subject_code=su.subject_code WHERE mi.register_number=? ORDER BY mi.semester DESC`,
      [req.params.regNum]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error.' });
  }
});

router.put('/marks/internal/:id', requireAdmin, async (req, res) => {
  const { marks_obtained, max_marks } = req.body;
  try {
    await db.query('UPDATE marks_internal SET marks_obtained=?, max_marks=? WHERE id=?', [marks_obtained, max_marks, req.params.id]);
    res.json({ success: true, message: 'Marks updated.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

router.get('/marks/external/:regNum', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT me.*, su.subject_name FROM marks_external me JOIN subjects su ON me.subject_code=su.subject_code WHERE me.register_number=? ORDER BY me.semester DESC`,
      [req.params.regNum]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error.' });
  }
});

router.put('/marks/external/:id', requireAdmin, async (req, res) => {
  const { marks_obtained, grade, grade_points, result } = req.body;
  try {
    await db.query('UPDATE marks_external SET marks_obtained=?, grade=?, grade_points=?, result=? WHERE id=?',
      [marks_obtained, grade, grade_points, result, req.params.id]);
    res.json({ success: true, message: 'Result updated.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

// ─── FEE CRUD ─────────────────────────────────────────────
router.get('/fees/:regNum', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM fees WHERE register_number=? ORDER BY due_date DESC', [req.params.regNum]);
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error.' });
  }
});

router.put('/fees/:id', requireAdmin, async (req, res) => {
  const { fee_type, amount, due_date, paid_date, status, transaction_id, payment_mode } = req.body;
  try {
    await db.query('UPDATE fees SET fee_type=?, amount=?, due_date=?, paid_date=?, status=?, transaction_id=?, payment_mode=? WHERE id=?',
      [fee_type, amount, due_date, paid_date || null, status, transaction_id || null, payment_mode || null, req.params.id]);
    res.json({ success: true, message: 'Fee updated.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

router.post('/fees', requireAdmin, async (req, res) => {
  const { register_number, fee_type, amount, due_date, status, academic_year } = req.body;
  try {
    await db.query('INSERT INTO fees (register_number, fee_type, amount, due_date, status, academic_year) VALUES (?,?,?,?,?,?)',
      [register_number, fee_type, amount, due_date, status || 'Pending', academic_year || '2024-25']);
    res.json({ success: true, message: 'Fee record added.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/fees/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM fees WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Fee deleted.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
});

// ─── ANNOUNCEMENTS CRUD ───────────────────────────────────
router.get('/announcements', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM announcements ORDER BY posted_at DESC');
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error.' });
  }
});

router.post('/announcements', requireAdmin, async (req, res) => {
  const { title, content, category, is_important, target_type, target_register, target_program, target_semester } = req.body;
  try {
    await db.query(
      `INSERT INTO announcements (title, content, category, posted_by, is_important, target_type, target_register, target_program, target_semester)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [title, content, category || 'General', req.session.admin.fullName, is_important ? 1 : 0,
       target_type || 'all', target_register || null, target_program || null, target_semester || null]
    );
    res.json({ success: true, message: 'Announcement created.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/announcements/:id', requireAdmin, async (req, res) => {
  const { title, content, category, is_important, target_type, target_register, target_program, target_semester } = req.body;
  try {
    await db.query(
      `UPDATE announcements SET title=?, content=?, category=?, is_important=?, target_type=?, target_register=?, target_program=?, target_semester=? WHERE id=?`,
      [title, content, category, is_important ? 1 : 0, target_type, target_register || null, target_program || null, target_semester || null, req.params.id]
    );
    res.json({ success: true, message: 'Announcement updated.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

router.delete('/announcements/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM announcements WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
});

// ─── SUBJECTS ─────────────────────────────────────────────
router.get('/subjects', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subjects ORDER BY semester, subject_code');
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: 'DB error.' });
  }
});

router.post('/subjects', requireAdmin, async (req, res) => {
  const { subject_code, subject_name, credits, type, semester, program } = req.body;
  try {
    await db.query('INSERT INTO subjects (subject_code, subject_name, credits, type, semester, program) VALUES (?,?,?,?,?,?)',
      [subject_code, subject_name, credits, type, semester, program]);
    res.json({ success: true, message: 'Subject added.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/subjects/:code', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM subjects WHERE subject_code=?', [req.params.code]);
    res.json({ success: true, message: 'Subject deleted.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
});

module.exports = router;
