-- ============================================================
--  SRM University AP Student Portal — MySQL Schema
--  Compatible with MySQL Workbench 8.x
--  Run this entire script to set up the database
-- ============================================================

CREATE DATABASE IF NOT EXISTS srm_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE srm_portal;

-- ============================================================
-- TABLE: students
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    institution VARCHAR(150) DEFAULT 'School of Engineering and Sciences (College)',
    semester VARCHAR(20) DEFAULT 'IV SEMESTER',
    program VARCHAR(200) DEFAULT 'B.Tech.-Computer Science and Engineering [UG - Full Time]',
    section CHAR(2) DEFAULT 'D',
    specialization VARCHAR(150) DEFAULT 'Artificial Intelligence and Machine Learning',
    dob DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
    phone VARCHAR(15),
    email VARCHAR(100),
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    blood_group VARCHAR(5) DEFAULT 'O+',
    address TEXT,
    photo_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: login_credentials
-- ============================================================
CREATE TABLE IF NOT EXISTS login_credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: subjects
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    credits INT DEFAULT 3,
    type ENUM('Theory', 'Lab', 'Project') DEFAULT 'Theory',
    semester INT DEFAULT 4
);

-- ============================================================
-- TABLE: student_subjects (enrollment)
-- ============================================================
CREATE TABLE IF NOT EXISTS student_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    faculty_name VARCHAR(100),
    academic_year VARCHAR(10) DEFAULT '2024-25',
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE,
    UNIQUE KEY uq_student_subject (register_number, subject_code)
);

-- ============================================================
-- TABLE: attendance
-- ============================================================
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

-- ============================================================
-- TABLE: timetable
-- ============================================================
CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_code VARCHAR(20),
    room_number VARCHAR(20),
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE SET NULL
);

-- ============================================================
-- TABLE: marks_internal
-- ============================================================
CREATE TABLE IF NOT EXISTS marks_internal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    exam_type VARCHAR(50) DEFAULT 'CAT-1',
    max_marks INT DEFAULT 50,
    marks_obtained DECIMAL(5,2) DEFAULT 0,
    semester INT DEFAULT 4,
    academic_year VARCHAR(10) DEFAULT '2024-25',
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: marks_external
-- ============================================================
CREATE TABLE IF NOT EXISTS marks_external (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    max_marks INT DEFAULT 100,
    marks_obtained DECIMAL(5,2) DEFAULT 0,
    grade VARCHAR(5) DEFAULT 'O',
    grade_points DECIMAL(4,2) DEFAULT 10.0,
    result ENUM('Pass','Fail','Withheld') DEFAULT 'Pass',
    semester INT DEFAULT 3,
    academic_year VARCHAR(10) DEFAULT '2023-24',
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: fees
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
-- TABLE: announcements
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category ENUM('Academic','Exam','Finance','Hostel','General') DEFAULT 'General',
    posted_by VARCHAR(100) DEFAULT 'Administration',
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_important TINYINT(1) DEFAULT 0
);

-- ============================================================
-- TABLE: od_ml (On-Duty / Medical Leave)
-- ============================================================
CREATE TABLE IF NOT EXISTS od_ml (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    leave_type ENUM('OD','ML') NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT,
    status ENUM('Approved','Pending','Rejected') DEFAULT 'Pending',
    approved_by VARCHAR(100),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: hostel (room assignments)
-- ============================================================
CREATE TABLE IF NOT EXISTS hostel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) UNIQUE NOT NULL,
    hostel_name VARCHAR(100),
    block VARCHAR(10),
    room_number VARCHAR(10),
    bed_number VARCHAR(5),
    mess_type ENUM('Veg','Non-Veg') DEFAULT 'Veg',
    academic_year VARCHAR(10) DEFAULT '2024-25',
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: transport
-- ============================================================
CREATE TABLE IF NOT EXISTS transport (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) UNIQUE NOT NULL,
    route_number VARCHAR(10),
    route_name VARCHAR(150),
    boarding_point VARCHAR(100),
    bus_timings VARCHAR(100),
    academic_year VARCHAR(10) DEFAULT '2024-25',
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);

