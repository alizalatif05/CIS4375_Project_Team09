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

/**
 * PUT /api/inventory/:id - Update an existing inventory item
 */
router.put('/inventory/:id', authenticateUser, (req, res) => {
    const inventoryId = req.params.id; // Extract inventory ID from URL
    const { name, quantity, location, category } = req.body; // Extract update data

    // Basic input validation (ensure all required fields are present)
    if (!name || !quantity || !location || !category) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // SQL query to update the inventory item
    const updateQuery = `
        UPDATE Inventory
        SET name = ?, quantity = ?, location = ?, category = ?
        WHERE inventory_id = ?;
    `;

    // Execute the update query
    pool.query(updateQuery, [name, quantity, location, category, inventoryId], (err, result) => {
        if (err) {
            console.error('Database update error:', err);
            return res.status(500).json({ message: 'Database query error' });
        }

        // Check if any rows were affected (i.e., if the item exists)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        return res.status(200).json({ message: 'Inventory item updated successfully' });
    });
});


/**
 * PUT /api/customers/:id - Update an existing customer record (supports partial updates)
 */
router.put('/customers/:id', authenticateUser, (req, res) => {
    const customerId = req.params.id;
    const updates = req.body; // Extract the fields the user wants to update

    // If no fields are provided, return an error
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'At least one field is required for an update' });
    }

    // Build the dynamic SQL query
    let query = 'UPDATE Customer SET ';
    const values = [];

    // Loop through the request body and construct the query dynamically
    Object.keys(updates).forEach((key, index) => {
        query += `${key} = ?`;
        if (index < Object.keys(updates).length - 1) query += ', '; // Add a comma between fields
        values.push(updates[key]);
    });

    query += ' WHERE CustomerID = ?;';
    values.push(customerId); // Append the customer ID for the WHERE clause

    // Execute the update query
    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Database update error:', err);
            return res.status(500).json({ message: 'Database query error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        return res.status(200).json({ message: 'Customer updated successfully' });
    });
});
