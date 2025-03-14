import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// MySQL configuration
const mysqlConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

async function main() {
  let connection;
  
  try {
    // Create connection
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(mysqlConfig);
    console.log('Connected to MySQL database');
    
    // Read the SQL file
    const sqlFilePath = path.resolve(__dirname, 'fix-expenses-table.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0 && !statement.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.substring(0, 100)}...`);
        await connection.query(statement);
        console.log('Statement executed successfully');
      } catch (error) {
        console.error(`Error executing statement: ${statement}`);
        console.error(error);
        // Continue with the next statement
      }
    }
    
    console.log('Database fix completed successfully');
    
    // Check the current structure of the expenses table
    console.log('Current structure of the expenses table:');
    const [rows] = await connection.query('DESCRIBE expenses');
    console.table(rows);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
      console.log('MySQL connection closed');
    }
  }
}

// Run the main function
main(); 