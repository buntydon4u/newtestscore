import { Pool } from 'pg';
import packageDb from '../config/packageDb.js';
import {
  Package,
  PackageWithDetails,
  CreatePackageRequest,
  UpdatePackageRequest,
  PackageFilter,
  PackageMapping,
  Class,
  Stream,
  Subject
} from '../types/packageTypes.js';

export class PackageService {
  private db: Pool;

  constructor() {
    this.db = packageDb;
  }

  // Get all packages with optional filtering
  async getPackages(filter: PackageFilter = {}): Promise<PackageWithDetails[]> {
    let query = `
      SELECT 
        p.id as package_id,
        p.name as package_name,
        p.type as package_type,
        p.description,
        p.price,
        p."durationMonths" as duration_months,
        p."isActive" as is_active,
        p."createdAt" as created_at,
        p."updatedAt" as updated_at,
        c.name as class_name,
        s.name as stream_name,
        sub.name as subject_name
      FROM "packages" p
      LEFT JOIN "package_mappings" pm ON p.id = pm."packageId"
      LEFT JOIN "classes" c ON pm."classId" = c.id
      LEFT JOIN "streams" s ON pm."streamId" = s.id
      LEFT JOIN "subjects" sub ON pm."subjectId" = sub.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filter.package_type) {
      query += ` AND p.type = $${paramIndex++}`;
      params.push(filter.package_type);
    }

    if (filter.class_id) {
      query += ` AND pm."classId" = $${paramIndex++}`;
      params.push(filter.class_id);
    }

    if (filter.stream_id) {
      query += ` AND pm."streamId" = $${paramIndex++}`;
      params.push(filter.stream_id);
    }

    if (filter.subject_id) {
      query += ` AND pm."subjectId" = $${paramIndex++}`;
      params.push(filter.subject_id);
    }

    if (filter.is_active !== undefined) {
      query += ` AND p."isActive" = $${paramIndex++}`;
      params.push(filter.is_active);
    }

    if (filter.min_price) {
      query += ` AND p.price >= $${paramIndex++}`;
      params.push(filter.min_price);
    }

    if (filter.max_price) {
      query += ` AND p.price <= $${paramIndex++}`;
      params.push(filter.max_price);
    }

    query += ` ORDER BY p."createdAt" DESC`;

    const result = await this.db.query(query, params);
    return result.rows;
  }

  // Get package by ID
  async getPackageById(packageId: string): Promise<PackageWithDetails | null> {
    const query = `
      SELECT 
        p.id as package_id,
        p.name as package_name,
        p.type as package_type,
        p.description,
        p.price,
        p."durationMonths" as duration_months,
        p."isActive" as is_active,
        p."createdAt" as created_at,
        p."updatedAt" as updated_at,
        c.name as class_name,
        s.name as stream_name,
        sub.name as subject_name
      FROM "packages" p
      LEFT JOIN "package_mappings" pm ON p.id = pm."packageId"
      LEFT JOIN "classes" c ON pm."classId" = c.id
      LEFT JOIN "streams" s ON pm."streamId" = s.id
      LEFT JOIN "subjects" sub ON pm."subjectId" = sub.id
      WHERE p.id = $1
    `;

    const result = await this.db.query(query, [packageId]);
    return result.rows[0] || null;
  }

  // Create new package
  async createPackage(packageData: CreatePackageRequest): Promise<Package> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Generate a unique ID for the package
      const packageId = `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Insert package
      const packageQuery = `
        INSERT INTO "packages" (id, name, type, description, price, "durationMonths", "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;
      const packageValues = [
        packageId,
        packageData.package_name,
        packageData.package_type,
        packageData.description || null,
        packageData.price,
        packageData.duration_months,
        true
      ];
      const packageResult = await client.query(packageQuery, packageValues);
      const newPackage = packageResult.rows[0];

      // Insert package mapping if applicable
      if (packageData.package_type !== 'test_series') {
        const mappingId = `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mappingQuery = `
          INSERT INTO "package_mappings" (id, "packageId", "classId", "streamId", "subjectId", "chapterId", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `;
        const mappingValues = [
          mappingId,
          packageId,
          packageData.class_id || null,
          packageData.stream_id || null,
          packageData.subject_id || null,
          packageData.chapter_id || null
        ];
        await client.query(mappingQuery, mappingValues);
      }

