require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// Middleware
// ======================
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'srm-portal-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000  // 8 hours
  }
}));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ======================
// Routes
// ======================
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const academicRoutes = require('./routes/academic');
const examinationRoutes = require('./routes/examination');
const financeRoutes = require('./routes/finance');
const adminRoutes = require('./routes/admin');
const systemRoutes = require('./routes/system');

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/examination', examinationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);

// Serve login page as root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Serve portal page
app.get('/portal', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, '../frontend/portal.html'));
});

// Serve admin login page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin-login.html'));
});

// Serve admin dashboard
app.get('/admin/dashboard', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// ======================
// Start Server
// ======================
app.listen(PORT, () => {
  console.log(`\n🎓 SRM University AP Portal Server Running`);
  console.log(`   → URL: http://localhost:${PORT}`);
  console.log(`   → API: http://localhost:${PORT}/api`);
  console.log(`\n   Login Credentials (Demo):`);
  console.log(`   Register No: AP24110010412`);
  console.log(`   Password:    16092007 (DOB in DDMMYYYY)\n`);
});
