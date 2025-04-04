// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const apiRoutes = require('./routes/inventory.js')
const authRoutes = require('./routes/auth.js')

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes)

// Create connection pool (this is not being loaded, consider changing)
const pool = mysql.createPool({
  host: 'database-2.cj442ogn3woj.us-east-1.rds.amazonaws.com',
  user: 'admin',
  port: 3306,
  password: 'Password123!',
  database: 'MilitiaProtection'
});

// Health check endpoint
app.get('/api/status', async (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get users endpoint
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM User');
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});