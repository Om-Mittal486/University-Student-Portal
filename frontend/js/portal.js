/* =======================================================
   SRM University AP — Portal JavaScript (portal.js)
   Full SPA logic: session, sidebar, all module renderers
   ======================================================= */

'use strict';

const API = 'http://localhost:5000/api';

// ── Current user (from session or sessionStorage demo-mode) ──
let currentUser = null;
let currentPage = 'profile';

// ─────────────────────────────────────────────
//  DEMO DATA  (used when backend is unreachable)
// ─────────────────────────────────────────────
const DEMO = {
  profile: {
    register_number: 'AP24110010412',
    full_name: 'IMMIDISETTI TERISH CHARAN TEJ',
    institution: 'School of Engineering and Sciences (College)',
    semester: 'IV SEMESTER',
    program: 'B.Tech.-Computer Science and Engineering [UG - Full Time]',
    section: 'D',
    specialization: 'Artificial Intelligence and Machine Learning',
    dob: '2007-09-16',
    gender: 'Male',
    phone: '9515523236',
    email: 'terishcharantej_immidisetti@srmap.edu.in',
    father_name: 'IMMIDISETTI MOHAN RAO',
    mother_name: 'IMMIDISETTI VENKATA SAIRAMA LAKSHMI',
    blood_group: 'B+'
  },
  subjects: [
    { subject_code:'CS401', subject_name:'Design and Analysis of Algorithms', credits:4, type:'Theory', faculty_name:'Dr. Rajesh Kumar Pattnaik', academic_year:'2024-25' },
    { subject_code:'CS402', subject_name:'Database Management Systems',        credits:4, type:'Theory', faculty_name:'Dr. Srinivasa Rao Maddu',    academic_year:'2024-25' },
    { subject_code:'CS403', subject_name:'Operating Systems',                  credits:3, type:'Theory', faculty_name:'Dr. Anitha Kumari P',         academic_year:'2024-25' },
    { subject_code:'CS404', subject_name:'Computer Networks',                  credits:3, type:'Theory', faculty_name:'Prof. Venkata Subramanian',   academic_year:'2024-25' },
    { subject_code:'CS405', subject_name:'Artificial Intelligence',            credits:3, type:'Theory', faculty_name:'Dr. Pradeep Kumar Yalla',     academic_year:'2024-25' },
    { subject_code:'MA401', subject_name:'Probability and Statistics',         credits:3, type:'Theory', faculty_name:'Dr. Lakshmi Prasanna V',      academic_year:'2024-25' },
    { subject_code:'CS406L', subject_name:'DBMS Laboratory',                  credits:2, type:'Lab',    faculty_name:'Dr. Srinivasa Rao Maddu',    academic_year:'2024-25' },
    { subject_code:'CS407L', subject_name:'AI Laboratory',                    credits:2, type:'Lab',    faculty_name:'Dr. Pradeep Kumar Yalla',     academic_year:'2024-25' }
  ],
  timetable: [
    { day_of_week:'Monday',    period_number:1, start_time:'08:00', end_time:'08:50', subject_code:'CS401', subject_name:'DAA',      room_number:'CR-201' },
    { day_of_week:'Monday',    period_number:2, start_time:'08:50', end_time:'09:40', subject_code:'CS402', subject_name:'DBMS',     room_number:'CR-201' },
    { day_of_week:'Monday',    period_number:3, start_time:'09:50', end_time:'10:40', subject_code:'CS403', subject_name:'OS',       room_number:'CR-201' },
    { day_of_week:'Monday',    period_number:5, start_time:'11:30', end_time:'12:20', subject_code:'MA401', subject_name:'P&S',      room_number:'CR-201' },
    { day_of_week:'Monday',    period_number:6, start_time:'13:10', end_time:'14:00', subject_code:'CS406L',subject_name:'DBMS Lab', room_number:'LAB-3'  },
    { day_of_week:'Tuesday',   period_number:1, start_time:'08:00', end_time:'08:50', subject_code:'CS404', subject_name:'CN',       room_number:'CR-201' },
    { day_of_week:'Tuesday',   period_number:2, start_time:'08:50', end_time:'09:40', subject_code:'CS405', subject_name:'AI',       room_number:'CR-201' },
    { day_of_week:'Tuesday',   period_number:3, start_time:'09:50', end_time:'10:40', subject_code:'CS401', subject_name:'DAA',      room_number:'CR-201' },
    { day_of_week:'Tuesday',   period_number:5, start_time:'11:30', end_time:'12:20', subject_code:'CS402', subject_name:'DBMS',     room_number:'CR-201' },
    { day_of_week:'Tuesday',   period_number:6, start_time:'13:10', end_time:'14:00', subject_code:'CS407L',subject_name:'AI Lab',   room_number:'AI-LAB' },
    { day_of_week:'Wednesday', period_number:1, start_time:'08:00', end_time:'08:50', subject_code:'CS403', subject_name:'OS',       room_number:'CR-201' },
    { day_of_week:'Wednesday', period_number:2, start_time:'08:50', end_time:'09:40', subject_code:'MA401', subject_name:'P&S',      room_number:'CR-201' },
    { day_of_week:'Wednesday', period_number:3, start_time:'09:50', end_time:'10:40', subject_code:'CS404', subject_name:'CN',       room_number:'CR-201' },
    { day_of_week:'Wednesday', period_number:5, start_time:'11:30', end_time:'12:20', subject_code:'CS405', subject_name:'AI',       room_number:'CR-201' },
    { day_of_week:'Thursday',  period_number:1, start_time:'08:00', end_time:'08:50', subject_code:'CS401', subject_name:'DAA',      room_number:'CR-201' },
    { day_of_week:'Thursday',  period_number:2, start_time:'08:50', end_time:'09:40', subject_code:'CS403', subject_name:'OS',       room_number:'CR-201' },
    { day_of_week:'Thursday',  period_number:3, start_time:'09:50', end_time:'10:40', subject_code:'CS402', subject_name:'DBMS',     room_number:'CR-201' },
    { day_of_week:'Thursday',  period_number:5, start_time:'11:30', end_time:'12:20', subject_code:'MA401', subject_name:'P&S',      room_number:'CR-201' },
    { day_of_week:'Friday',    period_number:1, start_time:'08:00', end_time:'08:50', subject_code:'CS405', subject_name:'AI',       room_number:'CR-201' },
    { day_of_week:'Friday',    period_number:2, start_time:'08:50', end_time:'09:40', subject_code:'CS404', subject_name:'CN',       room_number:'CR-201' },
    { day_of_week:'Friday',    period_number:3, start_time:'09:50', end_time:'10:40', subject_code:'CS401', subject_name:'DAA',      room_number:'CR-201' }
  ],
  attendance: [
    { subject_code:'CS401', subject_name:'Design and Analysis of Algorithms', type:'Theory', total_classes:52, attended_classes:48, od_classes:2, ml_classes:0, percentage:96.15 },
    { subject_code:'CS402', subject_name:'Database Management Systems',        type:'Theory', total_classes:48, attended_classes:45, od_classes:0, ml_classes:1, percentage:93.75 },
    { subject_code:'CS403', subject_name:'Operating Systems',                  type:'Theory', total_classes:39, attended_classes:35, od_classes:1, ml_classes:0, percentage:92.31 },
    { subject_code:'CS404', subject_name:'Computer Networks',                  type:'Theory', total_classes:39, attended_classes:36, od_classes:0, ml_classes:0, percentage:92.31 },
    { subject_code:'CS405', subject_name:'Artificial Intelligence',            type:'Theory', total_classes:39, attended_classes:38, od_classes:1, ml_classes:0, percentage:100.00},
    { subject_code:'MA401', subject_name:'Probability and Statistics',         type:'Theory', total_classes:39, attended_classes:37, od_classes:0, ml_classes:0, percentage:94.87 },
    { subject_code:'CS406L',subject_name:'DBMS Laboratory',                   type:'Lab',   total_classes:26, attended_classes:25, od_classes:0, ml_classes:0, percentage:96.15 },
    { subject_code:'CS407L',subject_name:'AI Laboratory',                     type:'Lab',   total_classes:26, attended_classes:24, od_classes:1, ml_classes:0, percentage:96.15 }
  ],
  odml: [
    { id:1, leave_type:'OD', from_date:'2025-02-10', to_date:'2025-02-10', reason:'Inter-college Tech Fest at VIT Amaravati',  status:'Approved', approved_by:'Dr. Rajesh Kumar Pattnaik' },
    { id:2, leave_type:'OD', from_date:'2025-01-22', to_date:'2025-01-22', reason:'National Level Coding Competition',         status:'Approved', approved_by:'Prof. Venkata Subramanian'  },
    { id:3, leave_type:'ML', from_date:'2025-03-05', to_date:'2025-03-06', reason:'Fever — Medical Certificate attached',      status:'Approved', approved_by:'Class Advisor'              },
    { id:4, leave_type:'OD', from_date:'2025-03-20', to_date:'2025-03-21', reason:'IEEE Student Branch Conference',            status:'Pending',  approved_by:null                         },
    { id:5, leave_type:'ML', from_date:'2025-04-01', to_date:'2025-04-01', reason:'Dental Appointment',                        status:'Approved', approved_by:'Class Advisor'              }
  ],
  internalMarks: [
    { subject_code:'CS401', subject_name:'Design and Analysis of Algorithms', exam_type:'CAT-1', max_marks:50, marks_obtained:42, semester:4, academic_year:'2024-25' },
    { subject_code:'CS401', subject_name:'Design and Analysis of Algorithms', exam_type:'CAT-2', max_marks:50, marks_obtained:44, semester:4, academic_year:'2024-25' },
    { subject_code:'CS402', subject_name:'Database Management Systems',        exam_type:'CAT-1', max_marks:50, marks_obtained:45, semester:4, academic_year:'2024-25' },
    { subject_code:'CS402', subject_name:'Database Management Systems',        exam_type:'CAT-2', max_marks:50, marks_obtained:47, semester:4, academic_year:'2024-25' },
    { subject_code:'CS403', subject_name:'Operating Systems',                  exam_type:'CAT-1', max_marks:50, marks_obtained:38, semester:4, academic_year:'2024-25' },
    { subject_code:'CS403', subject_name:'Operating Systems',                  exam_type:'CAT-2', max_marks:50, marks_obtained:40, semester:4, academic_year:'2024-25' },
    { subject_code:'CS404', subject_name:'Computer Networks',                  exam_type:'CAT-1', max_marks:50, marks_obtained:41, semester:4, academic_year:'2024-25' },
    { subject_code:'CS404', subject_name:'Computer Networks',                  exam_type:'CAT-2', max_marks:50, marks_obtained:43, semester:4, academic_year:'2024-25' },
    { subject_code:'CS405', subject_name:'Artificial Intelligence',            exam_type:'CAT-1', max_marks:50, marks_obtained:44, semester:4, academic_year:'2024-25' },
    { subject_code:'CS405', subject_name:'Artificial Intelligence',            exam_type:'CAT-2', max_marks:50, marks_obtained:46, semester:4, academic_year:'2024-25' },
    { subject_code:'MA401', subject_name:'Probability and Statistics',         exam_type:'CAT-1', max_marks:50, marks_obtained:39, semester:4, academic_year:'2024-25' },
    { subject_code:'MA401', subject_name:'Probability and Statistics',         exam_type:'CAT-2', max_marks:50, marks_obtained:41, semester:4, academic_year:'2024-25' }
  ],
  earlierMarks: [
    { subject_code:'CS301', subject_name:'Data Structures and Algorithms', exam_type:'CAT-1', max_marks:50, marks_obtained:46, semester:3, academic_year:'2023-24' },
    { subject_code:'CS302', subject_name:'Object Oriented Programming',    exam_type:'CAT-1', max_marks:50, marks_obtained:43, semester:3, academic_year:'2023-24' },
    { subject_code:'CS303', subject_name:'Digital Logic Design',           exam_type:'CAT-1', max_marks:50, marks_obtained:39, semester:3, academic_year:'2023-24' },
    { subject_code:'CS304', subject_name:'Theory of Computation',         exam_type:'CAT-1', max_marks:50, marks_obtained:41, semester:3, academic_year:'2023-24' },
    { subject_code:'MA301', subject_name:'Discrete Mathematics',           exam_type:'CAT-1', max_marks:50, marks_obtained:44, semester:3, academic_year:'2023-24' }
  ],
  semResults: [
    { subject_code:'CS301', subject_name:'Data Structures and Algorithms', credits:4, max_marks:100, marks_obtained:87, grade:'O',  grade_points:10.0, result:'Pass', semester:3, academic_year:'2023-24' },
    { subject_code:'CS302', subject_name:'Object Oriented Programming',    credits:3, max_marks:100, marks_obtained:82, grade:'A+', grade_points:9.0,  result:'Pass', semester:3, academic_year:'2023-24' },
    { subject_code:'CS303', subject_name:'Digital Logic Design',           credits:3, max_marks:100, marks_obtained:76, grade:'A',  grade_points:8.0,  result:'Pass', semester:3, academic_year:'2023-24' },
    { subject_code:'CS304', subject_name:'Theory of Computation',         credits:3, max_marks:100, marks_obtained:79, grade:'A',  grade_points:8.0,  result:'Pass', semester:3, academic_year:'2023-24' },
    { subject_code:'MA301', subject_name:'Discrete Mathematics',           credits:3, max_marks:100, marks_obtained:83, grade:'A+', grade_points:9.0,  result:'Pass', semester:3, academic_year:'2023-24' }
  ],
  fees: [
    { id:1, fee_type:'Tuition Fee - Semester IV', amount:105000, due_date:'2024-12-15', paid_date:'2024-12-10', status:'Paid',    transaction_id:'TXN20241210001234', payment_mode:'Online', academic_year:'2024-25' },
    { id:2, fee_type:'Transport Fee - Annual',     amount:18000,  due_date:'2024-07-31', paid_date:'2024-07-28', status:'Paid',    transaction_id:'TXN20240728009876', payment_mode:'Online', academic_year:'2024-25' },
    { id:3, fee_type:'Library & Lab Fee',           amount:5000,   due_date:'2024-12-15', paid_date:'2024-12-10', status:'Paid',    transaction_id:'TXN20241210001235', payment_mode:'Online', academic_year:'2024-25' },
    { id:4, fee_type:'Tuition Fee - Semester V',   amount:105000, due_date:'2025-06-15', paid_date:null,          status:'Pending', transaction_id:null,                payment_mode:null,      academic_year:'2025-26' },
    { id:5, fee_type:'Caution Deposit',             amount:10000,  due_date:'2024-07-31', paid_date:'2024-07-28', status:'Paid',    transaction_id:'TXN20240728009877', payment_mode:'Online', academic_year:'2024-25' }
  ],
  announcements: [
    { id:1, title:'Semester IV End Semester Examination Schedule', content:'The End Semester Examinations for Semester IV (B.Tech, BBA, BCA) are scheduled from May 12, 2025. Students are advised to check the detailed timetable on the portal under Examination > Exam Registration Details.', category:'Exam',    posted_by:'Controller of Examinations', posted_at:'2025-04-10T09:00:00', is_important:1 },
    { id:2, title:'Course Registration for Semester V Open',        content:'Course Registration for Semester V (2025-26) is now open. Students must complete registration by April 30, 2025. Please ensure your fee dues are cleared before registering.',                                           category:'Academic', posted_by:'Academic Section',           posted_at:'2025-04-08T10:30:00', is_important:1 },
    { id:3, title:'Fee Payment Deadline Reminder',                  content:'The last date for payment of Semester V tuition fee is June 15, 2025. Students with pending fees will not be allowed to attend classes or appear for examinations.',                                                    category:'Finance',  posted_by:'Finance Department',         posted_at:'2025-04-05T11:00:00', is_important:1 },
    { id:4, title:'Hostel Room Allotment for 2025-26',              content:'Hostel room allotment for the academic year 2025-26 will be done online. Students wishing to avail hostel facility must apply through the portal by May 31, 2025.',                                                     category:'Hostel',   posted_by:'Hostel Administration',      posted_at:'2025-04-01T09:00:00', is_important:0 },
    { id:5, title:'Summer Internship Opportunity — MNC Companies',  content:'The Training and Placement Cell invites applications for summer internship programs with leading MNCs. Eligible students (CGPA ≥ 7.0) may apply through the portal by April 25, 2025.',                               category:'General',  posted_by:'Placement Cell',             posted_at:'2025-03-28T14:00:00', is_important:0 }
  ],
  hostel: { hostel_name:'Greenwood Boys Hostel', block:'C', room_number:'214', bed_number:'B2', mess_type:'Veg', academic_year:'2024-25' },
  transport: { route_number:'R-07', route_name:'Vijayawada - Amaravati', boarding_point:'Benz Circle, Vijayawada', bus_timings:'7:15 AM / 5:30 PM', academic_year:'2024-25' }
};

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function fmt(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function fmtDOB(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString('en-IN', { month:'short' });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function inr(amount) {
  if (!amount && amount !== 0) return '-';
  return '₹ ' + Number(amount).toLocaleString('en-IN');
}

function pctClass(pct) {
  if (pct >= 85) return 'good';
  if (pct >= 75) return 'warn';
  return 'danger';
}

// ─────────────────────────────────────────────
//  API FETCH (with demo fallback)
// ─────────────────────────────────────────────
async function apiFetch(endpoint) {
  try {
    const r = await fetch(`${API}${endpoint}`, { credentials: 'include' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const json = await r.json();
    if (json.success) return { ok: true, data: json.data };
    throw new Error(json.message);
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────
//  SESSION CHECK
// ─────────────────────────────────────────────
async function initSession() {
  // Check demo-mode first
  const stored = sessionStorage.getItem('srm_user');
  if (stored) {
    currentUser = JSON.parse(stored);
    renderUserInfo();
    loadPage('profile');
    return;
  }
  // Try server session
  try {
    const r = await fetch(`${API}/auth/session`, { credentials: 'include' });
    const data = await r.json();
    if (data.loggedIn) {
      currentUser = data.user;
      renderUserInfo();
      loadPage('profile');
    } else {
      window.location.href = 'login.html';
    }
  } catch (e) {
    // If no server, check demo session
    if (!stored) window.location.href = 'login.html';
  }
}

function renderUserInfo() {
  if (!currentUser) return;
  const name = currentUser.fullName || currentUser.full_name || 'STUDENT';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('topbarName').textContent = name;
  // Avatar initials
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('');
  document.getElementById('sidebarAvatar').innerHTML = `<span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">${initials}</span>`;
  document.getElementById('topbarAvatar').innerHTML = `<span style="font-size:13px;font-weight:700;color:#fff;">${initials[0]}</span>`;
}

// ─────────────────────────────────────────────
//  SIDEBAR TOGGLE
// ─────────────────────────────────────────────
let sidebarOpen = true;

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  sidebarOpen = !sidebarOpen;
  if (window.innerWidth <= 900) {
    sb.classList.toggle('mobile-open', sidebarOpen);
  } else {
    sb.classList.toggle('collapsed', !sidebarOpen);
  }
  document.getElementById('hamburgerBtn').setAttribute('aria-expanded', sidebarOpen);
}

function toggleMenu(menuId) {
  const submenu = document.getElementById('submenu-' + menuId);
  const navLink = document.getElementById('nav-' + menuId);
  if (!submenu) return;
  const isOpen = submenu.classList.contains('open');
  // Close all other submenus
  document.querySelectorAll('.submenu.open').forEach(s => s.classList.remove('open'));
  document.querySelectorAll('.nav-link.expanded').forEach(l => l.classList.remove('expanded'));
  if (!isOpen) {
    submenu.classList.add('open');
    navLink.classList.add('expanded');
    navLink.setAttribute('aria-expanded', 'true');
  } else {
    navLink.setAttribute('aria-expanded', 'false');
  }
}

// Keyboard nav for sidebar
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement.classList.contains('nav-link')) {
    document.activeElement.click();
  }
  if (e.key === 'Enter' && document.activeElement.classList.contains('sub-link')) {
    document.activeElement.click();
  }
});

// ─────────────────────────────────────────────
//  PROFILE DROPDOWN
// ─────────────────────────────────────────────
function toggleProfileDropdown() {
  document.getElementById('profileDropdown').classList.toggle('show');
}

function closeProfileDropdown() {
  document.getElementById('profileDropdown').classList.remove('show');
}

document.addEventListener('click', e => {
  const btn = document.getElementById('topbarProfileBtn');
  const dd = document.getElementById('profileDropdown');
  if (btn && !btn.contains(e.target) && dd && !dd.contains(e.target)) {
    dd.classList.remove('show');
  }
});

// ─────────────────────────────────────────────
//  LOGOUT
// ─────────────────────────────────────────────
async function doLogout() {
  if (!confirm('Are you sure you want to logout?')) return;
  sessionStorage.removeItem('srm_user');
  try {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch (e) { /* ignore */ }
  window.location.href = 'login.html';
}

// ─────────────────────────────────────────────
//  PAGE ROUTER
// ─────────────────────────────────────────────
function loadPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  // Show target
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    currentPage = pageId;
  }
  // Update active nav link
  document.querySelectorAll('.sub-link').forEach(l => l.classList.remove('active'));
  // Render content
  renderPage(pageId);
  // Close mobile sidebar on nav
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('mobile-open');
    sidebarOpen = false;
  }
  // Scroll to top
  document.getElementById('mainArea').scrollTo(0, 0);
}

