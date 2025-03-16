// db.js - MySQL Database Connection

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

// Create a connection pool to the MySQL RDS instance
const pool = mysql.createPool({
  host: 'database-2.cj442ogn3woj.us-east-1.rds.amazonaws.com',
  user: 'admin',
  port: 3306,
  password: 'Password123!',
  database: 'MilitiaProtection',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to AWS RDS MySQL database.');
        connection.release(); // Release the connection back to the pool
    }
});

module.exports = pool; // Export the connection pool
