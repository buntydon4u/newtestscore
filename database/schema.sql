-- Educational Platform Database Schema
-- Phase 1: Core Educational Tables

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  class_id SERIAL PRIMARY KEY,
  class_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Streams table
CREATE TABLE IF NOT EXISTS streams (
  stream_id SERIAL PRIMARY KEY,
  stream_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  subject_id SERIAL PRIMARY KEY,
  subject_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Many-to-many relationship between streams and subjects
CREATE TABLE IF NOT EXISTS stream_subjects (
  id SERIAL PRIMARY KEY,
  stream_id INT REFERENCES streams(stream_id) ON DELETE CASCADE,
  subject_id INT REFERENCES subjects(subject_id) ON DELETE CASCADE,
  UNIQUE(stream_id, subject_id)
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  student_id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  phone VARCHAR(20),
  class_id INT REFERENCES classes(class_id),
  stream_id INT REFERENCES streams(stream_id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Phase 2: Package System

-- Packages table - represents sellable products
CREATE TABLE IF NOT EXISTS packages (
  package_id SERIAL PRIMARY KEY,
  package_name VARCHAR(255) NOT NULL,
  package_type VARCHAR(50) NOT NULL CHECK (package_type IN ('class', 'subject', 'stream', 'test_series', 'chapter')),
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  duration_months INT CHECK (duration_months > 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Package mappings - links packages to educational content
CREATE TABLE IF NOT EXISTS package_mappings (
  mapping_id SERIAL PRIMARY KEY,
  package_id INT REFERENCES packages(package_id) ON DELETE CASCADE,
  class_id INT REFERENCES classes(class_id),
  stream_id INT REFERENCES streams(stream_id),
  subject_id INT REFERENCES subjects(subject_id),
  chapter_id INT, -- placeholder for future chapters table
  UNIQUE (package_id, class_id, stream_id, subject_id, chapter_id),
  CHECK (
    (package_type = 'class' AND class_id IS NOT NULL AND stream_id IS NULL AND subject_id IS NULL) OR
    (package_type = 'stream' AND class_id IS NOT NULL AND stream_id IS NOT NULL AND subject_id IS NULL) OR
    (package_type = 'subject' AND class_id IS NOT NULL AND stream_id IS NOT NULL AND subject_id IS NOT NULL) OR
    (package_type = 'chapter' AND class_id IS NOT NULL AND stream_id IS NOT NULL AND subject_id IS NOT NULL AND chapter_id IS NOT NULL) OR
    (package_type = 'test_series')
  )
);

-- Phase 3: Order System

-- Orders table - track purchases
CREATE TABLE IF NOT EXISTS orders (
  order_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(student_id),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items - one order can have multiple packages
CREATE TABLE IF NOT EXISTS order_items (
  item_id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
  package_id INT REFERENCES packages(package_id),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Phase 4: Access Control

-- Student access table - defines what student can access
CREATE TABLE IF NOT EXISTS student_access (
  access_id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
  package_id INT REFERENCES packages(package_id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  activated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, package_id)
);

-- Phase 5: Indexes for performance

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_class_stream ON students(class_id, stream_id);
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(package_type);
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_package_mappings_package ON package_mappings(package_id);
CREATE INDEX IF NOT EXISTS idx_orders_student ON orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_student_access_student ON student_access(student_id);
CREATE INDEX IF NOT EXISTS idx_student_access_package ON student_access(package_id);
CREATE INDEX IF NOT EXISTS idx_student_access_expiry ON student_access(expires_at);

-- Phase 6: Triggers for updated_at timestamps

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Phase 7: Views for common queries

-- View for active packages with their mappings
CREATE OR REPLACE VIEW active_packages_view AS
SELECT 
    p.package_id,
    p.package_name,
    p.package_type,
    p.description,
    p.price,
    p.duration_months,
    c.class_name,
    s.stream_name,
    sub.subject_name,
    p.created_at
FROM packages p
LEFT JOIN package_mappings pm ON p.package_id = pm.package_id
LEFT JOIN classes c ON pm.class_id = c.class_id
LEFT JOIN streams s ON pm.stream_id = s.stream_id
LEFT JOIN subjects sub ON pm.subject_id = sub.subject_id
WHERE p.is_active = true;

-- View for student's accessible packages
CREATE OR REPLACE VIEW student_accessible_packages_view AS
SELECT 
    sa.student_id,
    sa.package_id,
    sa.expires_at,
    p.package_name,
    p.package_type,
    p.description,
    c.class_name,
    s.stream_name,
    sub.subject_name
FROM student_access sa
JOIN packages p ON sa.package_id = p.package_id
LEFT JOIN package_mappings pm ON p.package_id = pm.package_id
LEFT JOIN classes c ON pm.class_id = c.class_id
LEFT JOIN streams s ON pm.stream_id = s.stream_id
LEFT JOIN subjects sub ON pm.subject_id = sub.subject_id
WHERE sa.expires_at >= NOW();
