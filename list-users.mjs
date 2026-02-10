import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'Salayer*109',
  host: 'localhost',
  port: 5433,
  database: 'equipment_control'
});

async function listUsers() {
  try {
    const result = await pool.query(
      'SELECT id, username, full_name, role, is_active FROM users ORDER BY id'
    );
    
    console.log('📋 Usuarios en la BD:\n');
    console.table(result.rows);
    
    // Contar por rol
    const roleCount = {};
    result.rows.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    
    console.log('\n📊 Resumen por rol:');
    console.table(roleCount);
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

listUsers();
