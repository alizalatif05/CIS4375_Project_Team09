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
    pool.query('SELECT * FROM `Order` WHERE OrderID = ?', [req.params.id], (err, results) => {
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
    pool.query('SELECT * FROM SalesRep WHERE Deleted = "No"', (err, results) => {
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

router.post('/users', authenticateUser, authorizeAdmin, (req, res) => {
    const { User_fName, User_lName, Username, UserPassword, UserType } = req.body;

    if (!User_fName || !User_lName || !Username || !UserPassword || !UserType) {
        return res.status(400).json({ message: 'Missing required fields'});
    }

    const user = {
        User_fName,
        User_lName,
        Username,
        UserPassword,
        UserType,
        Deleted: 'no'
    };

    pool.query('INSERT INTO User SET ?', user, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error with database', error: err.message });
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    });
});

/**
 * PUT /api/inventory/:id - Update an existing inventory item
 */
router.put('/inventory/:id', authenticateUser, (req, res) => {
    const inventoryId = req.params.id;
    const { name, quantity, itemDesc } = req.body;

    // Update validation to only require fields you actually need
    if (!name || !quantity) {
        return res.status(400).json({ message: 'Name and quantity are required' });
    }

    const updateQuery = `
        UPDATE Inventory
        SET ItemName = ?, Item_Quantity = ?, Item_Desc = ?
        WHERE SKU_Number = ?;
    `;

    pool.query(updateQuery,
        [name, quantity, itemDesc || '', inventoryId], // Make sure to include itemDesc in the query
        (err, result) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).json({ message: 'Database query error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Inventory item not found' });
            }

            return res.status(200).json({ message: 'Inventory item updated successfully' });
        }
    );
});

/**
 * PUT /api/customers/:id - Update an existing customer record (supports partial updates)
 */
router.put('/customers/:id', authenticateUser, (req, res) => {
    const customerId = req.params.id;
    const updates = req.body;

    // Accept either naming convention
    const fieldsToUpdate = {};

    if (updates.firstName || updates.Customer_fName) {
        fieldsToUpdate.Customer_fName = updates.firstName || updates.Customer_fName;
    }
    if (updates.lastName || updates.Customer_lName) {
        fieldsToUpdate.Customer_lName = updates.lastName || updates.Customer_lName;
    }
    if (updates.address || updates.CustomerAddress) {
        fieldsToUpdate.CustomerAddress = updates.address || updates.CustomerAddress;
    }
    if (updates.phone || updates.CustomerPhone) {
        fieldsToUpdate.CustomerPhone = updates.phone || updates.CustomerPhone;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: 'At least one field is required for an update' });
    }

    let query = 'UPDATE Customer SET ';
    const values = [];

    Object.keys(fieldsToUpdate).forEach((key, index) => {
        query += `${key} = ?`;
        if (index < Object.keys(fieldsToUpdate).length - 1) query += ', ';
        values.push(fieldsToUpdate[key]);
    });

    query += ' WHERE CustomerID = ?;';
    values.push(customerId);

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
    const { User_fName, User_lName, Username, UserPassword, UserType, Deleted } = req.body;

    if (!User_fName || !User_lName || !Username || !UserType) {
        return res.status(400).json({ message: 'All fields except password are required' });
    }

    let query;
    const values = [];

    if (UserPassword) {
        query = `
            UPDATE User
            SET User_fName = ?, User_lName = ?, Username = ?, UserPassword = ?, UserType = ?, Deleted = ?
            WHERE UserID = ?;
        `;
        values.push(User_fName, User_lName, Username, UserPassword, UserType, Deleted || 'no', userId);
    } else {
        query = `
            UPDATE User
            SET User_fName = ?, User_lName = ?, Username = ?, UserType = ?, Deleted = ?
            WHERE UserID = ?;
        `;
        values.push(User_fName, User_lName, Username, UserType, Deleted || 'no', userId);
    }

    pool.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    });
});

