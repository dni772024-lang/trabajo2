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
    console.log('🔍 Revisando FK...\n');
    
    // PostgreSQL query para FK
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
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    `);
    
    console.log(`\n📋 Foreign Keys encontradas: ${pgFk.rows.length}`);
    for (const fk of pgFk.rows) {
      // Solo mostrar las que referencian users.id
      if (fk.referenced_table === 'users' && fk.referenced_column === 'id') {
        console.log(`  ⚠️  ${fk.constraint_name}: ${fk.table_name}.${fk.column_name} -> ${fk.referenced_table}.${fk.referenced_column}`);
      }
    }
    
    if (pgFk.rows.filter(r => r.referenced_table === 'users').length === 0) {
      console.log('  ✅ No hay FK que referencien a users.id');
      console.log('\n3️⃣  Procediendo a convertir id...');
      
      await pool.query(`
        ALTER TABLE users 
        ALTER COLUMN id TYPE VARCHAR(36) USING id::TEXT;
      `);
      console.log('✅ Columna id convertida a VARCHAR(36)');
    }
    
    await pool.end();
    console.log('\n✅ Completado');
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

main();
