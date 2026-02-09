import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env') });

// Inicializar pool de PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

// Manejo de errores del pool
pool.on('error', (err) => {
    console.error('❌ Error del pool PostgreSQL:', err.message);
});

pool.on('connect', () => {
    console.log('✅ Pool conectado a PostgreSQL');
});

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('✅ Backend Server is Running! Access the frontend at http://localhost:5173');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Backend is running',
        database: 'connected'
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Backend API is working' });
});

// ===== API ENDPOINTS =====

// GET /api/users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                username, 
                full_name as "fullName",
                password_hash as "password",
                role,
                is_active as "isActive",
                created_at as "createdAt"
            FROM users
            ORDER BY created_at DESC
        `);
        console.log(`✅ Retornando ${result.rows.length} usuarios`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error en GET /api/users:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/users
app.post('/api/users', async (req, res) => {
    try {
        const { username, full_name, password_hash, role } = req.body;
        const result = await pool.query(
            `INSERT INTO users (username, full_name, password_hash, role, is_active) 
             VALUES ($1, $2, $3, $4, true) RETURNING id, username, role`,
            [username, full_name, password_hash, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error en POST /api/users:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/employees
app.get('/api/employees', async (req, res) => {
    try {
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/equipment
app.get('/api/equipment', async (req, res) => {
    try {
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/loans
app.get('/api/loans', async (req, res) => {
    try {
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/categories
app.get('/api/categories', async (req, res) => {
    try {
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/chips
app.get('/api/chips', async (req, res) => {
    try {
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/check-username
app.get('/api/auth/check-username', async (req, res) => {
    try {
        const { username } = req.query;
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE LOWER(username) = LOWER($1)',
            [username]
        );
        res.json({ available: result.rows[0].count === 0 });
    } catch (err) {
        console.error('Error en check-username:', err.message);
        res.status(500).json({ error: err.message });
    }
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
            'SELECT id, username, password_hash, full_name, role, is_active FROM users WHERE LOWER(username) = LOWER($1)',
            [username.trim()]
        );

        console.log('📊 Query result:', { found: result.rows.length, username: username.trim() });

        if (result.rows.length === 0) {
            console.log('❌ User not found');
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const user = result.rows[0];
        console.log('👤 User found:', {
            id: user.id,
            username: user.username,
            isActive: user.is_active,
            passwordHashLength: user.password_hash?.length,
            passwordHash: user.password_hash,
            providedPassword: password,
            passwordsMatch: user.password_hash === password
        });

        // Check if user is active
        if (!user.is_active) {
            console.log('❌ User inactive');
            return res.status(401).json({ error: 'Usuario inactivo' });
        }

        // Validate password (plain text comparison for now)
        if (user.password_hash !== password) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Return user data (without password)
        res.json({
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            role: user.role,
            isActive: user.is_active
        });

        console.log(`✅ Login exitoso: ${user.username}`);
    } catch (err) {
        console.error('Error en login:', err.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Fallback
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada', path: req.path });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`   Frontend: http://localhost:5173`);
    console.log(`   Users: http://localhost:${port}/api/users`);
    console.log(`   Health: http://localhost:${port}/api/health`);
    console.log(`   Press Ctrl+C to stop`);
});

server.keepAliveTimeout = 60000;
server.headersTimeout = 65000;

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n⚠️ SIGTERM received, shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n⚠️ SIGINT received, shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.stdin.resume();
