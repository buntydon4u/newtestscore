import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use DATABASE_URL if available, otherwise fall back to individual parameters
const connectionString = process.env.DATABASE_URL;

// Debug logging
console.log('=== Package DB Debug ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
console.log('Connection String:', connectionString ? connectionString.substring(0, 50) + '...' : 'NULL');
console.log('========================');

const pool = new Pool(connectionString ? {
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Neon
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
} : {
  // Fallback configuration if DATABASE_URL is not set
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'educational_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
