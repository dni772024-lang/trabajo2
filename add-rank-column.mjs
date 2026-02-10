import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'Salayer*109',
  host: 'localhost',
  port: 5433,
  database: 'equipment_control'
});

async function addRankColumn() {
  try {
    console.log('1️⃣  Agregando columna rank a la tabla employees...');
    
    await pool.query(`
      ALTER TABLE employees
      ADD COLUMN IF NOT EXISTS rank VARCHAR(100) DEFAULT 'Agente';
    `);
    console.log('✅ Columna rank agregada correctamente');
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

addRankColumn();