/**
 * PUT sales rep
 */

router.put('/sales_reps/:id', authenticateUser, (req, res) => {
    const repId = req.params.id;
    const { SalesRep_fName, SalesRep_lName, UserID, Deleted } = req.body;

    if (!SalesRep_fName || !SalesRep_lName) {
        return res.status(400).json({ message: 'First and last name are required' });
    }

    const query = `
        UPDATE SalesRep
        SET SalesRep_fName = ?, SalesRep_lName = ?, UserID = ?, Deleted = ?
        WHERE SalesRepID = ?;
    `;

    pool.query(query, [SalesRep_fName, SalesRep_lName, UserID || null, Deleted || 'No', repId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sales Rep not found' });
        }
        res.json({ message: 'Sales Rep updated successfully' });
    });
});

/**
 * PUT /api/technicians/:id - Update a technician
 */
router.put('/technicians/:id', authenticateUser, (req, res) => {
    const techId = req.params.id;
    const { Tech_fName, Tech_lName, UserID, Deleted } = req.body;

    if (!Tech_fName || !Tech_lName) {
        return res.status(400).json({ message: 'First and last name are required' });
    }

    const query = `
        UPDATE Technician
        SET Tech_fName = ?, Tech_lName = ?, UserID = ?, Deleted = ?
        WHERE TechID = ?;
    `;

    pool.query(query, [Tech_fName, Tech_lName, UserID || null, Deleted || 'No', techId], (err, result) => {
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
    const { Tech_fName, Tech_lName, UserID } = req.body;

    if (!Tech_fName || !Tech_lName) {
        return res.status(400).json({ message: 'First and last name are required' });
    }

    const query = `
        INSERT INTO Technician (Tech_fName, Tech_lName, UserID)
        VALUES (?, ?, ?);
    `;

    pool.query(query, [Tech_fName, Tech_lName, UserID || null], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.status(201).json({ message: 'Technician added successfully', id: result.insertId });
    });
});

/**
 * POST /api/sales_reps - Add a new sales rep
 */
router.post('/sales_reps', authenticateUser, (req, res) => {
    const { SalesRep_fName, SalesRep_lName, UserID } = req.body;

    if (!SalesRep_fName || !SalesRep_lName) {
        return res.status(400).json({ message: 'First and last name are required' });
    }

    const query = `
        INSERT INTO SalesRep (SalesRep_fName, SalesRep_lName, UserID)
        VALUES (?, ?, ?);
    `;

    pool.query(query, [SalesRep_fName, SalesRep_lName, UserID || null], (err, result) => {
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
router.post('/orderitems', authenticateUser, async (req, res) => {
    const { skuNumber, orderID } = req.body;

    if (!skuNumber || !orderID) {
        return res.status(400).json({ message: 'SKU Number and Order ID are required' });
    }

    try {
        // Get a connection from the pool
        const connection = await pool.promise().getConnection();

        try {
            // Check for existing assignment (including soft-deleted ones)
            const [rows] = await connection.query(
                'SELECT * FROM OrderItems WHERE SKU_Number = ? AND OrderID = ?',
                [skuNumber, orderID]
            );

            if (rows && rows.length > 0) {
                const existing = rows[0];
                if (existing.Deleted === 'Yes') {
                    // Reactivate soft-deleted assignment
                    await connection.query(
                        'UPDATE OrderItems SET Deleted = "No" WHERE SKU_Number = ? AND OrderID = ?',
                        [skuNumber, orderID]
                    );
                    return res.status(200).json({
                        message: 'Order item reactivated successfully'
                    });
                }
                return res.status(409).json({
                    message: 'This item is already in this order'
                });
            }

            // Create new assignment
            await connection.query(
                'INSERT INTO OrderItems (SKU_Number, OrderID) VALUES (?, ?)',
                [skuNumber, orderID]
            );

            res.status(201).json({ message: 'Order item added successfully' });
        } finally {
            // Always release the connection back to the pool
            connection.release();
        }
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'This item is already in this order'
            });
        }
        console.error('Database error:', err);
        return res.status(500).json({
            message: 'Database query error',
            error: err.message
        });
    }
});

/**
 * DELETE /api/orders/:id - Soft delete an order
 */
router.delete('/orders/:id', authenticateUser, (req, res) => {
    const query = 'UPDATE `Order` SET Deleted = "Yes" WHERE OrderID = ?';
    pool.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Also soft delete all associated order items
        pool.query('UPDATE OrderItems SET Deleted = "Yes" WHERE OrderID = ?', [req.params.id], (err) => {
            if (err) {
                console.error('Error deleting order items:', err);
                // Still return success for the order deletion
                return res.json({
                    message: 'Order soft deleted (but some items may not have been removed)'
                });
            }
            res.json({ message: 'Order and all items soft deleted' });
        });
    });
});

