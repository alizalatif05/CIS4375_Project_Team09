// routes/api.js
const express = require('express');
const pool = require('../db');
const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const router = express.Router();

/**************************************
 *  INVENTORY ROUTES
 **************************************

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
 * POST /api/inventory - Add a new inventory item
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
 * DELETE /api/inventory/:sku - Soft delete an inventory item
 */
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
});

/**************************************
 *  CUSTOMER ROUTES
 **************************************/

/**
 * GET /api/customers - Retrieve all customers
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
 * PUT /api/customer/:id - Update an existing customer record 
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
 * DELETE /api/customers/:id - Soft delete a customer
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

/**************************************
 *  TECHNICIAN ROUTES
 **************************************/

/**
 * GET /api/technicians - Retrieve all technicians
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
 * DELETE /api/technicians/:id - Soft delete a technician
 */
router.delete('/technicians/:id', authenticateUser, async (req, res) => {
    try {
        console.log('Deleting technician with ID:', req.params.id);
        const query = 'UPDATE Technician SET Deleted = "Yes" WHERE TechID = ?';
        const [result] = await pool.query(query, [req.params.id]);
        
        if (result.affectedRows === 0) {
            console.log('No technician found with ID:', req.params.id);
            return res.status(404).json({ message: 'Technician not found' });
        }
        
        console.log('Successfully deleted technician with ID:', req.params.id);
        res.json({ message: 'Technician soft deleted successfully' });
    } catch (err) {
        console.error('Database delete error:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**************************************
 *  TECHNICIAN INVENTORY ROUTES
 **************************************/

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

/**
 * PUT /api/techinventory/:oldSku/:oldTechId - Update technician's inventory item
 */
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
 * POST /api/techinventory - Assign an item with quantity to a technician
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
        
        // FIX: Use correct property name - QTY instead of Quantity
        const quantityToRemove = techInvRows[0].QTY;

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
 * DELETE /api/sales_reps/:id - Soft delete a sales representative
 */
router.delete('/sales_reps/:id', authenticateUser, async (req, res) => {
    try {
        console.log('Deleting sales rep with ID:', req.params.id);
        const query = 'UPDATE SalesRep SET Deleted = "Yes" WHERE SalesRepID = ?';
        const [result] = await pool.query(query, [req.params.id]);
        
        if (result.affectedRows === 0) {
            console.log('No sales rep found with ID:', req.params.id);
            return res.status(404).json({ message: 'Sales representative not found' });
        }
        
        console.log('Successfully deleted sales rep with ID:', req.params.id);
        res.json({ message: 'Sales representative soft deleted successfully' });
    } catch (err) {
        console.error('Database delete error:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**************************************
 *  USER ROUTES
 **************************************/

/**
 * GET /api/user - Retrieve all users
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

/**
 * GET /api/user/:id - Retrieve a single user
 */
router.get('/user/:id', authenticateUser, async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM User WHERE UserID = ?', [req.params.id]);
        res.json(results[0] || {});
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * POST /api/user - Create a new user
 */
router.post('/user', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        const { User_fName, User_lName, Username, UserPassword, UserType } = req.body;

        if (!User_fName || !User_lName || !Username || !UserPassword || !UserType) {
            return res.status(400).json({ message: 'Missing required fields'});
        }

        // Hash the password with bcrypt before storing it
        const hashedPassword = await bcrypt.hash(UserPassword, 10);

        const user = {
            User_fName,
            User_lName,
            Username,
            UserPassword: hashedPassword, // Store the hashed password
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
 * PUT /api/users/:id - Update a user
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
            // Hash the password if it's provided
            const hashedPassword = await bcrypt.hash(UserPassword, 10);
            
            query = `
                UPDATE User
                SET User_fName = ?, User_lName = ?, Username = ?, UserPassword = ?, UserType = ?, Deleted = ?
                WHERE UserID = ?;
            `;
            values.push(User_fName, User_lName, Username, hashedPassword, UserType, Deleted || 'No', userId);
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
 * DELETE /api/users/:id - Soft delete a user
 */
router.delete('/users/:id', authenticateUser, authorizeAdmin, async (req, res) => {
    try {
        console.log('Deleting user with ID:', req.params.id);
        const query = 'UPDATE User SET Deleted = "Yes" WHERE UserID = ?';
        const [result] = await pool.query(query, [req.params.id]);
        
        if (result.affectedRows === 0) {
            console.log('No user found with ID:', req.params.id);
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('Successfully deleted user with ID:', req.params.id);
        res.json({ message: 'User soft deleted successfully' });
    } catch (err) {
        console.error('Database delete error:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**************************************
 *  ADMIN ROUTES
 **************************************/

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

/**************************************
 *  ORDER ROUTES
 **************************************/

/**
 * GET /api/orders - Retrieve all orders with optional date filtering
 */
router.get('/orders', authenticateUser, async (req, res) => {
    try {
        // Extract date filter parameters if provided
        const { startDate, endDate, filterBy } = req.query;
        
        let query = 'SELECT * FROM `Order` WHERE Deleted = "No"';
        const queryParams = [];
        
        // Add date filtering if date parameters are provided
        if (startDate || endDate) {
            // Determine which date field to filter on
            let dateField = 'DateCreated'; // Default
            
            if (filterBy === 'assigned') {
                dateField = 'DateAssigned';
            } else if (filterBy === 'completed') {
                dateField = 'DateCompleted';
            }
            
            // Add date range conditions if provided
            if (startDate) {
                query += ` AND ${dateField} >= ?`;
                queryParams.push(new Date(startDate));
            }
            
            if (endDate) {
                // Add 1 day to end date to include the full end date (up to 23:59:59)
                const adjustedEndDate = new Date(endDate);
                adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
                
                query += ` AND ${dateField} < ?`;
                queryParams.push(adjustedEndDate);
            }
        }
        
        // Add ordering by most recent first
        query += ' ORDER BY OrderID DESC';
        
        const [results] = await pool.query(query, queryParams);
        res.json(results);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * GET /api/orders/:id - Get a specific order
 */
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
 * GET /api/orders/:id/items - Get items for a specific order
 */
router.get('/orders/:id/items', authenticateUser, async (req, res) => {
    try {
        const orderId = req.params.id;
        const query = `
            SELECT oi.SKU_Number, oi.OrderID, oi.QTY, 
                oi.DateAdded, oi.DateUsed,
                i.ItemName, i.Item_Desc 
            FROM OrderItems oi
            JOIN Inventory i ON oi.SKU_Number = i.SKU_Number
            WHERE oi.OrderID = ? AND oi.Deleted = 'No';
        `;

        const [results] = await pool.query(query, [orderId]);
        res.json(results); // Return array of items
    } catch (err) {
        console.error('Error fetching items for order:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * GET /api/orderitems - Get all order items
 */
router.get('/orderitems', authenticateUser, async (req, res) => {
    try {
        const query = `
            SELECT OrderItems.SKU_Number, OrderItems.OrderID, OrderItems.QTY,
                OrderItems.DateAdded, OrderItems.DateUsed,
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
 * POST /api/orders - Create a new order
 */
router.post('/orders', authenticateUser, async (req, res) => {
    const { customerID, salesRepID, techID, dateCreated, dateAssigned } = req.body;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        if (!customerID || !salesRepID) {
            return res.status(400).json({ message: 'Customer ID and Sales Rep ID are required' });
        }
        
        // Set default timestamps if not provided
        const now = new Date();
        const currentDate = now.toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS
        
        // Insert new order with timestamps
        const [result] = await connection.query(
            'INSERT INTO `Order` (CustomerID, SalesRepID, TechID, DateCreated, DateAssigned, LastModified) VALUES (?, ?, ?, ?, ?, ?)',
            [
                customerID, 
                salesRepID, 
                techID, 
                dateCreated ? new Date(dateCreated).toISOString().slice(0, 19).replace('T', ' ') : currentDate, 
                dateAssigned ? new Date(dateAssigned).toISOString().slice(0, 19).replace('T', ' ') : (techID ? currentDate : null), 
                currentDate
            ]
        );
        
        const orderID = result.insertId;
        
        await connection.commit();
        
        res.status(201).json({ 
            message: 'Order created successfully', 
            orderID: orderID 
        });
    } catch (err) {
        await connection.rollback();
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    } finally {
        connection.release();
    }
});

/**
 * PUT /api/orders/:id - Update an existing order
 */
router.put('/orders/:id', authenticateUser, async (req, res) => {
    const orderId = req.params.id;
    const { customerID, salesRepID, techID, dateAssigned, dateCompleted, lastModified } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        try {
            // Check if order exists
            const [orderCheck] = await connection.query(
                'SELECT * FROM `Order` WHERE OrderID = ? AND Deleted = "No"',
                [orderId]
            );
            
            if (!orderCheck || orderCheck.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            // Construct update query dynamically based on provided fields
            let updateFields = [];
            let updateValues = [];
            
            // Only update fields that are provided
            if (customerID !== undefined) {
                updateFields.push('CustomerID = ?');
                updateValues.push(customerID);
            }
            
            if (salesRepID !== undefined) {
                updateFields.push('SalesRepID = ?');
                updateValues.push(salesRepID);
            }
            
            if (techID !== undefined) {
                updateFields.push('TechID = ?');
                updateValues.push(techID);
                
                // If technician is being assigned and there wasn't one before (or it was different)
                if (techID && (!orderCheck[0].TechID || orderCheck[0].TechID !== techID)) {
                    updateFields.push('DateAssigned = ?');
                    const newAssignDate = dateAssigned ? 
                    new Date(dateAssigned).toISOString().slice(0, 19).replace('T', ' ') : 
                    new Date().toISOString().slice(0, 19).replace('T', ' ');
                    updateValues.push(newAssignDate);
                }
            }
            
            // Handle specific timestamp fields
            if (dateAssigned !== undefined) {
                updateFields.push('DateAssigned = ?');
                const formattedDateAssigned = new Date(dateAssigned).toISOString().slice(0, 19).replace('T', ' ');
                updateValues.push(formattedDateAssigned);
            }
            
            if (dateCompleted !== undefined) {
                updateFields.push('DateCompleted = ?');
                const formattedDateCompleted = new Date(dateCompleted).toISOString().slice(0, 19).replace('T', ' ');
                updateValues.push(formattedDateCompleted);
            }
            
            // Always update LastModified
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            updateFields.push('LastModified = ?');
            if (lastModified) {
                const formattedLastModified = new Date(lastModified).toISOString().slice(0, 19).replace('T', ' ');
                updateValues.push(formattedLastModified);
              } else {
                updateValues.push(now);
              }
            
            // Only proceed if there are fields to update
            if (updateFields.length > 0) {
                const query = `UPDATE \`Order\` SET ${updateFields.join(', ')} WHERE OrderID = ?`;
                updateValues.push(orderId);
                
                await connection.query(query, updateValues);
            }
            
            res.json({ message: 'Order updated successfully' });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

/**
 * PUT /api/orders/:id/complete - Mark an order as completed
 */
// In your /orders/:id/complete endpoint
router.put('/orders/:id/complete', authenticateUser, async (req, res) => {
    const orderId = req.params.id;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // 1. Get all items from this order that are marked as used
        const [usedItems] = await connection.query(
            'SELECT SKU_Number, QTY FROM OrderItems WHERE OrderID = ? AND DateUsed IS NOT NULL AND Deleted = "No"',
            [orderId]
        );
        
        // 2. Return unused items to inventory
        const [unusedItems] = await connection.query(
            'SELECT SKU_Number, QTY FROM OrderItems WHERE OrderID = ? AND DateUsed IS NULL AND Deleted = "No"',
            [orderId]
        );
        
        for (const item of unusedItems) {
            // Return each unused item to inventory
            await connection.query(
                'UPDATE Inventory SET Item_Quantity = Item_Quantity + ? WHERE SKU_Number = ?',
                [item.QTY, item.SKU_Number]
            );
        }
        
        // 3. Mark order as completed
        await connection.query(
            'UPDATE `Order` SET DateCompleted = ?, LastModified = ? WHERE OrderID = ? AND Deleted = "No"',
            [now, now, orderId]
        );
        
        await connection.commit();
        
        res.json({ 
            message: 'Order marked as completed', 
            itemsReturned: unusedItems.length
        });
    } catch (err) {
        await connection.rollback();
        console.error('Error completing order:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    } finally {
        connection.release();
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
 * POST /api/orderitems - Add items to an order
 */
router.post('/orderitems', authenticateUser, async (req, res) => {
    const { skuNumber, orderID, QTY, dateAdded } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            if (!skuNumber || !orderID) {
                return res.status(400).json({ message: 'SKU Number and Order ID are required' });
            }
            
            // Validate the quantity
            const quantity = parseInt(QTY) || 1;
            if (isNaN(quantity) || quantity < 1) {
                return res.status(400).json({ message: 'Quantity must be a positive number' });
            }
            
            // Check if order exists
            const [orderCheck] = await connection.query(
                'SELECT * FROM `Order` WHERE OrderID = ? AND Deleted = "No"',
                [orderID]
            );
            
            if (orderCheck.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Order not found' });
            }
            
            // Check if inventory item exists and has enough quantity
            const [inventoryCheck] = await connection.query(
                'SELECT * FROM Inventory WHERE SKU_Number = ? AND Deleted = "No"',
                [skuNumber]
            );
            
            if (inventoryCheck.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Inventory item not found' });
            }
            
            if (inventoryCheck[0].Item_Quantity < quantity) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: 'Not enough inventory available',
                    available: inventoryCheck[0].Item_Quantity,
                    requested: quantity
                });
            }
            
            // Check if this item is already in the order
            const [existingItem] = await connection.query(
                'SELECT * FROM OrderItems WHERE OrderID = ? AND SKU_Number = ? AND Deleted = "No"',
                [orderID, skuNumber]
            );
            
            // Set current timestamp if not provided
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            if (existingItem.length > 0) {
                // Update existing item quantity instead of creating a duplicate
                const newQty = existingItem[0].QTY + quantity;
                
                await connection.query(
                    'UPDATE OrderItems SET QTY = ? WHERE OrderID = ? AND SKU_Number = ?',
                    [newQty, orderID, skuNumber]
                );
            } else {
                // Add new item to order with timestamp
                await connection.query(
                    'INSERT INTO OrderItems (OrderID, SKU_Number, QTY, DateAdded) VALUES (?, ?, ?, ?)',
                    [orderID, skuNumber, quantity, dateAdded || now]
                );
            }
            
            // Update inventory quantity
            await connection.query(
                'UPDATE Inventory SET Item_Quantity = Item_Quantity - ? WHERE SKU_Number = ?',
                [quantity, skuNumber]
            );
            
            // Update order's LastModified timestamp
            await connection.query(
                'UPDATE `Order` SET LastModified = ? WHERE OrderID = ?',
                [now, orderID]
            );
            
            await connection.commit();
            
            res.status(201).json({ message: 'Item added to order successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error adding item to order:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

/**
 * PUT /api/orderitems/:orderId/:sku - Update a specific order item
 */
router.put('/orderitems/:orderId/:sku', authenticateUser, async (req, res) => {
    try {
        const { orderId, sku } = req.params;
        const { skuNumber, QTY, dateUsed } = req.body;
        
        const connection = await pool.getConnection();
        
        try {
            // First check if the item being edited exists
            const [currentItem] = await connection.query(
                'SELECT * FROM OrderItems WHERE OrderID = ? AND SKU_Number = ? AND Deleted = "No"',
                [orderId, sku]
            );
            
            if (!currentItem || currentItem.length === 0) {
                return res.status(404).json({ message: 'Order item not found' });
            }
            
            // Construct update query dynamically based on provided fields
            let updateFields = [];
            let updateValues = [];
            
            // Handle quantity update
            if (QTY !== undefined && QTY >= 1) {
                updateFields.push('QTY = ?');
                updateValues.push(QTY);
            }
            
            // Handle SKU change
            if (skuNumber && skuNumber !== sku) {
                // Check if the new SKU already exists in this order
                const [existingCheck] = await connection.query(
                    'SELECT * FROM OrderItems WHERE OrderID = ? AND SKU_Number = ? AND Deleted = "No"',
                    [orderId, skuNumber]
                );
                
                if (existingCheck && existingCheck.length > 0) {
                    return res.status(409).json({ 
                        message: 'This order already contains the item you are trying to change to'
                    });
                }
                
                updateFields.push('SKU_Number = ?');
                updateValues.push(skuNumber);
            }
            
            // Handle dateUsed timestamp if provided
            if (dateUsed !== undefined) {
                updateFields.push('DateUsed = ?');
                updateValues.push(dateUsed);
            }
            
            // Only proceed if there are fields to update
            if (updateFields.length > 0) {
                const query = `UPDATE OrderItems SET ${updateFields.join(', ')} WHERE OrderID = ? AND SKU_Number = ? AND Deleted = "No"`;
                updateValues.push(orderId);
                updateValues.push(sku);
                
                await connection.query(query, updateValues);
                
                // Also update the order's LastModified timestamp
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                await connection.query(
                    'UPDATE `Order` SET LastModified = ? WHERE OrderID = ?',
                    [now, orderId]
                );
            }
            
            res.json({ message: 'Order item updated successfully' });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error updating order item:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

/**
 * PUT /api/orderitems/:orderId/:sku/used - Mark an item as used
 */
router.put('/orderitems/:orderId/:sku/used', authenticateUser, async (req, res) => {
    try {
        const { orderId, sku } = req.params;
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        const connection = await pool.getConnection();
        
        try {
            // Check if item exists
            const [itemCheck] = await connection.query(
                'SELECT * FROM OrderItems WHERE OrderID = ? AND SKU_Number = ? AND Deleted = "No"',
                [orderId, sku]
            );
            
            if (!itemCheck || itemCheck.length === 0) {
                return res.status(404).json({ message: 'Order item not found' });
            }
            
            // Mark as used
            await connection.query(
                'UPDATE OrderItems SET DateUsed = ? WHERE OrderID = ? AND SKU_Number = ? AND Deleted = "No"',
                [now, orderId, sku]
            );
            
            // Update order LastModified
            await connection.query(
                'UPDATE `Order` SET LastModified = ? WHERE OrderID = ?',
                [now, orderId]
            );
            
            res.json({ message: 'Item marked as used', dateUsed: now });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error marking item as used:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
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
        
        // Update the order's LastModified timestamp
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.query(
            'UPDATE `Order` SET LastModified = ? WHERE OrderID = ?',
            [now, req.params.orderId]
        );
        
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
        
        // Update the order's LastModified timestamp
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.query(
            'UPDATE `Order` SET LastModified = ? WHERE OrderID = ?',
            [now, req.params.orderId]
        );
        
        res.json({
            message: `All items from order ${req.params.orderId} soft deleted`,
            count: result.affectedRows
        });
    } catch (err) {
        console.error('Error deleting order items:', err);
        res.status(500).json({ message: 'Database query error', error: err.message });
    }
});

// Sales reps

/**
 * GET /api/sales_reps - Retrieve all sales reps
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

/**
 * GET /api/sales_reps/:id - Retrieve a single sales rep
 */
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
 * PUT /api/sales_reps/:id - Update a sales rep
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

module.exports = router;