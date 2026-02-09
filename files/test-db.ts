// test-db.ts
// Script para probar la conexión a PostgreSQL

import Database from './services/database';
import { storagePostgres } from './services/storagePostgres';

async function testDatabaseConnection() {
  console.log('🔍 Probando conexión a PostgreSQL...\n');

  try {
    // Test 1: Conexión básica
    console.log('Test 1: Verificando conexión básica...');
    const isConnected = await Database.testConnection();
    
    if (!isConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Test 2: Verificar tablas
    console.log('\nTest 2: Verificando tablas...');
    const tables = await Database.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tablas encontradas:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));

    // Test 3: Contar registros en cada tabla
    console.log('\nTest 3: Contando registros...');
    
    const userCount = await Database.query('SELECT COUNT(*) FROM users');
    console.log(`  Usuarios: ${userCount.rows[0].count}`);
    
    const empCount = await Database.query('SELECT COUNT(*) FROM employees');
    console.log(`  Empleados: ${empCount.rows[0].count}`);
    
    const eqCount = await Database.query('SELECT COUNT(*) FROM equipment');
    console.log(`  Equipos: ${eqCount.rows[0].count}`);
    
    const catCount = await Database.query('SELECT COUNT(*) FROM categories');
    console.log(`  Categorías: ${catCount.rows[0].count}`);
    
    const loanCount = await Database.query('SELECT COUNT(*) FROM loans');
    console.log(`  Préstamos: ${loanCount.rows[0].count}`);

    // Test 4: Probar servicios de almacenamiento
    console.log('\nTest 4: Probando servicios de almacenamiento...');
    
    const users = await storagePostgres.getUsers();
    console.log(`  ✅ getUsers(): ${users.length} usuarios obtenidos`);
    
    const employees = await storagePostgres.getEmployees();
    console.log(`  ✅ getEmployees(): ${employees.length} empleados obtenidos`);
    
    const equipment = await storagePostgres.getEquipment();
    console.log(`  ✅ getEquipment(): ${equipment.length} equipos obtenidos`);
    
    const categories = await storagePostgres.getCategories();
    console.log(`  ✅ getCategories(): ${categories.length} categorías obtenidas`);

    // Test 5: Verificar usuario admin
    console.log('\nTest 5: Verificando usuario administrador...');
    const adminUser = users.find(u => u.username === 'admin.pro.001');
    if (adminUser) {
      console.log(`  ✅ Usuario admin encontrado:`);
      console.log(`     - Nombre: ${adminUser.name} ${adminUser.lastName}`);
      console.log(`     - Email: ${adminUser.institutionalEmail}`);
      console.log(`     - Rol: ${adminUser.role}`);
      console.log(`     - Estado: ${adminUser.status}`);
    } else {
      console.log('  ⚠️  Usuario admin no encontrado');
    }

    console.log('\n✅ Todos los tests pasaron exitosamente!\n');
    console.log('🎉 La base de datos está lista para usar.\n');
    
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error);
    console.error('\nVerifica:');
    console.error('  1. PostgreSQL está corriendo');
    console.error('  2. Las credenciales en .env son correctas');
    console.error('  3. La base de datos "equipment_control" existe');
    console.error('  4. El script database-schema.sql se ejecutó correctamente\n');
    process.exit(1);
  } finally {
    await Database.close();
  }
}

// Ejecutar tests
testDatabaseConnection();
