// routes/inventory.js - FIXED VERSION

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
router.get('/inventory', authenticateUser, async (req, res) => {
    try {
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

        const [results] = await pool.query(query, values);
        res.json(results);
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * GET /api/inventory/:sku - Retrieve a single inventory item by SKU
 */
router.get('/inventory/:sku', authenticateUser, async (req, res) => {
    try {
        const query = `
            SELECT SKU_Number, ItemName, Item_Desc, Item_Quantity 
            FROM Inventory 
            WHERE SKU_Number = ? AND Deleted = 'No';
        `;
        const [results] = await pool.query(query, [req.params.sku]);
        res.json(results[0] || {});
    } catch (err) {
        console.error('Error fetching inventory item:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});


/** 
 *  CUSTOMER ROUTES
 */

router.get('/customers', authenticateUser, async (req, res) => {
    try {
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

        const [results] = await pool.query(query, values);
        res.json(results);
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 *  TECHNICIAN ROUTES
  */

router.get('/technicians', authenticateUser, async (req, res) => {
    try {
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

        const [results] = await pool.query(query, values);
        res.json(results);
    } catch (err) {
        console.error('Error fetching technicians:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * GET /api/techinventory - Retrieve all active technician inventory items with quantity
 */
router.get('/techinventory', authenticateUser, async (req, res) => {
    try {
        // Select Quantity from TechInventory table
        const query = `
            SELECT
                ti.SKU_Number,
                ti.TechID,
                ti.QTY,
                i.ItemName,
                i.Item_Desc
            FROM TechInventory ti
            JOIN Inventory i ON ti.SKU_Number = i.SKU_Number
            WHERE ti.Deleted = 'No' AND i.Deleted = 'No';
        `;
        const [results] = await pool.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching tech inventory:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

// Put for inventory edit updates

router.put('/techinventory/:oldSku/:oldTechId', authenticateUser, async (req, res) => {
    try {
        const { oldSku, oldTechId } = req.params;
        const { newTechId, QTY, newSkuNumber } = req.body;
        
        // Validate parameters
        if (!QTY && !newTechId && !newSkuNumber) {
            return res.status(400).json({ message: 'At least one field to update is required' });
        }
        
        // Get a connection for transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        try {
            // First, get the current quantity assigned to the technician
            const [currentRows] = await connection.query(
                'SELECT QTY FROM TechInventory WHERE SKU_Number = ? AND TechID = ? AND Deleted = "No"',
                [oldSku, oldTechId]
            );
            
            if (!currentRows || currentRows.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Technician inventory assignment not found or already deleted' });
            }
            
            const currentQty = currentRows[0].QTY;
            
            // Start building the query
            let query = 'UPDATE TechInventory SET ';
            const values = [];
            const updates = [];
            
            // Calculate quantity difference and update inventory if needed
            if (QTY) {
                const newQty = parseInt(QTY);
                const qtyDifference = newQty - currentQty;
                
                // If increasing quantity, check if enough inventory is available
                if (qtyDifference > 0) {
                    const [invRows] = await connection.query(
                        'SELECT Item_Quantity FROM Inventory WHERE SKU_Number = ? AND Deleted = "No"',
                        [oldSku]
                    );
                    
                    if (!invRows || invRows.length === 0 || invRows[0].Item_Quantity < qtyDifference) {
                        await connection.rollback();
                        return res.status(400).json({ 
                            message: `Insufficient inventory for SKU ${oldSku} to increase assignment by ${qtyDifference}. Available: ${invRows[0]?.Item_Quantity ?? 0}` 
                        });
                    }
                }
                
                updates.push('QTY = ?');
                values.push(newQty);
                
                // Update main inventory - subtract if increasing, add if decreasing
                if (qtyDifference !== 0) {
                    await connection.query(
                        'UPDATE Inventory SET Item_Quantity = Item_Quantity - ? WHERE SKU_Number = ?',
                        [qtyDifference, oldSku]
                    );
                }
            }
            
            // Add new tech ID if provided
            if (newTechId) {
                updates.push('TechID = ?');
                values.push(newTechId);
            }
            
            // Complete the query
            query += updates.join(', ');
            query += ' WHERE SKU_Number = ? AND TechID = ? AND Deleted = "No"';
            values.push(oldSku, oldTechId);
            
            // Execute the update
            const [result] = await connection.query(query, values);
            
            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Technician inventory assignment not found or already deleted' });
            }
            
            await connection.commit();
            
            res.json({
                message: 'Technician inventory updated successfully',
                affectedRows: result.affectedRows
            });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error updating technician inventory:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});


/** 
 *  ORDER ROUTES
 */

router.get('/orders', authenticateUser, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM `Order` WHERE Deleted = "No"');
        res.json(results);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

router.get('/orders/:id', authenticateUser, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM `Order` WHERE OrderID = ?', [req.params.id]);
        res.json(results[0] || {});
    } catch (err) {
        console.error('Error fetching order by ID:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * GET /api/orderitems - Retrieve all order items
 */
router.get('/orderitems', authenticateUser, async (req, res) => {
    try {
        const query = `
            SELECT OrderItems.SKU_Number, OrderItems.OrderID, 
                Inventory.ItemName, Inventory.Item_Desc 
            FROM OrderItems
            JOIN Inventory ON OrderItems.SKU_Number = Inventory.SKU_Number
            WHERE OrderItems.Deleted = 'No';
        `;

        const [results] = await pool.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching order items:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * ADMIN ROUTES
 **/

/**
 * GET /api/admins - Retrieve all admin users
 */
router.get('/admins', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const query = `
            SELECT AdminID, UserID, Admin_fName AS firstName, Admin_lName AS lastName 
            FROM Admin;
        `;

        const [results] = await pool.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching admins:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/** 
 *  SALES REPRESENTATIVE ROUTES
 */

router.get('/sales_reps', authenticateUser, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM SalesRep WHERE Deleted = "No"');
        res.json(results);
    } catch (err) {
        console.error('Error fetching sales reps:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

router.get('/sales_reps/:id', authenticateUser, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM SalesRep WHERE SalesRepID = ?', [req.params.id]);
        res.json(results[0] || {});
    } catch (err) {
        console.error('Error fetching sales rep by ID:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/** 
 *  USER ROUTES
 */

router.get('/user', authenticateUser, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM User');
        res.json(results);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

router.get('/user/:id', authenticateUser, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM User WHERE UserID = ?', [req.params.id]);
        res.json(results[0] || {});
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

router.post('/user', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
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
            Deleted: 'No'
        };

        const [result] = await pool.query('INSERT INTO User SET ?', [user]);
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Error with database', error: err.message });
    }
});

/**
 * PUT /api/inventory/:id - Update an existing inventory item
 */
router.put('/inventory/:id', authenticateUser, async (req, res) => {
    try {
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

        const [result] = await pool.query(updateQuery, [name, quantity, itemDesc || '', inventoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        return res.status(200).json({ message: 'Inventory item updated successfully' });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * PUT /api/customers/:id - Update an existing customer record (supports partial updates)
 */
router.put('/customer/:id', authenticateUser, async (req, res) => {
    try {
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

        const [result] = await pool.query(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        return res.status(200).json({ message: 'Customer updated successfully' });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * PUT APIs PUT /api/orders/:id - Update an existing order 
 */
router.put('/orders/:id', authenticateUser, async (req, res) => {
    try {
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

        const [result] = await pool.query(query, [customerID, techID, salesRepID, orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order updated successfully' });
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * PUT /api/users/:id - Update a user's information
 */
router.put('/users/:id', authenticateUser, async (req, res) => {
    try {
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
            values.push(User_fName, User_lName, Username, UserPassword, UserType, Deleted || 'No', userId);
        } else {
            query = `
                UPDATE User
                SET User_fName = ?, User_lName = ?, Username = ?, UserType = ?, Deleted = ?
                WHERE UserID = ?;
            `;
            values.push(User_fName, User_lName, Username, UserType, Deleted || 'No', userId);
        }

        const [result] = await pool.query(query, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * PUT sales rep
 */
router.put('/sales_reps/:id', authenticateUser, async (req, res) => {
    try {
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

        const [result] = await pool.query(query, [SalesRep_fName, SalesRep_lName, UserID || null, Deleted || 'No', repId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sales Rep not found' });
        }
        
        res.json({ message: 'Sales Rep updated successfully' });
    } catch (err) {
        console.error('Error updating sales rep:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * PUT /api/technicians/:id - Update a technician
 */
router.put('/technicians/:id', authenticateUser, async (req, res) => {
    try {
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

        const [result] = await pool.query(query, [Tech_fName, Tech_lName, UserID || null, Deleted || 'No', techId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Technician not found' });
        }
        
        res.json({ message: 'Technician updated successfully' });
    } catch (err) {
        console.error('Error updating technician:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/** 
 * POST APIs (Creating New Records)
 */
router.post('/inventory', authenticateUser, async (req, res) => {
    try {
        const { itemName, itemDesc, itemQuantity } = req.body;

        if (!itemName || !itemQuantity) {
            return res.status(400).json({ message: 'Item name and quantity are required' });
        }

        const query = `
            INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity) 
            VALUES (?, ?, ?);
        `;

        const [result] = await pool.query(query, [itemName, itemDesc || '', itemQuantity]);
        res.status(201).json({ message: 'Inventory item added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error creating inventory item:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * POST /api/customers - Add a new customer
 */
router.post('/customers', authenticateUser, async (req, res) => {
    try {
        const { firstName, lastName, address, phone } = req.body;

        if (!firstName || !lastName || !address || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const query = `
            INSERT INTO Customer (Customer_fName, Customer_lName, CustomerAddress, CustomerPhone)
            VALUES (?, ?, ?, ?);
        `;

        const [result] = await pool.query(query, [firstName, lastName, address, phone]);
        res.status(201).json({ message: 'Customer added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error creating customer:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * POST /api/technicians - Add a new technician
 */
router.post('/technicians', authenticateUser, async (req, res) => {
    try {
        const { Tech_fName, Tech_lName, UserID } = req.body;

        if (!Tech_fName || !Tech_lName) {
            return res.status(400).json({ message: 'First and last name are required' });
        }

        const query = `
            INSERT INTO Technician (Tech_fName, Tech_lName, UserID)
            VALUES (?, ?, ?);
        `;

        const [result] = await pool.query(query, [Tech_fName, Tech_lName, UserID || null]);
        res.status(201).json({ message: 'Technician added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error creating technician:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * POST /api/sales_reps - Add a new sales rep
 */
router.post('/sales_reps', authenticateUser, async (req, res) => {
    try {
        const { SalesRep_fName, SalesRep_lName, UserID } = req.body;

        if (!SalesRep_fName || !SalesRep_lName) {
            return res.status(400).json({ message: 'First and last name are required' });
        }

        const query = `
            INSERT INTO SalesRep (SalesRep_fName, SalesRep_lName, UserID)
            VALUES (?, ?, ?);
        `;

        const [result] = await pool.query(query, [SalesRep_fName, SalesRep_lName, UserID || null]);
        res.status(201).json({ message: 'Sales Rep added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error creating sales rep:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * POST /api/orders - Create a new order
 */
router.post('/orders', authenticateUser, async (req, res) => {
    try {
        const { customerID, techID, salesRepID } = req.body;

        if (!customerID || !techID || !salesRepID) {
            return res.status(400).json({ message: 'Customer ID, Technician ID, and Sales Rep ID are required' });
        }

        const query = `
            INSERT INTO \`Order\` (CustomerID, TechID, SalesRepID)
            VALUES (?, ?, ?);
        `;

        const [result] = await pool.query(query, [customerID, techID, salesRepID]);
        res.status(201).json({ message: 'Order created successfully', id: result.insertId });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
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
        const connection = await pool.getConnection();

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
router.delete('/orders/:id', authenticateUser, async (req, res) => {
    try {
        const [result] = await pool.query('UPDATE `Order` SET Deleted = "Yes" WHERE OrderID = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Also soft delete all associated order items
        await pool.query('UPDATE OrderItems SET Deleted = "Yes" WHERE OrderID = ?', [req.params.id]);
        
        res.json({ message: 'Order and all items soft deleted' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * DELETE /api/orderitems/:orderId/:sku - Soft delete a specific item from an order
 */
router.delete('/orderitems/:orderId/:sku', authenticateUser, async (req, res) => {
    try {
        const query = 'UPDATE OrderItems SET Deleted = "Yes" WHERE OrderID = ? AND SKU_Number = ?';
        const [result] = await pool.query(query, [req.params.orderId, req.params.sku]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Order item not found or already deleted'
            });
        }
        
        res.json({ message: 'Order item soft deleted' });
    } catch (err) {
        console.error('Error deleting order item:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * DELETE /api/orderitems/:orderId - Soft delete all items from an order
 */
router.delete('/orderitems/:orderId', authenticateUser, async (req, res) => {
    try {
        const query = 'UPDATE OrderItems SET Deleted = "Yes" WHERE OrderID = ?';
        const [result] = await pool.query(query, [req.params.orderId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'No order items found or already deleted'
            });
        }
        
        res.json({
            message: `All items from order ${req.params.orderId} soft deleted`,
            count: result.affectedRows
        });
    } catch (err) {
        console.error('Error deleting order items:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * DELETE API for Customer
 */
router.delete('/customers/:id', authenticateUser, async (req, res) => {
    try {
        const query = 'UPDATE Customer SET Deleted = "Yes" WHERE CustomerID = ?';
        const [result] = await pool.query(query, [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        res.json({ message: 'Customer soft deleted' });
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * POST /api/techinventory - Assign an item with quantity to a technician
 * MODIFIED BEHAVIOR: If item is already actively assigned, ADDS the requested quantity.
 * Handles new assignments and reactivation as before.
 */
router.post('/techinventory', authenticateUser, async (req, res) => {
    // 'quantity' from the request now represents the amount to ADD or the initial amount
    const { skuNumber, techId, QTY } = req.body;

    if (!skuNumber || !techId) {
        return res.status(400).json({ message: 'SKU Number and Technician ID are required' });
    }

    // Validate the quantity being added/assigned in this request
    const quantityToAddOrAssign = parseInt(QTY);
    if (isNaN(quantityToAddOrAssign) || quantityToAddOrAssign < 1) {
        return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); // Use transaction for safety

        // 1. Check available quantity in main inventory FOR THE AMOUNT BEING ADDED/ASSIGNED
        const [inventoryRows] = await connection.query(
            'SELECT Item_Quantity FROM Inventory WHERE SKU_Number = ? AND Deleted = "No"',
            [skuNumber]
        );
        if (!inventoryRows || inventoryRows.length === 0) {
             await connection.rollback();
            return res.status(404).json({ message: `Inventory item SKU ${skuNumber} not found.` });
        }
        const availableQuantity = inventoryRows[0].Item_Quantity;

        // Check if the amount we want to add/assign NOW is available
        if (quantityToAddOrAssign > availableQuantity) {
             await connection.rollback();
             return res.status(400).json({ message: `Cannot process request: Amount needed (${quantityToAddOrAssign}) exceeds available inventory (${availableQuantity}) for SKU ${skuNumber}.` });
        }

        // 2. Check for existing TechInventory assignment (active or deleted)
        const [existingRows] = await connection.query(
            'SELECT * FROM TechInventory WHERE SKU_Number = ? AND TechID = ?',
            [skuNumber, techId]
        );

        if (existingRows && existingRows.length > 0) {
            const existing = existingRows[0];
            if (existing.Deleted === 'Yes') {
                 // Reactivating: Behavior remains the same - set quantity to the requested amount.
                 // Inventory check already passed above for 'quantityToAddOrAssign'.
                await connection.query(
                    'UPDATE TechInventory SET QTY = ?, Deleted = "No" WHERE SKU_Number = ? AND TechID = ?',
                    [quantityToAddOrAssign, skuNumber, techId]
                );
                 // Decrease main inventory quantity by the amount being assigned now
                 await connection.query(
                     'UPDATE Inventory SET Item_Quantity = Item_Quantity - ? WHERE SKU_Number = ?',
                     [quantityToAddOrAssign, skuNumber]
                 );
                await connection.commit();
                return res.status(200).json({
                    message: `Assignment for SKU ${skuNumber} reactivated for Tech ${techId} with quantity ${quantityToAddOrAssign}`
                });
            } else {
                // --- MODIFIED LOGIC FOR ACTIVE ASSIGNMENT ---
                // Already Active: ADD the requested quantity ('quantityToAddOrAssign') to the existing quantity.
                 const currentQty = existing.QTY;

                 // Calculate the new total quantity
                 const newTotalQty = currentQty + quantityToAddOrAssign;

                // Update TechInventory quantity to the NEW TOTAL
                await connection.query(
                    'UPDATE TechInventory SET QTY = ? WHERE SKU_Number = ? AND TechID = ? AND Deleted = "No"',
                    [newTotalQty, skuNumber, techId]
                );

                 // Adjust main inventory - decrease ONLY by the amount ADDED in this request
                 await connection.query(
                     'UPDATE Inventory SET Item_Quantity = Item_Quantity - ? WHERE SKU_Number = ?',
                     [quantityToAddOrAssign, skuNumber] // Decrease only by the quantity added now
                 );

                await connection.commit();
                return res.status(200).json({
                    // Updated message reflecting the addition
                    message: `${quantityToAddOrAssign} units of SKU ${skuNumber} added for Tech ${techId}. New total: ${newTotalQty}`
                });
                // --- END OF MODIFIED LOGIC ---
            }
        } else {
            // New Assignment: Behavior remains the same - assign 'quantityToAddOrAssign'.
            // Inventory check already passed above.
            await connection.query(
                'INSERT INTO TechInventory (SKU_Number, TechID, QTY, Deleted) VALUES (?, ?, ?, "No")',
                [skuNumber, techId, quantityToAddOrAssign]
            );
             // Decrease main inventory quantity
             await connection.query(
                 'UPDATE Inventory SET Item_Quantity = Item_Quantity - ? WHERE SKU_Number = ?',
                 [quantityToAddOrAssign, skuNumber]
             );
            await connection.commit();
            res.status(201).json({
                message: `SKU ${skuNumber} assigned to Tech ${techId} with quantity ${quantityToAddOrAssign}`
            });
        }
    } catch (err) {
        if (connection) await connection.rollback();
         if (err.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(400).json({ message: 'Invalid SKU Number or Technician ID provided.' });
         }
         if (err.code === 'ER_DATA_TOO_LONG') {
              return res.status(400).json({ message: 'Input data too long for database field.' });
         }
         if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.message.includes('Item_Quantity_NonNegative')) {
             return res.status(400).json({ message: `Operation failed: Inventory quantity cannot go below zero for SKU ${skuNumber}.`});
         }
        console.error('Database error during tech inventory assignment:', err);
        return res.status(500).json({
            message: 'Database query error during assignment',
            error: err.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE /api/inventory/:sku - Soft delete an inventory item

router.delete('/inventory/:sku', authenticateUser, async (req, res) => {
    try {
        console.log('Deleting inventory item with SKU:', req.params.sku);
        const query = 'UPDATE Inventory SET Deleted = "Yes" WHERE SKU_Number = ?';
        const [result] = await pool.query(query, [req.params.sku]);
        
        if (result.affectedRows === 0) {
            console.log('No inventory item found with SKU:', req.params.sku);
            return res.status(404).json({ message: 'Inventory item not found' });
        }
 
        console.log('Successfully deleted inventory item with SKU:', req.params.sku);
        res.json({ message: 'Inventory item soft deleted successfully' });
    } catch (err) {
        console.error('Database delete error:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
 })


/**
 * DELETE /api/techinventory/:sku/:techId - Soft delete a technician's inventory assignment (return item to main inventory)
 */
router.delete('/techinventory/:sku/:techId', authenticateUser, async (req, res) => {
    const { sku, techId } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); // Use transaction

        // 1. Find the quantity being removed from the technician (lock the row)
        const [techInvRows] = await connection.query(
            'SELECT QTY FROM TechInventory WHERE SKU_Number = ? AND TechID = ? AND Deleted = "No" FOR UPDATE',
            [sku, techId]
        );

        if (!techInvRows || techInvRows.length === 0) {
             await connection.rollback(); // Rollback transaction
            return res.status(404).json({ message: 'Technician inventory assignment not found or already deleted' });
        }
        const quantityToRemove = techInvRows[0].Quantity;

        // 2. Soft delete the TechInventory record (set Deleted='Yes', Quantity=0)
        const [result] = await connection.query(
            'UPDATE TechInventory SET Deleted = "Yes", QTY = 0 WHERE SKU_Number = ? AND TechID = ? AND Deleted = "No"',
            [sku, techId]
        );

        // Verify deletion occurred (should always pass if SELECT found the row)
        if (result.affectedRows === 0) {
             await connection.rollback();
             console.warn(`TechInventory delete failed unexpectedly after select for SKU ${sku}, Tech ${techId}`);
             return res.status(500).json({ message: 'Failed to delete assignment record unexpectedly.' });
        }

         // 3. Add the quantity back to the main Inventory (ensure item exists and is not deleted)
         const [invUpdateResult] = await connection.query(
             'UPDATE Inventory SET Item_Quantity = Item_Quantity + ? WHERE SKU_Number = ? AND Deleted = "No"',
             [quantityToRemove, sku]
         );

         // Check if the inventory item was found to add back to
         if (invUpdateResult.affectedRows === 0) {
             await connection.rollback();
             console.error(`Failed to return quantity to inventory: Inventory item SKU ${sku} not found or deleted.`);
             // Decide how critical this is - maybe still allow tech inventory removal but warn?
             // For stricter consistency, fail the whole operation.
             return res.status(404).json({ message: `Assignment removed, but failed to return quantity: Inventory item SKU ${sku} not found or is deleted.`});
         }


        await connection.commit(); // Commit transaction
        console.log(`Successfully removed assignment for SKU ${sku} from Tech ${techId}, returned ${quantityToRemove} to inventory.`);
        res.json({ message: 'Technician inventory assignment removed successfully, quantity returned to main inventory.' });

    } catch (err) {
        if (connection) await connection.rollback(); // Rollback on any error
        console.error('Error removing tech inventory assignment:', err);
        res.status(500).json({ message: 'Database query error during removal', error: err.message });
    } finally {
        if (connection) connection.release(); // Always release connection
    }
});

module.exports = router;