      await client.query('COMMIT');
      return newPackage;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update package
  async updatePackage(packageId: string, updateData: UpdatePackageRequest): Promise<Package | null> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updateData.package_name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      params.push(updateData.package_name);
    }

    if (updateData.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      params.push(updateData.description);
    }

    if (updateData.price !== undefined) {
      updateFields.push(`price = $${paramIndex++}`);
      params.push(updateData.price);
    }

    if (updateData.duration_months !== undefined) {
      updateFields.push(`"durationMonths" = $${paramIndex++}`);
      params.push(updateData.duration_months);
    }

    if (updateData.is_active !== undefined) {
      updateFields.push(`"isActive" = $${paramIndex++}`);
      params.push(updateData.is_active);
    }

    if (updateFields.length === 0) {
      return this.getPackageById(packageId);
    }

    updateFields.push(`"updatedAt" = NOW()`);
    params.push(packageId);

    const query = `
      UPDATE "packages" 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, params);
    return result.rows[0] || null;
  }

  // Delete package (soft delete by setting is_active to false)
  async deletePackage(packageId: string): Promise<boolean> {
    const query = 'UPDATE "packages" SET "isActive" = false WHERE id = $1';
    const result = await this.db.query(query, [packageId]);
    return (result.rowCount ?? 0) > 0;
  }

  // Get classes
  async getClasses(): Promise<Class[]> {
    const query = 'SELECT * FROM "classes" ORDER BY name';
    const result = await this.db.query(query);
    return result.rows;
  }

  // Get streams
  async getStreams(): Promise<Stream[]> {
    const query = 'SELECT * FROM "streams" ORDER BY name';
    const result = await this.db.query(query);
    return result.rows;
  }

  // Get subjects
  async getSubjects(): Promise<Subject[]> {
    const query = 'SELECT * FROM "subjects" ORDER BY name';
    const result = await this.db.query(query);
    return result.rows;
  }

  // Get subjects by stream
  async getSubjectsByStream(streamId: string): Promise<Subject[]> {
    const query = `
      SELECT s.* FROM "subjects" s
      JOIN "stream_subjects" ss ON s.id = ss."subjectId"
      WHERE ss."streamId" = $1
      ORDER BY s.name
    `;
    const result = await this.db.query(query, [streamId]);
    return result.rows;
  }

  // Create stream
  async createStream(streamData: { name: string; description?: string }): Promise<Stream> {
    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const query = `
      INSERT INTO "streams" (id, name, description, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;
    const values = [streamId, streamData.name, streamData.description || null];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Update stream
  async updateStream(streamId: string, updateData: { name?: string; description?: string }): Promise<Stream | null> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updateData.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      params.push(updateData.name);
    }

    if (updateData.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      params.push(updateData.description);
    }

    if (updateFields.length === 0) {
      const query = 'SELECT * FROM "streams" WHERE id = $1';
      const result = await this.db.query(query, [streamId]);
      return result.rows[0] || null;
    }

    params.push(streamId);
    const query = `
      UPDATE "streams" 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    const result = await this.db.query(query, params);
    return result.rows[0] || null;
  }

  // Delete stream
  async deleteStream(streamId: string): Promise<boolean> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      
      // Delete from stream_subjects junction table first
      await client.query('DELETE FROM "stream_subjects" WHERE "streamId" = $1', [streamId]);
      
      // Delete from package_mappings
      await client.query('DELETE FROM "package_mappings" WHERE "streamId" = $1', [streamId]);
      
      // Delete the stream
      const result = await client.query('DELETE FROM "streams" WHERE id = $1', [streamId]);
      
      await client.query('COMMIT');
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Create subject
  async createSubject(subjectData: { name: string; description?: string; code?: string; category?: string; type?: string; isCore?: boolean; isMandatory?: boolean }): Promise<Subject> {
    const subjectId = `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const code = subjectData.code || subjectData.name.substring(0, 3).toUpperCase();
    const category = subjectData.category || 'SCIENCE';
    const type = subjectData.type || 'THEORY';
    const isCore = subjectData.isCore !== undefined ? subjectData.isCore : true;
    const isMandatory = subjectData.isMandatory !== undefined ? subjectData.isMandatory : true;
    
    const query = `
      INSERT INTO "subjects" (id, name, code, category, type, "isCore", "isMandatory", description, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;
    const values = [subjectId, subjectData.name, code, category, type, isCore, isMandatory, subjectData.description || null];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Update subject
  async updateSubject(subjectId: string, updateData: { name?: string; description?: string }): Promise<Subject | null> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updateData.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      params.push(updateData.name);
    }

    if (updateData.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      params.push(updateData.description);
    }

    if (updateFields.length === 0) {
      const query = 'SELECT * FROM "subjects" WHERE id = $1';
      const result = await this.db.query(query, [subjectId]);
      return result.rows[0] || null;
    }

    params.push(subjectId);
    const query = `
      UPDATE "subjects" 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    const result = await this.db.query(query, params);
    return result.rows[0] || null;
  }

  // Delete subject
  async deleteSubject(subjectId: string): Promise<boolean> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      
      // Delete from stream_subjects junction table first
      await client.query('DELETE FROM "stream_subjects" WHERE "subjectId" = $1', [subjectId]);
      
      // Delete from package_mappings
      await client.query('DELETE FROM "package_mappings" WHERE "subjectId" = $1', [subjectId]);
      
      // Delete the subject
      const result = await client.query('DELETE FROM "subjects" WHERE id = $1', [subjectId]);
      
      await client.query('COMMIT');
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Check if student has access to package
  async checkStudentAccess(studentId: string, packageId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM "student_access"
      WHERE "studentId" = $1 AND "packageId" = $2 AND "expiresAt" >= NOW()
    `;
    const result = await this.db.query(query, [studentId, packageId]);
    return parseInt(result.rows[0].count) > 0;
  }

  // Get student's accessible packages
  async getStudentPackages(studentId: string): Promise<any[]> {
    const query = `
      SELECT 
        sa.id as access_id,
        sa."studentId" as student_id,
        sa."packageId" as package_id,
        sa."expiresAt" as expires_at,
        sa."activatedAt" as activated_at,
        p.name as package_name,
        p.type as package_type,
        p.description,
        c.name as class_name,
        s.name as stream_name,
        sub.name as subject_name
      FROM "student_access" sa
      JOIN "packages" p ON sa."packageId" = p.id
      LEFT JOIN "package_mappings" pm ON p.id = pm."packageId"
      LEFT JOIN "classes" c ON pm."classId" = c.id
      LEFT JOIN "streams" s ON pm."streamId" = s.id
      LEFT JOIN "subjects" sub ON pm."subjectId" = sub.id
      WHERE sa."studentId" = $1 AND sa."expiresAt" >= NOW()
      ORDER BY sa."activatedAt" DESC
    `;
    const result = await this.db.query(query, [studentId]);
    return result.rows;
  }
}
