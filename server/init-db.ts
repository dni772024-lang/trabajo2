import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Specify path explicitely to be sure
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'Salayer*109',
    port: parseInt(process.env.DB_PORT || '5433'),
};

const targetDbName = process.env.DB_NAME || 'equipment_control';

console.log('DEBUG: DB Config:', {
    user: dbConfig.user,
    host: dbConfig.host,
    port: dbConfig.port,
    database: targetDbName,
    hasPassword: !!dbConfig.password,
    passwordLength: dbConfig.password?.length
});

async function init() {
    console.log('🔄 Sincronizando Base de Datos...');

    const client = new Client({ ...dbConfig, database: 'postgres' });

    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${targetDbName}'`);

        if (res.rowCount === 0) {
            console.log(`Database '${targetDbName}' not found. Creating...`);
            await client.query(`CREATE DATABASE "${targetDbName}"`);
            console.log(`✅ Base de datos '${targetDbName}' creada.`);
        } else {
            console.log(`ℹ️ La base de datos '${targetDbName}' ya existe.`);
        }
    } catch (err) {
        console.error('❌ Error checking/creating database:', err);
        // Don't exit if just sync fails, maybe DB exists and we just can't create it due to perms
        // But if auth fails, next step will also fail.
    } finally {
        await client.end();
    }

    const dbClient = new Client({ ...dbConfig, database: targetDbName });

    try {
        await dbClient.connect();

        const schemaPath = 'files/database-schema.sql';
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📜 Ejecutando esquema SQL...');
        await dbClient.query(schemaSql);
        console.log('✅ Esquema aplicado exitosamente.');

        // Actualizar permisos del usuario administrador para incluir Configuración
        console.log('🔄 Actualizando permisos del administrador...');
        const adminModules = JSON.stringify([
            "Dashboard", "Préstamos", "Equipos", "Empleados", 
            "Usuarios", "Configuración", "Reportes", "Chips", "Categorías", "Centro de Control"
        ]);
        await dbClient.query(`
            UPDATE users 
            SET accessible_modules = $1
            WHERE username = 'admin.pro.001'
        `, [adminModules]);
        console.log('✅ Permisos de administrador actualizados.');

    } catch (err) {
        console.error('❌ Error applying schema:', err);
        process.exit(1);
    } finally {
        await dbClient.end();
    }
}

init();
