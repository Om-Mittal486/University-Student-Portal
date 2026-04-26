const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Generate CAPTCHA (simple alphanumeric)
router.get('/captcha', (req, res) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let captcha = '';
  for (let i = 0; i < 5; i++) {
    captcha += chars[Math.floor(Math.random() * chars.length)];
  }
  req.session.captcha = captcha;
  res.json({ captcha });
});

// Login
router.post('/login', async (req, res) => {
  const { registerNumber, password, captcha } = req.body;

  // Validate inputs
  if (!registerNumber || !password || !captcha) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Validate captcha
  if (!req.session.captcha || captcha.toUpperCase() !== req.session.captcha.toUpperCase()) {
    return res.status(400).json({ success: false, message: 'Invalid CAPTCHA. Please try again.' });
  }

  try {
    // Fetch login credentials
    const [rows] = await db.query(
      'SELECT lc.*, s.full_name, s.semester, s.program FROM login_credentials lc JOIN students s ON lc.register_number = s.register_number WHERE lc.register_number = ? AND lc.is_active = 1',
      [registerNumber]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid Application/Register Number or Password.' });
    }

    const user = rows[0];

    // For demo: also allow plain DOB password (DDMMYYYY) matching
    const dob = await getDOB(registerNumber);
    const plainPassword = password === dob;
    let passwordMatch = plainPassword;

    // Also try bcrypt comparison
    if (!plainPassword) {
      try {
        passwordMatch = await bcrypt.compare(password, user.password_hash);
      } catch (e) {
        passwordMatch = false;
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Application/Register Number or Password.' });
    }

    // Update last login
    await db.query('UPDATE login_credentials SET last_login = NOW() WHERE register_number = ?', [registerNumber]);

    // Set session
    req.session.user = {
      registerNumber: user.register_number,
      fullName: user.full_name,
      semester: user.semester,
      program: user.program
    };
    req.session.captcha = null;

    res.json({ success: true, message: 'Login successful', user: { registerNumber: user.register_number, fullName: user.full_name, semester: user.semester, program: user.program } });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

async function getDOB(registerNumber) {
  try {
    const [rows] = await db.query('SELECT dob FROM students WHERE register_number = ?', [registerNumber]);
    if (rows.length === 0) return null;
    const dob = new Date(rows[0].dob);
    const dd = String(dob.getDate()).padStart(2, '0');
    const mm = String(dob.getMonth() + 1).padStart(2, '0');
    const yyyy = dob.getFullYear();
    return `${dd}${mm}${yyyy}`;
  } catch (e) {
    return null;
  }
}

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: 'Logout failed.' });
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

// Check session
router.get('/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;
