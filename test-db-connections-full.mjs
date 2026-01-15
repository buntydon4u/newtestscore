import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Client } from 'pg';

dotenv.config();

async function testPostgreSQL() {
  console.log('1️⃣  Testing PostgreSQL Connection...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful - Current time:', result.rows[0].current_time);
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL Error:', error.message);
    return false;
  }
}

async function testMongoDB() {
  console.log('\n2️⃣  Testing MongoDB Connection...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    const database = mongoose.connection.db;
    const collections = await database.listCollections().toArray();
    console.log(`✅ Database accessible - Found ${collections.length} collections`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n🧪 Database Connection Tests\n');
  console.log('Configuration:');
  console.log(`   PostgreSQL: ${process.env.DATABASE_URL}`);
  console.log(`   MongoDB: ${process.env.MONGODB_URI}`);
  console.log('');

  const postgresResult = await testPostgreSQL();
  const mongoResult = await testMongoDB();

  console.log('\n📊 Test Summary:');
  console.log(`   PostgreSQL: ${postgresResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   MongoDB: ${mongoResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('');

  if (postgresResult && mongoResult) {
    console.log('✅ All database connections are working!');
    process.exit(0);
  } else {
    console.log('❌ One or more database connections failed');
    process.exit(1);
  }
}

runTests();
