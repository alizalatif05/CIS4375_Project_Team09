// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('../db'); // Make sure this is imported correctly
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

dotenv.config();

const router = express.Router();

// Admin route to add new users - Replaces the old /register endpoint
router.post('/add-user', authenticateUser, authorizeAdmin, async (req, res) => {
    const { username, password, userType } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM user WHERE Username = ?', 
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Insert new user into the database (only admins can access this endpoint)
        const [result] = await pool.query(
            'INSERT INTO user (Username, UserPassword, UserType, Deleted) VALUES (?, ?, ?, "No")', 
            [username, password, userType || 'User']
        );

        res.status(201).json({ 
            message: 'User added successfully',
            userId: result.insertId 
        });
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ message: 'Server error while adding user' });
    }
});

// Admin-specific login endpoint
router.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user in the database with admin check
        const [users] = await pool.query(
            'SELECT * FROM user WHERE Username = ? AND UserType = "Admin" AND Deleted = "No"', 
            [username]
        );

        // Check if admin user exists and password matches
        if (users.length === 0 || password !== users[0].UserPassword) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const user = users[0];

        // Generate JWT token for admin
        const token = jwt.sign(
            { 
                userId: user.UserID,
                username: user.Username, 
                isAdmin: true  // Explicitly set isAdmin to true
            }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '8h' }
        );

        // Return token and admin user info
        res.json({ 
            token, 
            isAdmin: true,
            user: {
                UserID: user.UserID,
                Username: user.Username,
                UserType: user.UserType
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during admin login' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user in the database
        const [users] = await pool.query(
            'SELECT * FROM user WHERE Username = ? AND Deleted = "No"', 
            [username]
        );

        // Check if user exists and password matches
        if (users.length === 0 || password !== users[0].UserPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.UserID,
                username: user.Username, 
                isAdmin: user.UserType === 'Admin'
            }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '8h' }
        );

        // Return token and user info
        res.json({ 
            token, 
            isAdmin: user.UserType === 'Admin',
            user: {
                UserID: user.UserID,
                Username: user.Username,
                UserType: user.UserType
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get Users route
router.get('/user', authenticateUser, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM User');
        res.json(results);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Database query error' });
    }
});

router.get('/user/:id', authenticateUser, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM User WHERE UserID = ?', [req.params.id]);
        res.json(results[0] || {});
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Database query error' });
    }
});

// Protected route example
router.get('/protected', authenticateUser, (req, res) => {
    res.json({ message: 'Protected route accessed', user: req.user });
});

// Admin-only route example
router.get('/admin', authenticateUser, authorizeAdmin, (req, res) => {
    res.json({ message: 'Admin route accessed', user: req.user });
});

module.exports = router;