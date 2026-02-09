
console.log('Starting API test...');

async function test() {
    try {
        console.log('Testing /api/health...');
        const health = await fetch('http://localhost:3001/api/health');
        console.log('Health Status:', health.status);
        const healthText = await health.text();
        console.log('Health Body:', healthText.substring(0, 200));

        console.log('\nTesting /api/stats/overview...');
        const stats = await fetch('http://localhost:3001/api/stats/overview');
        console.log('Stats Status:', stats.status);
        const statsText = await stats.text();
        console.log('Stats Body:', statsText.substring(0, 500));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
