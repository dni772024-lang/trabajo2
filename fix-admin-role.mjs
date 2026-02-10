import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'Salayer*109',
  host: 'localhost',
  port: 5433,
  database: 'equipment_control'
});

async function fixRole() {
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE username = $2 RETURNING id, username, role',
      ['Administrador', 'admin.pro.001']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
    } else {
      console.log('✅ Rol actualizado correctamente:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

fixRole();
