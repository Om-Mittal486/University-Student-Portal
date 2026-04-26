# SRM University AP — Student Portal

A full-stack replica of the SRM University Andhra Pradesh student ERP portal built with **Node.js/Express**, **MySQL**, and **vanilla HTML/CSS/JS**.

---

## 📁 Project Structure

```
Universty portal/
├── backend/
│   ├── .env                   ← Environment variables (DB credentials, etc.)
│   ├── server.js              ← Express server (entry point)
│   ├── package.json
│   ├── config/
│   │   └── db.js              ← MySQL connection pool
│   └── routes/
│       ├── auth.js            ← Login / logout / session / CAPTCHA
│       ├── student.js         ← Profile API
│       ├── academic.js        ← Subjects, timetable, attendance, OD/ML
│       ├── examination.js     ← Internal marks, semester results
│       └── finance.js         ← Fees, hostel, transport, announcements
├── frontend/
│   ├── login.html             ← Login page (SRM AP style)
│   ├── portal.html            ← Main dashboard (SPA)
│   ├── css/
│   │   ├── login.css
│   │   └── portal.css
│   ├── js/
│   │   ├── login.js
│   │   └── portal.js
│   └── assets/
│       └── campus-bg.jpg      ← Campus background image
├── database/
│   └── schema.sql             ← MySQL schema + sample data
└── scripts/                   ← Database migrations and utility scripts
```

---

## 🚀 Setup Instructions

### Step 1 — Install MySQL
- Download MySQL Community Server: https://dev.mysql.com/downloads/
- Install MySQL Workbench: https://dev.mysql.com/downloads/workbench/

### Step 2 — Create Database
1. Open **MySQL Workbench**
2. Connect to your local MySQL server
3. Open `database/schema.sql`
4. Run the entire script (`Ctrl+Shift+Enter` or click ⚡ Execute All)

### Step 3 — Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=srm_portal
```

### Step 4 — Install Node.js Dependencies
```powershell
cd backend
npm install
```

### Step 5 — Start the Backend Server
```powershell
npm run dev
```
You should see:
```
✅ MySQL Database connected successfully
🎓 SRM University AP Portal Server Running
   → URL: http://localhost:5000
```

### Step 6 — Open the Portal
Visit: **http://localhost:5000**

---

## 🔐 Demo Login Credentials

| Register Number  | Password (DOB DDMMYYYY) | Name                        |
|-----------------|-------------------------|-----------------------------|
| AP24110010412   | **16092007**            | IMMIDISETTI TERISH CHARAN TEJ |
| AP24110010213   | **25112006**            | KARTHIK REDDY SURAPANENI    |
| AP24110010337   | **08032007**            | PRIYA ANANTHA KRISHNAN      |
| AP23110020156   | **14072005**            | RAHUL SHARMA BOPPANA        |
| AP24210030089   | **20012007**            | SNEHA VARMA KONDURI         |

> **Note:** The portal also works **without MySQL** in demo/offline mode.  
> Just open `frontend/login.html` directly in a browser and use the credentials above.

---

## 📦 Modules Implemented

### 🔐 Authentication
- Login with Register Number + Password (DOB format)
- CAPTCHA validation (click to refresh)
- Session management (8-hour timeout)
- Logout functionality

### 👤 Profile
- Student name, register number, institution, semester
- Program, section, specialization
- DOB/gender, contact, parent names

### 📚 Academic
- Student Wise Subjects (with faculty names)
- Time Table (period-wise grid)
- Attendance Details (with percentage badges)
- OD/ML Details
- Student Attendance Summary
- Course Registration
- Course Registration Cancellation
- Minor Program Registration

### 📝 Examination
- Internal Mark Details (CAT-1, CAT-2)
- Earlier Internal Marks (previous semesters)
- Current Semester Results (with SGPA, grades)
- Exam Mark Details
- Exam Registration (with dates, halls)
- Exam Registration Details (hall ticket)
- Degree Photo Upload

### 💰 Finance
- Fee Paid Details (with transaction IDs)
- Fee Due Details (with Pay Now button)
- Online Payment Verification
- Payment Acknowledgment (download receipts)
- Bank Account Details

### 🏨 Hostel
- Hostel room details
- Hostel fee details

### 🚍 Transport
- Route, boarding point, timings

### 📢 Other
- Announcements (with categories)
- Events Calendar
- Student Activities
- SAP (Student Activity Points)
- Course Feedback
- Document Verification
- Settings (Change Password)

---

## 🛠️ Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | HTML5, CSS3, Vanilla JS     |
| Backend   | Node.js, Express.js         |
| Database  | MySQL 8.x                   |
| Auth      | express-session, bcrypt     |
| Icons     | Font Awesome 6.4            |
| Fonts     | Google Fonts (Open Sans)    |

---

## 🎨 Design Details
- **Color scheme:** Dark navy sidebar (#1c2a36) + Olive green accents (#6b8c3e)
- **Font:** Open Sans (matches SRM AP portal)
- **Layout:** Fixed sidebar + scrollable content area
- **Tables:** Label column with green text, alternating row backgrounds
- **Responsive:** Works on mobile with collapsible sidebar

---

## ⚙️ API Endpoints

| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| GET    | /api/auth/captcha                     | Generate CAPTCHA             |
| POST   | /api/auth/login                       | Login                        |
| POST   | /api/auth/logout                      | Logout                       |
| GET    | /api/auth/session                     | Check session                |
| GET    | /api/student/profile                  | Student profile              |
| GET    | /api/academic/subjects                | Enrolled subjects            |
| GET    | /api/academic/timetable               | Weekly timetable             |
| GET    | /api/academic/attendance              | Attendance details           |
| GET    | /api/academic/od-ml                   | OD/ML records                |
| GET    | /api/examination/internal-marks       | Current internal marks       |
| GET    | /api/examination/previous-internal-marks | Earlier marks             |
| GET    | /api/examination/semester-results     | Semester results             |
| GET    | /api/finance/fees                     | All fee records              |
| GET    | /api/finance/announcements            | Announcements                |
| GET    | /api/finance/hostel                   | Hostel details               |
| GET    | /api/finance/transport                | Transport details            |
