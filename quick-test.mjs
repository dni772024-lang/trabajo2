// Simple test to verify the login endpoint exists
import http from 'http';

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
};

const data = JSON.stringify({
    username: 'admin.pro.001',
    password: 'Admin123'
});

console.log('Testing login endpoint...');
console.log('If you see debug logs (🔍, 📊, 👤) in the SERVER terminal, the endpoint is working.');
console.log('If you see NOTHING in the server terminal, the endpoint does not exist.\n');

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Response:', body);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