-- ============================================================
-- SAMPLE DATA INSERTS
-- ============================================================

INSERT INTO students (register_number, full_name, institution, semester, program, section, specialization, dob, gender, phone, email, father_name, mother_name, blood_group) VALUES
('AP24110010412', 'IMMIDISETTI TERISH CHARAN TEJ', 'School of Engineering and Sciences (College)', 'IV SEMESTER', 'B.Tech.-Computer Science and Engineering [UG - Full Time]', 'D', 'Artificial Intelligence and Machine Learning', '2007-09-16', 'Male', '9515523236', 'terishcharantej_immidisetti@srmap.edu.in', 'IMMIDISETTI MOHAN RAO', 'IMMIDISETTI VENKATA SAIRAMA LAKSHMI', 'B+'),
('AP24110010213', 'KARTHIK REDDY SURAPANENI', 'School of Engineering and Sciences (College)', 'IV SEMESTER', 'B.Tech.-Computer Science and Engineering [UG - Full Time]', 'C', 'Data Science and Analytics', '2006-11-25', 'Male', '9876543210', 'karthik.surapaneni@srmap.edu.in', 'SURAPANENI VENKAT REDDY', 'SURAPANENI PADMA', 'A+'),
('AP24110010337', 'PRIYA ANANTHA KRISHNAN', 'School of Engineering and Sciences (College)', 'IV SEMESTER', 'B.Tech.-Electronics and Communication Engineering [UG - Full Time]', 'A', 'VLSI and Embedded Systems', '2007-03-08', 'Female', '8765432109', 'priya.ananthakrishnan@srmap.edu.in', 'ANANTHAKRISHNAN RAMESH', 'ANANTHAKRISHNAN MEENA', 'O+'),
('AP23110020156', 'RAHUL SHARMA BOPPANA', 'School of Engineering and Sciences (College)', 'VI SEMESTER', 'B.Tech.-Mechanical Engineering [UG - Full Time]', 'B', 'Thermal Engineering', '2005-07-14', 'Male', '7654321098', 'rahul.boppana@srmap.edu.in', 'BOPPANA ANIL SHARMA', 'BOPPANA SUNITHA', 'AB+'),
('AP24210030089', 'SNEHA VARMA KONDURI', 'School of Management [College]', 'IV SEMESTER', 'BBA [UG - Full Time]', 'A', 'Marketing and Finance', '2007-01-20', 'Female', '6543210987', 'sneha.konduri@srmap.edu.in', 'KONDURI PRAKASH VARMA', 'KONDURI RADHA', 'B-');

-- Passwords = DOB in DDMMYYYY format (hashed equiv shown as plain for setup — use bcrypt in production)
-- Plain: AP24110010412 → 16092007, AP24110010213 → 25112006, etc.
INSERT INTO login_credentials (register_number, password_hash) VALUES
('AP24110010412', '$2b$10$xK8mN2pLqR4vT6wY0uO5eOQz1nJkI3hG7fD9cB2aE4mN6pLqR4vT6'),
('AP24110010213', '$2b$10$aB2cD4eF6gH8iJ0kL2mN4oP6qR8sT0uV2wX4yZ6aB2cD4eF6gH8iJ'),
('AP24110010337', '$2b$10$zY8xW6vU4tS2rQ0pO8nM6lK4jI2hG0fE8dC6bA4zY8xW6vU4tS2rQ'),
('AP23110020156', '$2b$10$mN6pLqR4vT6wY0uO5eOxK8mN2pLqR4vT6wY0uO5eOQz1nJkI3hG7f'),
('AP24210030089', '$2b$10$pO8nM6lK4jI2hG0fE8dcZ0yY8xW6vU4tS2rQ0pO8nM6lK4jI2hG0f');

