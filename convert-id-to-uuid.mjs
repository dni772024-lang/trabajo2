import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'Salayer*109',
  host: 'localhost',
  port: 5433,
  database: 'equipment_control'
});

async function convertIdToUUID() {
  try {
    // Convertir columna id de INTEGER a VARCHAR
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN id TYPE VARCHAR(36) USING id::TEXT;
    `);
    console.log('✅ Columna id convertida a VARCHAR(36)');
    
    // Agregar DEFAULT uuid_generate_v4() pero primero habilitar la extensión
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ Extensión uuid-ossp habilitada');
    } catch (e) {
      console.log('⚠️  Extensión uuid-ossp no se pudo habilitar (puede que ya exista)');
    }
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

convertIdToUUID();
