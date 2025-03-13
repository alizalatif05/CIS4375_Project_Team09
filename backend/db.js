// db.js - MySQL Database Connection

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

// Create a connection pool to the MySQL RDS instance
const pool = mysql.createPool({
    host: process.env.DB_HOST,  // AWS RDS endpoint
    user: process.env.DB_USER,  // MySQL username
    password: process.env.DB_PASSWORD,  // MySQL password
    database: process.env.DB_NAME,  // Target database
    port: 3306, // Default MySQL port
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
