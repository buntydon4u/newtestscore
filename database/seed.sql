-- Seed Data for Educational Platform
-- Insert basic educational data

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE student_access, order_items, orders, package_mappings, packages, stream_subjects, students, subjects, streams, classes RESTART IDENTITY CASCADE;

-- Insert Classes
INSERT INTO classes (class_name, description) VALUES
('11', 'Class 11 - Senior Secondary'),
('12', 'Class 12 - Senior Secondary'),
('10', 'Class 10 - Secondary'),
('9', 'Class 9 - Secondary');

-- Insert Streams
INSERT INTO streams (stream_name, description) VALUES
('Medical', 'Medical Stream - Physics, Chemistry, Biology'),
('Non-Medical', 'Non-Medical Stream - Physics, Chemistry, Mathematics'),
('Commerce', 'Commerce Stream - Accountancy, Business, Economics'),
('Arts', 'Arts Stream - History, Geography, Political Science'),
('General', 'General Stream for Class 9-10');

-- Insert Subjects
INSERT INTO subjects (subject_name, description) VALUES
('Physics', 'Physics - Study of matter and energy'),
('Chemistry', 'Chemistry - Study of substances and their properties'),
('Mathematics', 'Mathematics - Study of numbers and shapes'),
('Biology', 'Biology - Study of living organisms'),
('English', 'English Language and Literature'),
('Hindi', 'Hindi Language and Literature'),
('Accountancy', 'Accountancy - Financial accounting'),
('Business Studies', 'Business Studies - Business organization and management'),
('Economics', 'Economics - Study of production and consumption'),
('History', 'History - Study of past events'),
('Geography', 'Geography - Study of Earth and its features'),
('Political Science', 'Political Science - Study of politics and government'),
('Computer Science', 'Computer Science - Study of computation and information'),
('Physical Education', 'Physical Education - Sports and fitness'),
('Environmental Studies', 'Environmental Studies - Environment and ecology');

-- Map Subjects to Streams
-- Medical Stream
INSERT INTO stream_subjects (stream_id, subject_id) VALUES
((SELECT stream_id FROM streams WHERE stream_name = 'Medical'), (SELECT subject_id FROM subjects WHERE subject_name = 'Physics')),
((SELECT stream_id FROM streams WHERE stream_name = 'Medical'), (SELECT subject_id FROM subjects WHERE subject_name = 'Chemistry')),
((SELECT stream_id FROM streams WHERE stream_name = 'Medical'), (SELECT subject_id FROM subjects WHERE subject_name = 'Biology')),
((SELECT stream_id FROM streams WHERE stream_name = 'Medical'), (SELECT subject_id FROM subjects WHERE subject_name = 'English')),
((SELECT stream_id FROM streams WHERE stream_name = 'Medical'), (SELECT subject_id FROM subjects WHERE subject_name = 'Physical Education'));

