// db.js - MySQL Database Connection
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Async function to test the database connection
async function testConnection() {
    try {
        // Attempt to get a connection from the pool
        const connection = await pool.getConnection();
        console.log('Successfully connected to MySQL database.');
        
        // Release the connection back to the pool
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}

// Call the connection test
testConnection();

module.exports = pool;