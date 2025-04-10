// Migrates current passwords to hashing logic
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');

const SALT_ROUNDS = 10;

async function migratePasswords() {
  console.log('Starting password migration...');
  
  try {
    // Get all users with plaintext passwords
    const [users] = await pool.query('SELECT UserID, UserPassword FROM user');
    
    console.log(`Found ${users.length} users to migrate`);
    
    // Process each user
    for (const user of users) {
      try {
        // Hash the plaintext password
        const hashedPassword = await bcrypt.hash(user.UserPassword, SALT_ROUNDS);
        
        // Update the user's password with the hashed version
        await pool.query(
          'UPDATE user SET UserPassword = ? WHERE UserID = ?',
          [hashedPassword, user.UserID]
        );
        
        console.log(`Migrated password for user ID: ${user.UserID}`);
      } catch (err) {
        console.error(`Error migrating password for user ID ${user.UserID}:`, err);
      }
    }
    
    console.log('Password migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the migration
migratePasswords().catch(console.error);