INSERT INTO subjects (subject_code, subject_name, credits, type, semester) VALUES
('CS401', 'Design and Analysis of Algorithms', 4, 'Theory', 4),
('CS402', 'Database Management Systems', 4, 'Theory', 4),
('CS403', 'Operating Systems', 3, 'Theory', 4),
('CS404', 'Computer Networks', 3, 'Theory', 4),
('CS405', 'Artificial Intelligence', 3, 'Theory', 4),
('CS406L', 'DBMS Laboratory', 2, 'Lab', 4),
('CS407L', 'AI Laboratory', 2, 'Lab', 4),
('MA401', 'Probability and Statistics', 3, 'Theory', 4),
('CS301', 'Data Structures and Algorithms', 4, 'Theory', 3),
('CS302', 'Object Oriented Programming', 3, 'Theory', 3),
('CS303', 'Digital Logic Design', 3, 'Theory', 3),
('CS304', 'Theory of Computation', 3, 'Theory', 3),
('MA301', 'Discrete Mathematics', 3, 'Theory', 3);

INSERT INTO student_subjects (register_number, subject_code, faculty_name, academic_year) VALUES
('AP24110010412', 'CS401', 'Dr. Rajesh Kumar Pattnaik', '2024-25'),
('AP24110010412', 'CS402', 'Dr. Srinivasa Rao Maddu', '2024-25'),
('AP24110010412', 'CS403', 'Dr. Anitha Kumari P', '2024-25'),
('AP24110010412', 'CS404', 'Prof. Venkata Subramanian', '2024-25'),
('AP24110010412', 'CS405', 'Dr. Pradeep Kumar Yalla', '2024-25'),
('AP24110010412', 'CS406L', 'Dr. Srinivasa Rao Maddu', '2024-25'),
('AP24110010412', 'CS407L', 'Dr. Pradeep Kumar Yalla', '2024-25'),
('AP24110010412', 'MA401', 'Dr. Lakshmi Prasanna V', '2024-25');

INSERT INTO attendance (register_number, subject_code, total_classes, attended_classes, od_classes, ml_classes) VALUES
('AP24110010412', 'CS401', 52, 48, 2, 0),
('AP24110010412', 'CS402', 48, 45, 0, 1),
('AP24110010412', 'CS403', 39, 35, 1, 0),
('AP24110010412', 'CS404', 39, 36, 0, 0),
('AP24110010412', 'CS405', 39, 38, 1, 0),
('AP24110010412', 'CS406L', 26, 25, 0, 0),
('AP24110010412', 'CS407L', 26, 24, 1, 0),
('AP24110010412', 'MA401', 39, 37, 0, 0);

INSERT INTO timetable (register_number, day_of_week, period_number, start_time, end_time, subject_code, room_number) VALUES
('AP24110010412', 'Monday', 1, '08:00:00', '08:50:00', 'CS401', 'CR-201'),
('AP24110010412', 'Monday', 2, '08:50:00', '09:40:00', 'CS402', 'CR-201'),
('AP24110010412', 'Monday', 3, '09:50:00', '10:40:00', 'CS403', 'CR-201'),
('AP24110010412', 'Monday', 5, '11:30:00', '12:20:00', 'MA401', 'CR-201'),
('AP24110010412', 'Monday', 6, '13:10:00', '14:00:00', 'CS406L', 'LAB-3'),
('AP24110010412', 'Tuesday', 1, '08:00:00', '08:50:00', 'CS404', 'CR-201'),
('AP24110010412', 'Tuesday', 2, '08:50:00', '09:40:00', 'CS405', 'CR-201'),
('AP24110010412', 'Tuesday', 3, '09:50:00', '10:40:00', 'CS401', 'CR-201'),
('AP24110010412', 'Tuesday', 5, '11:30:00', '12:20:00', 'CS402', 'CR-201'),
('AP24110010412', 'Tuesday', 6, '13:10:00', '14:00:00', 'CS407L', 'AI-LAB'),
('AP24110010412', 'Wednesday', 1, '08:00:00', '08:50:00', 'CS403', 'CR-201'),
('AP24110010412', 'Wednesday', 2, '08:50:00', '09:40:00', 'MA401', 'CR-201'),
('AP24110010412', 'Wednesday', 3, '09:50:00', '10:40:00', 'CS404', 'CR-201'),
('AP24110010412', 'Wednesday', 5, '11:30:00', '12:20:00', 'CS405', 'CR-201'),
('AP24110010412', 'Thursday', 1, '08:00:00', '08:50:00', 'CS401', 'CR-201'),
('AP24110010412', 'Thursday', 2, '08:50:00', '09:40:00', 'CS403', 'CR-201'),
('AP24110010412', 'Thursday', 3, '09:50:00', '10:40:00', 'CS402', 'CR-201'),
('AP24110010412', 'Thursday', 5, '11:30:00', '12:20:00', 'MA401', 'CR-201'),
('AP24110010412', 'Friday', 1, '08:00:00', '08:50:00', 'CS405', 'CR-201'),
('AP24110010412', 'Friday', 2, '08:50:00', '09:40:00', 'CS404', 'CR-201'),
('AP24110010412', 'Friday', 3, '09:50:00', '10:40:00', 'CS401', 'CR-201');

