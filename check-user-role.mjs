import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'Salayer*109',
  host: 'localhost',
  port: 5433,
  database: 'equipment_control'
});

async function checkUser() {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['admin.pro.001']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
    } else {
      console.log('✅ Usuario encontrado:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkUser();
