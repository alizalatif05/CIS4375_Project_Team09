// middleware/authMiddleware.js

// Import required modules
const jwt = require('jsonwebtoken'); // JSON Web Token library for authentication
const dotenv = require('dotenv'); // Environment variable management

dotenv.config(); // Load environment variables from .env file

// test user for development only
const authenticateUser = (req, res, next) => {
    req.user = {
        id: 1,
        username: 'test_user',
        isAdmin: true,
        role: 'admin'
    };

console.log('This is a test user, please replace before deployment.')

next();
};

/**
 * Middleware function to authenticate users via JWT.
 *
 * This function checks for the presence of a JWT token in the request header.
 * If the token is valid, it decodes the token and attaches the user information to the request object.
 * If invalid or missing, an appropriate error response is sent back.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - Callback function to pass control to the next middleware.
 */

// ACUTAL AUTH LOGIC BELOW
// const authenticateUser = (req, res, next) => {
//     const token = req.header('Authorization'); // Get token from request header
//     if (!token) {
//         return res.status(401).json({ message: 'Access denied. No token provided.' }); // If no token, deny access
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret key
//         req.user = decoded; // Attach decoded user data to request
//         next(); // Move to the next middleware or route handler
//     } catch (err) {
//         res.status(400).json({ message: 'Invalid token' }); // If token is invalid, return error response
//     }
// };

/**
 * Middleware function to authorize admin users only.
 *
 * This function checks if the authenticated user has admin privileges.
 * If the user is not an admin, access is denied.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - Callback function to pass control to the next middleware.
 */

//Test auth

const authorizeAdmin = (req, res, next) => {
    console.log('Authorization in test mode.')
    next();
};


//ACTUAL LOGIC BELOW
// const authorizeAdmin = (req, res, next) => {
//     if (!req.user.isAdmin) {
//         return res.status(403).json({ message: 'Access denied. Admins only.' }); // If not admin, deny access
//     }
//     next(); // Allow admin to proceed
// };

module.exports = { authenticateUser, authorizeAdmin }; // Export both middleware functions
