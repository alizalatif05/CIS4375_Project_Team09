// routes/inventory.js

const express = require('express'); 
const pool = require('../db'); 
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router(); 

/** ================================
 * 🚀 INVENTORY ROUTES
 * ================================ */

/**
 * GET /api/inventory - Retrieve all inventory items
 */
router.get('/inventory', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Inventory', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

/**
 * GET /api/inventory/:sku - Retrieve a single inventory item by SKU
 */
router.get('/inventory/:sku', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Inventory WHERE SKU_Number = ?', [req.params.sku], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results[0] || {});
    });
});

/** ================================
 * 👤 CUSTOMER ROUTES
 * ================================ */

router.get('/customers', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Customer', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

router.get('/customers/:id', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Customer WHERE CustomerID = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results[0] || {});
    });
});

/** ================================
 * 🏗️ TECHNICIAN ROUTES
 * ================================ */

router.get('/technicians', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Technician', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

router.get('/technicians/:id', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Technician WHERE TechID = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results[0] || {});
    });
});

/** ================================
 * 📦 ORDER ROUTES
 * ================================ */

router.get('/orders', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Orders', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

router.get('/orders/:id', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Orders WHERE OrderID = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results[0] || {});
    });
});

/** ================================
 * 👨‍💼 SALES REPRESENTATIVE ROUTES
 * ================================ */

router.get('/sales_reps', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Sales_Rep', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

router.get('/sales_reps/:id', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Sales_Rep WHERE SalesRepID = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results[0] || {});
    });
});

/** ================================
 * 🔐 USER ROUTES
 * ================================ */

router.get('/users', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Users', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

router.get('/users/:id', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM Users WHERE UserID = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results[0] || {});
    });
});

module.exports = router; 
