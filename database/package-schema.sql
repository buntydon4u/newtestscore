-- Package Management System Additions
-- This file contains only the tables that don't exist in the existing Prisma schema

-- Note: The following tables already exist in Prisma:
-- - users (will be used as students)
-- - classes (already exists)
-- - subjects (already exists)
-- - class_subjects (already exists, similar to our stream_subjects)

-- We need to create these new tables for package management:

-- Streams table (for academic streams like Medical, Non-Medical, etc.)
CREATE TABLE IF NOT EXISTS "streams" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "streams_pkey" PRIMARY KEY ("id")
);

-- Create unique index on streams name
CREATE UNIQUE INDEX IF NOT EXISTS "streams_name_key" ON "streams"("name");

-- Stream-Subject relationship (many-to-many)
CREATE TABLE IF NOT EXISTS "stream_subjects" (
  "id" TEXT NOT NULL,
  "streamId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "stream_subjects_pkey" PRIMARY KEY ("id")
);

-- Create unique index for stream-subject combination
CREATE UNIQUE INDEX IF NOT EXISTS "stream_subjects_streamId_subjectId_key" ON "stream_subjects"("streamId", "subjectId");

-- Packages table - represents sellable products
CREATE TABLE IF NOT EXISTS "packages" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- class / subject / stream / test_series / chapter
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "durationMonths" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- Create index on packages
CREATE INDEX IF NOT EXISTS "packages_type_idx" ON "packages"("type");
CREATE INDEX IF NOT EXISTS "packages_isActive_idx" ON "packages"("isActive");

-- Package mappings - links packages to educational content
CREATE TABLE IF NOT EXISTS "package_mappings" (
  "id" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "classId" TEXT,
  "streamId" TEXT,
  "subjectId" TEXT,
  "chapterId" TEXT, -- optional future (if you add chapters table)
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "package_mappings_pkey" PRIMARY KEY ("id")
);

-- Create unique index for package mapping
CREATE UNIQUE INDEX IF NOT EXISTS "package_mappings_packageId_classId_streamId_subjectId_chapterId_key" 
ON "package_mappings"("packageId", "classId", "streamId", "subjectId", "chapterId");

-- Orders table - track purchases
CREATE TABLE IF NOT EXISTS "orders" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "totalAmount" DECIMAL(10,2) NOT NULL,
  "paymentStatus" TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS "orders_studentId_idx" ON "orders"("studentId");
CREATE INDEX IF NOT EXISTS "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- Order items - one order can have multiple packages
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- Create index for order items
CREATE INDEX IF NOT EXISTS "order_items_orderId_idx" ON "order_items"("orderId");

-- Student access table - defines what the student gets after payment
CREATE TABLE IF NOT EXISTS "student_access" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "student_access_pkey" PRIMARY KEY ("id")
);

-- Create indexes for student access
CREATE INDEX IF NOT EXISTS "student_access_studentId_idx" ON "student_access"("studentId");
CREATE INDEX IF NOT EXISTS "student_access_packageId_idx" ON "student_access"("packageId");
CREATE INDEX IF NOT EXISTS "student_access_expiresAt_idx" ON "student_access"("expiresAt");

-- Create unique index for student-package access
CREATE UNIQUE INDEX IF NOT EXISTS "student_access_studentId_packageId_key" 
ON "student_access"("studentId", "packageId");

-- Add foreign key constraints
ALTER TABLE "stream_subjects" ADD CONSTRAINT "stream_subjects_streamId_fkey" 
FOREIGN KEY ("streamId") REFERENCES "streams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "stream_subjects" ADD CONSTRAINT "stream_subjects_subjectId_fkey" 
FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "package_mappings" ADD CONSTRAINT "package_mappings_packageId_fkey" 
FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "package_mappings" ADD CONSTRAINT "package_mappings_classId_fkey" 
FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "package_mappings" ADD CONSTRAINT "package_mappings_streamId_fkey" 
FOREIGN KEY ("streamId") REFERENCES "streams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "package_mappings" ADD CONSTRAINT "package_mappings_subjectId_fkey" 
FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_studentId_fkey" 
FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" 
FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_packageId_fkey" 
FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_access" ADD CONSTRAINT "student_access_studentId_fkey" 
FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_access" ADD CONSTRAINT "student_access_packageId_fkey" 
FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
