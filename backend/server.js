// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const apiRoutes = require('./routes/inventory.js')
const authRoutes = require('./routes/auth.js')
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes)


// Password migration function
async function migratePasswords() {
  console.log('Checking for passwords that need migration...');
  try {
    // Get all users with non-hashed passwords
    const [users] = await pool.query(
      'SELECT UserID, Username, UserPassword FROM User WHERE Deleted = "No"'
    );

    let migratedCount = 0;
    for (const user of users) {
      // Skip already hashed passwords
      if (user.UserPassword.startsWith('$2b$') || user.UserPassword.startsWith('$2a$')) {
        continue;
      }

      console.log(`Migrating password for user: ${user.Username}`);
      
      // Hash the plain text password
      const hashedPassword = await bcrypt.hash(user.UserPassword, 10);
      
      // Update the user record with the hashed password
      await pool.query(
        'UPDATE User SET UserPassword = ? WHERE UserID = ?',
        [hashedPassword, user.UserID]
      );
      
      migratedCount++;
    }

    if (migratedCount > 0) {
      console.log(`Successfully migrated ${migratedCount} passwords.`);
    } else {
      console.log('No passwords needed migration.');
    }
  } catch (error) {
    console.error('Error during password migration:', error);
  }
}

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

// Debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Headers:`, req.headers.authorization ? 'Auth header present' : 'No auth header');
  next();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  await migratePasswords();
});