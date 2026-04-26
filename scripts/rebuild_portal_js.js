const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../frontend/js/portal.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Remove DEMO constants and fallbacks
code = code.replace(/=\s*res\.success\s*\?\s*res\.data\s*:\s*DEMO_[\w]+/g, '= res.success ? res.data : []');
code = code.replace(/=\s*res\.success\s*\?\s*res\.data\.slice\([\d,]+\)\s*:\s*DEMO_[\w]+\.slice\([\d,]+\)/g, (match) => {
  return match.split(':')[0] + ': []';
});

// Explicit replace for profile demo fallback
code = code.replace(/=\s*res\.success\s*\?\s*res\.data\s*:\s*DEMO_PROFILE;/g, '= res.success ? res.data : {};');

// 2. Fetch System Settings on Initial load
const domInitMarker = `document.addEventListener('DOMContentLoaded', () => {`;
const domInitSettings = `document.addEventListener('DOMContentLoaded', async () => {
  // Load System Settings
  try {
    const sRes = await apiFetch('/system/settings');
    if(sRes.success) {
      window.SYSTEM_SETTINGS = sRes.data;
    } else {
      window.SYSTEM_SETTINGS = {};
    }
  } catch(e) {
    window.SYSTEM_SETTINGS = {};
  }
`;
code = code.replace(domInitMarker, domInitSettings);

// 3. Inject settings checks in specific functions
// Result Release Check
const loadMarksMarker = `async function loadMarks() {
  $('marksTbody').innerHTML`;
const loadMarksNew = `async function loadMarks() {
  if (window.SYSTEM_SETTINGS && window.SYSTEM_SETTINGS.result_release_enabled === false) {
    document.getElementById('marksCont').innerHTML = '<div style="padding:40px;text-align:center;color:#666;"><h3><i class="fa fa-lock"></i> Results are currently hidden</h3><p>The administration has not released the semester results yet.</p></div>';
    return;
  }
  $('marksTbody').innerHTML`;
code = code.replace(loadMarksMarker, loadMarksNew);

// Hostel check
const loadFinanceMarker = `async function loadFinance() {`;
const loadFinanceNew = `async function loadFinance() {
  if (window.SYSTEM_SETTINGS && window.SYSTEM_SETTINGS.hostel_booking_enabled === false) {
    const hb = document.getElementById('financeHostelBox');
    if(hb) hb.innerHTML = '<p style="color:#d32f2f;">Hostel bookings and allocations are currently disabled by Admin.</p>';
  }
`;
code = code.replace(loadFinanceMarker, loadFinanceNew);

fs.writeFileSync(targetFile, code);
console.log('portal.js successfully rebuilt.');