INSERT INTO marks_internal (register_number, subject_code, exam_type, max_marks, marks_obtained, semester, academic_year) VALUES
('AP24110010412', 'CS401', 'CAT-1', 50, 42, 4, '2024-25'),
('AP24110010412', 'CS402', 'CAT-1', 50, 45, 4, '2024-25'),
('AP24110010412', 'CS403', 'CAT-1', 50, 38, 4, '2024-25'),
('AP24110010412', 'CS404', 'CAT-1', 50, 41, 4, '2024-25'),
('AP24110010412', 'CS405', 'CAT-1', 50, 44, 4, '2024-25'),
('AP24110010412', 'MA401', 'CAT-1', 50, 39, 4, '2024-25'),
('AP24110010412', 'CS401', 'CAT-2', 50, 44, 4, '2024-25'),
('AP24110010412', 'CS402', 'CAT-2', 50, 47, 4, '2024-25'),
('AP24110010412', 'CS403', 'CAT-2', 50, 40, 4, '2024-25'),
('AP24110010412', 'CS404', 'CAT-2', 50, 43, 4, '2024-25'),
('AP24110010412', 'CS405', 'CAT-2', 50, 46, 4, '2024-25'),
('AP24110010412', 'MA401', 'CAT-2', 50, 41, 4, '2024-25'),
-- Previous semester internal marks (Sem 3)
('AP24110010412', 'CS301', 'CAT-1', 50, 46, 3, '2023-24'),
('AP24110010412', 'CS302', 'CAT-1', 50, 43, 3, '2023-24'),
('AP24110010412', 'CS303', 'CAT-1', 50, 39, 3, '2023-24'),
('AP24110010412', 'CS304', 'CAT-1', 50, 41, 3, '2023-24'),
('AP24110010412', 'MA301', 'CAT-1', 50, 44, 3, '2023-24');

INSERT INTO marks_external (register_number, subject_code, max_marks, marks_obtained, grade, grade_points, result, semester, academic_year) VALUES
('AP24110010412', 'CS301', 100, 87, 'O', 10.0, 'Pass', 3, '2023-24'),
('AP24110010412', 'CS302', 100, 82, 'A+', 9.0, 'Pass', 3, '2023-24'),
('AP24110010412', 'CS303', 100, 76, 'A', 8.0, 'Pass', 3, '2023-24'),
('AP24110010412', 'CS304', 100, 79, 'A', 8.0, 'Pass', 3, '2023-24'),
('AP24110010412', 'MA301', 100, 83, 'A+', 9.0, 'Pass', 3, '2023-24');

INSERT INTO fees (register_number, fee_type, amount, due_date, paid_date, status, transaction_id, payment_mode, academic_year) VALUES
('AP24110010412', 'Tuition Fee - Semester IV', 105000.00, '2024-12-15', '2024-12-10', 'Paid', 'TXN20241210001234', 'Online', '2024-25'),
('AP24110010412', 'Transport Fee - Annual', 18000.00, '2024-07-31', '2024-07-28', 'Paid', 'TXN20240728009876', 'Online', '2024-25'),
('AP24110010412', 'Library & Lab Fee', 5000.00, '2024-12-15', '2024-12-10', 'Paid', 'TXN20241210001235', 'Online', '2024-25'),
('AP24110010412', 'Tuition Fee - Semester V', 105000.00, '2025-06-15', NULL, 'Pending', NULL, NULL, '2025-26'),
('AP24110010412', 'Caution Deposit', 10000.00, '2024-07-31', '2024-07-28', 'Paid', 'TXN20240728009877', 'Online', '2024-25');

