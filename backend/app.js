// // backend/app.js

// // Import required modules
// const express = require('express'); // Express framework for building APIs
// const cors = require('cors'); // Middleware to allow cross-origin requests
// const bodyParser = require('body-parser'); // Middleware to parse incoming JSON requests
// const inventoryRoutes = require('./routes/inventory'); // Import inventory routes
// const authRoutes = require('./routes/auth'); // Import authentication routes
// const dotenv = require('dotenv'); // Environment variable management
// const db = require('./db'); // Import database connection


// dotenv.config(); // Load environment variables from .env file

// const app = express(); // Initialize Express application
// const PORT = process.env.PORT || 5000; // Define server port

// // Middleware setup
// app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
// app.use(bodyParser.json()); // Enable JSON request body parsing

// // Define API routes
// app.use('/api/inventory', inventoryRoutes); // Inventory management routes
// app.use('/api/auth', authRoutes); // Authentication routes

// // Root Route (Basic health check for API)
// app.get('/', (req, res) => {
//     res.send('Inventory Management API Running');
// });

// // Start Express server and listen on the defined port
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// module.exports = app; // Export the app instance for potential testing
