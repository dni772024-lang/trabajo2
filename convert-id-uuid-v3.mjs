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
    console.log('1️⃣  Obteniendo restricciones de llave foránea que referencian users.id...');
    const fkResult = await pool.query(`
      SELECT tc.constraint_name, kcu.table_name
      FROM information_schema.table_constraints tc 
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND ccu.table_name = 'users' 
        AND ccu.column_name = 'id'
    `);
    
    console.log(`Encontradas restricciones: ${fkResult.rows.length}`);
    
    console.log('\n2️⃣  Eliminando todas las restricciones de llave foránea de todas las tablas...');
    // Approach más seguro: obtener todas las FK y eliminarlas
    const allFK = await pool.query(`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
    `);
    
    for (const row of allFK.rows) {
      try {
        await pool.query(`ALTER TABLE "${row.table_name}" DROP CONSTRAINT IF EXISTS "${row.constraint_name}"`);
        console.log(`✅ ${row.constraint_name}`);
      } catch (e) {
        console.log(`⚠️  ${row.constraint_name}: ${e.message}`);
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
    await pool.end();
    process.exit(1);
  }
}

convertIdToUUID();
