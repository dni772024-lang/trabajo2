import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    password: 'Salayer*109',
    host: 'localhost',
    database: 'equipment_control',
    port: 5433,
});

async function checkChips() {
    try {
        const client = await pool.connect();
        console.log('CONNECTED');
        const res = await client.query('SELECT count(*) FROM satellite_chips');
        console.log('COUNT:', res.rows[0].count);
        client.release();
        await pool.end();
    } catch (err) {
        console.error('ERROR:', err);
    }
}

checkChips();
