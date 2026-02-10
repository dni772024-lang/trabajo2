import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'Salayer*109',
  host: 'localhost',
  port: 5433,
  database: 'equipment_control'
});

async function testCreateUser() {
  try {
    // Obtener el siguiente ID
    const idResult = await pool.query('SELECT MAX(CAST(id AS INTEGER)) as max_id FROM users');
    const nextId = (parseInt(idResult.rows[0].max_id) || 0) + 1;
    const result = await pool.query(`
      INSERT INTO users (
        id, full_name, last_name, username, rank, badge_number, unit,
        institutional_email, phone, password, role, permissions,
        accessible_modules, session_expiration, ip_restriction,
        require_password_change, auto_lock, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id, username, role
    `, [
      nextId, 
      'Usuario Test', 
      'Test', 
      'usuario.test', 
      'Operador', 
      'OP-001', 
      'Sistemas',
      'usuario@test.com', 
      '555-1234', 
      'TempPassword123', 
      'Operador', 
      JSON.stringify(['view_equipment', 'view_loans']),
      JSON.stringify(['Préstamos', 'Inventario']), 
      '8h',
      '', 
      false, 
      true, 
      'Activo'
    ]);
    
    console.log('✅ Usuario creado exitosamente:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error al crear usuario:', err.message);
    process.exit(1);
  }
}

testCreateUser();
