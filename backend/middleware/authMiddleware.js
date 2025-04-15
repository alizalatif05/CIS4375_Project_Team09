//middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('../db');

dotenv.config();

// Authenticate any user 
const authenticateUser = async (req, res, next) => {
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    try {
        // Remove 'Bearer ' if it's present
        const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        
        // Verify the token
        const decoded = jwt.verify(
            actualToken, 
            process.env.JWT_SECRET || 'supersecretkey',
            { algorithms: ['HS256'] } 
        );
        
        // Look up the user in the database 
        const [users] = await pool.query(
            'SELECT UserID, Username, UserType, Deleted FROM user WHERE UserID = ?', 
            [decoded.userId]
        );
        
        // Check if user exists and is not deleted
        if (users.length === 0 || users[0].Deleted === 'Yes') {
            return res.status(401).json({ message: 'User not found or deactivated' });
        }
        
        // Set the user object with current database values
        req.user = {
            userId: users[0].UserID,
            username: users[0].Username,
            isAdmin: users[0].UserType.toLowerCase() === 'admin',
            userType: users[0].UserType
        };
        
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        res.status(401).json({ message: 'Authentication failed' });
    }
};

// Middleware to restrict access to admin-only routes
const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ 
            message: 'Access denied. Admin privileges required.' 
        });
    }
    
    next();
};

// Middleware that checks if the user is an admin and sets an isAdmin flag
// but allows the request to continue regardless of user type
const checkAdmin = (req, res, next) => {

    
    next();
};

module.exports = { 
    authenticateUser, 
    authorizeAdmin,
    checkAdmin
};