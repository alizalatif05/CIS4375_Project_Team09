// routes/inventory.js

const express = require('express'); 
const pool = require('../db'); 
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router(); 

/** 
 *  INVENTORY ROUTES
 */

/**
 * GET /api/inventory - Retrieve all inventory items
 */
router.get('/inventory', authenticateUser, (req, res) => {
    const { search } = req.query;
    let query = `
        SELECT SKU_Number, ItemName, Item_Desc, Item_Quantity 
        FROM Inventory
        WHERE Deleted = 'No'
    `;

    const values = [];

    if (search) {
        query += " AND (SKU_Number LIKE ? OR ItemName LIKE ?)";
        values.push(`%${search}%`, `%${search}%`);
    }

    pool.query(query, values, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

/**
 * GET /api/inventory/:sku - Retrieve a single inventory item by SKU
 */
router.get('/inventory/:sku', authenticateUser, (req, res) => {
    const query = `
        SELECT SKU_Number, ItemName, Item_Desc, Item_Quantity 
        FROM Inventory 
        WHERE SKU_Number = ? AND Deleted = 'No';
    `;
    pool.query(query, [req.params.sku], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results[0] || {});
    });
});

/** 
 *  CUSTOMER ROUTES
 */

router.get('/customers', authenticateUser, (req, res) => {
    const { search } = req.query;
    let query = `
        SELECT CustomerID, Customer_fName AS firstName, Customer_lName AS lastName, 
               CustomerAddress AS address, CustomerPhone AS phone 
        FROM Customer
        WHERE Deleted = 'No'
    `;

    const values = [];

    if (search) {
        query += " AND (CustomerID LIKE ? OR Customer_fName LIKE ? OR Customer_lName LIKE ?)";
        values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    pool.query(query, values, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

/**
 *  TECHNICIAN ROUTES
  */

router.get('/technicians', authenticateUser, (req, res) => {
    const { search } = req.query;
    let query = `
        SELECT TechID, UserID, Tech_fName AS firstName, Tech_lName AS lastName 
        FROM Technician
        WHERE Deleted = 'No'
    `;

    const values = [];

    if (search) {
        query += " AND (TechID LIKE ? OR Tech_fName LIKE ? OR Tech_lName LIKE ?)";
        values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    pool.query(query, values, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});


/**
 * GET /api/techinventory - Retrieve all technician inventory items
 */
router.get('/techinventory', authenticateUser, (req, res) => {
    const query = `
        SELECT TechInventory.SKU_Number, TechInventory.TechID, 
               Inventory.ItemName, Inventory.Item_Desc 
        FROM TechInventory
        JOIN Inventory ON TechInventory.SKU_Number = Inventory.SKU_Number
        WHERE TechInventory.Deleted = 'No';
    `;
    
    pool.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

/** 
 *  ORDER ROUTES
 */

router.get('/orders', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM `Order` WHERE Deleted = "No"', (err, results) => {
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

/**
 * GET /api/orderitems - Retrieve all order items
 */
router.get('/orderitems', authenticateUser, (req, res) => {
    const query = `
        SELECT OrderItems.SKU_Number, OrderItems.OrderID, 
               Inventory.ItemName, Inventory.Item_Desc 
        FROM OrderItems
        JOIN Inventory ON OrderItems.SKU_Number = Inventory.SKU_Number
        WHERE OrderItems.Deleted = 'No';
    `;

    pool.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

/**
 * ADMIN ROUTES
 **/

/**
 * GET /api/admins - Retrieve all admin users
 */
router.get('/admins', authenticateUser, authorizeAdmin, (req, res) => {
    const query = `
        SELECT AdminID, UserID, Admin_fName AS firstName, Admin_lName AS lastName 
        FROM Admin;
    `;

    pool.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});


/** 
 *  SALES REPRESENTATIVE ROUTES
 */

router.get('/sales_reps', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM SalesRep', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

router.get('/sales_reps/:id', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM SalesRep WHERE SalesRepID = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results[0] || {});
    });
});

/** 
 *  USER ROUTES
 */

router.get('/users', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM User', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

router.get('/users/:id', authenticateUser, (req, res) => {
    pool.query('SELECT * FROM User WHERE UserID = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results[0] || {});
    });
});

router.post ('/users', authenticateUser, authorizeAdmin, (req, res) => {
    const { User_fName, User_lName, Username, UserPassword, User_Type }  = req.body;
    
    if (!User_fName || !User_lName || !Username || !UserPassword) {
        return res.status(400).json ({ message: 'Missing required fields'});
    }

    const user = {
        User_fName,
        User_lName,
        Username,
        UserPassword,
        User_Type: User_Type || 'admin',
        Deleted: 'no'


    };

    pool.query ('INSERT INTO User SET ?', user, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error with database', error:err.message});
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
        WHERE SKU_Number = ?;
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


/**
 * PUT APIs PUT /api/orders/:id - Update an existing order 
 */
router.put('/orders/:id', authenticateUser, (req, res) => {
    const orderId = req.params.id;
    const { customerID, techID, salesRepID } = req.body;

    if (!customerID || !techID || !salesRepID) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        UPDATE \`Order\`
        SET CustomerID = ?, TechID = ?, SalesRepID = ?
        WHERE OrderID = ?;
    `;

    pool.query(query, [customerID, techID, salesRepID, orderId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order updated successfully' });
    });
});

/**
 * PUT /api/users/:id - Update a user's information
 */
router.put('/users/:id', authenticateUser, (req, res) => {
    const userId = req.params.id;
    const { User_fName, User_lName, Username, UserPassword, UserType } = req.body;

    if (!User_fName || !User_lName || !Username || !UserPassword || !UserType) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        UPDATE User
        SET User_fName = ?, User_lName = ?, Username = ?, UserPassword = ?, UserType = ?
        WHERE UserID = ?;
    `;

    pool.query(query, [User_fName, User_lName, Username, UserPassword, UserType, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully' });
    });
});

/**
 * PUT /api/technicians/:id - Update a technician
 */
router.put('/technicians/:id', authenticateUser, (req, res) => {
    const techId = req.params.id;
    const { Tech_fName, Tech_lName, UserID } = req.body;

    if (!Tech_fName || !Tech_lName) {
        return res.status(400).json({ message: 'First and last name are required' });
    }

    const query = `
        UPDATE Technician
        SET Tech_fName = ?, Tech_lName = ?, UserID = ?
        WHERE TechID = ?;
    `;

    pool.query(query, [Tech_fName, Tech_lName, UserID || null, techId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        res.json({ message: 'Technician updated successfully' });
    });
});

/** 
 *POST APIs (Creating New Records)
*/
router.post('/inventory', authenticateUser, (req, res) => {
    const { itemName, itemDesc, itemQuantity } = req.body;

    if (!itemName || !itemQuantity) {
        return res.status(400).json({ message: 'Item name and quantity are required' });
    }

    const query = `
        INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity) 
        VALUES (?, ?, ?);
    `;

    pool.query(query, [itemName, itemDesc || '', itemQuantity], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.status(201).json({ message: 'Inventory item added successfully', id: result.insertId });
    });
});

/**
 * POST /api/customers - Add a new customer
 */
router.post('/customers', authenticateUser, (req, res) => {
    const { firstName, lastName, address, phone } = req.body;

    if (!firstName || !lastName || !address || !phone) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        INSERT INTO Customer (Customer_fName, Customer_lName, CustomerAddress, CustomerPhone)
        VALUES (?, ?, ?, ?);
    `;

    pool.query(query, [firstName, lastName, address, phone], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.status(201).json({ message: 'Customer added successfully', id: result.insertId });
    });
});

/**
 * POST /api/technicians - Add a new technician
 */
router.post('/technicians', authenticateUser, (req, res) => {
    const { firstName, lastName, userID } = req.body;

    if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First and last name are required' });
    }

    const query = `
        INSERT INTO Technician (Tech_fName, Tech_lName, UserID)
        VALUES (?, ?, ?);
    `;

    pool.query(query, [firstName, lastName, userID || null], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.status(201).json({ message: 'Technician added successfully', id: result.insertId });
    });
});

/**
 * POST /api/sales_reps - Add a new sales rep
 */
router.post('/sales_reps', authenticateUser, (req, res) => {
    const { firstName, lastName, userID } = req.body;

    if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First and last name are required' });
    }

    const query = `
        INSERT INTO SalesRep (SalesRep_fName, SalesRep_lName, UserID)
        VALUES (?, ?, ?);
    `;

    pool.query(query, [firstName, lastName, userID || null], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.status(201).json({ message: 'Sales Rep added successfully', id: result.insertId });
    });
});


/**
 * POST /api/orders - Create a new order
 */
router.post('/orders', authenticateUser, (req, res) => {
    const { customerID, techID, salesRepID } = req.body;

    if (!customerID || !techID || !salesRepID) {
        return res.status(400).json({ message: 'Customer ID, Technician ID, and Sales Rep ID are required' });
    }

    const query = `
        INSERT INTO \`Order\` (CustomerID, TechID, SalesRepID)
        VALUES (?, ?, ?);
    `;

    pool.query(query, [customerID, techID, salesRepID], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.status(201).json({ message: 'Order created successfully', id: result.insertId });
    });
});

/**
 * POST /api/orderitems - Add items to an order
 */
router.post('/orderitems', authenticateUser, (req, res) => {
    const { skuNumber, orderID } = req.body;

    if (!skuNumber || !orderID) {
        return res.status(400).json({ message: 'SKU Number and Order ID are required' });
    }

    const query = `
        INSERT INTO OrderItems (SKU_Number, OrderID)
        VALUES (?, ?);
    `;

    pool.query(query, [skuNumber, orderID], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.status(201).json({ message: 'Order item added successfully' });
    });
});

/**
 * DELETE API (soft delete)
 */
router.delete('/inventory/:id', authenticateUser, (req, res) => {
    const inventoryId = req.params.id;

    const query = `
        UPDATE Inventory SET Deleted = 'Yes' WHERE SKU_Number = ?;
    `;

    pool.query(query, [inventoryId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json({ message: 'Inventory item soft deleted' });
    });
});




/**
 * GET /api/order/:id/details - retrieving full order details
 */
router.get('/orders/:id/details', authenticateUser, (req, res) => {
    const query = `
        SELECT o.OrderID, c.Customer_fName AS CustomerName, t.Tech_fName AS TechnicianName,
               sr.SalesRep_fName AS SalesRepName, i.ItemName
        FROM \`Order\` o
        JOIN Customer c ON o.CustomerID = c.CustomerID
        JOIN Technician t ON o.TechID = t.TechID
        JOIN SalesRep sr ON o.SalesRepID = sr.SalesRepID
        JOIN OrderItems oi ON o.OrderID = oi.OrderID
        JOIN Inventory i ON oi.SKU_Number = i.SKU_Number
        WHERE o.OrderID = ?;
    `;

    pool.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

module.exports = router;