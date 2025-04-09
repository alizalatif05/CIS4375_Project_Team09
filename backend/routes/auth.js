// routes/auth.js - Updated with password hashing
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt'); // Add bcrypt
const pool = require('../db');
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

dotenv.config();
const router = express.Router();
const SALT_ROUNDS = 10; // Standard salt rounds for bcrypt

// Admin route to add new users 
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

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user with hashed password
        const [result] = await pool.query(
            'INSERT INTO user (Username, UserPassword, UserType, Deleted) VALUES (?, ?, ?, "No")', 
            [username, hashedPassword, userType || 'User']
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

        // Check if admin user exists
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const user = users[0];
        
        // Compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(password, user.UserPassword);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Generate JWT token for admin
        const token = jwt.sign(
            { 
                userId: user.UserID,
                username: user.Username, 
                isAdmin: true
            }, 
            process.env.JWT_SECRET || 'supersecretkey', 
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

        // Check if user exists
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        
        // Compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(password, user.UserPassword);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.UserID,
                username: user.Username, 
                isAdmin: user.UserType === 'Admin'
            }, 
            process.env.JWT_SECRET || 'supersecretkey', 
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

// Other routes remain the same
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

router.get('/protected', authenticateUser, (req, res) => {
    res.json({ message: 'Protected route accessed', user: req.user });
});

router.get('/admin', authenticateUser, authorizeAdmin, (req, res) => {
    res.json({ message: 'Admin route accessed', user: req.user });
});

module.exports = router;