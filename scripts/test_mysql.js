// ============================================================
// Comprehensive MySQL Operations Test Script
// Tests ALL database operations in the SRM Portal
// ============================================================

const db = require('./config/db');

const PASS = '✅ PASS';
const FAIL = '❌ FAIL';
const WARN = '⚠️  WARN';

let passCount = 0, failCount = 0, warnCount = 0;
const issues = [];

function log(status, test, detail = '') {
  if (status === PASS) passCount++;
  else if (status === FAIL) { failCount++; issues.push({ test, detail }); }
  else warnCount++;
  console.log(`  ${status} ${test}${detail ? ' — ' + detail : ''}`);
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('  SRM PORTAL — MySQL Operations Test Suite');
  console.log('='.repeat(60));

  // ─────────────────────────────────────────────────
  // 1. CONNECTION TEST
  // ─────────────────────────────────────────────────
  console.log('\n📌 1. DATABASE CONNECTION');
  try {
    const conn = await db.getConnection();
    log(PASS, 'MySQL connection');
    conn.release();
  } catch (e) {
    log(FAIL, 'MySQL connection', e.message);
    process.exit(1);
  }

  // ─────────────────────────────────────────────────
  // 2. TABLE EXISTENCE
  // ─────────────────────────────────────────────────
  console.log('\n📌 2. TABLE EXISTENCE CHECK');
  const requiredBySchema = ['students', 'login_credentials', 'subjects', 'student_subjects', 'attendance', 'timetable', 'marks_internal', 'marks_external', 'fees', 'announcements', 'od_ml', 'hostel', 'transport'];
  const requiredByCode = ['admin_users', 'system_settings', 'events', 'sap_points', 'feedbacks'];

  const [tables] = await db.query("SHOW TABLES");
  const existingTables = tables.map(t => Object.values(t)[0]);

  for (const t of requiredBySchema) {
    if (existingTables.includes(t)) log(PASS, `Table '${t}' exists`);
    else log(FAIL, `Table '${t}' exists`, 'MISSING — required by schema.sql');
  }

  for (const t of requiredByCode) {
    if (existingTables.includes(t)) log(PASS, `Table '${t}' exists (code)`);
    else log(FAIL, `Table '${t}' exists`, 'MISSING — referenced in route code but not in schema');
  }

  // ─────────────────────────────────────────────────
  // 3. COLUMN MISMATCH CHECKS
  // ─────────────────────────────────────────────────
  console.log('\n📌 3. COLUMN MISMATCH CHECKS');

  // subjects table — code references 'program' column
  try {
    const [cols] = await db.query("DESCRIBE subjects");
    const colNames = cols.map(c => c.Field);
    if (colNames.includes('program')) log(PASS, "subjects.program column");
    else log(FAIL, "subjects.program column", "MISSING — academic.js queries WHERE program=?");
  } catch (e) { log(FAIL, "subjects columns check", e.message); }

  // announcements table — code references target columns
  try {
    const [cols] = await db.query("DESCRIBE announcements");
    const colNames = cols.map(c => c.Field);
    const needed = ['target_type', 'target_register', 'target_program', 'target_semester'];
    for (const col of needed) {
      if (colNames.includes(col)) log(PASS, `announcements.${col} column`);
      else log(FAIL, `announcements.${col} column`, "MISSING — admin.js & finance.js reference this");
    }
  } catch (e) { log(FAIL, "announcements columns check", e.message); }

  // ─────────────────────────────────────────────────
  // 4. AUTH OPERATIONS (READ)
  // ─────────────────────────────────────────────────
  console.log('\n📌 4. AUTH — Login Query');
  try {
    const [rows] = await db.query(
      'SELECT lc.*, s.full_name, s.semester, s.program FROM login_credentials lc JOIN students s ON lc.register_number = s.register_number WHERE lc.register_number = ? AND lc.is_active = 1',
      ['AP24110010412']
    );
    if (rows.length > 0) log(PASS, 'Login credentials JOIN query', `Found: ${rows[0].full_name}`);
    else log(FAIL, 'Login credentials JOIN query', 'No rows returned');
  } catch (e) { log(FAIL, 'Login credentials JOIN query', e.message); }

  // DOB lookup
  try {
    const [rows] = await db.query('SELECT dob FROM students WHERE register_number = ?', ['AP24110010412']);
    if (rows.length > 0) log(PASS, 'DOB lookup for password', `DOB: ${rows[0].dob}`);
    else log(FAIL, 'DOB lookup', 'No rows');
  } catch (e) { log(FAIL, 'DOB lookup', e.message); }

  // Update last_login
  try {
    await db.query('UPDATE login_credentials SET last_login = NOW() WHERE register_number = ?', ['AP24110010412']);
    log(PASS, 'UPDATE last_login');
  } catch (e) { log(FAIL, 'UPDATE last_login', e.message); }

  // ─────────────────────────────────────────────────
  // 5. STUDENT PROFILE (READ)
  // ─────────────────────────────────────────────────
  console.log('\n📌 5. STUDENT PROFILE');
  try {
    const [rows] = await db.query(
      `SELECT register_number, full_name, institution, semester, program, section,
              specialization, dob, gender, phone, email, father_name, mother_name, blood_group, address
       FROM students WHERE register_number = ?`, ['AP24110010412']
    );
    if (rows.length > 0) log(PASS, 'Student profile SELECT', `Name: ${rows[0].full_name}`);
    else log(FAIL, 'Student profile SELECT', 'No rows');
  } catch (e) { log(FAIL, 'Student profile SELECT', e.message); }

  // ─────────────────────────────────────────────────
  // 6. ACADEMIC OPERATIONS
  // ─────────────────────────────────────────────────
  console.log('\n📌 6. ACADEMIC OPERATIONS');

  // Subjects query (THIS WILL FAIL — no 'program' column)
  try {
    const [rows] = await db.query(
      `SELECT subject_code, subject_name, credits, type, semester, program
       FROM subjects WHERE program = ? AND semester = ? ORDER BY type, subject_code`,
      ['B.Tech.-Computer Science and Engineering [UG - Full Time]', 'IV SEMESTER']
    );
    log(PASS, 'Subjects query (with program filter)', `${rows.length} subjects`);
  } catch (e) { log(FAIL, 'Subjects query (with program filter)', e.message); }

  // Timetable
  try {
    const [rows] = await db.query(
      `SELECT t.day_of_week, t.period_number, t.start_time, t.end_time, t.subject_code, su.subject_name, t.room_number
       FROM timetable t LEFT JOIN subjects su ON t.subject_code = su.subject_code
       WHERE t.register_number = ?
       ORDER BY FIELD(t.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), t.period_number`,
      ['AP24110010412']
    );
    if (rows.length > 0) log(PASS, 'Timetable SELECT', `${rows.length} periods`);
    else log(WARN, 'Timetable SELECT', 'Query OK but 0 rows');
  } catch (e) { log(FAIL, 'Timetable SELECT', e.message); }

  // Attendance
  try {
    const [rows] = await db.query(
      `SELECT a.subject_code, su.subject_name, su.type, a.total_classes, a.attended_classes,
              a.od_classes, a.ml_classes, a.percentage
       FROM attendance a JOIN subjects su ON a.subject_code = su.subject_code
       WHERE a.register_number = ? ORDER BY a.subject_code`,
      ['AP24110010412']
    );
    if (rows.length > 0) log(PASS, 'Attendance SELECT', `${rows.length} subjects`);
    else log(WARN, 'Attendance SELECT', 'Query OK but 0 rows');
  } catch (e) { log(FAIL, 'Attendance SELECT', e.message); }

  // OD/ML
  try {
    const [rows] = await db.query(
      `SELECT id, leave_type, from_date, to_date, reason, status, approved_by, submitted_at
       FROM od_ml WHERE register_number = ? ORDER BY submitted_at DESC`,
      ['AP24110010412']
    );
    if (rows.length > 0) log(PASS, 'OD/ML SELECT', `${rows.length} records`);
    else log(WARN, 'OD/ML SELECT', 'Query OK but 0 rows');
  } catch (e) { log(FAIL, 'OD/ML SELECT', e.message); }

  // ─────────────────────────────────────────────────
  // 7. EXAMINATION OPERATIONS
  // ─────────────────────────────────────────────────
  console.log('\n📌 7. EXAMINATION OPERATIONS');

  // Internal marks
  try {
    const [rows] = await db.query(
      `SELECT mi.subject_code, su.subject_name, mi.exam_type, mi.max_marks, mi.marks_obtained, mi.semester, mi.academic_year
       FROM marks_internal mi JOIN subjects su ON mi.subject_code = su.subject_code
       WHERE mi.register_number = ? AND mi.semester = (
         SELECT MAX(semester) FROM marks_internal WHERE register_number = ?
       ) ORDER BY mi.subject_code, mi.exam_type`,
      ['AP24110010412', 'AP24110010412']
    );
    if (rows.length > 0) log(PASS, 'Internal marks SELECT', `${rows.length} marks`);
    else log(WARN, 'Internal marks SELECT', 'Query OK but 0 rows');
  } catch (e) { log(FAIL, 'Internal marks SELECT', e.message); }

  // Previous internal marks
  try {
    const [rows] = await db.query(
      `SELECT mi.subject_code, su.subject_name, mi.exam_type, mi.max_marks, mi.marks_obtained, mi.semester, mi.academic_year
       FROM marks_internal mi JOIN subjects su ON mi.subject_code = su.subject_code
       WHERE mi.register_number = ? AND mi.semester < (
         SELECT MAX(semester) FROM marks_internal WHERE register_number = ?
       ) ORDER BY mi.semester DESC, mi.subject_code, mi.exam_type`,
      ['AP24110010412', 'AP24110010412']
    );
    log(PASS, 'Previous internal marks SELECT', `${rows.length} marks`);
  } catch (e) { log(FAIL, 'Previous internal marks SELECT', e.message); }

  // Semester results
  try {
    const [rows] = await db.query(
      `SELECT me.subject_code, su.subject_name, su.credits, me.max_marks, me.marks_obtained,
              me.grade, me.grade_points, me.result, me.semester, me.academic_year
       FROM marks_external me JOIN subjects su ON me.subject_code = su.subject_code
       WHERE me.register_number = ? ORDER BY me.semester DESC, me.subject_code`,
      ['AP24110010412']
    );
    if (rows.length > 0) log(PASS, 'Semester results SELECT', `${rows.length} results`);
    else log(WARN, 'Semester results SELECT', 'Query OK but 0 rows');
  } catch (e) { log(FAIL, 'Semester results SELECT', e.message); }

  // ─────────────────────────────────────────────────
  // 8. FINANCE OPERATIONS
  // ─────────────────────────────────────────────────
  console.log('\n📌 8. FINANCE OPERATIONS');

  // Fees
  try {
    const [rows] = await db.query(
      `SELECT id, fee_type, amount, due_date, paid_date, status, transaction_id, payment_mode, academic_year
       FROM fees WHERE register_number = ? ORDER BY due_date DESC`,
      ['AP24110010412']
    );
    if (rows.length > 0) log(PASS, 'Fees SELECT', `${rows.length} records`);
    else log(WARN, 'Fees SELECT', 'Query OK but 0 rows');
  } catch (e) { log(FAIL, 'Fees SELECT', e.message); }

  // Announcements (the route code uses target columns that don't exist)
  try {
    const [rows] = await db.query(
      `SELECT * FROM announcements
       WHERE target_type = 'all'
       OR (target_type = 'individual' AND target_register = ?)
       ORDER BY is_important DESC, posted_at DESC`,
      ['AP24110010412']
    );
    log(PASS, 'Announcements with targeting SELECT', `${rows.length} rows`);
  } catch (e) { log(FAIL, 'Announcements with targeting SELECT', e.message); }

  // Hostel (correct query using actual 'hostel' table)
  try {
    const [rows] = await db.query('SELECT * FROM hostel WHERE register_number = ?', ['AP24110010412']);
    if (rows.length > 0) log(PASS, 'Hostel direct SELECT (actual table)', `Room: ${rows[0].room_number}`);
    else log(WARN, 'Hostel direct SELECT', 'Query OK but 0 rows');
  } catch (e) { log(FAIL, 'Hostel direct SELECT', e.message); }

  // Transport (correct query using actual 'transport' table)
  try {
    const [rows] = await db.query('SELECT * FROM transport WHERE register_number = ?', ['AP24110010412']);
    if (rows.length > 0) log(PASS, 'Transport direct SELECT (actual table)', `Route: ${rows[0].route_name}`);
    else log(WARN, 'Transport direct SELECT', 'Query OK but 0 rows');
  } catch (e) { log(FAIL, 'Transport direct SELECT', e.message); }

  // ─────────────────────────────────────────────────
  // 9. SYSTEM ROUTES (events, sap, feedback, settings)
  // ─────────────────────────────────────────────────
  console.log('\n📌 9. SYSTEM OPERATIONS');

  const systemTables = ['system_settings', 'events', 'sap_points', 'feedbacks'];
  for (const tbl of systemTables) {
    try {
      const [rows] = await db.query(`SELECT * FROM ${tbl} LIMIT 1`);
      log(PASS, `SELECT from ${tbl}`);
    } catch (e) { log(FAIL, `SELECT from ${tbl}`, e.message); }
  }

  // ─────────────────────────────────────────────────
  // 10. ADMIN CRUD OPERATIONS
  // ─────────────────────────────────────────────────
  console.log('\n📌 10. ADMIN CRUD OPERATIONS');

  // Admin users table
  try {
    const [rows] = await db.query('SELECT * FROM admin_users LIMIT 1');
    log(PASS, 'admin_users table SELECT');
  } catch (e) { log(FAIL, 'admin_users table SELECT', e.message); }

  // Dashboard stats
  try {
    const [[{ total_students }]] = await db.query('SELECT COUNT(*) AS total_students FROM students');
    const [[{ total_announcements }]] = await db.query('SELECT COUNT(*) AS total_announcements FROM announcements');
    const [[{ pending_fees }]] = await db.query('SELECT COUNT(*) AS pending_fees FROM fees WHERE status="Pending"');
    const [[{ total_subjects }]] = await db.query('SELECT COUNT(*) AS total_subjects FROM subjects');
    log(PASS, 'Dashboard stats queries', `Students: ${total_students}, Subjects: ${total_subjects}, Fees pending: ${pending_fees}`);
  } catch (e) { log(FAIL, 'Dashboard stats queries', e.message); }

  // Student CRUD
  try {
    const [rows] = await db.query('SELECT * FROM students ORDER BY register_number');
    log(PASS, 'Admin: List all students', `${rows.length} students`);
  } catch (e) { log(FAIL, 'Admin: List all students', e.message); }

  // Subjects with program column INSERT
  try {
    await db.query('INSERT INTO subjects (subject_code, subject_name, credits, type, semester, program) VALUES (?,?,?,?,?,?)',
      ['TEST001', 'Test Subject', 3, 'Theory', 4, 'B.Tech']);
    log(PASS, 'Admin: INSERT subject with program col');
    await db.query('DELETE FROM subjects WHERE subject_code = ?', ['TEST001']);
  } catch (e) { log(FAIL, 'Admin: INSERT subject with program col', e.message); }

  // Announcement INSERT with targeting
  try {
    await db.query(
      `INSERT INTO announcements (title, content, category, posted_by, is_important, target_type, target_register, target_program, target_semester)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      ['Test Announcement', 'Test content', 'General', 'Test', 0, 'all', null, null, null]
    );
    log(PASS, 'Admin: INSERT announcement with targeting cols');
    await db.query("DELETE FROM announcements WHERE title = 'Test Announcement'");
  } catch (e) { log(FAIL, 'Admin: INSERT announcement with targeting cols', e.message); }

  // Fee INSERT + DELETE
  try {
    const [result] = await db.query('INSERT INTO fees (register_number, fee_type, amount, due_date, status, academic_year) VALUES (?,?,?,?,?,?)',
      ['AP24110010412', 'Test Fee', 1000, '2025-06-01', 'Pending', '2024-25']);
    const newId = result.insertId;
    log(PASS, 'Admin: INSERT fee', `ID: ${newId}`);
    await db.query('DELETE FROM fees WHERE id=?', [newId]);
    log(PASS, 'Admin: DELETE fee');
  } catch (e) { log(FAIL, 'Admin: Fee INSERT/DELETE', e.message); }

  // Attendance UPDATE
  try {
    const [attn] = await db.query('SELECT id, total_classes FROM attendance LIMIT 1');
    if (attn.length > 0) {
      const orig = attn[0].total_classes;
      await db.query('UPDATE attendance SET total_classes=? WHERE id=?', [orig, attn[0].id]);
      log(PASS, 'Admin: UPDATE attendance');
    }
  } catch (e) { log(FAIL, 'Admin: UPDATE attendance', e.message); }

  // Marks UPDATE
  try {
    const [marks] = await db.query('SELECT id, marks_obtained FROM marks_internal LIMIT 1');
    if (marks.length > 0) {
      const orig = marks[0].marks_obtained;
      await db.query('UPDATE marks_internal SET marks_obtained=?, max_marks=? WHERE id=?', [orig, 50, marks[0].id]);
      log(PASS, 'Admin: UPDATE internal marks');
    }
  } catch (e) { log(FAIL, 'Admin: UPDATE internal marks', e.message); }

  try {
    const [marks] = await db.query('SELECT id, marks_obtained FROM marks_external LIMIT 1');
    if (marks.length > 0) {
      const orig = marks[0].marks_obtained;
      await db.query('UPDATE marks_external SET marks_obtained=?, grade=?, grade_points=?, result=? WHERE id=?',
        [orig, 'O', 10, 'Pass', marks[0].id]);
      log(PASS, 'Admin: UPDATE external marks');
    }
  } catch (e) { log(FAIL, 'Admin: UPDATE external marks', e.message); }

  // ─────────────────────────────────────────────────
  // 11. DATA INTEGRITY CHECKS
  // ─────────────────────────────────────────────────
  console.log('\n📌 11. DATA INTEGRITY');
  try {
    const [[{ cnt }]] = await db.query('SELECT COUNT(*) AS cnt FROM students s LEFT JOIN login_credentials lc ON s.register_number = lc.register_number WHERE lc.register_number IS NULL');
    if (cnt === 0) log(PASS, 'All students have login_credentials');
    else log(WARN, 'Students without login_credentials', `${cnt} student(s) missing`);
  } catch (e) { log(FAIL, 'Data integrity check', e.message); }

  try {
    const [[{ cnt }]] = await db.query('SELECT COUNT(*) AS cnt FROM attendance a LEFT JOIN subjects su ON a.subject_code = su.subject_code WHERE su.subject_code IS NULL');
    if (cnt === 0) log(PASS, 'All attendance records reference valid subjects');
    else log(WARN, 'Orphaned attendance records', `${cnt} records`);
  } catch (e) { log(FAIL, 'Attendance FK check', e.message); }

  // ─────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log(`  RESULTS: ${PASS.slice(0,2)} ${passCount} passed | ${FAIL.slice(0,2)} ${failCount} failed | ${WARN.slice(0,2)} ${warnCount} warnings`);
  console.log('='.repeat(60));

  if (issues.length > 0) {
    console.log('\n🔧 ISSUES TO FIX:');
    issues.forEach((iss, i) => {
      console.log(`  ${i+1}. ${iss.test}`);
      console.log(`     → ${iss.detail}`);
    });
  }

  console.log('');
  process.exit(0);
}

runTests().catch(err => { console.error('Fatal:', err); process.exit(1); });