/**
 * DELETE /api/orderitems/:orderId/:sku - Soft delete a specific item from an order
 */
router.delete('/orderitems/:orderId/:sku', authenticateUser, (req, res) => {
    const query = 'UPDATE OrderItems SET Deleted = "Yes" WHERE OrderID = ? AND SKU_Number = ?';
    pool.query(query, [req.params.orderId, req.params.sku], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Order item not found or already deleted'
            });
        }
        res.json({ message: 'Order item soft deleted' });
    });
});

/**
 * DELETE /api/orderitems/:orderId - Soft delete all items from an order
 */
router.delete('/orderitems/:orderId', authenticateUser, (req, res) => {
    const query = 'UPDATE OrderItems SET Deleted = "Yes" WHERE OrderID = ?';
    pool.query(query, [req.params.orderId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'No order items found or already deleted'
            });
        }
        res.json({
            message: `All items from order ${req.params.orderId} soft deleted`,
            count: result.affectedRows
        });
    });
});

/**
 * DELETE API for Customer
 */

router.delete('/customers/:id', authenticateUser, (req, res) => {
    const query = 'UPDATE Customer SET Deleted = "Yes" WHERE CustomerID = ?';
    pool.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json({ message: 'Customer soft deleted' });
    });
});

/**
 * POST API for TechInventory
 */
router.post('/techinventory', authenticateUser, async (req, res) => {
    const { skuNumber, techId } = req.body;

    if (!skuNumber || !techId) {
        return res.status(400).json({ message: 'SKU Number and Technician ID are required' });
    }

    try {
        // Get promise-based connection from the pool
        const connection = await pool.promise().getConnection();

        try {
            // Check for existing assignment
            const [rows] = await connection.query(
                'SELECT * FROM TechInventory WHERE SKU_Number = ? AND TechID = ?',
                [skuNumber, techId]
            );

            if (rows && rows.length > 0) {
                const existing = rows[0];
                if (existing.Deleted === 'Yes') {
                    // Reactivate soft-deleted assignment
                    await connection.query(
                        'UPDATE TechInventory SET Deleted = "No" WHERE SKU_Number = ? AND TechID = ?',
                        [skuNumber, techId]
                    );
                    return res.status(200).json({
                        message: 'Existing assignment reactivated successfully'
                    });
                }
                return res.status(409).json({
                    message: 'This item is already assigned to this technician'
                });
            }

            // Create new assignment
            const [result] = await connection.query(
                'INSERT INTO TechInventory (SKU_Number, TechID) VALUES (?, ?)',
                [skuNumber, techId]
            );

            res.status(201).json({
                message: 'Inventory item assigned to technician successfully',
                assignmentId: result.insertId
            });
        } finally {
            // Always release the connection back to the pool
            connection.release();
        }
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'This item is already assigned to this technician'
            });
        }
        console.error('Database error:', err);
        return res.status(500).json({
            message: 'Database query error',
            error: err.message
        });
    }
});

/**
 * PUT API for TechInventory
 */
