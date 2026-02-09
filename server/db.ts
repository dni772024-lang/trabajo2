import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'equipment_control',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
};

export const pool = new Pool(config);

export class Database {
    static async getClient(): Promise<PoolClient> {
        return await pool.connect();
    }

    static async query(text: string, params?: any[]) {
        // console.log('Query:', text); // Uncomment for debug
        return await pool.query(text, params);
    }

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

    static async checkConnection() {
        try {
            const client = await pool.connect();
            client.release();
            return true;
        } catch (error) {
            console.error('DB Connection Failed:', error);
            return false;
        }
    }
}
