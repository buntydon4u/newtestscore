-- Package Management System Seed Data
-- This file adds seed data for the package management system
-- It works with the existing Prisma schema

-- Clear existing package management data (in correct order due to foreign keys)
TRUNCATE TABLE "student_access", "order_items", "orders", "package_mappings", "packages", "stream_subjects", "streams" RESTART IDENTITY CASCADE;

-- Insert Streams
INSERT INTO "streams" ("id", "name", "description", "isActive", "createdAt", "updatedAt") VALUES
('stream_medical', 'Medical', 'Medical Stream - Physics, Chemistry, Biology', true, NOW(), NOW()),
('stream_non_medical', 'Non-Medical', 'Non-Medical Stream - Physics, Chemistry, Mathematics', true, NOW(), NOW()),
('stream_commerce', 'Commerce', 'Commerce Stream - Accountancy, Business, Economics', true, NOW(), NOW()),
('stream_arts', 'Arts', 'Arts Stream - History, Geography, Political Science', true, NOW(), NOW()),
('stream_general', 'General', 'General Stream for Class 9-10', true, NOW(), NOW());

-- Map Subjects to Streams
-- First, let's get some existing subject IDs (you may need to adjust these based on your actual data)
-- For now, we'll use placeholder IDs - replace with actual subject IDs from your database

-- Medical Stream (assuming these subject IDs exist)
INSERT INTO "stream_subjects" ("streamId", "subjectId", "createdAt", "updatedAt") VALUES
('stream_medical', 'subject_physics', NOW(), NOW()),
('stream_medical', 'subject_chemistry', NOW(), NOW()),
('stream_medical', 'subject_biology', NOW(), NOW()),
('stream_medical', 'subject_english', NOW(), NOW()),
('stream_medical', 'subject_physical_ed', NOW(), NOW());

-- Non-Medical Stream
INSERT INTO "stream_subjects" ("streamId", "subjectId", "createdAt", "updatedAt") VALUES
('stream_non_medical', 'subject_physics', NOW(), NOW()),
('stream_non_medical', 'subject_chemistry', NOW(), NOW()),
('stream_non_medical', 'subject_maths', NOW(), NOW()),
('stream_non_medical', 'subject_english', NOW(), NOW()),
('stream_non_medical', 'subject_cs', NOW(), NOW());

-- Commerce Stream
INSERT INTO "stream_subjects" ("streamId", "subjectId", "createdAt", "updatedAt") VALUES
('stream_commerce', 'subject_accountancy', NOW(), NOW()),
('stream_commerce', 'subject_business', NOW(), NOW()),
('stream_commerce', 'subject_economics', NOW(), NOW()),
('stream_commerce', 'subject_english', NOW(), NOW()),
('stream_commerce', 'subject_maths', NOW(), NOW());

-- Arts Stream
INSERT INTO "stream_subjects" ("streamId", "subjectId", "createdAt", "updatedAt") VALUES
('stream_arts', 'subject_history', NOW(), NOW()),
('stream_arts', 'subject_geography', NOW(), NOW()),
('stream_arts', 'subject_political', NOW(), NOW()),
('stream_arts', 'subject_english', NOW(), NOW()),
('stream_arts', 'subject_economics', NOW(), NOW());

-- General Stream (Class 9-10)
INSERT INTO "stream_subjects" ("streamId", "subjectId", "createdAt", "updatedAt") VALUES
('stream_general', 'subject_physics', NOW(), NOW()),
('stream_general', 'subject_chemistry', NOW(), NOW()),
('stream_general', 'subject_maths', NOW(), NOW()),
('stream_general', 'subject_biology', NOW(), NOW()),
('stream_general', 'subject_english', NOW(), NOW()),
('stream_general', 'subject_hindi', NOW(), NOW());

-- Insert Sample Packages
-- Class 11 Packages (assuming class IDs exist)
INSERT INTO "packages" ("id", "name", "type", "description", "price", "durationMonths", "isActive", "createdAt", "updatedAt") VALUES
('pkg_class11_complete', 'Class 11 Complete Package', 'class', 'Complete access to Class 11 materials across all streams', 9999.00, 12, true, NOW(), NOW()),
('pkg_class11_medical', 'Class 11 Medical Stream', 'stream', 'Complete access to Class 11 Medical stream subjects', 6999.00, 12, true, NOW(), NOW()),
('pkg_class11_non_medical', 'Class 11 Non-Medical Stream', 'stream', 'Complete access to Class 11 Non-Medical stream subjects', 6999.00, 12, true, NOW(), NOW()),
('pkg_class11_commerce', 'Class 11 Commerce Stream', 'stream', 'Complete access to Class 11 Commerce stream subjects', 5999.00, 12, true, NOW(), NOW()),
('pkg_class11_arts', 'Class 11 Arts Stream', 'stream', 'Complete access to Class 11 Arts stream subjects', 4999.00, 12, true, NOW(), NOW());

-- Class 12 Packages
INSERT INTO "packages" ("id", "name", "type", "description", "price", "durationMonths", "isActive", "createdAt", "updatedAt") VALUES
('pkg_class12_complete', 'Class 12 Complete Package', 'class', 'Complete access to Class 12 materials across all streams', 10999.00, 12, true, NOW(), NOW()),
('pkg_class12_medical', 'Class 12 Medical Stream', 'stream', 'Complete access to Class 12 Medical stream subjects', 7999.00, 12, true, NOW(), NOW()),
('pkg_class12_non_medical', 'Class 12 Non-Medical Stream', 'stream', 'Complete access to Class 12 Non-Medical stream subjects', 7999.00, 12, true, NOW(), NOW()),
('pkg_class12_commerce', 'Class 12 Commerce Stream', 'stream', 'Complete access to Class 12 Commerce stream subjects', 6999.00, 12, true, NOW(), NOW()),
('pkg_class12_arts', 'Class 12 Arts Stream', 'stream', 'Complete access to Class 12 Arts stream subjects', 5999.00, 12, true, NOW(), NOW());

