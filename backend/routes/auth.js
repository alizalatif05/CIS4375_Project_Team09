// routes/auth.js

// Import required modules
const express = require('express'); // Express framework for handling routes
const jwt = require('jsonwebtoken'); // JSON Web Token library for authentication
// const bcrypt = require('bcryptjs'); // Library for hashing passwords securely
const dotenv = require('dotenv'); // Environment variable management
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware'); // Middleware for token validation

dotenv.config(); // Load environment variables from .env file

const router = express.Router(); // Create an Express router

// Temporary mock user data (to be replaced with database connection later)
const users = [
    { username: 'admin', password: 'admin123', isAdmin: true }, // Placeholder admin
    { username: 'user', password: 'user123', isAdmin: false } // Placeholder non-admin
];

/**
 * Register a new user
 *
 * This route allows a user to register with a username, password, and role (admin or non-admin).
 * The password is hashed before storing to ensure security.
 * @route POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    const { username, password, isAdmin } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' }); // Validate input
    }

    const existingUser = users.find(us => u.username === username);
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists'});
    }

    users.push({ username, password, isAdmin: isAdmin || false});
    res.status(201).json({ message: 'User registered successfully'});
});

/**
 * Login user
 *
 * This route allows an existing user to log in with a username and password.
 * If valid, a JWT token is generated and returned for authentication.
 * @route POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (!user || password !== user.password) {
        return res.status(401).json({ message: 'Invalid credentials' }); // Validate password
    }

    // Generate JWT token with user role (admin or non-admin)
    const token = jwt.sign({ username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, isAdmin: user.isAdmin }); // Return token and role to client
});

/**
 * Protected Route Example
 *
 * This route requires a valid JWT token to access.
 * If authenticated, it returns user information.
 * @route GET /api/auth/protected
 */
router.get('/protected', authenticateUser, (req, res) => {
    res.json({ message: 'Protected route accessed', user: req.user }); // Return user data
});

/**
 * Admin-Only Route Example
 *
 * This route is restricted to users with the admin role.
 * @route GET /api/auth/admin
 */
router.get('/admin', authenticateUser, authorizeAdmin, (req, res) => {
    res.json({ message: 'Admin route accessed', user: req.user });
});

module.exports = router; // Export the router

