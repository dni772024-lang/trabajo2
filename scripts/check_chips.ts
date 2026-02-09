import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    password: 'Salayer*109',
    host: 'localhost',
    database: 'equipment_control',
    port: 5433, // User specified 5433
});

async function checkChips() {
    try {
        const client = await pool.connect();
        console.log('Connected successfully to DB on port 5433');

        const res = await client.query('SELECT * FROM satellite_chips');
        console.log(`Found ${res.rows.length} chips.`);
        console.table(res.rows);

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

checkChips();
