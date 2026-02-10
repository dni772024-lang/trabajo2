import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'Salayer*109',
  host: 'localhost',
  port: 5433,
  database: 'equipment_control'
});

async function fixSchema() {
  try {
    // Convertir ARRAY TEXT[] a TEXT
    const result = await pool.query(`
      ALTER TABLE users
      ALTER COLUMN permissions TYPE TEXT USING COALESCE(array_to_string(permissions, ','), '[]'),
      ALTER COLUMN accessible_modules TYPE TEXT USING COALESCE(array_to_string(accessible_modules, ','), '[]')
    `);
    console.log('✅ Esquema corregido: permissions y accessible_modules son ahora TEXT');
    
    await pool.end();
  } catch (err) {
    // Si hay error, probablemente ya estén como TEXT
    console.log('⚠️  Hay un error, pero puede ser que las columnas ya estén como TEXT');
    console.log('Error:', err.message);
    await pool.end();
  }
}

fixSchema();
