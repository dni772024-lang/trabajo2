import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'Salayer*109',
  host: 'localhost',
  port: 5433,
  database: 'equipment_control'
});

async function updateUsersTable() {
  try {
    // Agregar columnas faltantes si no existen
    const alter1 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT '';
    `);
    console.log('✅ Columna last_name añadida/verificada');

    const alter2 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS rank VARCHAR(100) DEFAULT 'N/A';
    `);
    console.log('✅ Columna rank añadida/verificada');

    const alter3 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS badge_number VARCHAR(50) DEFAULT '';
    `);
    console.log('✅ Columna badge_number añadida/verificada');

    const alter4 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS unit VARCHAR(100) DEFAULT '';
    `);
    console.log('✅ Columna unit añadida/verificada');

    const alter5 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS institutional_email VARCHAR(255) DEFAULT '';
    `);
    console.log('✅ Columna institutional_email añadida/verificada');

    const alter6 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '';
    `);
    console.log('✅ Columna phone añadida/verificada');

    const alter7 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}'::TEXT[];
    `);
    console.log('✅ Columna permissions añadida/verificada');

    const alter8 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS accessible_modules TEXT[] DEFAULT '{}'::TEXT[];
    `);
    console.log('✅ Columna accessible_modules añadida/verificada');

    const alter9 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS session_expiration VARCHAR(50) DEFAULT '8h';
    `);
    console.log('✅ Columna session_expiration añadida/verificada');

    const alter10 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ip_restriction VARCHAR(255) DEFAULT '';
    `);
    console.log('✅ Columna ip_restriction añadida/verificada');

    const alter11 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS require_password_change BOOLEAN DEFAULT false;
    `);
    console.log('✅ Columna require_password_change añadida/verificada');

    const alter12 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS auto_lock BOOLEAN DEFAULT true;
    `);
    console.log('✅ Columna auto_lock añadida/verificada');

    const alter13 = await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Activo';
    `);
    console.log('✅ Columna status añadida/verificada');

    // Renombrar password_hash a password
    const alter14 = await pool.query(`
      ALTER TABLE users 
      RENAME COLUMN password_hash TO password;
    `).catch(() => {
      console.log('⚠️  Columna password ya existe o no necesita renombrarse');
    });

    console.log('\n✅ Tabla users actualizada correctamente');
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateUsersTable();
