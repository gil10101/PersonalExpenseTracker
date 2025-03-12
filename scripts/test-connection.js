import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test the database connection
 */
async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  // Get database configuration from environment variables
  const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };
  
  console.log(`Connecting to database at ${dbConfig.host}:${dbConfig.port}...`);
  
  let connection;
  
  try {
    // Create a connection
    connection = await mysql.createConnection(dbConfig);
    
    // Test the connection with a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    
    console.log('Connection successful!');
    console.log('Test query result:', rows);
    
    // Try to query the expenses table
    try {
      const [expenses] = await connection.execute('SELECT COUNT(*) as count FROM expenses');
      console.log(`Found ${expenses[0].count} expenses in the database.`);
    } catch (err) {
      console.warn('Could not query expenses table:', err.message);
    }
    
    return {
      success: true,
      message: 'Database connection successful'
    };
  } catch (error) {
    console.error('Error connecting to database:', error);
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test if this file is executed directly
if (process.argv[1].includes('test-connection.js')) {
  testDatabaseConnection()
    .then(result => {
      if (result.success) {
        console.log('✅ Database connection test passed!');
        process.exit(0);
      } else {
        console.error('❌ Database connection test failed!');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error during test:', err);
      process.exit(1);
    });
}

export default testDatabaseConnection; 