import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'equipment_control',
    password: 'Salayer*109',
    port: 5433
});

async function fixUser() {
    try {
        // Delete old user
        await pool.query('DELETE FROM users WHERE username = $1', ['Admin']);
        console.log('✅ Usuario antiguo "Admin" eliminado');

        // Create new user
        await pool.query(
            'INSERT INTO users (username, password_hash, full_name, role, is_active) VALUES ($1, $2, $3, $4, $5)',
            ['admin.pro.001', 'Admin123', 'Administrador Principal', 'admin', true]
        );
        console.log('✅ Nuevo usuario creado: admin.pro.001 / Admin123');

        // Verify
        const result = await pool.query('SELECT id, username, password_hash, role, is_active FROM users');
        console.log('\n📋 Usuarios en la base de datos:');
        console.table(result.rows);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        pool.end();
    }
}

fixUser();