INSERT INTO announcements (title, content, category, posted_by, is_important) VALUES
('Semester IV End Semester Examination Schedule', 'The End Semester Examinations for Semester IV (B.Tech, BBA, BCA) are scheduled from May 12, 2025. Students are advised to check the detailed timetable on the portal under Examination > Exam Registration Details.', 'Exam', 'Controller of Examinations', 1),
('Course Registration for Semester V Open', 'Course Registration for Semester V (2025-26) is now open. Students must complete registration by April 30, 2025. Please ensure your fee dues are cleared before registering.', 'Academic', 'Academic Section', 1),
('Fee Payment Deadline Reminder', 'The last date for payment of Semester V tuition fee is June 15, 2025. Students with pending fees will not be allowed to attend classes or appear for examinations.', 'Finance', 'Finance Department', 1),
('Hostel Room Allotment for 2025-26', 'Hostel room allotment for the academic year 2025-26 will be done online. Students wishing to avail hostel facility must apply through the portal by May 31, 2025.', 'Hostel', 'Hostel Administration', 0),
('Summer Internship Opportunity — MNC Companies', 'The Training and Placement Cell invites applications for summer internship programs with leading MNCs. Eligible students (CGPA ≥ 7.0) may apply through the portal by April 25, 2025.', 'General', 'Placement Cell', 0);

INSERT INTO od_ml (register_number, leave_type, from_date, to_date, reason, status, approved_by) VALUES
('AP24110010412', 'OD', '2025-02-10', '2025-02-10', 'Inter-college Tech Fest at VIT Amaravati', 'Approved', 'Dr. Rajesh Kumar Pattnaik'),
('AP24110010412', 'OD', '2025-01-22', '2025-01-22', 'National Level Coding Competition', 'Approved', 'Prof. Venkata Subramanian'),
('AP24110010412', 'ML', '2025-03-05', '2025-03-06', 'Fever and Medical Certificate attached', 'Approved', 'Class Advisor'),
('AP24110010412', 'OD', '2025-03-20', '2025-03-21', 'IEEE Student Branch Conference', 'Pending', NULL),
('AP24110010412', 'ML', '2025-04-01', '2025-04-01', 'Dental Appointment', 'Approved', 'Class Advisor');

INSERT INTO hostel (register_number, hostel_name, block, room_number, bed_number, mess_type, academic_year) VALUES
('AP24110010412', 'Greenwood Boys Hostel', 'C', '214', 'B2', 'Veg', '2024-25'),
('AP24110010213', 'Greenwood Boys Hostel', 'A', '105', 'B1', 'Non-Veg', '2024-25'),
('AP24110010337', 'Maple Girls Hostel', 'B', '312', 'B1', 'Veg', '2024-25'),
('AP23110020156', 'Greenwood Boys Hostel', 'D', '402', 'B2', 'Non-Veg', '2024-25'),
('AP24210030089', 'Maple Girls Hostel', 'A', '201', 'B2', 'Veg', '2024-25');

INSERT INTO transport (register_number, route_number, route_name, boarding_point, bus_timings, academic_year) VALUES
('AP24110010213', 'R-07', 'Vijayawada - Amaravati', 'Benz Circle, Vijayawada', '7:15 AM / 5:30 PM', '2024-25'),
('AP24110010337', 'R-12', 'Guntur - Amaravati', 'Brodipet Bus Stand, Guntur', '7:00 AM / 5:45 PM', '2024-25'),
('AP23110020156', 'R-03', 'Tenali - Amaravati', 'Tenali Town Bus Stand', '6:45 AM / 6:00 PM', '2024-25'),
('AP24210030089', 'R-15', 'Bapatla - Amaravati', 'Bapatla Railway Station', '6:30 AM / 6:15 PM', '2024-25'),
('AP24110010412', 'R-07', 'Vijayawada - Amaravati', 'Benz Circle, Vijayawada', '7:15 AM / 5:30 PM', '2024-25');
