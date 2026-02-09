// services/database.ts
import { Pool, PoolClient } from 'pg';

// Configuración de la base de datos PostgreSQL
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'equipment_control',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Pool de conexiones
const pool = new Pool(dbConfig);

// Manejo de errores del pool
pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente inactivo de PostgreSQL', err);
  process.exit(-1);
});

// Clase para gestionar la base de datos
export class Database {
  // Obtener una conexión del pool
  static async getClient(): Promise<PoolClient> {
    return await pool.connect();
  }

  // Ejecutar una query simple
  static async query(text: string, params?: any[]) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  }

  // Ejecutar una transacción
  static async transaction(callback: (client: PoolClient) => Promise<any>) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Cerrar el pool de conexiones
  static async close() {
    await pool.end();
  }

  // Verificar la conexión
  static async testConnection(): Promise<boolean> {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Conexión a PostgreSQL exitosa');
      return true;
    } catch (error) {
      console.error('❌ Error al conectar con PostgreSQL:', error);
      return false;
    }
  }
}

export default Database;