async function renderPage(pageId) {
  switch (pageId) {
    case 'profile':          return renderProfile();
    case 'subjects':         return renderSubjects();
    case 'timetable':        return renderTimetable();
    case 'attendance':       return renderAttendance();
    case 'od-ml':            return renderOdMl();
    case 'student-attendance': return renderStudentAttendance();
    case 'internal-marks':   return renderInternalMarks();
    case 'earlier-marks':    return renderEarlierMarks();
    case 'sem-results':      return renderSemResults();
    case 'exam-marks':       return renderExamMarks();
    case 'fee-paid':         return renderFeePaid();
    case 'fee-due':          return renderFeeDue();
    case 'hostel-details':   return renderHostel();
    case 'transport-details':return renderTransport();
    case 'announcements':    return renderAnnouncements();
    case 'course-reg':       return renderCourseReg();
    case 'course-cancel':    return renderCourseCancel();
    case 'minor-reg':        return renderMinorReg();
    case 'exam-reg':         return renderExamReg();
    case 'exam-reg-details': return renderExamRegDetails();
    case 'degree-photo':     return renderDegreePhoto();
    case 'online-payment':   return renderOnlinePayment();
    case 'payment-ack':      return renderPaymentAck();
    case 'bank-account':     return renderBankAccount();
    case 'hostel-fees':      return renderHostelFees();
    case 'events-calendar':  return renderEventsCalendar();
    case 'events-activities':return renderEventsActivities();
    case 'sap-info':         return renderSapInfo();
    case 'course-feedback':  return renderCourseFeedback();
    case 'settings':         return renderSettings();
    case 'doc-verification': return renderDocVerification();
  }
}

