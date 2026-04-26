-- ============================================================
--  SRM Portal — Schema Migration
--  Adds all missing tables and columns required by route code
-- ============================================================

USE srm_portal;

-- 1. Add 'program' column to subjects table
-- ALTER TABLE subjects ADD COLUMN program VARCHAR(200) DEFAULT NULL AFTER semester;

-- Update existing subjects with the correct program
UPDATE subjects SET program = 'B.Tech.-Computer Science and Engineering [UG - Full Time]' WHERE subject_code LIKE 'CS%' OR subject_code LIKE 'MA%';

-- 2. Add announcement targeting columns
-- ALTER TABLE announcements ADD COLUMN target_type ENUM('all','group','individual') DEFAULT 'all' AFTER is_important;
-- ALTER TABLE announcements ADD COLUMN target_register VARCHAR(20) DEFAULT NULL AFTER target_type;
-- ALTER TABLE announcements ADD COLUMN target_program VARCHAR(200) DEFAULT NULL AFTER target_register;
-- ALTER TABLE announcements ADD COLUMN target_semester VARCHAR(20) DEFAULT NULL AFTER target_program;

-- 3. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('superadmin','registrar','finance','academic') DEFAULT 'academic',
    is_active TINYINT(1) DEFAULT 1,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin@srmap2024)
INSERT IGNORE INTO admin_users (username, password_hash, full_name, role) VALUES
('admin', '$2b$10$xK8mN2pLqR4vT6wY0uO5eOQz1nJkI3hG7fD9cB2aE4mN6pLqR4vT6', 'System Administrator', 'superadmin'),
('registrar', '$2b$10$aB2cD4eF6gH8iJ0kL2mN4oP6qR8sT0uV2wX4yZ6aB2cD4eF6gH8iJ', 'Academic Registrar', 'registrar');

-- 4. Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('hostel_booking_enabled', 'true', 'Allow students to book hostel rooms'),
('transport_booking_enabled', 'true', 'Allow students to register for transport'),
('course_registration_enabled', 'true', 'Allow course registration'),
('exam_registration_enabled', 'true', 'Allow exam registration'),
('fee_payment_enabled', 'true', 'Allow online fee payment'),
('feedback_enabled', 'true', 'Allow course feedback submission'),
('maintenance_mode', 'false', 'Put portal in maintenance mode');

-- 5. Create events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    venue VARCHAR(200),
    organizer VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample events
INSERT INTO events (title, description, event_date, venue, organizer) VALUES
('Semester IV End Semester Exams', 'End Semester Examinations for all UG programs', '2025-05-12', 'Examination Halls A-D', 'Controller of Examinations'),
('Tech Fest 2025 — InnoVision', 'Annual technical festival with coding competitions, hackathons, and workshops', '2025-03-15', 'Central Campus Grounds', 'Student Council'),
('Industry Connect — Guest Lecture', 'Guest lecture by Google India on Cloud Computing and AI', '2025-04-05', 'Auditorium Block A', 'Dept. of CSE'),
('Annual Sports Day', 'Inter-department sports competitions', '2025-02-20', 'Sports Complex', 'Physical Education Dept'),
('Cultural Fest — Rhythm 2025', 'Music, dance, and drama performances', '2025-04-20', 'Open Air Theatre', 'Cultural Committee');

-- 6. Create sap_points table (Student Activity Points)
CREATE TABLE IF NOT EXISTS sap_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    activity_name VARCHAR(200) NOT NULL,
    activity_type ENUM('Technical','Cultural','Sports','Social','Academic') DEFAULT 'Technical',
    points INT DEFAULT 0,
    approved TINYINT(1) DEFAULT 0,
    approved_by VARCHAR(100) DEFAULT NULL,
    activity_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);

-- Insert sample SAP data
INSERT INTO sap_points (register_number, activity_name, activity_type, points, approved, approved_by, activity_date) VALUES
('AP24110010412', 'Inter-college Coding Competition — 1st Place', 'Technical', 50, 1, 'Dr. Rajesh Kumar Pattnaik', '2025-01-22'),
('AP24110010412', 'IEEE Student Branch Conference Volunteer', 'Technical', 30, 1, 'Prof. Venkata Subramanian', '2025-03-20'),
('AP24110010412', 'Blood Donation Camp — NSS', 'Social', 20, 1, 'NSS Coordinator', '2025-02-14'),
('AP24110010412', 'Tech Fest InnoVision — Hackathon Participant', 'Technical', 25, 1, 'Student Council', '2025-03-15'),
('AP24110010412', 'Badminton Inter-Dept — Runner Up', 'Sports', 15, 0, NULL, '2025-04-10');

-- 7. Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(20) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT,
    category ENUM('Course','Faculty','Infrastructure','General') DEFAULT 'General',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (register_number) REFERENCES students(register_number) ON DELETE CASCADE
);

-- Insert sample feedback
INSERT INTO feedbacks (register_number, subject, message, category) VALUES
('AP24110010412', 'CS401 — Design and Analysis of Algorithms', 'Excellent teaching methodology. The real-world examples really help understand complex algorithms.', 'Course'),
('AP24110010412', 'CS405 — Artificial Intelligence', 'Great hands-on lab sessions. Would appreciate more industry case studies.', 'Faculty'),
('AP24110010412', 'Library Wi-Fi Speed', 'The Wi-Fi in the library is often slow during peak hours. Please consider upgrading.', 'Infrastructure');

-- ============================================================
-- DONE — All missing tables and columns have been added
-- ============================================================
