import fetch from 'node-fetch';

async function testLogin() {
    console.log('🧪 Testing login endpoint...\n');

    const credentials = {
        username: 'admin.pro.001',
        password: 'Admin123'
    };

    console.log('📤 Sending request to http://localhost:3001/api/auth/login');
    console.log('📋 Credentials:', credentials);
    console.log('');

    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        console.log('📊 Response Status:', response.status, response.statusText);

        const data = await response.text();
        console.log('📄 Response Body:', data);

        if (response.ok) {
            console.log('\n✅ Login successful!');
        } else {
            console.log('\n❌ Login failed');
            console.log('\n⚠️  Check the SERVER console for debug logs (🔍, 📊, 👤)');
            console.log('⚠️  If you DON\'T see those logs, the server is running old code');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testLogin();
