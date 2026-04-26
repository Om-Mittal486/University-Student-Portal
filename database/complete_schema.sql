-- ============================================================
--  SRM University AP Student Portal — COMPLETE SCHEMA
--  Combined Student Portal + Admin Portal + New Modules
-- ============================================================

DROP DATABASE IF EXISTS srm_portal;
CREATE DATABASE IF NOT EXISTS srm_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE srm_portal;

-- ============================================================
-- 1. SETTINGS & CONFIGURATION
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT
);

INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('hostel_booking_enabled', 'true', 'Toggle hostel booking access'),
('result_release_enabled', 'false', 'Toggle whether semester results are visible'),
('sap_registration_enabled', 'true', 'Toggle SAP points upload/registration'),
('exam_registration_enabled', 'false', 'Toggle Exam registration portal'),
('minor_course_enabled', 'false', 'Toggle Minor Course registration');


-- ============================================================
-- 2. CORE: STUDENTS & ADMINS
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    register_number VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    institution VARCHAR(200) DEFAULT 'School of Engineering and Sciences (College)',
    semester VARCHAR(20) DEFAULT 'IV SEMESTER',
    program VARCHAR(200) DEFAULT 'B.Tech.-Computer Science and Engineering [UG - Full Time]',
    section VARCHAR(10) DEFAULT 'A',
    specialization VARCHAR(200) DEFAULT 'Core',
    dob DATE,
    gender VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    blood_group VARCHAR(5),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('superadmin','admin','registrar','finance') DEFAULT 'admin',
    email VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 3. ACADEMIC & EXAMINATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    credits INT DEFAULT 3,
    type ENUM('Theory', 'Lab', 'Project') DEFAULT 'Theory',
    semester VARCHAR(20) DEFAULT 'IV SEMESTER',
    program VARCHAR(200) DEFAULT 'B.Tech.-Computer Science and Engineering [UG - Full Time]'
);

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    total_classes INT DEFAULT 0,
    attended_classes INT DEFAULT 0,
    od_classes INT DEFAULT 0,
    ml_classes INT DEFAULT 0,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_classes = 0 THEN 0
        ELSE ROUND(((attended_classes + od_classes) / total_classes) * 100, 2)
        END
    ) STORED,
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS marks_internal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    exam_type VARCHAR(50) DEFAULT 'CAT-1',
    max_marks INT DEFAULT 50,
    marks_obtained DECIMAL(5,2) DEFAULT 0,
    semester VARCHAR(20) DEFAULT 'IV SEMESTER',
    academic_year VARCHAR(10) DEFAULT '2024-25',
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS marks_external (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    max_marks INT DEFAULT 100,
    marks_obtained DECIMAL(5,2) DEFAULT 0,
    grade VARCHAR(5) DEFAULT 'O',
    grade_points DECIMAL(4,2) DEFAULT 10.0,
    result ENUM('Pass','Fail','Withheld') DEFAULT 'Pass',
    semester VARCHAR(20) DEFAULT 'III SEMESTER',
    academic_year VARCHAR(10) DEFAULT '2023-24',
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE
);


-- ============================================================
-- 4. FINANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    paid_date DATE,
    status ENUM('Paid','Pending','Overdue') DEFAULT 'Pending',
    transaction_id VARCHAR(50),
    payment_mode VARCHAR(50) DEFAULT 'Online',
    academic_year VARCHAR(10) DEFAULT '2024-25',
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);


-- ============================================================
-- 5. COMMUNICATION & EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category ENUM('Academic','Exam','Finance','Hostel','General') DEFAULT 'General',
    posted_by VARCHAR(100) DEFAULT 'Administration',
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_important TINYINT(1) DEFAULT 0,
    target_type ENUM('all','group','individual') DEFAULT 'all',
    target_register VARCHAR(20) NULL,
    target_program VARCHAR(200) NULL,
    target_semester VARCHAR(20) NULL
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    venue VARCHAR(255),
    organizer VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    register_number VARCHAR(20) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);