// ─────────────────────────────────────────────
//  MODULE: PROFILE
// ─────────────────────────────────────────────
async function renderProfile() {
  const el = document.getElementById('profileContent');
  el.innerHTML = loader();
  const res = await apiFetch('/student/profile');
  const p = res.ok ? res.data : DEMO.profile;
  const dobFmt = fmtDOB(p.dob);
  el.innerHTML = `
    <table class="profile-table">
      <tbody>
        <tr>
          <td class="label-cell">Student Name</td>
          <td class="colon-cell">:</td>
          <td class="value-cell"><strong>${p.full_name}</strong></td>
        </tr>
        <tr>
          <td class="label-cell">Register No.</td>
          <td class="colon-cell">:</td>
          <td class="value-cell">${p.register_number}</td>
        </tr>
        <tr>
          <td class="label-cell">Institution</td>
          <td class="colon-cell">:</td>
          <td class="value-cell"><strong>${p.institution}</strong></td>
        </tr>
        <tr>
          <td class="label-cell">Semester</td>
          <td class="colon-cell">:</td>
          <td class="value-cell"><strong>${p.semester}</strong></td>
        </tr>
        <tr>
          <td class="label-cell">Program / Section</td>
          <td class="colon-cell">:</td>
          <td class="value-cell"><strong class="highlight">${p.program}</strong>&nbsp;&nbsp;/&nbsp;&nbsp;<strong>'${p.section}'</strong></td>
        </tr>
        <tr>
          <td class="label-cell">Specialization</td>
          <td class="colon-cell">:</td>
          <td class="value-cell"><strong class="highlight">${p.specialization}</strong></td>
        </tr>
        <tr>
          <td class="label-cell">D.O.B. / Gender</td>
          <td class="colon-cell">:</td>
          <td class="value-cell">${dobFmt} / <a href="#">${p.gender}</a></td>
        </tr>
        <tr>
          <td class="label-cell">Student Contact Number / Email</td>
          <td class="colon-cell">:</td>
          <td class="value-cell">
            ${p.phone} <span class="badge-verified">Verified</span>
            &nbsp;/&nbsp; <a href="mailto:${p.email}">${p.email}</a>
          </td>
        </tr>
        <tr>
          <td class="label-cell">Father Name / Mother Name</td>
          <td class="colon-cell">:</td>
          <td class="value-cell">${p.father_name} / ${p.mother_name}</td>
        </tr>
        <tr>
          <td class="label-cell">Blood Group</td>
          <td class="colon-cell">:</td>
          <td class="value-cell">${p.blood_group || '-'}</td>
        </tr>
        <tr>
          <td class="label-cell">Access Through</td>
          <td class="colon-cell">:</td>
          <td class="value-cell" style="color:#888;font-size:11.5px;">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36</td>
        </tr>
      </tbody>
    </table>`;
}

