import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'equipment_control',
    password: 'Salayer*109',
    port: 5433
});

async function checkUser() {
    try {
        const result = await pool.query(
            `SELECT id, username, password_hash FROM users WHERE LOWER(username) = LOWER('admin.pro.001')`
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('✅ User found in database:');
            console.log('   ID:', user.id);
            console.log('   Username:', user.username);
            console.log('   Password Hash:', user.password_hash);
            console.log('   Password matches "Admin123"?', user.password_hash === 'Admin123');
        } else {
            console.log('❌ User not found');
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        pool.end();
    }
}

checkUser();
