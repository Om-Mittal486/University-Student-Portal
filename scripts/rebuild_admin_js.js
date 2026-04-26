const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../frontend/js/admin.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Remove all fallback to DEMO arrays
code = code.replace(/=\s*res\.success\s*\?\s*res\.data[\.\w\(\),0-9]*\s*:\s*DEMO_[\w]+/g, (match) => {
  // Replace fallback with empty array or null depending on context
  return match.split(':')[0] + ': []';
});
// Explicitly replace complex ones
code = code.replace(/const data = res\.success \? res\.data : \(type==='internal' \? DEMO_INT : DEMO_EXT\);/g, 'const data = res.success ? res.data : [];');

// 2. Add Bulk Upload Event Listener
const initMarker = `document.addEventListener('DOMContentLoaded', () => {`;
const bulkEvent = `document.addEventListener('DOMContentLoaded', () => {
  const bulkForm = document.getElementById('bulkUploadForm');
  if(bulkForm) {
    bulkForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('csvFile');
      if (!fileInput.files[0]) return showAlert('Please select a CSV file');
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      
      const btn = bulkForm.querySelector('button');
      btn.textContent = 'Uploading...';
      btn.disabled = true;
      try {
        const res = await fetch(API_BASE + '/admin/students/bulk-upload', {
          method: 'POST',
          body: formData
        });
        const d = await res.json();
        if (d.success) {
          showAlert(d.message, 'success');
          bulkForm.reset();
        } else {
          showAlert(d.message);
        }
      } catch (err) {
        showAlert('Upload failed');
      }
      btn.textContent = 'Process Upload';
      btn.disabled = false;
    });
  }
`;
code = code.replace(initMarker, bulkEvent);

// 3. Add Page Load dispatch for new pages
const loadPageMarker = `if (pageId === 'subjects') loadSubjects();`;
const newPageLoaders = `if (pageId === 'subjects') loadSubjects();
    if (pageId === 'settings') loadSettings();
    if (pageId === 'events') loadEvents();
    if (pageId === 'sap') loadSap();
    if (pageId === 'feedback') loadFeedback();
    if (pageId === 'hostel') loadHostelAdmin();
    if (pageId === 'transport') loadTransportAdmin();`;
code = code.replace(loadPageMarker, newPageLoaders);

// 4. Append new functionality functions
const newFunctions = `
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
    tbody.innerHTML = res.data.map(e => \`<tr>
      <td>\${e.title}</td>
      <td>\${new Date(e.event_date).toLocaleString()}</td>
      <td>\${e.venue}</td>
      <td>\${e.organizer}</td>
      <td><button class="btn btn-danger" onclick="deleteEvent('\${e.id}')"><i class="fa fa-trash"></i></button></td>
    </tr>\`).join('');
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
    tbody.innerHTML = res.data.map(s => \`<tr>
      <td>\${s.register_number}</td>
      <td>\${s.activity_name}</td>
      <td>\${s.activity_type}</td>
      <td>\${s.points}</td>
      <td><button class="btn btn-danger" onclick="deleteSap('\${s.id}')"><i class="fa fa-trash"></i></button></td>
    </tr>\`).join('');
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
    tbody.innerHTML = res.data.map(f => \`<tr>
      <td>\${f.register_number}</td>
      <td>\${f.subject}</td>
      <td>\${f.category}</td>
      <td>\${f.message}</td>
      <td>\${f.status} <button class="btn btn-danger" style="margin-left:5px" onclick="deleteFeedback('\${f.id}')"><i class="fa fa-trash"></i></button></td>
    </tr>\`).join('');
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
`;

code += newFunctions;

// Finally write the modified code
fs.writeFileSync(targetFile, code);
console.log('admin.js successfully rebuilt.');
