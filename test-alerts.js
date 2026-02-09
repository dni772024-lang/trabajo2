
console.log('Starting API test...');

async function test() {
    try {
        console.log('\nTesting /api/stats/alerts...');
        const alerts = await fetch('http://localhost:3001/api/stats/alerts');
        console.log('Alerts Status:', alerts.status);
        const alertsText = await alerts.text();
        console.log('Alerts Body:', alertsText.substring(0, 500));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
