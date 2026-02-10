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
    console.log('1️⃣  Obteniendo restricciones de llave foránea...');
    const fkResult = await pool.query(`
      SELECT constraint_name, table_name, column_name
      FROM information_schema.key_column_usage
      WHERE referenced_table_name = 'users' AND referenced_column_name = 'id'
    `);
    
    console.log(`Encontradas ${fkResult.rows.length} restricciones`);
    
    console.log('\n2️⃣  Eliminando restricciones de llave foránea...');
    for (const row of fkResult.rows) {
      try {
        await pool.query(`ALTER TABLE ${row.table_name} DROP CONSTRAINT IF EXISTS ${row.constraint_name}`);
        console.log(`✅ Eliminada restricción ${row.constraint_name}`);
      } catch (e) {
        console.log(`⚠️  No se pudo eliminar ${row.constraint_name}: ${e.message}`);
      }
    }
    
    console.log('\n3️⃣  Convertiendo columna id de INTEGER a VARCHAR...');
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN id TYPE VARCHAR(36) USING id::TEXT;
    `);
    console.log('✅ Columna id convertida a VARCHAR(36)');
    
    console.log('\n✅ Conversión completada');
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

convertIdToUUID();
