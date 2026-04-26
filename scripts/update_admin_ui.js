const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/admin.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add new links to sidebar
const sidebarMarker = `<div class="sb-section-label" style="margin-top:8px;">Communication</div>`;
const newSidebarLinks = `
      <div class="sb-section-label" style="margin-top:8px;">Events & Activities</div>
      <div class="sb-link" id="nav-events" onclick="showPage('events')" tabindex="0">
        <i class="sb-icon fa fa-calendar-check"></i><span>Events</span>
      </div>
      <div class="sb-link" id="nav-sap" onclick="showPage('sap')" tabindex="0">
        <i class="sb-icon fa fa-star"></i><span>SAP Points</span>
      </div>

      <div class="sb-section-label" style="margin-top:8px;">Facilities</div>
      <div class="sb-link" id="nav-hostel" onclick="showPage('hostel')" tabindex="0">
        <i class="sb-icon fa fa-bed"></i><span>Hostel</span>
      </div>
      <div class="sb-link" id="nav-transport" onclick="showPage('transport')" tabindex="0">
        <i class="sb-icon fa fa-bus"></i><span>Transport</span>
      </div>

      <div class="sb-section-label" style="margin-top:8px;">System</div>
      <div class="sb-link" id="nav-feedback" onclick="showPage('feedback')" tabindex="0">
        <i class="sb-icon fa fa-comment-dots"></i><span>Feedback</span>
      </div>
      <div class="sb-link" id="nav-settings" onclick="showPage('settings')" tabindex="0">
        <i class="sb-icon fa fa-cogs"></i><span>Settings</span>
      </div>

      <div class="sb-section-label" style="margin-top:8px;">Communication</div>`;

content = content.replace(sidebarMarker, newSidebarLinks);

// 2. Add Bulk Upload to Dashboard header
const dashboardActionsMarker = `<div class="page-head">
          <h2><i class="fa fa-gauge-high"></i> Dashboard Overview</h2>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="showPage('add-student')"><i class="fa fa-user-plus"></i> Add Student</button>`;
const newDashboardActions = `<div class="page-head">
          <h2><i class="fa fa-gauge-high"></i> Dashboard Overview</h2>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="showPage('bulk-upload')"><i class="fa fa-file-csv"></i> Bulk Import</button>
            <button class="btn btn-primary" onclick="showPage('add-student')"><i class="fa fa-user-plus"></i> Add Student</button>`;

content = content.replace(dashboardActionsMarker, newDashboardActions);

// 3. Add Content Pages
const modalEndMarker = `<!-- ──────── MODALS ──────── -->`;
const newPages = `
      <!-- ──────── BULK UPLOAD ──────── -->
      <div class="admin-page" id="page-bulk-upload">
        <div class="page-head">
          <h2><i class="fa fa-file-csv"></i> Bulk Student Import</h2>
        </div>
        <div class="form-card">
          <p style="margin-bottom:15px; color:#666;">Upload a CSV file containing student records. Required columns: register_number, full_name, dob, gender, phone, email, program, semester.</p>
          <form id="bulkUploadForm">
            <div class="form-group">
              <label>Select CSV File</label>
              <input type="file" id="csvFile" accept=".csv" required>
            </div>
            <button type="submit" class="btn btn-primary">Process Upload</button>
          </form>
        </div>
      </div>

      <!-- ──────── SYSTEM SETTINGS ──────── -->
      <div class="admin-page" id="page-settings">
        <div class="page-head">
          <h2><i class="fa fa-cogs"></i> System Settings & Features</h2>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="saveSystemSettings()"><i class="fa fa-save"></i> Save Settings</button>
          </div>
        </div>
        <div class="form-card" style="max-width: 600px;">
          <form id="settingsForm">
            <div class="form-group" style="display:flex; justify-content:space-between; border-bottom:1px solid #ddd; padding-bottom:10px;">
              <label style="font-size:16px;">Hostel Booking Module</label>
              <input type="checkbox" id="set_hostel" style="width:20px; height:20px;">
            </div>
            <div class="form-group" style="display:flex; justify-content:space-between; border-bottom:1px solid #ddd; padding-bottom:10px;">
              <label style="font-size:16px;">Semester Results Release</label>
              <input type="checkbox" id="set_results" style="width:20px; height:20px;">
            </div>
            <div class="form-group" style="display:flex; justify-content:space-between; border-bottom:1px solid #ddd; padding-bottom:10px;">
              <label style="font-size:16px;">SAP Registration Portal</label>
              <input type="checkbox" id="set_sap" style="width:20px; height:20px;">
            </div>
            <div class="form-group" style="display:flex; justify-content:space-between; border-bottom:1px solid #ddd; padding-bottom:10px;">
              <label style="font-size:16px;">Exam Registration Window</label>
              <input type="checkbox" id="set_exam_reg" style="width:20px; height:20px;">
            </div>
            <div class="form-group" style="display:flex; justify-content:space-between; padding-bottom:10px;">
              <label style="font-size:16px;">Minor Course Registration</label>
              <input type="checkbox" id="set_minor" style="width:20px; height:20px;">
            </div>
          </form>
        </div>
      </div>

      <!-- Placeholder Pages for Events, SAP, Hostel, Transport, Feedback -->
      <div class="admin-page" id="page-events">
        <div class="page-head">
          <h2><i class="fa fa-calendar-check"></i> Events Management</h2>
        </div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Title</th><th>Date</th><th>Venue</th><th>Organizer</th><th>Action</th></tr></thead><tbody id="tb-events"></tbody></table></div>
      </div>
      <div class="admin-page" id="page-sap">
        <div class="page-head">
          <h2><i class="fa fa-star"></i> Student SAP Approvals</h2>
        </div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Student ID</th><th>Activity</th><th>Type</th><th>Points</th><th>Action</th></tr></thead><tbody id="tb-sap"></tbody></table></div>
      </div>
      <div class="admin-page" id="page-hostel">
        <div class="page-head">
          <h2><i class="fa fa-bed"></i> Hostel Management</h2>
        </div>
        <p style="padding:20px;">Manage Rooms and view Bookings in realtime here.</p>
      </div>
      <div class="admin-page" id="page-transport">
        <div class="page-head">
          <h2><i class="fa fa-bus"></i> Transport Routes</h2>
        </div>
        <p style="padding:20px;">Manage Bus Routes and Allocations here.</p>
      </div>
      <div class="admin-page" id="page-feedback">
        <div class="page-head">
          <h2><i class="fa fa-comment-dots"></i> Student Feedback & Grievances</h2>
        </div>
        <div class="table-container"><table class="data-table"><thead><tr><th>Student ID</th><th>Subject</th><th>Category</th><th>Message</th><th>Status</th></tr></thead><tbody id="tb-feedback"></tbody></table></div>
      </div>

      <!-- ──────── MODALS ──────── -->`;

content = content.replace(modalEndMarker, newPages);

// Additionally update Add Subject modal fields to ensure program is captured.
const subjHtml = `              <div class="form-group">
                <label>Program / Department</label>
                <input type="text" id="add_subj_prog" placeholder="e.g. B.Tech.-Computer Science and Engineering [UG - Full Time]" required>
              </div>
              <div class="form-action">`;
content = content.replace(`<div class="form-action">`, subjHtml);

fs.writeFileSync(filePath, content);
console.log('admin.html updated successfully.');
