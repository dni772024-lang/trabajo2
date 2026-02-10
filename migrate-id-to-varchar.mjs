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
    console.log('1️⃣  Eliminando FK...');
    
    // Eliminar las FK
    await pool.query('ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_created_by_fkey');
    console.log('✅ equipment_created_by_fkey eliminada');
    
    await pool.query('ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_registrado_por_fkey');
    console.log('✅ loans_registrado_por_fkey eliminada');
    
    console.log('\n2️⃣  Convirtiendo id de INTEGER a VARCHAR...');
    
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN id TYPE VARCHAR(36) USING id::TEXT;
    `);
    console.log('✅ Columna users.id convertida a VARCHAR(36)');
    
    // Convertir también las columnas que referencian a users.id
    await pool.query(`
      ALTER TABLE equipment 
      ALTER COLUMN created_by TYPE VARCHAR(36) USING COALESCE(created_by::TEXT, '');
    `);
    console.log('✅ Columna equipment.created_by convertida a VARCHAR(36)');
    
    await pool.query(`
      ALTER TABLE loans 
      ALTER COLUMN registrado_por TYPE VARCHAR(36) USING COALESCE(registrado_por::TEXT, '');
    `);
    console.log('✅ Columna loans.registrado_por convertida a VARCHAR(36)');
    
    console.log('\n3️⃣  Recreando FK...');
    
    await pool.query(`
      ALTER TABLE equipment 
      ADD CONSTRAINT equipment_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES users(id)
    `);
    console.log('✅ equipment_created_by_fkey recreada');
    
    await pool.query(`
      ALTER TABLE loans 
      ADD CONSTRAINT loans_registrado_por_fkey 
      FOREIGN KEY (registrado_por) REFERENCES users(id)
    `);
    console.log('✅ loans_registrado_por_fkey recreada');
    
    console.log('\n✅ Conversión completada');
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

main();
