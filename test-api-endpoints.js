import http from 'http';

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n✅ ${description}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data}`);
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`\n❌ ${description}`);
      console.log(`   Error: ${err.message}`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`\n❌ ${description} - TIMEOUT`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing API Endpoints...\n');
  await testEndpoint('/api/health', 'Health Check');
  await testEndpoint('/api/users', 'Get Users');
  console.log('\n✅ Tests completed');
}

runTests();
