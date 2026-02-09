import http from 'http';

console.log('Testing server at localhost:3001...\n');

const req = http.request('http://127.0.0.1:3001/api/test', {
  method: 'GET',
  timeout: 5000
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Server responded!');
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.log('❌ Connection error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Request timeout (5 seconds) - server not responding');
  req.destroy();
  process.exit(1);
});

req.end();
