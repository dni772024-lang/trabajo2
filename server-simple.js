import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Simple middleware
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  console.log('GET / called');
  res.send('Hello from root');
});

app.get('/test', (req, res) => {
  console.log('GET /test called');
  res.json({ status: 'ok', endpoint: '/test' });
});

app.get('/api/health', (req, res) => {
  console.log('GET /api/health called');
  res.json({ status: 'ok', message: 'Health check' });
});

app.get('/api/users', (req, res) => {
  console.log('GET /api/users called');
  res.json([{ id: 1, username: 'Admin' }]);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple test server running on port ${PORT}`);
});