router.put('/techinventory/:oldSku/:oldTechId', authenticateUser, (req, res) => {
    const { oldSku, oldTechId } = req.params;
    const { newSkuNumber, newTechId } = req.body;

    // Validate at least one field to update
    if (!newSkuNumber && !newTechId) {
        return res.status(400).json({ message: 'At least one field (newSkuNumber or newTechId) is required for update' });
    }

    // Build the dynamic query
    let query = 'UPDATE TechInventory SET ';
    const values = [];

    if (newSkuNumber) {
        query += 'SKU_Number = ?';
        values.push(newSkuNumber);
    }

    if (newTechId) {
        if (newSkuNumber) query += ', ';
        query += 'TechID = ?';
        values.push(newTechId);
    }

    query += ' WHERE SKU_Number = ? AND TechID = ?';
    values.push(oldSku, oldTechId);

    pool.query(query, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'This assignment already exists' });
            }
            return res.status(500).json({ message: 'Database query error', error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Technician inventory assignment not found' });
        }

        res.json({
            message: 'Technician inventory assignment updated successfully',
            changes: result.affectedRows
        });
    });
});

/**
 * DELETE API for Inventory
 */

router.delete('/techinventory/:sku/:techId', authenticateUser, (req, res) => {
    const query = 'UPDATE TechInventory SET Deleted = "Yes" WHERE SKU_Number = ? AND TechID = ?';
    pool.query(query, [req.params.sku, req.params.techId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json({ message: 'Technician inventory assignment removed' });
    });
});


/**
 * DELETE /api/inventory/:sku - Soft delete an inventory item
 */
router.delete('/inventory/:sku', authenticateUser, (req, res) => {
    const query = 'UPDATE Inventory SET Deleted = "Yes" WHERE SKU_Number = ?';
    pool.query(query, [req.params.sku], (err, result) => {
        if (err) {
            console.error('Database delete error:', err);
            return res.status(500).json({ message: 'Database query error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        res.json({ message: 'Inventory item soft deleted successfully' });
    });
});

/**
 * DELETE /api/users/:id - Soft delete a user
 */
router.delete('/users/:id', authenticateUser, authorizeAdmin, (req, res) => {
    const query = 'UPDATE User SET Deleted = "Yes" WHERE UserID = ?';
    pool.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User soft deleted' });
    });
});

/**
 * DELETE /api/sales_reps/:id - Soft delete a sales representative
 */
router.delete('/sales_reps/:id', authenticateUser, authorizeAdmin, (req, res) => {
    const query = 'UPDATE SalesRep SET Deleted = "Yes" WHERE SalesRepID = ?';
    pool.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sales representative not found' });
        }
        res.json({ message: 'Sales representative soft deleted' });
    });
});

/**
 * DELETE /api/technicians/:id - Soft delete a technician
 */
router.delete('/technicians/:id', authenticateUser, authorizeAdmin, (req, res) => {
    const query = 'UPDATE Technician SET Deleted = "Yes" WHERE TechID = ?';
    pool.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Technician not found' });
        }
        res.json({ message: 'Technician soft deleted' });
    });
});

/**
 * GET /api/order/:id/details - retrieving full order details
 */
router.get('/orders/:id/details', authenticateUser, (req, res) => {
    const query = `
        SELECT o.OrderID, c.Customer_fName AS CustomerName, t.Tech_fName AS TechnicianName,
               sr.SalesRep_fName AS SalesRepName, i.ItemName, i.SKU_Number
        FROM \`Order\` o
        JOIN Customer c ON o.CustomerID = c.CustomerID
        JOIN Technician t ON o.TechID = t.TechID
        JOIN SalesRep sr ON o.SalesRepID = sr.SalesRepID
        JOIN OrderItems oi ON o.OrderID = oi.OrderID
        JOIN Inventory i ON oi.SKU_Number = i.SKU_Number
        WHERE o.OrderID = ? AND oi.Deleted = 'No';
    `;

    pool.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database query error' });
        res.json(results);
    });
});

module.exports = router;