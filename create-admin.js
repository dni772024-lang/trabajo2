import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

(async () => {
  try {
    console.log('Actualizando contraseña del usuario Admin a "admin"...\n');
    
    const result = await pool.query(`
      UPDATE users 
      SET password_hash = $1
      WHERE LOWER(username) = 'admin'
      RETURNING id, username, role, is_active;
    `, ['admin']); // En testing, almacenamos texto plano
    
    if (result.rowCount === 0) {
      console.log('❌ No se encontró usuario Admin para actualizar');
      await pool.end();
      process.exit(1);
    }
    
    console.log('✅ Usuario Admin actualizado:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    console.log('\nCredenciales de prueba:');
    console.log('Username: Admin');
    console.log('Password: admin');
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
})();