-- Non-Medical Stream
INSERT INTO stream_subjects (stream_id, subject_id) VALUES
((SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical'), (SELECT subject_id FROM subjects WHERE subject_name = 'Physics')),
((SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical'), (SELECT subject_id FROM subjects WHERE subject_name = 'Chemistry')),
((SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical'), (SELECT subject_id FROM subjects WHERE subject_name = 'Mathematics')),
((SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical'), (SELECT subject_id FROM subjects WHERE subject_name = 'English')),
((SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical'), (SELECT subject_id FROM subjects WHERE subject_name = 'Computer Science'));

-- Commerce Stream
INSERT INTO stream_subjects (stream_id, subject_id) VALUES
((SELECT stream_id FROM streams WHERE stream_name = 'Commerce'), (SELECT subject_id FROM subjects WHERE subject_name = 'Accountancy')),
((SELECT stream_id FROM streams WHERE stream_name = 'Commerce'), (SELECT subject_id FROM subjects WHERE subject_name = 'Business Studies')),
((SELECT stream_id FROM streams WHERE stream_name = 'Commerce'), (SELECT subject_id FROM subjects WHERE subject_name = 'Economics')),
((SELECT stream_id FROM streams WHERE stream_name = 'Commerce'), (SELECT subject_id FROM subjects WHERE subject_name = 'English')),
((SELECT stream_id FROM streams WHERE stream_name = 'Commerce'), (SELECT subject_id FROM subjects WHERE subject_name = 'Mathematics'));

-- Arts Stream
INSERT INTO stream_subjects (stream_id, subject_id) VALUES
((SELECT stream_id FROM streams WHERE stream_name = 'Arts'), (SELECT subject_id FROM subjects WHERE subject_name = 'History')),
((SELECT stream_id FROM streams WHERE stream_name = 'Arts'), (SELECT subject_id FROM subjects WHERE subject_name = 'Geography')),
((SELECT stream_id FROM streams WHERE stream_name = 'Arts'), (SELECT subject_id FROM subjects WHERE subject_name = 'Political Science')),
((SELECT stream_id FROM streams WHERE stream_name = 'Arts'), (SELECT subject_id FROM subjects WHERE subject_name = 'English')),
((SELECT stream_id FROM streams WHERE stream_name = 'Arts'), (SELECT subject_id FROM subjects WHERE subject_name = 'Economics'));

-- General Stream (Class 9-10)
INSERT INTO stream_subjects (stream_id, subject_id) VALUES
((SELECT stream_id FROM streams WHERE stream_name = 'General'), (SELECT subject_id FROM subjects WHERE subject_name = 'Physics')),
((SELECT stream_id FROM streams WHERE stream_name = 'General'), (SELECT subject_id FROM subjects WHERE subject_name = 'Chemistry')),
((SELECT stream_id FROM streams WHERE stream_name = 'General'), (SELECT subject_id FROM subjects WHERE subject_name = 'Mathematics')),
((SELECT stream_id FROM streams WHERE stream_name = 'General'), (SELECT subject_id FROM subjects WHERE subject_name = 'Biology')),
((SELECT stream_id FROM streams WHERE stream_name = 'General'), (SELECT subject_id FROM subjects WHERE subject_name = 'English')),
((SELECT stream_id FROM streams WHERE stream_name = 'General'), (SELECT subject_id FROM subjects WHERE subject_name = 'Hindi')),
((SELECT stream_id FROM streams WHERE stream_name = 'General'), (SELECT subject_id FROM subjects WHERE subject_name = 'Social Studies'));

-- Insert Sample Packages
-- Class 11 Packages
INSERT INTO packages (package_name, package_type, description, price, duration_months) VALUES
('Class 11 Complete Package', 'class', 'Complete access to Class 11 materials across all streams', 9999.00, 12),
('Class 11 Medical Stream', 'stream', 'Complete access to Class 11 Medical stream subjects', 6999.00, 12),
('Class 11 Non-Medical Stream', 'stream', 'Complete access to Class 11 Non-Medical stream subjects', 6999.00, 12),
('Class 11 Commerce Stream', 'stream', 'Complete access to Class 11 Commerce stream subjects', 5999.00, 12),
('Class 11 Arts Stream', 'stream', 'Complete access to Class 11 Arts stream subjects', 4999.00, 12);

-- Class 12 Packages
INSERT INTO packages (package_name, package_type, description, price, duration_months) VALUES
('Class 12 Complete Package', 'class', 'Complete access to Class 12 materials across all streams', 10999.00, 12),
('Class 12 Medical Stream', 'stream', 'Complete access to Class 12 Medical stream subjects', 7999.00, 12),
('Class 12 Non-Medical Stream', 'stream', 'Complete access to Class 12 Non-Medical stream subjects', 7999.00, 12),
('Class 12 Commerce Stream', 'stream', 'Complete access to Class 12 Commerce stream subjects', 6999.00, 12),
('Class 12 Arts Stream', 'stream', 'Complete access to Class 12 Arts stream subjects', 5999.00, 12);

-- Subject-wise Packages for Class 11
INSERT INTO packages (package_name, package_type, description, price, duration_months) VALUES
('Class 11 Physics', 'subject', 'Physics for Class 11', 1999.00, 12),
('Class 11 Chemistry', 'subject', 'Chemistry for Class 11', 1999.00, 12),
('Class 11 Mathematics', 'subject', 'Mathematics for Class 11', 1999.00, 12),
('Class 11 Biology', 'subject', 'Biology for Class 11', 1999.00, 12),
('Class 11 Accountancy', 'subject', 'Accountancy for Class 11', 1799.00, 12),
('Class 11 Business Studies', 'subject', 'Business Studies for Class 11', 1799.00, 12),
('Class 11 Economics', 'subject', 'Economics for Class 11', 1799.00, 12),
('Class 11 English', 'subject', 'English for Class 11', 999.00, 12);

-- Subject-wise Packages for Class 12
INSERT INTO packages (package_name, package_type, description, price, duration_months) VALUES
('Class 12 Physics', 'subject', 'Physics for Class 12', 2199.00, 12),
('Class 12 Chemistry', 'subject', 'Chemistry for Class 12', 2199.00, 12),
('Class 12 Mathematics', 'subject', 'Mathematics for Class 12', 2199.00, 12),
('Class 12 Biology', 'subject', 'Biology for Class 12', 2199.00, 12),
('Class 12 Accountancy', 'subject', 'Accountancy for Class 12', 1999.00, 12),
('Class 12 Business Studies', 'subject', 'Business Studies for Class 12', 1999.00, 12),
('Class 12 Economics', 'subject', 'Economics for Class 12', 1999.00, 12),
('Class 12 English', 'subject', 'English for Class 12', 1199.00, 12);

-- Test Series Packages
INSERT INTO packages (package_name, package_type, description, price, duration_months) VALUES
('JEE Test Series', 'test_series', 'CompleteComplete JEE preparation test series', 4999.00, 12),
('NEET Test Series', 'test_series', 'Complete NEET preparation test series', 4999.00, 12),
('Class 11 PCM Test Series', 'test_series', 'Physics, Chemistry, Mathematics test series for Class 11', 2999.00, 12),
('Class 11 PCB Test Series', 'test_series', 'Physics, Chemistry, Biology test series for Class 11', 2999.00, 12),
('Class 12 PCM Test Series', 'test_series', 'Physics, Chemistry, Mathematics test series for Class 12', 3299.00, 12),
('Class 12 PCB Test Series', 'test_series', 'Physics, Chemistry, Biology test series for Class 12', 3299.00, 12);

-- Map packages to content
-- Class 11 Complete Package
INSERT INTO package_mappings (package_id, class_id) VALUES
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Complete Package'), 
 (SELECT class_id FROM classes WHERE class_name = '11'));

-- Class 11 Stream Packages
INSERT INTO package_mappings (package_id, class_id, stream_id) VALUES
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Medical Stream'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Medical')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Non-Medical Stream'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Commerce Stream'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Commerce')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Arts Stream'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Arts'));

-- Class 11 Subject Packages
INSERT INTO package_mappings (package_id, class_id, stream_id, subject_id) VALUES
-- Physics for Medical and Non-Medical
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Physics'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Medical'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'Physics')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Physics'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'Physics')),
-- Chemistry for Medical and Non-Medical
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Chemistry'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Medical'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'Chemistry')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Chemistry'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'Chemistry')),
-- Mathematics for Non-Medical and Commerce
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Mathematics'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'Mathematics')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Mathematics'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Commerce'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'Mathematics')),
-- Biology for Medical
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Biology'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Medical'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'Biology')),
-- Accountancy, Business Studies, Economics for Commerce
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Accountancy'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Commerce'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'Accountancy')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Business Studies'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Commerce'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'Business Studies')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 Economics'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Commerce'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'Economics')),
-- English for all streams
((SELECT package_id FROM packages WHERE package_name = 'Class 11 English'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Medical'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'English')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 English'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'English')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 English'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Commerce'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'English')),
((SELECT package_id FROM packages WHERE package_name = 'Class 11 English'), 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Arts'),
 (SELECT subject_id FROM subjects WHERE subject_name = 'English'));

