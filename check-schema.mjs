import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'equipment_control',
    password: 'Salayer*109',
    port: 5433
});

async function getSchema() {
    const tables = ['equipment', 'loans', 'employees'];

    for (const table of tables) {
        console.log(`\n=== ${table.toUpperCase()} TABLE ===`);
        const res = await pool.query(
            `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = $1 
       ORDER BY ordinal_position`,
            [table]
        );
        res.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
    }

    await pool.end();
}

getSchema().catch(console.error);
