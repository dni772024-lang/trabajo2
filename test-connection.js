import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
};

const client = new Client(config);

console.log('Attempting to connect with:');
console.log(`User: ${config.user}`);
console.log(`Host: ${config.host}:${config.port}`);
console.log(`Database: ${config.database}`);

client.connect()
    .then(() => {
        console.log('✅ Connected successfully!');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log('Time from DB:', res.rows[0].now);
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection error:', err.message);
        if (err.code) console.error('Code:', err.code);
        process.exit(1);
    });
