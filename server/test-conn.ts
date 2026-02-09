import { Database } from './db.js';

(async () => {
  console.log('🔎 Probando conexión a PostgreSQL con configuración de .env...');
  try {
    const ok = await Database.checkConnection();
    console.log('checkConnection() =>', ok);
    if (!ok) {
      console.error('❌ No se pudo conectar al pool de PostgreSQL.');
      process.exit(1);
    }

    const res = await Database.query('SELECT NOW() as now');
    console.log('✅ Query OK:', res.rows[0]);
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Error durante la prueba de conexión:', err.message || err);
    if (err.code) console.error('PG Error code:', err.code);
    process.exit(2);
  }
})();
