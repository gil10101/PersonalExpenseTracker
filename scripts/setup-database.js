import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Set up the database and create tables
 */
async function setupDatabase() {
  console.log('Setting up database...');
  
  // Get database configuration from environment variables
  const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  };
  
  console.log(`Connecting to database server at ${dbConfig.host}:${dbConfig.port}...`);
  console.log(`Using user: ${dbConfig.user}`);
  
  let connection;
  
  try {
    // First try to connect to the mysql database (which should always exist)
    const mysqlConfig = {
      ...dbConfig,
      database: 'mysql'
    };
    
    console.log('First connecting to the mysql database...');
    connection = await mysql.createConnection(mysqlConfig);
    
    // Get the database name from environment variables
    const dbName = process.env.DB_NAME;
    
    // Create the database if it doesn't exist
    console.log(`Creating database ${dbName} if it doesn't exist...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    
    // Close the connection to mysql
    await connection.end();
    
    // Now connect to the newly created database
    const appDbConfig = {
      ...dbConfig,
      database: dbName
    };
    
    console.log(`Connecting to ${dbName} database...`);
    connection = await mysql.createConnection(appDbConfig);
    
    // Read the SQL file with table definitions
    const sqlFilePath = path.join(__dirname, 'create_tables.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    console.log('Creating tables...');
    for (const statement of statements) {
      try {
        await connection.execute(statement);
        console.log('Executed statement successfully');
      } catch (error) {
        console.error(`Error executing statement: ${error.message}`);
        console.error(`Statement: ${statement}`);
      }
    }
    
    console.log('Database setup completed successfully!');
    
    return {
      success: true,
      message: 'Database setup completed successfully'
    };
  } catch (error) {
    console.error('Error setting up database:', error);
    
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

// Run the setup if this file is executed directly
if (process.argv[1].includes('setup-database.js')) {
  setupDatabase()
    .then(result => {
      if (result.success) {
        console.log('✅ Database setup completed successfully!');
        process.exit(0);
      } else {
        console.error('❌ Database setup failed!');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error during database setup:', err);
      process.exit(1);
    });
}

export default setupDatabase; 