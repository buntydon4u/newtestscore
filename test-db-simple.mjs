import net from 'net';

function checkPort(host, port, name) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({
        name,
        port,
        connected: false,
        error: 'Connection timeout'
      });
    }, 3000);

    socket.connect(port, host, () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({
        name,
        port,
        connected: true,
        error: null
      });
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        name,
        port,
        connected: false,
        error: err.message
      });
    });
  });
}

async function testDatabases() {
  console.log('\n🧪 Testing Database Services\n');

  const postgresql = await checkPort('localhost', 5432, 'PostgreSQL');
  const mongodb = await checkPort('localhost', 27017, 'MongoDB');

  console.log('📋 Results:');
  console.log(`   PostgreSQL (port 5432): ${postgresql.connected ? '✅ RUNNING' : '❌ NOT RUNNING'} ${!postgresql.connected ? `(${postgresql.error})` : ''}`);
  console.log(`   MongoDB (port 27017):   ${mongodb.connected ? '✅ RUNNING' : '❌ NOT RUNNING'} ${!mongodb.connected ? `(${mongodb.error})` : ''}`);
  console.log('');

  if (!postgresql.connected || !mongodb.connected) {
    console.log('⚠️  Database services not running. Start them before running the application:');
    console.log('');
    if (!postgresql.connected) {
      console.log('   PostgreSQL: Start your PostgreSQL service');
    }
    if (!mongodb.connected) {
      console.log('   MongoDB: Start your MongoDB service');
    }
    process.exit(1);
  } else {
    console.log('✅ All database services are running and accessible!');
    process.exit(0);
  }
}

testDatabases();
