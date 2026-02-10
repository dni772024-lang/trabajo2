import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';
import { storage } from './storage.js';

dotenv.config({ path: '.env' });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root endpoint for status check
app.get('/', (req, res) => {
    res.send('✅ Backend Server is Running! Access the frontend at http://localhost:5173');
});

// Test Endpoint
app.get('/api/health', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json({ status: 'ok', time: result.rows[0].now, db: 'connected' });
    } catch (error: any) {
        console.error('DB Error:', error);
        res.status(500).json({ status: 'error', db: 'disconnected', details: error.message });
    }
});

// ================= API ENDPOINTS =================

// USERS
app.get('/api/users', async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
});

app.post('/api/users', async (req, res) => {
    try {
        await storage.saveUser(req.body);
        res.status(201).json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        await storage.updateUser(req.body);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await storage.deleteUser(req.params.id);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// EQUIPMENT
app.get('/api/equipment', async (req, res) => {
    const data = await storage.getEquipment();
    res.json(data);
});

app.post('/api/equipment', async (req, res) => {
    try {
        await storage.addEquipment(req.body);
        res.status(201).json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/equipment/:id', async (req, res) => {
    try {
        await storage.updateEquipment(req.body);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/equipment/:id', async (req, res) => {
    try {
        await storage.deleteEquipment(req.params.id);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// EMPLOYEES
app.get('/api/employees', async (req, res) => {
    const data = await storage.getEmployees();
    res.json(data);
});

// Employees distribution summary
app.get('/api/employees/distribution', async (req, res) => {
    try {
        const data = await storage.getEmployeesDistribution();
        // Transform to nested structure by department
        const grouped: Record<string, { rank: string; count: number }[]> = {};
        for (const row of data) {
            if (!grouped[row.department]) grouped[row.department] = [];
            grouped[row.department].push({ rank: row.rank, count: row.count });
        }
        res.json({ summary: grouped });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Employees detail by department + rank
app.get('/api/employees/filter', async (req, res) => {
    try {
        const department = String(req.query.department || '');
        const rank = String(req.query.rank || '');
        const data = await storage.getEmployeesByDepartmentAndRank(department, rank);
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        await storage.addEmployee(req.body);
        res.status(201).json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    try {
        await storage.updateEmployee(req.body);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        await storage.deleteEmployee(req.params.id);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// LOANS
app.get('/api/loans', async (req, res) => {
    const data = await storage.getLoans();
    res.json(data);
});

app.post('/api/loans', async (req, res) => {
    try {
        await storage.addLoan(req.body);
        res.status(201).json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/loans/:id', async (req, res) => {
    try {
        const loan = req.body;
        if (loan.id !== req.params.id) {
            return res.status(400).json({ error: 'ID mismatch' });
        }
        await storage.updateLoan(loan);
        res.json({ success: true });
    } catch (e: any) {
        console.error('Error updating loan:', e);
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/loans/:id/return', async (req, res) => {
    try {
        await storage.finalizeReturn(req.params.id, req.body);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// SATELLITE CHIPS
app.get('/api/chips', async (req, res) => {
    const data = await storage.getSatelliteChips();
    res.json(data);
});

app.post('/api/chips', async (req, res) => {
    try {
        await storage.addSatelliteChip(req.body);
        res.status(201).json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/chips/:id', async (req, res) => {
    try {
        await storage.updateSatelliteChip(req.body);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/chips/:id', async (req, res) => {
    try {
        await storage.deleteSatelliteChip(req.params.id);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// CATEGORIES
app.get('/api/categories', async (req, res) => {
    const data = await storage.getCategories();
    res.json(data);
});

// UTILS
app.get('/api/auth/check-username', async (req, res) => {
    const { username, excludeId } = req.query;
    const isAvailable = await storage.isUsernameAvailable(
        username as string,
        excludeId as string | undefined
    );
    res.json({ isAvailable });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('🔍 Login attempt:', { username, passwordLength: password?.length });

        if (!username || !password) {
            console.log('❌ Missing credentials');
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        // Query user from database (case-insensitive username)
        const result = await pool.query(
            'SELECT * FROM users WHERE LOWER(username) = LOWER($1)',
            [username.trim()]
        );

        console.log('📊 Query result:', { found: result.rows.length, username: username.trim() });

        if (result.rows.length === 0) {
            console.log('❌ User not found');
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const user = result.rows[0];
        // DEBUG: Ver qué columnas existen realmente en la base de datos
        console.log('🔍 Objeto usuario completo:', user);

        // Intentar detectar campos con nombres alternativos
        const dbPassword = user.password || user.contrasena || user.clave || user.pass || user.password_hash;
        
        // Determinar si está activo (soporte para is_active boolean o status string)
        let isActive = true;
        if (user.is_active !== undefined) {
            isActive = user.is_active;
        } else {
            const dbStatus = user.status || user.estado || user.estatus || 'Activo';
            isActive = String(dbStatus).toLowerCase() === 'activo' || String(dbStatus).toLowerCase() === 'active';
        }

        console.log('👤 User found:', {
            id: user.id,
            username: user.username,
            isActive: isActive,
            passwordFound: !!dbPassword,
            passwordMatch: dbPassword == password
        });

        // Check if user is active
        if (!isActive) {
            console.log(`❌ User inactive.`);
            return res.status(401).json({ error: 'Usuario inactivo' });
        }

        // Validate password (plain text comparison for now)
        if (!dbPassword || dbPassword != password) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Return user data (without password)
        res.json({
            id: user.id,
            username: user.username,
            name: user.name || user.full_name,
            lastName: user.last_name || '',
            role: user.role,
            status: isActive ? 'Activo' : 'Inactivo',
            accessibleModules: typeof user.accessible_modules === 'string' ? JSON.parse(user.accessible_modules) : (user.accessible_modules || []),
            permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || [])
        });

        console.log(`✅ Login exitoso: ${user.username}`);
    } catch (err: any) {
        console.error('Error en login:', err.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ================= STATISTICS ENDPOINTS =================

// Overview Statistics
app.get('/api/stats/overview', async (req, res) => {
    try {
        const client = await pool.connect();

        // Get counts with safer approach
        let totalEquipment = 0, totalValue = 0, activeLoans = 0, activeEmployees = 0;
        let availableCount = 0, maintenanceCount = 0;

        try {
            const equipmentResult = await client.query('SELECT COUNT(*) as count, COALESCE(SUM(initial_value), 0) as total_value FROM equipment');
            if (equipmentResult.rows[0]) {
                totalEquipment = parseInt(equipmentResult.rows[0].count || 0);
                totalValue = parseFloat(equipmentResult.rows[0].total_value || 0);
            }
        } catch (e) {
            console.warn('Equipment count query failed:', e.message);
        }

        try {
            const loansResult = await client.query('SELECT COUNT(*) as count FROM loans WHERE status = $1', ['active']);
            if (loansResult.rows[0]) activeLoans = parseInt(loansResult.rows[0].count || 0);
        } catch (e) {
            console.warn('Loans count query failed:', e.message);
        }

        try {
            const employeesResult = await client.query("SELECT COUNT(DISTINCT l.solicitante->>'placa') as count FROM loans l WHERE l.status = $1", ['active']);
            if (employeesResult.rows[0]) activeEmployees = parseInt(employeesResult.rows[0].count || 0);
        } catch (e) {
            console.warn('Employees count query failed:', e.message);
        }

        try {
            const availableResult = await client.query('SELECT COUNT(*) as count FROM equipment WHERE status = $1', ['Disponible']);
            if (availableResult.rows[0]) availableCount = parseInt(availableResult.rows[0].count || 0);
        } catch (e) {
            console.warn('Available equipment query failed:', e.message);
        }

        try {
            const maintenanceResult = await client.query('SELECT COUNT(*) as count FROM equipment WHERE status = $1', ['Mantenimiento']);
            if (maintenanceResult.rows[0]) maintenanceCount = parseInt(maintenanceResult.rows[0].count || 0);
        } catch (e) {
            console.warn('Maintenance equipment query failed:', e.message);
        }

        let lastWeek = 0, prevWeek = 0;
        try {
            const lastWeekResult = await client.query('SELECT COUNT(*) as count FROM loans WHERE loan_date >= NOW() - INTERVAL \'7 days\'');
            if (lastWeekResult.rows[0]) lastWeek = parseInt(lastWeekResult.rows[0].count || 0);
        } catch (e) {
            console.warn('Last week query failed:', e.message);
        }

        try {
            const prevWeekResult = await client.query('SELECT COUNT(*) as count FROM loans WHERE loan_date >= NOW() - INTERVAL \'14 days\' AND loan_date < NOW() - INTERVAL \'7 days\'');
            if (prevWeekResult.rows[0]) prevWeek = parseInt(prevWeekResult.rows[0].count || 0);
        } catch (e) {
            console.warn('Previous week query failed:', e.message);
        }

        const loansChangePercent = prevWeek > 0 ? ((lastWeek - prevWeek) / prevWeek * 100) : 0;
        const utilizationRate = totalEquipment > 0 ? (activeLoans / totalEquipment * 100) : 0;
        const availablePercent = totalEquipment > 0 ? (availableCount / totalEquipment * 100) : 0;

        client.release();

        res.json({
            totalEquipment,
            totalValue,
            activeLoans,
            loansChangePercent: Math.round(loansChangePercent * 10) / 10,
            activeEmployees,
            utilizationRate: Math.round(utilizationRate * 10) / 10,
            availableCount,
            availablePercent: Math.round(availablePercent * 10) / 10,
            maintenanceCount
        });
    } catch (e: any) {
        console.error('Stats overview error:', e);
        // Return default stats if all queries fail
        res.json({
            totalEquipment: 0,
            totalValue: 0,
            activeLoans: 0,
            loansChangePercent: 0,
            activeEmployees: 0,
            utilizationRate: 0,
            availableCount: 0,
            availablePercent: 0,
            maintenanceCount: 0
        });
    }
});

// Loans by Month (last 6 months)
app.get('/api/stats/loans-by-month', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    TO_CHAR(loan_date, 'Mon YYYY') as month,
                    COUNT(*) as count
                FROM loans
                WHERE loan_date >= NOW() - INTERVAL '6 months'
                GROUP BY TO_CHAR(loan_date, 'Mon YYYY'), DATE_TRUNC('month', loan_date)
                ORDER BY DATE_TRUNC('month', loan_date) ASC
            `);
            client.release();
            res.json(result.rows || []);
        } catch (queryErr: any) {
            client.release();
            console.warn('Loans by month query failed:', queryErr.message);
            res.json([]);
        }
    } catch (e: any) {
        console.error('Loans by month error:', e);
        res.json([]);
    }
});

// Equipment by Category
app.get('/api/stats/equipment-by-category', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    category,
                    COUNT(*) as count
                FROM equipment
                GROUP BY category
                ORDER BY count DESC
            `);

            const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
            const data = result.rows.map(row => ({
                category: row.category,
                count: parseInt(row.count),
                percentage: total > 0 ? Math.round((parseInt(row.count) / total * 100) * 10) / 10 : 0
            }));

            client.release();
            res.json(data);
        } catch (queryErr: any) {
            client.release();
            console.warn('Equipment by category query failed:', queryErr.message);
            res.json([]);
        }
    } catch (e: any) {
        console.error('Equipment by category error:', e);
        res.json([]);
    }
});

// Top 5 Equipment (most loaned)
app.get('/api/stats/top-equipment', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    e.id,
                    e.brand || ' ' || e.model as name,
                    e.category,
                    COUNT(li.id) as loan_count
                FROM equipment e
                LEFT JOIN loan_items li ON e.id = li.equipment_id
                GROUP BY e.id, e.brand, e.model, e.category
                ORDER BY loan_count DESC
                LIMIT 5
            `);

            const data = result.rows.map(row => ({
                id: row.id,
                name: row.name,
                category: row.category,
                loanCount: parseInt(row.loan_count)
            }));

            client.release();
            res.json(data);
        } catch (queryErr: any) {
            client.release();
            console.warn('Top equipment query failed:', queryErr.message);
            res.json([]);
        }
    } catch (e: any) {
        console.error('Top equipment error:', e);
        res.json([]);
    }
});

// Top 5 Employees (most active loans)
app.get('/api/stats/top-employees', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    COUNT(DISTINCT l.solicitante->>'placa') as active_loans,
                    MAX(emp.id) as id,
                    MAX(emp.name || ' ' || emp.last_name) as name,
                    MAX(emp.department) as department
                FROM loans l
                LEFT JOIN employees emp ON l.solicitante->>'placa' = emp.badge_number
                WHERE l.status = 'active'
                GROUP BY l.solicitante->>'placa'
                ORDER BY active_loans DESC
                LIMIT 5
            `);

            const data = result.rows.map(row => ({
                id: row.id,
                name: row.name,
                department: row.department,
                activeLoans: parseInt(row.active_loans)
            }));

            client.release();
            res.json(data);
        } catch (queryErr: any) {
            client.release();
            console.warn('Top employees query failed:', queryErr.message);
            res.json([]);
        }
    } catch (e: any) {
        console.error('Top employees error:', e);
        res.json([]);
    }
});

// Alerts (maintenance due, overdue loans)
app.get('/api/stats/alerts', async (req, res) => {
    try {
        const client = await pool.connect();

        let maintenanceResult = { rows: [] }, overdueResult = { rows: [] }, damagedResult = { rows: [] };

        try {
            maintenanceResult = await client.query(`
                SELECT 
                    id,
                    brand || ' ' || model as name,
                    category
                FROM equipment
                WHERE status != 'Retirado' 
                AND condition IN ('Malo', 'Regular')
                LIMIT 10
            `);
        } catch (e) {
            console.warn('Maintenance query failed:', e.message);
        }

        try {
            overdueResult = await client.query(`
                SELECT 
                    l.id,
                    COALESCE(emp.name || ' ' || emp.last_name, l.solicitante->>'nombre') as employee_name,
                    l.loan_date,
                    EXTRACT(DAY FROM (NOW() - l.loan_date)) as days_active
                FROM loans l
                LEFT JOIN employees emp ON l.solicitante->>'placa' = emp.badge_number
                WHERE l.status = 'active'
                AND EXTRACT(DAY FROM (NOW() - l.loan_date)) > 25
                ORDER BY days_active DESC
                LIMIT 10
            `);
        } catch (e) {
            console.warn('Overdue loans query failed:', e.message);
        }

        try {
            damagedResult = await client.query(`
                SELECT 
                    id,
                    brand || ' ' || model as name,
                    category
                FROM equipment
                WHERE status = 'Dañado'
                LIMIT 10
            `);
        } catch (e) {
            console.warn('Damaged equipment query failed:', e.message);
        }

        client.release();

        res.json({
            maintenanceDue: maintenanceResult.rows.map(row => ({
                id: row.id,
                name: row.name,
                category: row.category
            })),
            overdueLoans: overdueResult.rows.map(row => ({
                id: row.id,
                employeeName: row.employee_name,
                loanDate: row.loan_date,
                daysActive: parseInt(row.days_active)
            })),
            damagedEquipment: damagedResult.rows.map(row => ({
                id: row.id,
                name: row.name,
                category: row.category
            }))
        });
    } catch (e: any) {
        console.error('Alerts error:', e);
        res.json({
            maintenanceDue: [],
            overdueLoans: [],
            damagedEquipment: []
        });
    }
});


// Verificar conexión a Base de Datos al iniciar
pool.connect()
    .then(client => {
        console.log('✅ Conexión a Base de Datos establecida correctamente');
        client.release();
    })
    .catch(err => {
        console.error('❌ Error fatal: No se pudo conectar a la Base de Datos.', err.message);
        console.error('   Verifica que PostgreSQL esté corriendo y las credenciales en .env sean correctas.');
    });

// Iniciar servidor
const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`   Frontend: http://localhost:5173`);
    console.log(`   Health Check: http://localhost:${port}/api/health`);
});

// Mantener el servidor activo
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT recibido, cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
    });
});