// ─────────────────────────────────────────────
//  MODULE: SUBJECTS
// ─────────────────────────────────────────────
async function renderSubjects() {
  const el = document.getElementById('subjectsContent');
  el.innerHTML = loader();
  const res = await apiFetch('/academic/subjects');
  const data = res.ok ? res.data : DEMO.subjects;
  if (!data.length) { el.innerHTML = empty('No subjects found.'); return; }
  el.innerHTML = `
    <p style="font-size:12px;color:#666;margin-bottom:12px;">
      <strong>Academic Year:</strong> 2024-25 &nbsp;|&nbsp; <strong>Semester:</strong> IV
    </p>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Subject Code</th>
            <th>Subject Name</th>
            <th>Credits</th>
            <th>Type</th>
            <th>Faculty Name</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((s, i) => `
            <tr>
              <td class="serial-col">${i + 1}</td>
              <td><strong>${s.subject_code}</strong></td>
              <td>${s.subject_name}</td>
              <td style="text-align:center;">${s.credits}</td>
              <td><span class="pct-badge ${s.type === 'Lab' ? 'warn' : 'good'}">${s.type}</span></td>
              <td>${s.faculty_name}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p style="margin-top:10px;font-size:11.5px;color:#888;">Total Subjects: ${data.length} &nbsp;|&nbsp; Total Credits: ${data.reduce((a, s) => a + s.credits, 0)}</p>`;
}

// ─────────────────────────────────────────────
//  MODULE: TIMETABLE
// ─────────────────────────────────────────────
async function renderTimetable() {
  const el = document.getElementById('timetableContent');
  el.innerHTML = loader();
  const res = await apiFetch('/academic/timetable');
  const data = res.ok ? res.data : DEMO.timetable;

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const periods = [1,2,3,4,5,6,7];
  const timeMap = {1:'08:00-08:50',2:'08:50-09:40',3:'09:50-10:40',4:'Break',5:'11:30-12:20',6:'13:10-14:00',7:'14:00-14:50'};

  // Build lookup: day+period -> cell data
  const lookup = {};
  data.forEach(row => {
    lookup[`${row.day_of_week}-${row.period_number}`] = row;
  });

  const rows = periods.map(p => {
    const timeLabel = timeMap[p];
    if (timeLabel === 'Break') {
      return `<tr>
        <td style="background:#f5f5f5;color:#aaa;text-align:center;font-size:11px;font-style:italic;">Break</td>
        ${days.map(() => `<td style="background:#fafafa;"></td>`).join('')}
      </tr>`;
    }
    return `<tr>
      <td style="font-size:11px;color:#666;text-align:center;white-space:nowrap;">${timeLabel}</td>
      ${days.map(day => {
        const cell = lookup[`${day}-${p}`];
        if (cell) return `<td class="tt-cell">
          <div class="tt-code">${cell.subject_code}</div>
          <div class="tt-room">${cell.room_number}</div>
        </td>`;
        return `<td></td>`;
      }).join('')}
    </tr>`;
  }).join('');

  el.innerHTML = `
    <div class="timetable-wrap">
      <table class="timetable-grid">
        <thead>
          <tr>
            <th>Time</th>
            ${days.map(d => `<th>${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:10px;">
      ${[...new Set(data.map(d => d.subject_code))].map(code => {
        const s = data.find(d => d.subject_code === code);
        return `<span style="font-size:11.5px;background:#e8f5e9;border:1px solid #c8e6c9;padding:3px 10px;border-radius:10px;">
          <strong>${code}</strong> — ${s.subject_name || code}
        </span>`;
      }).join('')}
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: ATTENDANCE
// ─────────────────────────────────────────────
async function renderAttendance() {
  const el = document.getElementById('attendanceContent');
  el.innerHTML = loader();
  const res = await apiFetch('/academic/attendance');
  const data = res.ok ? res.data : DEMO.attendance;
  if (!data.length) { el.innerHTML = empty('No attendance data found.'); return; }

  const overall = data.reduce((a, r) => a + r.attended_classes + r.od_classes, 0) / data.reduce((a, r) => a + r.total_classes, 0) * 100;

  el.innerHTML = `
    <div class="stats-row" style="margin-bottom:16px;">
      <div class="stat-card" style="border-left-color:#2e7d32;">
        <i class="stat-icon fa fa-percentage"></i>
        <div class="stat-body">
          <div class="stat-label">Overall Attendance</div>
          <div class="stat-value" style="color:#2e7d32;">${overall.toFixed(2)}%</div>
        </div>
      </div>
      <div class="stat-card" style="border-left-color:#1565c0;">
        <i class="stat-icon fa fa-book fa-fw" style="color:#1565c0;"></i>
        <div class="stat-body">
          <div class="stat-label">Total Subjects</div>
          <div class="stat-value" style="color:#1565c0;">${data.length}</div>
        </div>
      </div>
      <div class="stat-card" style="border-left-color:#f57f17;">
        <i class="stat-icon fa fa-exclamation-triangle fa-fw" style="color:#f57f17;"></i>
        <div class="stat-body">
          <div class="stat-label">Below 75%</div>
          <div class="stat-value" style="color:#f57f17;">${data.filter(r => r.percentage < 75).length}</div>
        </div>
      </div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Subject Code</th>
            <th>Subject Name</th>
            <th>Type</th>
            <th>Total Classes</th>
            <th>Attended</th>
            <th>OD Classes</th>
            <th>ML Classes</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((r, i) => `
            <tr>
              <td class="serial-col">${i + 1}</td>
              <td><strong>${r.subject_code}</strong></td>
              <td>${r.subject_name}</td>
              <td>${r.type}</td>
              <td style="text-align:center;">${r.total_classes}</td>
              <td style="text-align:center;">${r.attended_classes}</td>
              <td style="text-align:center;">${r.od_classes}</td>
              <td style="text-align:center;">${r.ml_classes}</td>
              <td><span class="pct-badge ${pctClass(r.percentage)}">${Number(r.percentage).toFixed(2)}%</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p style="margin-top:10px;font-size:11.5px;color:#888;">
      <span style="background:#e8f5e9;padding:2px 8px;border-radius:8px;color:#2e7d32;font-weight:600;">≥85% Good</span>&nbsp;
      <span style="background:#fff8e1;padding:2px 8px;border-radius:8px;color:#f57f17;font-weight:600;">75–84% Warning</span>&nbsp;
      <span style="background:#fdecea;padding:2px 8px;border-radius:8px;color:#c62828;font-weight:600;">&lt;75% Shortage</span>
    </p>`;
}

// ─────────────────────────────────────────────
//  MODULE: OD/ML
// ─────────────────────────────────────────────
async function renderOdMl() {
  const el = document.getElementById('odMlContent');
  el.innerHTML = loader();
  const res = await apiFetch('/academic/od-ml');
  const data = res.ok ? res.data : DEMO.odml;
  if (!data.length) { el.innerHTML = empty('No OD/ML records found.'); return; }
  el.innerHTML = `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Type</th><th>From Date</th><th>To Date</th><th>Days</th><th>Reason</th><th>Status</th><th>Approved By</th></tr>
        </thead>
        <tbody>
          ${data.map((r, i) => {
            const days = Math.ceil((new Date(r.to_date) - new Date(r.from_date)) / 86400000) + 1;
            const sc = r.status.toLowerCase();
            return `<tr>
              <td class="serial-col">${i + 1}</td>
              <td><span class="status-badge ${r.leave_type === 'OD' ? 'paid' : 'warn'}">${r.leave_type}</span></td>
              <td>${fmt(r.from_date)}</td>
              <td>${fmt(r.to_date)}</td>
              <td style="text-align:center;">${days}</td>
              <td>${r.reason}</td>
              <td><span class="status-badge ${sc}">${r.status}</span></td>
              <td>${r.approved_by || '<em style="color:#aaa">Pending</em>'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: STUDENT ATTENDANCE (summary view)
// ─────────────────────────────────────────────
async function renderStudentAttendance() {
  const el = document.getElementById('studentAttendanceContent');
  el.innerHTML = loader();
  const data = DEMO.attendance;
  el.innerHTML = `
    <p style="font-size:12px;color:#666;margin-bottom:14px;">Consolidated attendance summary for the current semester.</p>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Subject</th><th>Present</th><th>Absent</th><th>Total</th><th>%</th></tr>
        </thead>
        <tbody>
          ${data.map((r, i) => {
            const absent = r.total_classes - r.attended_classes - r.od_classes;
            return `<tr>
              <td class="serial-col">${i+1}</td>
              <td>${r.subject_name}<br><span style="font-size:11px;color:#888">${r.subject_code}</span></td>
              <td style="text-align:center;color:#2e7d32;font-weight:600;">${r.attended_classes + r.od_classes}</td>
              <td style="text-align:center;color:#c62828;font-weight:600;">${Math.max(0, absent)}</td>
              <td style="text-align:center;">${r.total_classes}</td>
              <td><span class="pct-badge ${pctClass(r.percentage)}">${Number(r.percentage).toFixed(1)}%</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: INTERNAL MARKS
// ─────────────────────────────────────────────
async function renderInternalMarks() {
  const el = document.getElementById('internalMarksContent');
  el.innerHTML = loader();
  const res = await apiFetch('/examination/internal-marks');
  const data = res.ok ? res.data : DEMO.internalMarks;
  if (!data.length) { el.innerHTML = empty('No internal marks found.'); return; }
  el.innerHTML = `
    <p style="font-size:12px;color:#666;margin-bottom:12px;"><strong>Semester:</strong> IV (2024-25)</p>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Subject Code</th><th>Subject Name</th><th>Exam Type</th><th>Max Marks</th><th>Marks Obtained</th><th>Percentage</th></tr>
        </thead>
        <tbody>
          ${data.map((r, i) => {
            const pct = (r.marks_obtained / r.max_marks * 100).toFixed(1);
            return `<tr>
              <td class="serial-col">${i+1}</td>
              <td><strong>${r.subject_code}</strong></td>
              <td>${r.subject_name}</td>
              <td><span class="pct-badge good">${r.exam_type}</span></td>
              <td style="text-align:center;">${r.max_marks}</td>
              <td style="text-align:center;font-weight:700;color:#1a2a0a;">${r.marks_obtained}</td>
              <td><span class="pct-badge ${pctClass(Number(pct))}">${pct}%</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: EARLIER MARKS
// ─────────────────────────────────────────────
async function renderEarlierMarks() {
  const el = document.getElementById('earlierMarksContent');
  el.innerHTML = loader();
  const res = await apiFetch('/examination/previous-internal-marks');
  const data = res.ok ? res.data : DEMO.earlierMarks;
  if (!data.length) { el.innerHTML = empty('No earlier marks found.'); return; }
  el.innerHTML = `
    <p style="font-size:12px;color:#666;margin-bottom:12px;"><strong>Semester III</strong> (2023-24) Internal Assessment Records</p>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Subject Code</th><th>Subject Name</th><th>Exam Type</th><th>Max Marks</th><th>Marks Obtained</th><th>Percentage</th><th>Semester</th></tr>
        </thead>
        <tbody>
          ${data.map((r, i) => {
            const pct = (r.marks_obtained / r.max_marks * 100).toFixed(1);
            return `<tr>
              <td class="serial-col">${i+1}</td>
              <td><strong>${r.subject_code}</strong></td>
              <td>${r.subject_name}</td>
              <td><span class="pct-badge good">${r.exam_type}</span></td>
              <td style="text-align:center;">${r.max_marks}</td>
              <td style="text-align:center;font-weight:700;">${r.marks_obtained}</td>
              <td><span class="pct-badge ${pctClass(Number(pct))}">${pct}%</span></td>
              <td style="text-align:center;">${r.semester}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: SEMESTER RESULTS
// ─────────────────────────────────────────────
async function renderSemResults() {
  const el = document.getElementById('semResultsContent');
  el.innerHTML = loader();
  const res = await apiFetch('/examination/semester-results');
  const data = res.ok ? res.data : DEMO.semResults;
  if (!data.length) { el.innerHTML = empty('No results found.'); return; }
  const gpa = (data.reduce((a, r) => a + r.grade_points * r.credits, 0) / data.reduce((a, r) => a + r.credits, 0)).toFixed(2);
  el.innerHTML = `
    <div class="stats-row" style="margin-bottom:16px;">
      <div class="stat-card" style="border-left-color:#2e7d32;">
        <i class="stat-icon fa fa-star" style="color:#2e7d32;"></i>
        <div class="stat-body">
          <div class="stat-label">SGPA (Sem III)</div>
          <div class="stat-value" style="color:#2e7d32;">${gpa}</div>
        </div>
      </div>
      <div class="stat-card" style="border-left-color:#1565c0;">
        <i class="stat-icon fa fa-check-circle" style="color:#1565c0;"></i>
        <div class="stat-body">
          <div class="stat-label">Result</div>
          <div class="stat-value" style="color:#1565c0;">PASS</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="stat-icon fa fa-layer-group"></i>
        <div class="stat-body">
          <div class="stat-label">Total Credits</div>
          <div class="stat-value">${data.reduce((a, r) => a + r.credits, 0)}</div>
        </div>
      </div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Subject Code</th><th>Subject Name</th><th>Credits</th><th>Marks</th><th>Grade</th><th>Grade Points</th><th>Result</th></tr>
        </thead>
        <tbody>
          ${data.map((r, i) => `
            <tr>
              <td class="serial-col">${i+1}</td>
              <td><strong>${r.subject_code}</strong></td>
              <td>${r.subject_name}</td>
              <td style="text-align:center;">${r.credits}</td>
              <td style="text-align:center;font-weight:700;">${r.marks_obtained} / ${r.max_marks}</td>
              <td style="text-align:center;"><span class="grade-badge">${r.grade}</span></td>
              <td style="text-align:center;font-weight:700;">${r.grade_points}</td>
              <td><span class="status-badge ${r.result === 'Pass' ? 'paid' : 'overdue'}">${r.result}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: EXAM MARKS
// ─────────────────────────────────────────────
async function renderExamMarks() {
  const el = document.getElementById('examMarksContent');
  el.innerHTML = loader();
  // Same as semResults for now
  const data = DEMO.semResults;
  el.innerHTML = `
    <p style="font-size:12px;color:#666;margin-bottom:12px;">End Semester Examination Marks — Semester III (2023-24)</p>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Subject Code</th><th>Subject Name</th><th>Max Marks</th><th>Marks Obtained</th><th>Grade</th><th>Result</th></tr>
        </thead>
        <tbody>
          ${data.map((r, i) => `
            <tr>
              <td class="serial-col">${i+1}</td>
              <td><strong>${r.subject_code}</strong></td>
              <td>${r.subject_name}</td>
              <td style="text-align:center;">${r.max_marks}</td>
              <td style="text-align:center;font-weight:700;">${r.marks_obtained}</td>
              <td style="text-align:center;"><span class="grade-badge">${r.grade}</span></td>
              <td><span class="status-badge paid">${r.result}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: FEE PAID
// ─────────────────────────────────────────────
async function renderFeePaid() {
  const el = document.getElementById('feePaidContent');
  el.innerHTML = loader();
  const res = await apiFetch('/finance/fees');
  const allFees = res.ok ? res.data : DEMO.fees;
  const data = allFees.filter(f => f.status === 'Paid');
  const total = data.reduce((a, f) => a + Number(f.amount), 0);
  if (!data.length) { el.innerHTML = empty('No paid fee records found.'); return; }
  el.innerHTML = `
    <div class="stats-row" style="margin-bottom:16px;">
      <div class="stat-card" style="border-left-color:#2e7d32;">
        <i class="stat-icon fa fa-check-circle" style="color:#2e7d32;"></i>
        <div class="stat-body">
          <div class="stat-label">Total Paid</div>
          <div class="stat-value" style="color:#2e7d32;">${inr(total)}</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="stat-icon fa fa-file-invoice-dollar"></i>
        <div class="stat-body">
          <div class="stat-label">Transactions</div>
          <div class="stat-value">${data.length}</div>
        </div>
      </div>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Fee Type</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Transaction ID</th><th>Mode</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${data.map((f, i) => `
            <tr>
              <td class="serial-col">${i+1}</td>
              <td>${f.fee_type}</td>
              <td style="font-weight:700;">${inr(f.amount)}</td>
              <td>${fmt(f.due_date)}</td>
              <td>${fmt(f.paid_date)}</td>
              <td style="font-size:11px;color:#555;">${f.transaction_id || '-'}</td>
              <td>${f.payment_mode || '-'}</td>
              <td><span class="status-badge paid">Paid</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: FEE DUE
// ─────────────────────────────────────────────
async function renderFeeDue() {
  const el = document.getElementById('feeDueContent');
  el.innerHTML = loader();
  const res = await apiFetch('/finance/fees');
  const allFees = res.ok ? res.data : DEMO.fees;
  const data = allFees.filter(f => f.status !== 'Paid');
  const total = data.reduce((a, f) => a + Number(f.amount), 0);
  if (!data.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fa fa-check-circle" style="color:#2e7d32;"></i></div><p style="color:#2e7d32;font-weight:600;">No pending fee dues! All fees are paid.</p></div>`;
    return;
  }
  el.innerHTML = `
    <div style="background:#fdecea;border-left:4px solid #c62828;padding:10px 16px;border-radius:2px;margin-bottom:16px;font-size:13px;color:#b71c1c;">
      <i class="fa fa-exclamation-triangle"></i>&nbsp; You have <strong>${data.length}</strong> pending fee(s) totalling <strong>${inr(total)}</strong>. Please pay before the due date to avoid late fees.
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Fee Type</th><th>Amount</th><th>Due Date</th><th>Academic Year</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${data.map((f, i) => `
            <tr>
              <td class="serial-col">${i+1}</td>
              <td>${f.fee_type}</td>
              <td style="font-weight:700;color:#c62828;">${inr(f.amount)}</td>
              <td>${fmt(f.due_date)}</td>
              <td>${f.academic_year}</td>
              <td><span class="status-badge ${f.status.toLowerCase()}">${f.status}</span></td>
              <td><button onclick="alert('Online payment gateway — integrate with payment provider.')" style="background:#5cb85c;color:#fff;border:none;padding:5px 14px;border-radius:3px;cursor:pointer;font-size:12px;font-weight:600;">Pay Now</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: HOSTEL
// ─────────────────────────────────────────────
async function renderHostel() {
  const el = document.getElementById('hostelContent');
  el.innerHTML = loader();
  const res = await apiFetch('/finance/hostel');
  const h = res.ok ? res.data : DEMO.hostel;
  if (!h) {
    el.innerHTML = `<div class="info-card"><div class="info-icon"><i class="fa fa-building"></i></div><h3>Hostel Information</h3><p style="color:#888;font-size:13px;">No hostel allocation found for this student.</p></div>`;
    return;
  }
  el.innerHTML = `
    <div class="info-card">
      <div class="info-icon"><i class="fa fa-building"></i></div>
      <h3>Hostel Room Details — ${h.academic_year}</h3>
      <div class="info-row"><span class="info-lbl">Hostel Name</span><span class="info-val">${h.hostel_name}</span></div>
      <div class="info-row"><span class="info-lbl">Block</span><span class="info-val">${h.block}</span></div>
      <div class="info-row"><span class="info-lbl">Room Number</span><span class="info-val">${h.room_number}</span></div>
      <div class="info-row"><span class="info-lbl">Bed Number</span><span class="info-val">${h.bed_number}</span></div>
      <div class="info-row"><span class="info-lbl">Mess Type</span><span class="info-val">${h.mess_type}</span></div>
      <div class="info-row"><span class="info-lbl">Academic Year</span><span class="info-val">${h.academic_year}</span></div>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: TRANSPORT
// ─────────────────────────────────────────────
async function renderTransport() {
  const el = document.getElementById('transportContent');
  el.innerHTML = loader();
  const res = await apiFetch('/finance/transport');
  const t = res.ok ? res.data : DEMO.transport;
  if (!t) {
    el.innerHTML = `<div class="info-card"><div class="info-icon"><i class="fa fa-bus"></i></div><h3>Transport Information</h3><p style="color:#888;font-size:13px;">No transport allocation found for this student.</p></div>`;
    return;
  }
  el.innerHTML = `
    <div class="info-card">
      <div class="info-icon"><i class="fa fa-bus"></i></div>
      <h3>Transport Details — ${t.academic_year}</h3>
      <div class="info-row"><span class="info-lbl">Route Number</span><span class="info-val">${t.route_number}</span></div>
      <div class="info-row"><span class="info-lbl">Route Name</span><span class="info-val">${t.route_name}</span></div>
      <div class="info-row"><span class="info-lbl">Boarding Point</span><span class="info-val">${t.boarding_point}</span></div>
      <div class="info-row"><span class="info-lbl">Bus Timings</span><span class="info-val">${t.bus_timings}</span></div>
      <div class="info-row"><span class="info-lbl">Academic Year</span><span class="info-val">${t.academic_year}</span></div>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: ANNOUNCEMENTS
// ─────────────────────────────────────────────
async function renderAnnouncements() {
  const el = document.getElementById('announcementsContent');
  el.innerHTML = loader();
  const res = await apiFetch('/finance/announcements');
  const data = res.ok ? res.data : DEMO.announcements;
  if (!data.length) { el.innerHTML = empty('No announcements.'); return; }
  el.innerHTML = `
    <div class="announcement-list">
      ${data.map(a => `
        <div class="announcement-card ${a.is_important ? 'important' : ''}">
          <div class="ann-header">
            <div class="ann-title">
              ${a.is_important ? '<i class="fa fa-exclamation-circle" style="color:#c62828;margin-right:6px;"></i>' : ''}
              ${a.title}
            </div>
            <span class="ann-badge ${a.category.toLowerCase()}">${a.category}</span>
          </div>
          <div class="ann-content">${a.content}</div>
          <div class="ann-footer">
            <span><i class="fa fa-user fa-fw"></i> ${a.posted_by}</span>
            <span><i class="fa fa-clock fa-fw"></i> ${fmt(a.posted_at)}</span>
          </div>
        </div>`).join('')}
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: COURSE REGISTRATION
// ─────────────────────────────────────────────
function renderCourseReg() {
  document.getElementById('courseRegContent').innerHTML = `
    <div style="background:#e3f2fd;border-left:4px solid #1565c0;padding:12px 18px;border-radius:2px;margin-bottom:18px;font-size:13px;color:#0d47a1;">
      <i class="fa fa-info-circle"></i>&nbsp; Course Registration for <strong>Semester V (2025-26)</strong> is open. Last date: <strong>30 Apr 2025</strong>. Ensure fee dues are cleared before registering.
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Subject Code</th><th>Subject Name</th><th>Credits</th><th>Type</th><th>Slot</th><th>Action</th></tr></thead>
        <tbody>
          ${[
            {code:'CS501',name:'Compiler Design',credits:3,type:'Theory',slot:'A'},
            {code:'CS502',name:'Machine Learning',credits:3,type:'Theory',slot:'B'},
            {code:'CS503',name:'Cloud Computing',credits:3,type:'Theory',slot:'C'},
            {code:'CS504',name:'Information Security',credits:3,type:'Theory',slot:'D'},
            {code:'CS505',name:'Deep Learning',credits:3,type:'Theory',slot:'E'},
            {code:'CS506L',name:'ML Laboratory',credits:2,type:'Lab',slot:'P1'},
          ].map((s, i) => `<tr>
            <td class="serial-col">${i+1}</td>
            <td><strong>${s.code}</strong></td>
            <td>${s.name}</td>
            <td style="text-align:center;">${s.credits}</td>
            <td>${s.type}</td>
            <td style="text-align:center;">${s.slot}</td>
            <td>
              <button onclick="alert('Course ${s.code} registered successfully!')" style="background:#5cb85c;color:#fff;border:none;padding:4px 12px;border-radius:3px;cursor:pointer;font-size:12px;">Register</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: COURSE CANCELLATION
// ─────────────────────────────────────────────
function renderCourseCancel() {
  document.getElementById('courseCancelContent').innerHTML = `
    <div style="background:#fff8e1;border-left:4px solid #f57f17;padding:12px 18px;border-radius:2px;margin-bottom:18px;font-size:13px;color:#e65100;">
      <i class="fa fa-exclamation-triangle"></i>&nbsp; Course deregistration period is open until <strong>07 May 2025</strong>. You may cancel elective courses only.
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Subject Code</th><th>Subject Name</th><th>Credits</th><th>Registered On</th><th>Action</th></tr></thead>
        <tbody>
          ${DEMO.subjects.slice(0,6).map((s, i) => `<tr>
            <td class="serial-col">${i+1}</td>
            <td><strong>${s.subject_code}</strong></td>
            <td>${s.subject_name}</td>
            <td style="text-align:center;">${s.credits}</td>
            <td>10 Jan 2025</td>
            <td>
              <button onclick="if(confirm('Cancel ${s.subject_code}?')) alert('Course cancelled.')" style="background:#d32f2f;color:#fff;border:none;padding:4px 12px;border-radius:3px;cursor:pointer;font-size:12px;">Cancel</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: MINOR PROGRAM REGISTRATION
// ─────────────────────────────────────────────
function renderMinorReg() {
  document.getElementById('minorRegContent').innerHTML = `
    <div style="background:#e8f5e9;border-left:4px solid #2e7d32;padding:12px 18px;border-radius:2px;margin-bottom:18px;font-size:13px;color:#1b5e20;">
      <i class="fa fa-info-circle"></i>&nbsp; Minor Program Registration for 2025-26 is now open. Choose a minor from the available disciplines below.
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Minor Program</th><th>Offered By</th><th>Total Credits</th><th>Semesters</th><th>Seats Available</th><th>Action</th></tr></thead>
        <tbody>
          ${[
            {prog:'Data Science',dept:'CSE',credits:18,sem:'V-VIII',seats:40},
            {prog:'Entrepreneurship',dept:'Management',credits:12,sem:'V-VI',seats:30},
            {prog:'Cyber Security',dept:'CSE',credits:18,sem:'V-VIII',seats:35},
            {prog:'Environmental Science',dept:'Sciences',credits:12,sem:'V-VI',seats:50},
            {prog:'Design Thinking',dept:'Design',credits:12,sem:'V-VI',seats:25},
          ].map((m, i) => `<tr>
            <td class="serial-col">${i+1}</td>
            <td><strong>${m.prog}</strong></td>
            <td>${m.dept}</td>
            <td style="text-align:center;">${m.credits}</td>
            <td>${m.sem}</td>
            <td style="text-align:center;">${m.seats}</td>
            <td><button onclick="alert('Applied for Minor: ${m.prog}')" style="background:#6b8c3e;color:#fff;border:none;padding:4px 12px;border-radius:3px;cursor:pointer;font-size:12px;">Apply</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: EXAM REGISTRATION
// ─────────────────────────────────────────────
function renderExamReg() {
  document.getElementById('examRegContent').innerHTML = `
    <div style="background:#e3f2fd;border-left:4px solid #1565c0;padding:12px 18px;border-radius:2px;margin-bottom:18px;font-size:13px;color:#0d47a1;">
      <i class="fa fa-info-circle"></i>&nbsp; End Semester Exam Registration for <strong>Semester IV (May 2025)</strong> is open. Last date: <strong>02 May 2025</strong>.
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Subject Code</th><th>Subject Name</th><th>Exam Date</th><th>Session</th><th>Eligibility</th><th>Action</th></tr></thead>
        <tbody>
          ${[
            {code:'CS401',name:'Design and Analysis of Algorithms',date:'12 May 2025',session:'FN',eligible:true},
            {code:'CS402',name:'Database Management Systems',date:'14 May 2025',session:'FN',eligible:true},
            {code:'CS403',name:'Operating Systems',date:'16 May 2025',session:'AN',eligible:true},
            {code:'CS404',name:'Computer Networks',date:'19 May 2025',session:'FN',eligible:true},
            {code:'CS405',name:'Artificial Intelligence',date:'21 May 2025',session:'AN',eligible:true},
            {code:'MA401',name:'Probability and Statistics',date:'23 May 2025',session:'FN',eligible:true},
          ].map((s, i) => `<tr>
            <td class="serial-col">${i+1}</td>
            <td><strong>${s.code}</strong></td>
            <td>${s.name}</td>
            <td>${s.date}</td>
            <td>${s.session === 'FN' ? 'Forenoon (9:30 AM)' : 'Afternoon (2:00 PM)'}</td>
            <td><span class="status-badge paid">Eligible</span></td>
            <td><button onclick="alert('Registered for ${s.code} exam!')" style="background:#5cb85c;color:#fff;border:none;padding:4px 12px;border-radius:3px;cursor:pointer;font-size:12px;">Register</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: EXAM REGISTRATION DETAILS
// ─────────────────────────────────────────────
function renderExamRegDetails() {
  document.getElementById('examRegDetailsContent').innerHTML = `
    <p style="font-size:12px;color:#666;margin-bottom:12px;">Registered for End Semester Examinations — Semester IV (May 2025)</p>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Subject Code</th><th>Subject Name</th><th>Exam Date</th><th>Exam Hall</th><th>Seat Number</th><th>Session</th></tr></thead>
        <tbody>
          ${[
            {code:'CS401',name:'Design and Analysis of Algorithms',date:'12 May 2025',hall:'Exam Hall - 3',seat:'EH3-024',session:'FN'},
            {code:'CS402',name:'Database Management Systems',date:'14 May 2025',hall:'Exam Hall - 3',seat:'EH3-024',session:'FN'},
            {code:'CS403',name:'Operating Systems',date:'16 May 2025',hall:'Exam Hall - 1',seat:'EH1-024',session:'AN'},
            {code:'CS404',name:'Computer Networks',date:'19 May 2025',hall:'Exam Hall - 3',seat:'EH3-024',session:'FN'},
            {code:'CS405',name:'Artificial Intelligence',date:'21 May 2025',hall:'Exam Hall - 2',seat:'EH2-024',session:'AN'},
            {code:'MA401',name:'Probability and Statistics',date:'23 May 2025',hall:'Exam Hall - 3',seat:'EH3-024',session:'FN'},
          ].map((s, i) => `<tr>
            <td class="serial-col">${i+1}</td>
            <td><strong>${s.code}</strong></td>
            <td>${s.name}</td>
            <td><strong>${s.date}</strong></td>
            <td>${s.hall}</td>
            <td style="font-weight:700;color:#1565c0;">${s.seat}</td>
            <td><span class="pct-badge good">${s.session}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:14px;">
      <button onclick="window.print()" style="background:#6b8c3e;color:#fff;border:none;padding:8px 18px;border-radius:3px;cursor:pointer;font-size:13px;font-weight:600;"><i class="fa fa-print"></i> Print Hall Ticket</button>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: DEGREE PHOTO UPLOAD
// ─────────────────────────────────────────────
function renderDegreePhoto() {
  document.getElementById('degreePhotoContent').innerHTML = `
    <div class="info-card" style="max-width:500px;">
      <div class="info-icon"><i class="fa fa-camera"></i></div>
      <h3>Degree Photo Upload</h3>
      <p style="font-size:12.5px;color:#666;margin-bottom:16px;">Upload a recent passport-size photograph for your degree certificate. The photo must be in colour with white background.</p>
      <div style="border:2px dashed #c8e6c9;border-radius:6px;padding:30px;text-align:center;background:#f9fff5;margin-bottom:16px;">
        <i class="fa fa-cloud-upload-alt" style="font-size:36px;color:#6b8c3e;margin-bottom:10px;display:block;"></i>
        <p style="font-size:13px;color:#555;margin-bottom:12px;">Drag &amp; drop your photo here, or</p>
        <input type="file" id="degreePhotoFile" accept="image/jpeg,image/png" style="display:none" onchange="previewPhoto(event)"/>
        <button onclick="document.getElementById('degreePhotoFile').click()" style="background:#6b8c3e;color:#fff;border:none;padding:8px 20px;border-radius:3px;cursor:pointer;font-size:13px;">Choose File</button>
      </div>
      <div id="photoPreview" style="display:none;text-align:center;margin-bottom:16px;">
        <img id="previewImg" src="" alt="Preview" style="max-width:150px;max-height:200px;border:2px solid #c8e6c9;border-radius:4px;"/>
      </div>
      <ul style="font-size:12px;color:#888;margin:0 0 16px 18px;line-height:1.8;">
        <li>File format: JPG / PNG</li>
        <li>Maximum file size: 200 KB</li>
        <li>Dimensions: 3.5 cm × 4.5 cm (passport size)</li>
        <li>Background: White</li>
      </ul>
      <button onclick="alert('Photo uploaded successfully!')" style="background:#5cb85c;color:#fff;border:none;padding:8px 20px;border-radius:3px;cursor:pointer;font-size:13px;font-weight:600;"><i class="fa fa-upload"></i> Upload Photo</button>
    </div>`;
}

function previewPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('previewImg').src = ev.target.result;
    document.getElementById('photoPreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// ─────────────────────────────────────────────
//  MODULE: ONLINE PAYMENT VERIFICATION
// ─────────────────────────────────────────────
function renderOnlinePayment() {
  document.getElementById('onlinePaymentContent').innerHTML = `
    <div class="info-card">
      <h3><i class="fa fa-credit-card" style="margin-right:8px;color:#6b8c3e;"></i>Online Payment Verification</h3>
      <p style="font-size:12.5px;color:#666;margin-bottom:16px;">Enter your payment transaction ID to verify the payment status.</p>
      <div style="display:flex;gap:10px;align-items:flex-end;margin-bottom:20px;">
        <div style="flex:1;">
          <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:5px;">Transaction / Reference Number</label>
          <input type="text" id="txnInput" placeholder="e.g. TXN20241210001234" style="width:100%;padding:8px 10px;border:1px solid #ccc;border-radius:2px;font-size:13px;"/>
        </div>
        <button onclick="verifyPayment()" style="background:#6b8c3e;color:#fff;border:none;padding:9px 18px;border-radius:3px;cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap;">Verify</button>
      </div>
      <div id="verificationResult"></div>
    </div>`;
}

function verifyPayment() {
  const txn = document.getElementById('txnInput').value.trim();
  const el = document.getElementById('verificationResult');
  if (!txn) { el.innerHTML = `<div style="color:#c62828;font-size:12.5px;">Please enter a transaction number.</div>`; return; }
  const found = DEMO.fees.find(f => f.transaction_id === txn);
  if (found) {
    el.innerHTML = `<div style="background:#e8f5e9;border:1px solid #a5d6a7;border-radius:3px;padding:12px 16px;font-size:13px;color:#1b5e20;">
      <i class="fa fa-check-circle" style="margin-right:6px;"></i>
      <strong>Payment Verified!</strong><br>
      Fee Type: ${found.fee_type}<br>Amount: ${inr(found.amount)}<br>Paid On: ${fmt(found.paid_date)}
    </div>`;
  } else {
    el.innerHTML = `<div style="background:#fdecea;border:1px solid #ef9a9a;border-radius:3px;padding:12px 16px;font-size:13px;color:#b71c1c;">
      <i class="fa fa-times-circle" style="margin-right:6px;"></i>
      Transaction not found. Please check the ID and try again.
    </div>`;
  }
}

// ─────────────────────────────────────────────
//  MODULE: PAYMENT ACK
// ─────────────────────────────────────────────
function renderPaymentAck() {
  const paid = DEMO.fees.filter(f => f.status === 'Paid');
  document.getElementById('paymentAckContent').innerHTML = `
    <p style="font-size:12px;color:#666;margin-bottom:14px;">Download payment acknowledgment receipts for completed transactions.</p>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Fee Type</th><th>Amount</th><th>Paid Date</th><th>Transaction ID</th><th>Action</th></tr></thead>
        <tbody>
          ${paid.map((f, i) => `<tr>
            <td class="serial-col">${i+1}</td>
            <td>${f.fee_type}</td>
            <td style="font-weight:700;">${inr(f.amount)}</td>
            <td>${fmt(f.paid_date)}</td>
            <td style="font-size:11.5px;">${f.transaction_id}</td>
            <td><button onclick="alert('Downloading receipt for ${f.transaction_id}...')" style="background:#1565c0;color:#fff;border:none;padding:4px 12px;border-radius:3px;cursor:pointer;font-size:12px;"><i class="fa fa-download"></i> Receipt</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: BANK ACCOUNT
// ─────────────────────────────────────────────
function renderBankAccount() {
  document.getElementById('bankAccountContent').innerHTML = `
    <div class="info-card">
      <div class="info-icon"><i class="fa fa-university"></i></div>
      <h3>Bank Account Details (for Scholarship / Refund)</h3>
      <div class="info-row"><span class="info-lbl">Account Holder</span><span class="info-val">IMMIDISETTI TERISH CHARAN TEJ</span></div>
      <div class="info-row"><span class="info-lbl">Bank Name</span><span class="info-val">State Bank of India</span></div>
      <div class="info-row"><span class="info-lbl">Branch</span><span class="info-val">Amaravati Branch</span></div>
      <div class="info-row"><span class="info-lbl">Account Number</span><span class="info-val">XXXXXXXXXXXX4521</span></div>
      <div class="info-row"><span class="info-lbl">IFSC Code</span><span class="info-val">SBIN0021046</span></div>
      <div class="info-row"><span class="info-lbl">Account Type</span><span class="info-val">Savings</span></div>
      <div style="margin-top:14px;">
        <button onclick="alert('Please visit Finance Office to update bank details with supporting documents.')" style="background:#6b8c3e;color:#fff;border:none;padding:7px 16px;border-radius:3px;cursor:pointer;font-size:12.5px;">Update Bank Details</button>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: HOSTEL FEES
// ─────────────────────────────────────────────
function renderHostelFees() {
  document.getElementById('hostelFeesContent').innerHTML = `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Fee Description</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td class="serial-col">1</td><td>Hostel Rent - Semester IV</td><td style="font-weight:700;">${inr(35000)}</td><td>15 Dec 2024</td><td><span class="status-badge paid">Paid</span></td></tr>
          <tr><td class="serial-col">2</td><td>Mess Charges - Semester IV</td><td style="font-weight:700;">${inr(18000)}</td><td>15 Dec 2024</td><td><span class="status-badge paid">Paid</span></td></tr>
          <tr><td class="serial-col">3</td><td>Hostel Rent - Semester V</td><td style="font-weight:700;">${inr(35000)}</td><td>15 Jun 2025</td><td><span class="status-badge pending">Pending</span></td></tr>
          <tr><td class="serial-col">4</td><td>Mess Charges - Semester V</td><td style="font-weight:700;">${inr(18000)}</td><td>15 Jun 2025</td><td><span class="status-badge pending">Pending</span></td></tr>
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: EVENTS CALENDAR
// ─────────────────────────────────────────────
function renderEventsCalendar() {
  document.getElementById('eventsCalendarContent').innerHTML = `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Event</th><th>Date</th><th>Category</th></tr></thead>
        <tbody>
          ${[
            {ev:'Commencement of Semester IV Classes',date:'02 Jan 2025',cat:'Academic'},
            {ev:'CAT-1 Examinations',date:'03 Feb 2025',cat:'Exam'},
            {ev:'Republic Day Holiday',date:'26 Jan 2025',cat:'Holiday'},
            {ev:'CAT-2 Examinations',date:'17 Mar 2025',cat:'Exam'},
            {ev:'Ugadi Holiday',date:'01 Apr 2025',cat:'Holiday'},
            {ev:'Course Registration - Semester V Opens',date:'08 Apr 2025',cat:'Academic'},
            {ev:'Last Working Day',date:'02 May 2025',cat:'Academic'},
            {ev:'End Semester Examinations',date:'12 May 2025',cat:'Exam'},
            {ev:'Summer Vacation Begins',date:'31 May 2025',cat:'Holiday'},
          ].map((e, i) => `<tr>
            <td class="serial-col">${i+1}</td>
            <td><strong>${e.ev}</strong></td>
            <td>${e.date}</td>
            <td><span class="ann-badge ${e.cat.toLowerCase()}">${e.cat}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: EVENTS ACTIVITIES
// ─────────────────────────────────────────────
function renderEventsActivities() {
  document.getElementById('eventsActivitiesContent').innerHTML = `
    <div class="announcement-list">
      ${[
        {title:'Hackathon 2025 – SRM TechFest',content:'Annual 24-hour hackathon organized by CSE Department. Prizes worth ₹1,00,000. Register by April 28, 2025.',cat:'Academic'},
        {title:'Cultural Fest – MELA 2025',content:'Annual cultural festival from May 3–5, 2025. Events include music, dance, drama, and literary competitions.',cat:'General'},
        {title:'Sports Meet 2025',content:'Annual inter-department sports meet scheduled for April 22–24, 2025. Register through your class advisor.',cat:'General'},
      ].map(a => `<div class="announcement-card">
        <div class="ann-header">
          <div class="ann-title">${a.title}</div>
          <span class="ann-badge ${a.cat.toLowerCase()}">${a.cat}</span>
        </div>
        <div class="ann-content">${a.content}</div>
      </div>`).join('')}
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: SAP INFO
// ─────────────────────────────────────────────
function renderSapInfo() {
  document.getElementById('sapInfoContent').innerHTML = `
    <div class="info-card">
      <div class="info-icon"><i class="fa fa-id-card"></i></div>
      <h3>Student Activity Points (SAP)</h3>
      <div class="info-row"><span class="info-lbl">Total SAP Earned</span><span class="info-val" style="color:#2e7d32;font-size:18px;font-weight:700;">145 / 200</span></div>
      <div class="info-row"><span class="info-lbl">Category A (Academic)</span><span class="info-val">60 pts</span></div>
      <div class="info-row"><span class="info-lbl">Category B (Cultural)</span><span class="info-val">35 pts</span></div>
      <div class="info-row"><span class="info-lbl">Category C (Sports)</span><span class="info-val">25 pts</span></div>
      <div class="info-row"><span class="info-lbl">Category D (Volunteering)</span><span class="info-val">25 pts</span></div>
      <div class="info-row"><span class="info-lbl">Status</span><span class="info-val"><span class="status-badge paid">On Track</span></span></div>
      <p style="font-size:11.5px;color:#888;margin-top:12px;">Minimum 200 SAP required for degree completion. 55 more points needed.</p>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: COURSE FEEDBACK
// ─────────────────────────────────────────────
function renderCourseFeedback() {
  document.getElementById('courseFeedbackContent').innerHTML = `
    <p style="font-size:12px;color:#666;margin-bottom:14px;">Please provide honest feedback for your courses. Feedback is anonymous and used for faculty evaluation.</p>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Subject</th><th>Faculty</th><th>Rating (1-5)</th><th>Action</th></tr></thead>
        <tbody>
          ${DEMO.subjects.map((s, i) => `<tr>
            <td class="serial-col">${i+1}</td>
            <td>${s.subject_name}</td>
            <td>${s.faculty_name}</td>
            <td>
              <select style="border:1px solid #ccc;padding:4px 8px;border-radius:2px;font-size:12px;">
                <option>5 - Excellent</option>
                <option>4 - Good</option>
                <option>3 - Average</option>
                <option>2 - Below Average</option>
                <option>1 - Poor</option>
              </select>
            </td>
            <td><button onclick="alert('Feedback submitted for ${s.subject_code}!')" style="background:#6b8c3e;color:#fff;border:none;padding:4px 12px;border-radius:3px;cursor:pointer;font-size:12px;">Submit</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: SETTINGS
// ─────────────────────────────────────────────
function renderSettings() {
  document.getElementById('settingsContent').innerHTML = `
    <div class="info-card">
      <h3><i class="fa fa-cog" style="margin-right:8px;color:#6b8c3e;"></i>Account Settings</h3>
      <form onsubmit="event.preventDefault();alert('Settings saved!');">
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:5px;">Current Password</label>
          <input type="password" placeholder="Enter current password" style="width:100%;max-width:380px;padding:8px 10px;border:1px solid #ccc;border-radius:2px;font-size:13px;"/>
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:5px;">New Password</label>
          <input type="password" placeholder="Enter new password" style="width:100%;max-width:380px;padding:8px 10px;border:1px solid #ccc;border-radius:2px;font-size:13px;"/>
        </div>
        <div style="margin-bottom:18px;">
          <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:5px;">Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" style="width:100%;max-width:380px;padding:8px 10px;border:1px solid #ccc;border-radius:2px;font-size:13px;"/>
        </div>
        <button type="submit" style="background:#6b8c3e;color:#fff;border:none;padding:8px 20px;border-radius:3px;cursor:pointer;font-size:13px;font-weight:600;">Change Password</button>
      </form>
    </div>`;
}

// ─────────────────────────────────────────────
//  MODULE: DOC VERIFICATION
// ─────────────────────────────────────────────
function renderDocVerification() {
  document.getElementById('docVerificationContent').innerHTML = `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Document</th><th>Submitted On</th><th>Verified By</th><th>Status</th></tr></thead>
        <tbody>
          ${[
            {doc:'10th Mark Sheet',date:'15 Aug 2024',by:'Admissions Office',status:'Verified'},
            {doc:'12th Mark Sheet',date:'15 Aug 2024',by:'Admissions Office',status:'Verified'},
            {doc:'Transfer Certificate',date:'16 Aug 2024',by:'Admissions Office',status:'Verified'},
            {doc:'Aadhar Card',date:'15 Aug 2024',by:'Admissions Office',status:'Verified'},
            {doc:'Community Certificate',date:'16 Aug 2024',by:'Admissions Office',status:'Pending'},
          ].map((d, i) => `<tr>
            <td class="serial-col">${i+1}</td>
            <td><strong>${d.doc}</strong></td>
            <td>${d.date}</td>
            <td>${d.by}</td>
            <td><span class="status-badge ${d.status === 'Verified' ? 'paid' : 'pending'}">${d.status}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────
//  SHARED: Loader & Empty
// ─────────────────────────────────────────────
function loader() {
  return `<div class="page-loader"><div class="loader-ring"></div><p>Loading data...</p></div>`;
}

function empty(msg) {
  return `<div class="empty-state"><div class="empty-icon"><i class="fa fa-inbox"></i></div><p>${msg}</p></div>`;
}

// ─────────────────────────────────────────────
//  RESPONSIVE: close sidebar on outside click
// ─────────────────────────────────────────────
document.addEventListener('click', e => {
  if (window.innerWidth <= 900) {
    const sb = document.getElementById('sidebar');
    const hb = document.getElementById('hamburgerBtn');
    if (sb.classList.contains('mobile-open') && !sb.contains(e.target) && !hb.contains(e.target)) {
      sb.classList.remove('mobile-open');
      sidebarOpen = false;
    }
  }
});

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
initSession();
