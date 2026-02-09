import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('═══════════════════════════════════════');
console.log('DIAGNÓSTICO DE CONEXIÓN PostgreSQL');
console.log('═══════════════════════════════════════\n');

console.log('📋 Configuración cargada desde .env:');
console.log(`   DB_USER: ${process.env.DB_USER}`);
console.log(`   DB_HOST: ${process.env.DB_HOST}`);
console.log(`   DB_PORT: ${process.env.DB_PORT}`);
console.log(`   DB_NAME: ${process.env.DB_NAME}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-3) : 'NO DEFINIDA'}\n`);

const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
};

console.log('🔄 Intentando conectar...\n');

const pool = new Pool(config);

// Event listeners
pool.on('error', (err) => {
    console.error('❌ Error del pool:', err.message);
});

pool.on('connect', () => {
    console.log('✅ Conexión establecida');
});

(async () => {
  try {
    console.log('⏳ Conectando al servidor PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Conexión exitosa\n');

    console.log('🔍 Obteniendo información del servidor:');
    const versionResult = await client.query('SELECT version()');
    console.log(`   PostgreSQL: ${versionResult.rows[0].version.split(',')[0]}\n`);

    console.log('📊 Verificando tabla "users":');
    const usersResult = await client.query(`
      SELECT COUNT(*) as count FROM users;
    `);
    console.log(`   Total de usuarios: ${usersResult.rows[0].count}`);

    console.log('\n👤 Usuario Admin:');
    const adminResult = await client.query(`
      SELECT id, username, full_name, role, password_hash 
      FROM users 
      WHERE LOWER(username) = 'admin'
      LIMIT 1
    `);
    
    if (adminResult.rows.length === 0) {
      console.log('   ❌ No encontrado');
    } else {
      const admin = adminResult.rows[0];
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Full Name: ${admin.full_name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Password Hash: ${admin.password_hash.substring(0, 20)}...`);
      console.log(`   Es texto plano "admin"?: ${admin.password_hash === 'admin' ? '✅ SÍ' : '❌ NO (hasheado o diferente)'}`);
    }

    client.release();
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO EXITOSAMENTE');
    console.log('\nPróximos pasos:');
    console.log('1. Verifica que el usuario Admin exista');
    console.log('2. Asegúrate que su contraseña sea "admin" en texto plano');
    console.log('3. Inicia el servidor: npm run server');
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ ERROR DURANTE EL DIAGNÓSTICO:');
    console.error(`   Tipo: ${err.code || err.name}`);
    console.error(`   Mensaje: ${err.message}`);
    
    if (err.code === 'ECONNREFUSED') {
      console.error('\n   → PostgreSQL no está escuchando en localhost:5433');
      console.error('   → Verifica que PostgreSQL esté corriendo');
    } else if (err.code === 'ENOTFOUND') {
      console.error('\n   → No se puede resolver "localhost"');
    } else if (err.code === '28P01') {
      console.error('\n   → Credenciales incorrectas (usuario/contraseña)');
    } else if (err.code === '3D000') {
      console.error('\n   → Base de datos no existe');
    }
    
    console.error('\nDetalles completos:', err);
    
    await pool.end();
    process.exit(1);
  }
})();