-- Class 12 Complete Package
INSERT INTO package_mappings (package_id, class_id) VALUES
((SELECT package_id FROM packages WHERE package_name = 'Class 12 Complete Package'), 
 (SELECT class_id FROM classes WHERE class_name = '12'));

-- Class 12 Stream Packages
INSERT INTO package_mappings (package_id, class_id, stream_id) VALUES
((SELECT package_id FROM packages WHERE package_name = 'Class 12 Medical Stream'), 
 (SELECT class_id FROM classes WHERE class_name = '12'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Medical')),
((SELECT package_id FROM packages WHERE package_name = 'Class 12 Non-Medical Stream'), 
 (SELECT class_id FROM classes WHERE class_name = '12'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical')),
((SELECT package_id FROM packages WHERE package_name = 'Class 12 Commerce Stream'), 
 (SELECT class_id FROM classes WHERE class_name = '12'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Commerce')),
((SELECT package_id FROM packages WHERE package_name = 'Class 12 Arts Stream'), 
 (SELECT class_id FROM classes WHERE class_name = '12'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Arts'));

-- Insert sample students
INSERT INTO students (email, password_hash, first_name, last_name, phone, class_id, stream_id) VALUES
('student1@example.com', '$2b$10$example_hash_1', 'Rahul', 'Kumar', '9876543210', 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Non-Medical')),
('student2@example.com', '$2b$10$example_hash_2', 'Priya', 'Sharma', '9876543211', 
 (SELECT class_id FROM classes WHERE class_name = '12'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Medical')),
('student3@example.com', '$2b$10$example_hash_3', 'Amit', 'Singh', '9876543212', 
 (SELECT class_id FROM classes WHERE class_name = '11'),
 (SELECT stream_id FROM streams WHERE stream_name = 'Commerce'));

-- Display summary
SELECT 'Classes' as table_name, COUNT(*) as count FROM classes
UNION ALL
SELECT 'Streams', COUNT(*) FROM streams
UNION ALL
SELECT 'Subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'Stream-Subject Mappings', COUNT(*) FROM stream_subjects
UNION ALL
SELECT 'Packages', COUNT(*) FROM packages
UNION ALL
SELECT 'Package Mappings', COUNT(*) FROM package_mappings
UNION ALL
SELECT 'Students', COUNT(*) FROM students;
