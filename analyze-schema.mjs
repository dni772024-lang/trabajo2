import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'Salayer*109',
  host: 'localhost',
  port: 5433,
  database: 'equipment_control'
});

async function main() {
  try {
    console.log('🔍 Revisando problemas...\n');
    
    // Obtener todos los datos de users primero
    const usersResult = await pool.query('SELECT * FROM users');
    console.log(`📊 Usuarios en BD: ${usersResult.rows.length}`);
    usersResult.rows.forEach(u => {
      console.log(`  - ID: ${u.id} (${typeof u.id}), Usuario: ${u.username}`);
    });
    
    // Obtener todas las FK
    console.log('\n📋 Restricciones Foreign Key:');
    const fkResult = await pool.query(`
      SELECT 
        constraint_name,
        table_name,
        column_name,
        referenced_table_name,
        referenced_column_name
      FROM information_schema.referential_constraints
      WHERE constraint_schema = 'public'
    `);
    
    if (fkResult.rows.length === 0) {
      console.log('  No hay FK encontradas (esto es normal en postgresql con este query)');
    }
    
    // Otro intento para postgresql
    const pgFk = await pool.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
    `);
    
    console.log(`Encontradas ${pgFk.rows.length} FK:`);
    for (const fk of pgFk.rows) {
      console.log(`  - ${fk.constraint_name}: ${fk.table_name}.${fk.column_name} -> ${fk.referenced_table}.${fk.referenced_column}`);
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

main();