-- ============================================================
-- 6. STUDENT ACTIVITIES (SAP)
-- ============================================================
CREATE TABLE IF NOT EXISTS sap_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    activity_type VARCHAR(100) DEFAULT 'Extra Curricular',
    points INT DEFAULT 0,
    approved TINYINT(1) DEFAULT 0,
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);


-- ============================================================
-- 7. HOSTEL & TRANSPORT
-- ============================================================
CREATE TABLE IF NOT EXISTS hostel_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    block_name VARCHAR(50) NOT NULL,
    type ENUM('AC', 'Non-AC') DEFAULT 'Non-AC',
    capacity INT DEFAULT 2,
    occupancy INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hostel_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) UNIQUE NOT NULL,
    room_id INT NOT NULL,
    status ENUM('Approved','Pending','Rejected') DEFAULT 'Pending',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES hostel_rooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transport_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(255) NOT NULL,
    bus_number VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 40,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS transport_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) UNIQUE NOT NULL,
    route_id INT NOT NULL,
    boarding_point VARCHAR(255),
    status ENUM('Active','Inactive') DEFAULT 'Active',
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE
);


-- ============================================================
-- 8. FEEDBACK & GRIEVANCES
-- ============================================================
CREATE TABLE IF NOT EXISTS feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category ENUM('Academic','Hostel','Transport','General') DEFAULT 'General',
    status ENUM('Open','In Progress','Resolved') DEFAULT 'Open',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);


-- ============================================================
-- SAMPLE DATA INSERTION
-- ============================================================

-- Admin Accounts (Pass: admin@srmap2024, registrar@2024)
INSERT IGNORE INTO admin_users (username, password_hash, full_name, role, email) VALUES
('admin',    '$2a$10$C82oXmN7E86uB5cQ0a.vOed0B2z7vB5o5Vj4kRwJp0iX6vU4mN6pL', 'System Administrator', 'superadmin', 'admin@srmap.edu.in'),
('registrar','$2a$10$R9n5pLqR4vT6wY0uO5eOed0B2z7vB5o5Vj4kRwJp0iX6vU4mN6pL',  'Academic Registrar',   'registrar',  'registrar@srmap.edu.in');

-- Student Sample
INSERT IGNORE INTO students (register_number, full_name, dob, gender, semester, program, section, phone, email) VALUES
('AP24110010412', 'IMMIDISETTI TERISH CHARAN TEJ', '2007-09-16', 'Male', 'IV SEMESTER', 'B.Tech.-Computer Science and Engineering [UG - Full Time]', 'D', '9515523236', 'terishcharantej_immidisetti@srmap.edu.in');

-- Login Credentials (Pass: 16092007)
INSERT IGNORE INTO login_credentials (register_number, password_hash) VALUES
('AP24110010412', '$2a$12$R9n5pLqR4vT6wY0uO5eOed0B2z7vB5o5Vj4kRwJp0iX6vU4mN6pL');

-- Subjects & Attendance
INSERT IGNORE INTO subjects (subject_code, subject_name, credits, type, semester, program) VALUES 
('CS401', 'Algorithm Design', 4, 'Theory', 'IV SEMESTER', 'B.Tech.-Computer Science and Engineering [UG - Full Time]'),
('CS402', 'Database Management', 4, 'Theory', 'IV SEMESTER', 'B.Tech.-Computer Science and Engineering [UG - Full Time]');

-- Sample Hostel Room
INSERT IGNORE INTO hostel_rooms (room_number, block_name, type, capacity, occupancy) VALUES
('A-101', 'Ganga', 'AC', 2, 0),
('A-102', 'Ganga', 'Non-AC', 2, 0);

-- Sample Transport Route
INSERT IGNORE INTO transport_routes (route_name, bus_number, driver_name) VALUES
('Vijayawada Route 1', 'AP 16 TZ 1234', 'Ramesh');