-- Subject-wise Packages for Class 11
INSERT INTO "packages" ("id", "name", "type", "description", "price", "durationMonths", "isActive", "createdAt", "updatedAt") VALUES
('pkg_class11_physics', 'Class 11 Physics', 'subject', 'Physics for Class 11', 1999.00, 12, true, NOW(), NOW()),
('pkg_class11_chemistry', 'Class 11 Chemistry', 'subject', 'Chemistry for Class 11', 1999.00, 12, true, NOW(), NOW()),
('pkg_class11_maths', 'Class 11 Mathematics', 'subject', 'Mathematics for Class 11', 1999.00, 12, true, NOW(), NOW()),
('pkg_class11_biology', 'Class 11 Biology', 'subject', 'Biology for Class 11', 1999.00, 12, true, NOW(), NOW()),
('pkg_class11_accountancy', 'Class 11 Accountancy', 'subject', 'Accountancy for Class 11', 1799.00, 12, true, NOW(), NOW()),
('pkg_class11_business', 'Class 11 Business Studies', 'subject', 'Business Studies for Class 11', 1799.00, 12, true, NOW(), NOW()),
('pkg_class11_economics', 'Class 11 Economics', 'subject', 'Economics for Class 11', 1799.00, 12, true, NOW(), NOW()),
('pkg_class11_english', 'Class 11 English', 'subject', 'English for Class 11', 999.00, 12, true, NOW(), NOW());

-- Test Series Packages
INSERT INTO "packages" ("id", "name", "type", "description", "price", "durationMonths", "isActive", "createdAt", "updatedAt") VALUES
('pkg_jee_test', 'JEE Test Series', 'test_series', 'Complete JEE preparation test series', 4999.00, 12, true, NOW(), NOW()),
('pkg_neet_test', 'NEET Test Series', 'test_series', 'Complete NEET preparation test series', 4999.00, 12, true, NOW(), NOW()),
('pkg_class11_pcm_test', 'Class 11 PCM Test Series', 'test_series', 'Physics, Chemistry, Mathematics test series for Class 11', 2999.00, 12, true, NOW(), NOW()),
('pkg_class11_pcb_test', 'Class 11 PCB Test Series', 'test_series', 'Physics, Chemistry, Biology test series for Class 11', 2999.00, 12, true, NOW(), NOW());

-- Map packages to content
-- Class 11 Complete Package (assuming class ID exists)
INSERT INTO "package_mappings" ("packageId", "classId", "createdAt", "updatedAt") VALUES
('pkg_class11_complete', 'class_11_id', NOW(), NOW());

-- Class 11 Stream Packages
INSERT INTO "package_mappings" ("packageId", "classId", "streamId", "createdAt", "updatedAt") VALUES
('pkg_class11_medical', 'class_11_id', 'stream_medical', NOW(), NOW()),
('pkg_class11_non_medical', 'class_11_id', 'stream_non_medical', NOW(), NOW()),
('pkg_class11_commerce', 'class_11_id', 'stream_commerce', NOW(), NOW()),
('pkg_class11_arts', 'class_11_id', 'stream_arts', NOW(), NOW());

-- Class 11 Subject Packages
INSERT INTO "package_mappings" ("packageId", "classId", "streamId", "subjectId", "createdAt", "updatedAt") VALUES
-- Physics for Medical and Non-Medical
('pkg_class11_physics', 'class_11_id', 'stream_medical', 'subject_physics', NOW(), NOW()),
('pkg_class11_physics', 'class_11_id', 'stream_non_medical', 'subject_physics', NOW(), NOW()),
-- Chemistry for Medical and Non-Medical
('pkg_class11_chemistry', 'class_11_id', 'stream_medical', 'subject_chemistry', NOW(), NOW()),
('pkg_class11_chemistry', 'class_11_id', 'stream_non_medical', 'subject_chemistry', NOW(), NOW()),
-- Mathematics for Non-Medical and Commerce
('pkg_class11_maths', 'class_11_id', 'stream_non_medical', 'subject_maths', NOW(), NOW()),
('pkg_class11_maths', 'class_11_id', 'stream_commerce', 'subject_maths', NOW(), NOW()),
-- Biology for Medical
('pkg_class11_biology', 'class_11_id', 'stream_medical', 'subject_biology', NOW(), NOW()),
-- Accountancy, Business Studies, Economics for Commerce
('pkg_class11_accountancy', 'class_11_id', 'stream_commerce', 'subject_accountancy', NOW(), NOW()),
('pkg_class11_business', 'class_11_id', 'stream_commerce', 'subject_business', NOW(), NOW()),
('pkg_class11_economics', 'class_11_id', 'stream_commerce', 'subject_economics', NOW(), NOW());

-- Display summary
SELECT 'Streams' as table_name, COUNT(*) as count FROM "streams"
UNION ALL
SELECT 'Stream-Subject Mappings', COUNT(*) FROM "stream_subjects"
UNION ALL
SELECT 'Packages', COUNT(*) FROM "packages"
UNION ALL
SELECT 'Package Mappings', COUNT(*) FROM "package_mappings";
