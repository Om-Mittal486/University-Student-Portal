'use strict';
/* =====================================================
   SRM Admin Portal — JavaScript (admin.js)
   ===================================================== */

const API = 'http://localhost:5000/api';
let adminUser = null;
let allStudents = [];
let allSubjects = [];
let allAnn = [];
let currentFeeReg = null;
let currentAttReg = null;
let currentMarksReg = null;

// ─── HELPERS ──────────────────────────────────────────
const $ = id => document.getElementById(id);
function fmt(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function inr(n) { return '₹ '+Number(n).toLocaleString('en-IN'); }
function pctBadge(p){ const c = p>=85?'green':p>=75?'orange':'red'; return `<span class="badge badge-${c}">${Number(p).toFixed(1)}%</span>`; }
function statusBadge(s){
  const m={Paid:'green',Pending:'orange',Overdue:'red',Approved:'green',Rejected:'red'};
  return `<span class="badge badge-${m[s]||'grey'}">${s}</span>`;
}

// ─── TOAST ───────────────────────────────────────────
function toast(msg, type='success') {
  const t = $('toast'); const m = $('toastMsg');
  t.className = `toast ${type} show`;
  t.querySelector('i').className = `fa ${type==='success'?'fa-check-circle':'fa-times-circle'}`;
  m.textContent = msg;
  setTimeout(()=>{ t.className='toast'; }, 3500);
}

// ─── API FETCH ────────────────────────────────────────
async function apiFetch(endpoint, method='GET', body=null) {
  try {
    const opts = { method, credentials:'include', headers:{'Content-Type':'application/json'} };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${API}${endpoint}`, opts);
    return await r.json();
  } catch(e) { return { success:false, message:'Server unreachable', demo:true }; }
}

// ─── SESSION ──────────────────────────────────────────
async function initAdmin() {
  // Demo mode check
  const stored = sessionStorage.getItem('srm_admin');
  if (stored) {
    adminUser = JSON.parse(stored);
    setAdminUI();
    loadDashboard();
    return;
  }
  // Server session check
  const res = await apiFetch('/admin/session');
  if (res.loggedIn) {
    adminUser = res.admin;
    sessionStorage.setItem('srm_admin', JSON.stringify(adminUser));
    setAdminUI();
    loadDashboard();
  } else {
    window.location.href = '/admin';
  }
}

function setAdminUI() {
  if (!adminUser) return;
  const n = adminUser.fullName || 'Administrator';
  const init = n.split(' ').map(w=>w[0]).slice(0,2).join('');
  $('sbAvatar').textContent = init;
  $('sbName').textContent = n;
  $('sbRole').textContent = adminUser.role || 'admin';
  $('topbarAvatar').textContent = init[0];
  $('topbarName').textContent = n;
}

async function adminLogout() {
  if (!confirm('Logout from admin panel?')) return;
  sessionStorage.removeItem('srm_admin');
  await apiFetch('/admin/logout','POST');
  window.location.href = '/admin';
}

// ─── SIDEBAR ──────────────────────────────────────────
let sideOpen = true;
function toggleSidebar() {
  sideOpen = !sideOpen;
  const sb = $('adminSidebar');
  if (window.innerWidth <= 900) { sb.classList.toggle('mobile-open', sideOpen); }
  else { sb.classList.toggle('collapsed', !sideOpen); }
}

// ─── PAGE ROUTER ──────────────────────────────────────
const pageTitles = {
  dashboard:'Dashboard', students:'Student Management', 'add-student':'Add New Student',
  attendance:'Attendance Management', marks:'Marks & Results', subjects:'Subjects',
  fees:'Fee Management', announcements:'Announcements'
};

function showPage(id) {
  document.querySelectorAll('.admin-page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(l=>l.classList.remove('active'));
  const page = $('page-'+id);
  const nav = $('nav-'+id);
  if (page) page.classList.add('active');
  if (nav) nav.classList.add('active');
  $('topbarTitle').textContent = pageTitles[id] || id;
  if (window.innerWidth<=900 && sideOpen) { $('adminSidebar').classList.remove('mobile-open'); sideOpen=false; }
  $('adminContent').scrollTo(0,0);
  // Load data
  if (id==='dashboard') loadDashboard();
  if (id==='students') loadStudents();
  if (id==='subjects') loadSubjects();
  if (id==='announcements') loadAnnouncements();
  
  // New Modules
  if (id==='settings') loadSettings();
  if (id==='events') loadEvents();
  if (id==='sap') loadSap();
  if (id==='feedback') loadFeedback();
  if (id==='hostel') loadHostelAdmin();
  if (id==='transport') loadTransportAdmin();
}

// ─── DASHBOARD ────────────────────────────────────────
async function loadDashboard() {
  const res = await apiFetch('/admin/stats');
  const d = res.success ? res.data : { total_students:5, total_subjects:13, pending_fees:2, total_announcements:5 };
  $('stat-students').textContent = d.total_students;
  $('stat-subjects').textContent = d.total_subjects;
  $('stat-fees').textContent = d.pending_fees;
  $('stat-announcements').textContent = d.total_announcements;
  $('annBadge').textContent = d.total_announcements;
  loadDashStudentPreview();
  loadDashAnnPreview();
}

async function loadDashStudentPreview() {
  const res = await apiFetch('/admin/students');
  const data = res.success ? res.data.slice(0,5) : [].slice(0,5);
  $('dashStudentPreview').innerHTML = `
    <div class="tbl-wrap">
      <table class="admin-tbl">
        <thead><tr><th>#</th><th>Register No.</th><th>Name</th><th>Program</th><th>Semester</th><th>Actions</th></tr></thead>
        <tbody>${data.map((s,i)=>`<tr>
          <td class="serial-col">${i+1}</td>
          <td><strong>${s.register_number}</strong></td>
          <td>${s.full_name}</td>
          <td style="font-size:11.5px;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.program}</td>
          <td>${s.semester}</td>
          <td><div class="tbl-actions">
            <button class="btn btn-edit" onclick='openEditStudent(${JSON.stringify(s)})'><i class="fa fa-edit"></i></button>
          </div></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

async function loadDashAnnPreview() {
  const res = await apiFetch('/admin/announcements');
  const data = res.success ? res.data.slice(0,4) : [].slice(0,4);
  $('dashAnnPreview').innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;">
    ${data.map(a=>`<div style="padding:10px 14px;border:1px solid var(--border);border-left:4px solid ${a.is_important?'#c62828':'var(--green)'};border-radius:4px;background:#fafcf7;">
      <div style="font-weight:700;font-size:13px;margin-bottom:3px;">${a.title}</div>
      <div style="font-size:11.5px;color:#888;">${a.category} &nbsp;|&nbsp; ${fmt(a.posted_at)} &nbsp;|&nbsp; Target: <strong>${a.target_type||'all'}</strong></div>
    </div>`).join('')}
  </div>`;
}

// ─── STUDENTS ────────────────────────────────────────
async function loadStudents() {
  $('studentsTbody').innerHTML = '<tr><td colspan="8"><div class="tbl-loader"><div class="loader-ring"></div></div></td></tr>';
  const res = await apiFetch('/admin/students');
  allStudents = res.success ? res.data : [];
  renderStudentsTable(allStudents);
}

function renderStudentsTable(data) {
  if (!data.length) { $('studentsTbody').innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#aaa;">No students found.</td></tr>'; return; }
  $('studentsTbody').innerHTML = data.map((s,i)=>`<tr>
    <td class="serial-col">${i+1}</td>
    <td><strong>${s.register_number}</strong></td>
    <td>${s.full_name}</td>
    <td style="font-size:11.5px;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.program}</td>
    <td>${s.semester}</td>
    <td><span class="badge badge-blue">${s.section}</span></td>
    <td>${s.phone||'-'}</td>
    <td><div class="tbl-actions">
      <button class="btn btn-edit" onclick='openEditStudent(${JSON.stringify(s)})'><i class="fa fa-edit"></i> Edit</button>
      <button class="btn btn-del" onclick="deleteStudent('${s.register_number}','${s.full_name}')"><i class="fa fa-trash"></i></button>
    </div></td>
  </tr>`).join('');
}

function filterStudents() {
  const q = $('studentSearch').value.toLowerCase();
  const sem = $('semFilter').value;
  renderStudentsTable(allStudents.filter(s=>
    (!q || s.full_name.toLowerCase().includes(q) || s.register_number.toLowerCase().includes(q)) &&
    (!sem || s.semester === sem)
  ));
}

function openEditStudent(s) {
  $('edit-regnum-orig').value = s.register_number;
  $('edit-name').value = s.full_name;
  $('edit-phone').value = s.phone||'';
  $('edit-email').value = s.email||'';
  $('edit-blood').value = s.blood_group||'O+';
  $('edit-institution').value = s.institution||'';
  $('edit-program').value = s.program||'';
  $('edit-spec').value = s.specialization||'';
  $('edit-sem').value = s.semester||'IV SEMESTER';
  $('edit-section').value = s.section||'';
  $('edit-gender').value = s.gender||'Male';
  $('edit-father').value = s.father_name||'';
  $('edit-mother').value = s.mother_name||'';
  $('edit-dob').value = s.dob ? s.dob.split('T')[0] : '';
  openModal('editStudentModal');
}

async function saveStudentEdit() {
  const regNum = $('edit-regnum-orig').value;
  const body = {
    full_name:$('edit-name').value, phone:$('edit-phone').value, email:$('edit-email').value,
    blood_group:$('edit-blood').value, institution:$('edit-institution').value,
    program:$('edit-program').value, specialization:$('edit-spec').value,
    semester:$('edit-sem').value, section:$('edit-section').value,
    gender:$('edit-gender').value, father_name:$('edit-father').value,
    mother_name:$('edit-mother').value, dob:$('edit-dob').value, address:''
  };
  const res = await apiFetch(`/admin/students/${regNum}`, 'PUT', body);
  if (res.success || !res.message?.includes('failed')) {
    toast('Student updated successfully!');
    closeModal('editStudentModal');
    loadStudents();
    loadDashboard();
  } else { toast(res.message||'Update failed', 'error'); }
}

async function deleteStudent(regNum, name) {
  if (!confirm(`Delete student "${name}" (${regNum})?\n\nThis will permanently remove ALL their data.`)) return;
  const res = await apiFetch(`/admin/students/${regNum}`, 'DELETE');
  if (res.success || !res.message?.includes('failed')) {
    toast(`${name} deleted.`);
    loadStudents(); loadDashboard();
  } else { toast(res.message||'Delete failed', 'error'); }
}

async function submitAddStudent(e) {
  e.preventDefault();
  const body = {
    register_number: $('as-regnum').value.trim().toUpperCase(),
    full_name: $('as-name').value.trim().toUpperCase(),
    dob: $('as-dob').value, gender: $('as-gender').value,
    institution: $('as-institution').value, program: $('as-program').value,
    specialization: $('as-spec').value, semester: $('as-sem').value,
    section: $('as-section').value.toUpperCase(), blood_group: $('as-blood').value,
    phone: $('as-phone').value, email: $('as-email').value,
    father_name: $('as-father').value, mother_name: $('as-mother').value,
    address: $('as-address').value
  };
  const res = await apiFetch('/admin/students', 'POST', body);
  if (res.success) {
    toast('Student added! Default password: DOB in DDMMYYYY format.');
    $('addStudentForm').reset();
    showPage('students');
  } else { toast(res.message||'Failed to add student.', 'error'); }
}

// ─── ATTENDANCE ───────────────────────────────────────
function searchAttendance() {
  const v = $('attRegSearch').value;
  if (v.length >= 5) loadAttendance(v);
}

async function loadAttendance(regNum) {
  if (!regNum) { toast('Enter a register number.','error'); return; }
  currentAttReg = regNum.toUpperCase();
  $('attendanceTblWrap').innerHTML = '<div class="tbl-loader"><div class="loader-ring"></div><p>Loading...</p></div>';
  const res = await apiFetch(`/admin/attendance/${currentAttReg}`);
  const data = res.success ? res.data : [];
  if (!data.length) { $('attendanceTblWrap').innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">No attendance records found.</div>'; return; }
  $('attendanceTblWrap').innerHTML = `
    <p style="font-size:12px;color:#555;margin-bottom:10px;">Showing attendance for: <strong>${currentAttReg}</strong></p>
    <div class="tbl-wrap">
      <table class="admin-tbl">
        <thead><tr><th>#</th><th>Subject Code</th><th>Subject Name</th><th>Total</th><th>Attended</th><th>OD</th><th>ML</th><th>%</th><th>Actions</th></tr></thead>
        <tbody>${data.map((r,i)=>`<tr>
          <td class="serial-col">${i+1}</td>
          <td><strong>${r.subject_code}</strong></td>
          <td>${r.subject_name||r.subject_code}</td>
          <td style="text-align:center;">${r.total_classes}</td>
          <td style="text-align:center;">${r.attended_classes}</td>
          <td style="text-align:center;">${r.od_classes}</td>
          <td style="text-align:center;">${r.ml_classes}</td>
          <td>${pctBadge(r.percentage)}</td>
          <td><button class="btn btn-edit" onclick='openEditAtt(${JSON.stringify(r)})'><i class="fa fa-edit"></i> Edit</button></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function openEditAtt(r) {
  $('att-edit-id').value = r.id;
  $('attSubjectLabel').innerHTML = `<strong>${r.subject_code}</strong> — ${r.subject_name||r.subject_code}`;
  $('att-total').value = r.total_classes;
  $('att-attended').value = r.attended_classes;
  $('att-od').value = r.od_classes;
  $('att-ml').value = r.ml_classes;
  openModal('editAttModal');
}

async function saveAttendance() {
  const id = $('att-edit-id').value;
  const body = { total_classes:+$('att-total').value, attended_classes:+$('att-attended').value, od_classes:+$('att-od').value, ml_classes:+$('att-ml').value };
  const res = await apiFetch(`/admin/attendance/${id}`,'PUT',body);
  toast(res.success ? 'Attendance updated!' : (res.message||'Updated (demo)'));
  closeModal('editAttModal');
  loadAttendance(currentAttReg);
}

// ─── MARKS ────────────────────────────────────────────
async function loadMarks() {
  const regNum = $('marksRegSearch').value.trim();
  const type = $('marksTypeFilter').value;
  if (!regNum) { toast('Enter a register number.','error'); return; }
  currentMarksReg = regNum.toUpperCase();
  $('marksTblWrap').innerHTML = '<div class="tbl-loader"><div class="loader-ring"></div><p>Loading...</p></div>';
  const endpoint = type==='internal' ? `/admin/marks/internal/${currentMarksReg}` : `/admin/marks/external/${currentMarksReg}`;
  const res = await apiFetch(endpoint);
  const data = res.success ? res.data : [];
  if (!data.length) { $('marksTblWrap').innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">No marks found.</div>'; return; }
  if (type==='internal') renderInternalMarks(data);
  else renderExternalMarks(data);
}

function renderInternalMarks(data) {
  $('marksTblWrap').innerHTML = `
    <p style="font-size:12px;color:#555;margin-bottom:10px;">Internal Marks — <strong>${currentMarksReg}</strong></p>
    <div class="tbl-wrap"><table class="admin-tbl">
      <thead><tr><th>#</th><th>Subject</th><th>Exam Type</th><th>Max</th><th>Obtained</th><th>Sem</th><th>Year</th><th>Actions</th></tr></thead>
      <tbody>${data.map((r,i)=>`<tr>
        <td class="serial-col">${i+1}</td>
        <td><strong>${r.subject_code}</strong><br><span style="font-size:11px;color:#888;">${r.subject_name||''}</span></td>
        <td><span class="badge badge-blue">${r.exam_type}</span></td>
        <td style="text-align:center;">${r.max_marks}</td>
        <td style="text-align:center;font-weight:700;">${r.marks_obtained}</td>
        <td style="text-align:center;">${r.semester}</td>
        <td>${r.academic_year}</td>
        <td><button class="btn btn-edit" onclick='openEditMarks(${JSON.stringify(r)},"internal")'><i class="fa fa-edit"></i> Edit</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

function renderExternalMarks(data) {
  $('marksTblWrap').innerHTML = `
    <p style="font-size:12px;color:#555;margin-bottom:10px;">Semester Results — <strong>${currentMarksReg}</strong></p>
    <div class="tbl-wrap"><table class="admin-tbl">
      <thead><tr><th>#</th><th>Subject</th><th>Marks</th><th>Grade</th><th>Grade Pts</th><th>Result</th><th>Sem</th><th>Actions</th></tr></thead>
      <tbody>${data.map((r,i)=>`<tr>
        <td class="serial-col">${i+1}</td>
        <td><strong>${r.subject_code}</strong><br><span style="font-size:11px;color:#888;">${r.subject_name||''}</span></td>
        <td style="text-align:center;font-weight:700;">${r.marks_obtained}/${r.max_marks}</td>
        <td style="text-align:center;"><span class="badge badge-green">${r.grade}</span></td>
        <td style="text-align:center;font-weight:700;">${r.grade_points}</td>
        <td>${statusBadge(r.result)}</td>
        <td style="text-align:center;">${r.semester}</td>
        <td><button class="btn btn-edit" onclick='openEditMarks(${JSON.stringify(r)},"external")'><i class="fa fa-edit"></i> Edit</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

function openEditMarks(r, type) {
  $('marks-edit-id').value = r.id;
  $('marks-edit-type').value = type;
  const lbl = `<strong>${r.subject_code}</strong> — ${r.subject_name||r.subject_code} &nbsp; <span class="badge badge-blue">${r.exam_type||'ESE'}</span>`;
  $('marksSubjectLabel').innerHTML = lbl;
  $('marks-max').value = r.max_marks;
  $('marks-obtained').value = r.marks_obtained;
  if (type==='external') {
    $('externalMarksFields').style.display='block';
    $('marks-grade').value = r.grade||'O';
    $('marks-gp').value = r.grade_points||10;
    $('marks-result').value = r.result||'Pass';
  } else { $('externalMarksFields').style.display='none'; }
  openModal('editMarksModal');
}

async function saveMarks() {
  const id = $('marks-edit-id').value;
  const type = $('marks-edit-type').value;
  const body = { marks_obtained:+$('marks-obtained').value, max_marks:+$('marks-max').value };
  if (type==='external') {
    body.grade = $('marks-grade').value;
    body.grade_points = +$('marks-gp').value;
    body.result = $('marks-result').value;
  }
  const endpoint = type==='internal' ? `/admin/marks/internal/${id}` : `/admin/marks/external/${id}`;
  const res = await apiFetch(endpoint,'PUT',body);
  toast(res.success ? 'Marks updated successfully!' : (res.message||'Updated (demo)'));
  closeModal('editMarksModal');
  loadMarks();
}

// ─── SUBJECTS ────────────────────────────────────────
async function loadSubjects() {
  $('subjectsTbody').innerHTML = '<tr><td colspan="7"><div class="tbl-loader"><div class="loader-ring"></div></div></td></tr>';
  const res = await apiFetch('/admin/subjects');
  allSubjects = res.success ? res.data : [];
  renderSubjectsTable(allSubjects);
}

function renderSubjectsTable(data) {
  if (!data.length) { $('subjectsTbody').innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#aaa;">No subjects found.</td></tr>'; return; }
  $('subjectsTbody').innerHTML = data.map((s,i)=>`<tr>
    <td class="serial-col">${i+1}</td>
    <td><strong>${s.subject_code}</strong></td>
    <td>${s.subject_name}</td>
    <td style="text-align:center;">${s.credits}</td>
    <td><span class="badge ${s.type==='Lab'?'badge-orange':'badge-green'}">${s.type}</span></td>
    <td style="text-align:center;">Sem ${s.semester}</td>
    <td><button class="btn btn-del" onclick="deleteSubject('${s.subject_code}','${s.subject_name}')"><i class="fa fa-trash"></i></button></td>
  </tr>`).join('');
}

function filterSubjects() {
  const q = $('subjectSearch').value.toLowerCase();
  const sem = $('subSemFilter').value;
  renderSubjectsTable(allSubjects.filter(s=>
    (!q || s.subject_name.toLowerCase().includes(q) || s.subject_code.toLowerCase().includes(q)) &&
    (!sem || String(s.semester)===sem)
  ));
}

function openAddSubjectModal() { openModal('addSubjectModal'); }

async function submitAddSubject() {
  const body = {
    subject_code: $('addsubj-code').value.trim().toUpperCase(),
    subject_name: $('addsubj-name').value.trim(),
    credits: +$('addsubj-credits').value,
    type: $('addsubj-type').value,
    semester: +$('addsubj-sem').value
  };
  if (!body.subject_code || !body.subject_name) { toast('Code and name required.','error'); return; }
  const res = await apiFetch('/admin/subjects','POST',body);
  toast(res.success ? 'Subject added!' : (res.message||'Added (demo)'));
  closeModal('addSubjectModal');
  loadSubjects();
}

async function deleteSubject(code, name) {
  if (!confirm(`Delete subject "${name}" (${code})?`)) return;
  const res = await apiFetch(`/admin/subjects/${code}`,'DELETE');
  toast(res.success ? 'Subject deleted.' : (res.message||'Deleted (demo)'));
  loadSubjects();
}

// ─── FEES ─────────────────────────────────────────────
async function loadFees(regNum) {
  if (!regNum) { toast('Enter a register number.','error'); return; }
  currentFeeReg = regNum.toUpperCase();
  $('feeTblWrap').innerHTML = '<div class="tbl-loader"><div class="loader-ring"></div><p>Loading...</p></div>';
  const res = await apiFetch(`/admin/fees/${currentFeeReg}`);
  const data = res.success ? res.data : [];
  if (!data.length) { $('feeTblWrap').innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;">No fee records found.</div>'; return; }
  const total = data.reduce((a,f)=>a+Number(f.amount),0);
  const paid = data.filter(f=>f.status==='Paid').reduce((a,f)=>a+Number(f.amount),0);
  $('feeTblWrap').innerHTML = `
    <div style="display:flex;gap:14px;margin-bottom:14px;flex-wrap:wrap;">
      <div style="background:#e8f5e9;border:1px solid #a5d6a7;border-radius:6px;padding:10px 16px;"><div style="font-size:11px;color:#2e7d32;font-weight:600;text-transform:uppercase;">Total Paid</div><div style="font-size:18px;font-weight:800;color:#2e7d32;">${inr(paid)}</div></div>
      <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:6px;padding:10px 16px;"><div style="font-size:11px;color:#f57f17;font-weight:600;text-transform:uppercase;">Pending</div><div style="font-size:18px;font-weight:800;color:#f57f17;">${inr(total-paid)}</div></div>
    </div>
    <div class="tbl-wrap"><table class="admin-tbl">
      <thead><tr><th>#</th><th>Fee Type</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Status</th><th>Transaction ID</th><th>Actions</th></tr></thead>
      <tbody>${data.map((f,i)=>`<tr>
        <td class="serial-col">${i+1}</td>
        <td>${f.fee_type}</td>
        <td style="font-weight:700;">${inr(f.amount)}</td>
        <td>${fmt(f.due_date)}</td>
        <td>${fmt(f.paid_date)}</td>
        <td>${statusBadge(f.status)}</td>
        <td style="font-size:11.5px;">${f.transaction_id||'-'}</td>
        <td><div class="tbl-actions">
          <button class="btn btn-edit" onclick='openEditFee(${JSON.stringify(f)})'><i class="fa fa-edit"></i></button>
          <button class="btn btn-del" onclick="deleteFee(${f.id})"><i class="fa fa-trash"></i></button>
        </div></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

function openEditFee(f) {
  $('fee-edit-id').value = f.id;
  $('fee-type').value = f.fee_type;
  $('fee-amount').value = f.amount;
  $('fee-status').value = f.status;
  $('fee-due-date').value = f.due_date ? f.due_date.split('T')[0] : '';
  $('fee-paid-date').value = f.paid_date ? f.paid_date.split('T')[0] : '';
  $('fee-txn-id').value = f.transaction_id||'';
  $('fee-mode').value = f.payment_mode||'Online';
  openModal('editFeeModal');
}

async function saveFeeEdit() {
  const id = $('fee-edit-id').value;
  const body = {
    fee_type:$('fee-type').value, amount:+$('fee-amount').value,
    status:$('fee-status').value, due_date:$('fee-due-date').value,
    paid_date:$('fee-paid-date').value||null, transaction_id:$('fee-txn-id').value||null,
    payment_mode:$('fee-mode').value
  };
  const res = await apiFetch(`/admin/fees/${id}`,'PUT',body);
  toast(res.success ? 'Fee record updated!' : (res.message||'Updated (demo)'));
  closeModal('editFeeModal');
  loadFees(currentFeeReg);
}

function openAddFeeModal() { openModal('addFeeModal'); }

async function submitAddFee() {
  const body = {
    register_number:$('addfee-reg').value.trim().toUpperCase(),
    fee_type:$('addfee-type').value, amount:+$('addfee-amount').value,
    due_date:$('addfee-due').value, status:$('addfee-status').value, academic_year:$('addfee-year').value
  };
  const res = await apiFetch('/admin/fees','POST',body);
  toast(res.success ? 'Fee record added!' : (res.message||'Added (demo)'));
  closeModal('addFeeModal');
  if (currentFeeReg) loadFees(currentFeeReg);
}

async function deleteFee(id) {
  if (!confirm('Delete this fee record?')) return;
  const res = await apiFetch(`/admin/fees/${id}`,'DELETE');
  toast(res.success ? 'Fee deleted.' : (res.message||'Deleted (demo)'));
  loadFees(currentFeeReg);
}

// ─── ANNOUNCEMENTS ────────────────────────────────────
async function loadAnnouncements() {
  $('annTbody').innerHTML = '<tr><td colspan="7"><div class="tbl-loader"><div class="loader-ring"></div></div></td></tr>';
  const res = await apiFetch('/admin/announcements');
  allAnn = res.success ? res.data : [];
  $('annBadge').textContent = allAnn.length;
  $('annTbody').innerHTML = allAnn.map((a,i)=>`<tr>
    <td class="serial-col">${i+1}</td>
    <td style="max-width:260px;"><strong>${a.title}</strong><br><span style="font-size:11.5px;color:#888;">${a.content?.substring(0,60)}...</span></td>
    <td><span class="badge badge-blue">${a.category}</span></td>
    <td><span class="badge ${a.target_type==='all'?'badge-green':a.target_type==='individual'?'badge-orange':'badge-blue'}">${a.target_type||'all'}</span>${a.target_register?`<br><span style="font-size:10.5px;color:#888;">${a.target_register}</span>`:''}</td>
    <td>${a.is_important?'<span class="badge badge-red">⚠ Yes</span>':'<span class="badge badge-grey">No</span>'}</td>
    <td style="font-size:12px;">${fmt(a.posted_at)}</td>
    <td><div class="tbl-actions">
      <button class="btn btn-edit" onclick='openEditAnn(${JSON.stringify(a)})'><i class="fa fa-edit"></i> Edit</button>
      <button class="btn btn-del" onclick="deleteAnn(${a.id},'${a.title.replace(/'/g,'\\\'').substring(0,30)}')"><i class="fa fa-trash"></i></button>
    </div></td>
  </tr>`).join('');
}

function openAnnModal() {
  $('ann-edit-id').value = '';
  $('ann-title').value = '';
  $('ann-content').value = '';
  $('ann-category').value = 'General';
  $('ann-important').value = '0';
  $('annModalTitle').textContent = 'Create Announcement';
  $('annSubmitLabel').textContent = 'Publish';
  selectTarget('all');
  openModal('annModal');
}

function openEditAnn(a) {
  $('ann-edit-id').value = a.id;
  $('ann-title').value = a.title;
  $('ann-content').value = a.content;
  $('ann-category').value = a.category;
  $('ann-important').value = a.is_important?'1':'0';
  $('annModalTitle').textContent = 'Edit Announcement';
  $('annSubmitLabel').textContent = 'Update';
  selectTarget(a.target_type||'all');
  if (a.target_register) $('ann-target-reg').value = a.target_register;
  if (a.target_semester) $('ann-target-sem').value = a.target_semester;
  if (a.target_program) $('ann-target-program').value = a.target_program;
  openModal('annModal');
}

function selectTarget(type) {
  document.querySelectorAll('.ann-pill').forEach(p=>p.classList.remove('selected'));
  $('pill-'+type).classList.add('selected');
  $('targetGroupFields').style.display = type==='group'?'block':'none';
  $('targetIndividualFields').style.display = type==='individual'?'block':'none';
  document.querySelector(`input[name=target][value="${type}"]`).checked = true;
}

async function submitAnnouncement() {
  const title = $('ann-title').value.trim();
  const content = $('ann-content').value.trim();
  if (!title || !content) { toast('Title and content are required.','error'); return; }
  const target_type = document.querySelector('input[name=target]:checked').value;
  const body = {
    title, content, category:$('ann-category').value,
    is_important:+$('ann-important').value,
    target_type,
    target_register: target_type==='individual' ? $('ann-target-reg').value.trim() : null,
    target_semester: target_type==='group' ? $('ann-target-sem').value : null,
    target_program: target_type==='group' ? $('ann-target-program').value.trim() : null
  };
  const editId = $('ann-edit-id').value;
  const res = editId
    ? await apiFetch(`/admin/announcements/${editId}`,'PUT',body)
    : await apiFetch('/admin/announcements','POST',body);
  toast(res.success ? (editId?'Announcement updated!':'Announcement published!') : (res.message||'Published (demo)'));
  closeModal('annModal');
  loadAnnouncements();
  loadDashboard();
}

async function deleteAnn(id, title) {
  if (!confirm(`Delete announcement:\n"${title}..."`)) return;
  const res = await apiFetch(`/admin/announcements/${id}`,'DELETE');
  toast(res.success ? 'Announcement deleted.' : (res.message||'Deleted (demo)'));
  loadAnnouncements();
  loadDashboard();
}

// ─── MODAL HELPERS ────────────────────────────────────
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }
document.addEventListener('click', e => {
  document.querySelectorAll('.modal-overlay.open').forEach(mo => {
    if (e.target === mo) mo.classList.remove('open');
  });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open'));
});

// ─── DEMO DATA (offline fallback) ─────────────────────
const DEMO_STUDENTS = [
  { register_number:'AP24110010412', full_name:'IMMIDISETTI TERISH CHARAN TEJ', program:'B.Tech.-Computer Science and Engineering [UG - Full Time]', semester:'IV SEMESTER', section:'D', phone:'9515523236', email:'terishcharantej_immidisetti@srmap.edu.in', dob:'2007-09-16', gender:'Male', institution:'School of Engineering and Sciences (College)', specialization:'Artificial Intelligence and Machine Learning', father_name:'IMMIDISETTI MOHAN RAO', mother_name:'IMMIDISETTI VENKATA SAIRAMA LAKSHMI', blood_group:'B+', address:'' },
  { register_number:'AP24110010213', full_name:'KARTHIK REDDY SURAPANENI',      program:'B.Tech.-Computer Science and Engineering [UG - Full Time]', semester:'IV SEMESTER', section:'C', phone:'9876543210', email:'karthik.surapaneni@srmap.edu.in', dob:'2006-11-25', gender:'Male', institution:'School of Engineering and Sciences (College)', specialization:'Data Science and Analytics', father_name:'SURAPANENI VENKAT REDDY', mother_name:'SURAPANENI PADMA', blood_group:'A+', address:'' },
  { register_number:'AP24110010337', full_name:'PRIYA ANANTHA KRISHNAN',         program:'B.Tech.-Electronics and Communication Engineering [UG - Full Time]', semester:'IV SEMESTER', section:'A', phone:'8765432109', email:'priya.ananthakrishnan@srmap.edu.in', dob:'2007-03-08', gender:'Female', institution:'School of Engineering and Sciences (College)', specialization:'VLSI and Embedded Systems', father_name:'ANANTHAKRISHNAN RAMESH', mother_name:'ANANTHAKRISHNAN MEENA', blood_group:'O+', address:'' },
  { register_number:'AP23110020156', full_name:'RAHUL SHARMA BOPPANA',           program:'B.Tech.-Mechanical Engineering [UG - Full Time]', semester:'VI SEMESTER', section:'B', phone:'7654321098', email:'rahul.boppana@srmap.edu.in', dob:'2005-07-14', gender:'Male', institution:'School of Engineering and Sciences (College)', specialization:'Thermal Engineering', father_name:'BOPPANA ANIL SHARMA', mother_name:'BOPPANA SUNITHA', blood_group:'AB+', address:'' },
  { register_number:'AP24210030089', full_name:'SNEHA VARMA KONDURI',            program:'BBA [UG - Full Time]', semester:'IV SEMESTER', section:'A', phone:'6543210987', email:'sneha.konduri@srmap.edu.in', dob:'2007-01-20', gender:'Female', institution:'School of Management [College]', specialization:'Marketing and Finance', father_name:'KONDURI PRAKASH VARMA', mother_name:'KONDURI RADHA', blood_group:'B-', address:'' }
];
const DEMO_ATT = [
  {id:1,subject_code:'CS401',subject_name:'Design and Analysis of Algorithms',total_classes:52,attended_classes:48,od_classes:2,ml_classes:0,percentage:96.15},
  {id:2,subject_code:'CS402',subject_name:'Database Management Systems',total_classes:48,attended_classes:45,od_classes:0,ml_classes:1,percentage:93.75},
  {id:3,subject_code:'CS403',subject_name:'Operating Systems',total_classes:39,attended_classes:35,od_classes:1,ml_classes:0,percentage:92.31},
  {id:4,subject_code:'CS404',subject_name:'Computer Networks',total_classes:39,attended_classes:36,od_classes:0,ml_classes:0,percentage:92.31},
  {id:5,subject_code:'CS405',subject_name:'Artificial Intelligence',total_classes:39,attended_classes:38,od_classes:1,ml_classes:0,percentage:100},
  {id:6,subject_code:'MA401',subject_name:'Probability and Statistics',total_classes:39,attended_classes:37,od_classes:0,ml_classes:0,percentage:94.87}
];
const DEMO_INT = [
  {id:1,subject_code:'CS401',subject_name:'Design and Analysis of Algorithms',exam_type:'CAT-1',max_marks:50,marks_obtained:42,semester:4,academic_year:'2024-25'},
  {id:2,subject_code:'CS401',subject_name:'Design and Analysis of Algorithms',exam_type:'CAT-2',max_marks:50,marks_obtained:44,semester:4,academic_year:'2024-25'},
  {id:3,subject_code:'CS402',subject_name:'Database Management Systems',exam_type:'CAT-1',max_marks:50,marks_obtained:45,semester:4,academic_year:'2024-25'},
  {id:4,subject_code:'CS402',subject_name:'Database Management Systems',exam_type:'CAT-2',max_marks:50,marks_obtained:47,semester:4,academic_year:'2024-25'},
];
const DEMO_EXT = [
  {id:1,subject_code:'CS301',subject_name:'Data Structures and Algorithms',max_marks:100,marks_obtained:87,grade:'O',grade_points:10,result:'Pass',semester:3,academic_year:'2023-24'},
  {id:2,subject_code:'CS302',subject_name:'Object Oriented Programming',max_marks:100,marks_obtained:82,grade:'A+',grade_points:9,result:'Pass',semester:3,academic_year:'2023-24'},
];
const DEMO_FEES = [
  {id:1,fee_type:'Tuition Fee - Semester IV',amount:105000,due_date:'2024-12-15T00:00:00',paid_date:'2024-12-10T00:00:00',status:'Paid',transaction_id:'TXN20241210001234',payment_mode:'Online'},
  {id:2,fee_type:'Transport Fee - Annual',amount:18000,due_date:'2024-07-31T00:00:00',paid_date:'2024-07-28T00:00:00',status:'Paid',transaction_id:'TXN20240728009876',payment_mode:'Online'},
  {id:3,fee_type:'Tuition Fee - Semester V',amount:105000,due_date:'2025-06-15T00:00:00',paid_date:null,status:'Pending',transaction_id:null,payment_mode:null},
];
const DEMO_ANN = [
  {id:1,title:'Semester IV End Semester Examination Schedule',content:'The End Semester Examinations for Semester IV are scheduled from May 12, 2025.',category:'Exam',posted_by:'Controller of Examinations',posted_at:'2025-04-10T09:00:00',is_important:1,target_type:'all'},
  {id:2,title:'Course Registration for Semester V Open',content:'Course Registration for Semester V (2025-26) is now open.',category:'Academic',posted_by:'Academic Section',posted_at:'2025-04-08T10:30:00',is_important:1,target_type:'group',target_semester:'IV SEMESTER'},
  {id:3,title:'Fee Payment Deadline Reminder',content:'The last date for payment of Semester V tuition fee is June 15, 2025.',category:'Finance',posted_by:'Finance Department',posted_at:'2025-04-05T11:00:00',is_important:1,target_type:'all'},
  {id:4,title:'Hostel Room Allotment for 2025-26',content:'Hostel room allotment for 2025-26 will be done online.',category:'Hostel',posted_by:'Hostel Administration',posted_at:'2025-04-01T09:00:00',is_important:0,target_type:'all'},
  {id:5,title:'Summer Internship Opportunity — MNC',content:'The Placement Cell invites applications for summer internships.',category:'General',posted_by:'Placement Cell',posted_at:'2025-03-28T14:00:00',is_important:0,target_type:'all'},
];
const DEMO_SUBJ = [
  {subject_code:'CS401',subject_name:'Design and Analysis of Algorithms',credits:4,type:'Theory',semester:4},
  {subject_code:'CS402',subject_name:'Database Management Systems',credits:4,type:'Theory',semester:4},
  {subject_code:'CS403',subject_name:'Operating Systems',credits:3,type:'Theory',semester:4},
  {subject_code:'CS404',subject_name:'Computer Networks',credits:3,type:'Theory',semester:4},
  {subject_code:'CS405',subject_name:'Artificial Intelligence',credits:3,type:'Theory',semester:4},
  {subject_code:'MA401',subject_name:'Probability and Statistics',credits:3,type:'Theory',semester:4},
  {subject_code:'CS406L',subject_name:'DBMS Laboratory',credits:2,type:'Lab',semester:4},
  {subject_code:'CS407L',subject_name:'AI Laboratory',credits:2,type:'Lab',semester:4},
];

// ─── INIT ──────────────────────────────────────────────
initAdmin();

// ─── NEW MODULES (Settings, Events, SAP, Feedback) ─────────────

async function loadSettings() {
  const res = await apiFetch('/system/settings');
  if (res.success) {
    const s = res.data;
    if(document.getElementById('set_hostel')) document.getElementById('set_hostel').checked = s.hostel_booking_enabled;
    if(document.getElementById('set_results')) document.getElementById('set_results').checked = s.result_release_enabled;
    if(document.getElementById('set_sap')) document.getElementById('set_sap').checked = s.sap_registration_enabled;
    if(document.getElementById('set_exam_reg')) document.getElementById('set_exam_reg').checked = s.exam_registration_enabled;
    if(document.getElementById('set_minor')) document.getElementById('set_minor').checked = s.minor_course_enabled;
  }
}

async function saveSystemSettings() {
  const payload = {
    hostel_booking_enabled: document.getElementById('set_hostel')?.checked || false,
    result_release_enabled: document.getElementById('set_results')?.checked || false,
    sap_registration_enabled: document.getElementById('set_sap')?.checked || false,
    exam_registration_enabled: document.getElementById('set_exam_reg')?.checked || false,
    minor_course_enabled: document.getElementById('set_minor')?.checked || false
  };
  const res = await apiFetch('/system/settings', 'POST', payload);
  if (res.success) showAlert('Settings updated successfully', 'success');
  else showAlert('Failed to update settings');
}

async function loadEvents() {
  const res = await apiFetch('/system/events');
  const tbody = document.getElementById('tb-events');
  if(!tbody) return;
  if(res.success && res.data.length > 0) {
    tbody.innerHTML = res.data.map(e => `<tr>
      <td>${e.title}</td>
      <td>${new Date(e.event_date).toLocaleString()}</td>
      <td>${e.venue}</td>
      <td>${e.organizer}</td>
      <td><button class="btn btn-danger" onclick="deleteEvent('${e.id}')"><i class="fa fa-trash"></i></button></td>
    </tr>`).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="5">No events found</td></tr>';
  }
}
async function deleteEvent(id) {
  if(!confirm('Delete this event?')) return;
  await apiFetch('/system/events/'+id, 'DELETE');
  loadEvents();
}

async function loadSap() {
  const res = await apiFetch('/system/sap');
  const tbody = document.getElementById('tb-sap');
  if(!tbody) return;
  if(res.success && res.data.length > 0) {
    tbody.innerHTML = res.data.map(s => `<tr>
      <td>${s.register_number}</td>
      <td>${s.activity_name}</td>
      <td>${s.activity_type}</td>
      <td>${s.points}</td>
      <td><button class="btn btn-danger" onclick="deleteSap('${s.id}')"><i class="fa fa-trash"></i></button></td>
    </tr>`).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="5">No SAP records found</td></tr>';
  }
}
async function deleteSap(id) {
  if(!confirm('Delete this SAP record?')) return;
  await apiFetch('/system/sap/'+id, 'DELETE');
  loadSap();
}

async function loadFeedback() {
  const res = await apiFetch('/system/feedback');
  const tbody = document.getElementById('tb-feedback');
  if(!tbody) return;
  if(res.success && res.data.length > 0) {
    tbody.innerHTML = res.data.map(f => `<tr>
      <td>${f.register_number}</td>
      <td>${f.subject}</td>
      <td>${f.category}</td>
      <td>${f.message}</td>
      <td>${f.status} <button class="btn btn-danger" style="margin-left:5px" onclick="deleteFeedback('${f.id}')"><i class="fa fa-trash"></i></button></td>
    </tr>`).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="5">No feedback found</td></tr>';
  }
}
async function deleteFeedback(id) {
  if(!confirm('Delete feedback?')) return;
  await apiFetch('/system/feedback/'+id, 'DELETE');
  loadFeedback();
}

function loadHostelAdmin() {}
function loadTransportAdmin() {}

document.addEventListener('DOMContentLoaded', () => {
  const bulkForm = document.getElementById('bulkUploadForm');
  if(bulkForm) {
    bulkForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('csvFile');
      if (!fileInput) return;
      if (!fileInput.files[0]) return alert('Please select a CSV file');
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      
      const btn = bulkForm.querySelector('button');
      btn.textContent = 'Uploading...';
      btn.disabled = true;
      try {
        const res = await fetch(API + '/admin/students/bulk-upload', {
          method: 'POST',
          body: formData
        });
        const d = await res.json();
        if (d.success) {
          alert(d.message);
          bulkForm.reset();
          loadStudents(); // Refresh the dynamic student page
        } else {
          alert(d.message);
        }
      } catch (err) {
        alert('Upload failed: ' + err.message);
      }
      btn.textContent = 'Process Upload';
      btn.disabled = false;
    });
  }
});
