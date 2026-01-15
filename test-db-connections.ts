import dotenv from 'dotenv';
import { connectPostgres, disconnectPostgres, prisma } from './src/config/database.js';
import { connectMongoDB, disconnectMongoDB } from './src/config/mongodb.js';

dotenv.config();

async function testConnections() {
  console.log('\n🧪 Starting Database Connection Tests...\n');

  let postgresSuccess = false;
  let mongodbSuccess = false;

  try {
    console.log('1️⃣  Testing PostgreSQL Connection...');
    await connectPostgres();
    postgresSuccess = true;
    console.log('✅ PostgreSQL connection test passed\n');
  } catch (error) {
    console.error('❌ PostgreSQL connection test failed:', error);
    console.log('');
  }

  try {
    console.log('2️⃣  Testing MongoDB Connection...');
    await connectMongoDB();
    mongodbSuccess = true;
    console.log('✅ MongoDB connection test passed\n');
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    console.log('');
  }

  try {
    console.log('3️⃣  Testing PostgreSQL Query...');
    if (postgresSuccess) {
      const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
      console.log('✅ PostgreSQL query successful:', result);
      console.log('');
    } else {
      console.log('⏭️  Skipping PostgreSQL query test (connection failed)\n');
    }
  } catch (error) {
    console.error('❌ PostgreSQL query test failed:', error);
    console.log('');
  }

  console.log('📊 Test Summary:');
  console.log(`   PostgreSQL: ${postgresSuccess ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   MongoDB: ${mongodbSuccess ? '✅ Connected' : '❌ Failed'}`);
  console.log('');

  try {
    await disconnectPostgres();
    await disconnectMongoDB();
    console.log('🔌 All connections closed');
  } catch (error) {
    console.error('Error closing connections:', error);
  }

  process.exit(postgresSuccess && mongodbSuccess ? 0 : 1);
}

testConnections();
