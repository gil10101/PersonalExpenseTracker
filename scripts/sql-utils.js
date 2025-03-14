import mysql from 'mysql2/promise';
import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
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
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// RDS Data API configuration
const rdsConfig = {
  resourceArn: process.env.DB_CLUSTER_ARN,
  secretArn: process.env.DB_SECRET_ARN,
  database: process.env.DB_NAME,
  region: process.env.AWS_REGION || 'us-east-2'
};

// Create RDS Data API client
const rdsClient = new RDSDataClient({
  region: rdsConfig.region
});

/**
 * Execute SQL using MySQL client
 * @param {string} sql - The SQL query to execute
 * @param {Array} params - The parameters for the SQL query
 * @returns {Promise<Object>} - The query result
 */
export async function executeMySQLQuery(sql, params = []) {
  let connection;
  try {
    connection = await mysql.createConnection(mysqlConfig);
    console.log('Connected to MySQL database');
    
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('MySQL connection closed');
    }
  }
}

/**
 * Execute SQL using RDS Data API
 * @param {string} sql - The SQL query to execute
 * @param {Array} parameters - The parameters for the SQL query
 * @returns {Promise<Object>} - The query result
 */
export async function executeRDSQuery(sql, parameters = []) {
  try {
    const params = {
      resourceArn: rdsConfig.resourceArn,
      secretArn: rdsConfig.secretArn,
      database: rdsConfig.database,
      sql,
      parameters: parameters.map((param, index) => ({
        name: `param${index}`,
        value: { stringValue: param.toString() }
      }))
    };
    
    const command = new ExecuteStatementCommand(params);
    const response = await rdsClient.send(command);
    return response;
  } catch (error) {
    console.error('Error executing RDS Data API query:', error);
    throw error;
  }
}

/**
 * Execute SQL from a file using MySQL client
 * @param {string} filePath - The path to the SQL file
 * @returns {Promise<Object>} - The query result
 */
export async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    return await executeMySQLQuery(sql);
  } catch (error) {
    console.error(`Error executing SQL file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Fix the expenses table structure
 * @returns {Promise<void>}
 */
export async function fixExpensesTable() {
  try {
    console.log('Fixing expenses table structure...');
    
    // SQL statements to fix the expenses table
    const sql = `
      -- Fix the duplicate fields issue
      UPDATE expenses SET userId = user_id WHERE userId IS NULL AND user_id IS NOT NULL;
      
      -- Create a backup of the user_id column in case we need to revert
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id_backup VARCHAR(36);
      UPDATE expenses SET user_id_backup = user_id;
      
      -- Drop the duplicate columns
      ALTER TABLE expenses 
        DROP COLUMN IF EXISTS user_id,
        DROP COLUMN IF EXISTS created_at,
        DROP COLUMN IF EXISTS updated_at;
      
      -- Ensure all required columns exist with correct types
      ALTER TABLE expenses 
        MODIFY COLUMN id VARCHAR(36) NOT NULL,
        MODIFY COLUMN name VARCHAR(255) NOT NULL,
        MODIFY COLUMN amount DECIMAL(10,2) NOT NULL,
        MODIFY COLUMN category VARCHAR(100) NOT NULL,
        MODIFY COLUMN date DATETIME NOT NULL,
        MODIFY COLUMN userId VARCHAR(36),
        MODIFY COLUMN createdAt DATETIME,
        MODIFY COLUMN updatedAt DATETIME;
      
      -- Add indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_expenses_userId ON expenses(userId);
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    `;
    
    await executeMySQLQuery(sql);
    console.log('Expenses table structure fixed successfully');
  } catch (error) {
    console.error('Error fixing expenses table structure:', error);
    throw error;
  }
}

/**
 * Standardize the database schema
 * @returns {Promise<void>}
 */
export async function standardizeDatabase() {
  try {
    console.log('Standardizing database schema...');
    
    // SQL statements to standardize the database schema
    const sql = `
      -- Ensure all tables use consistent naming conventions (camelCase)
      
      -- Fix expenses table
      ALTER TABLE expenses 
        MODIFY COLUMN id VARCHAR(36) NOT NULL,
        MODIFY COLUMN name VARCHAR(255) NOT NULL,
        MODIFY COLUMN amount DECIMAL(10,2) NOT NULL,
        MODIFY COLUMN category VARCHAR(100) NOT NULL,
        MODIFY COLUMN date DATETIME NOT NULL,
        MODIFY COLUMN userId VARCHAR(36),
        MODIFY COLUMN createdAt DATETIME,
        MODIFY COLUMN updatedAt DATETIME;
      
      -- Fix categories table
      ALTER TABLE categories 
        MODIFY COLUMN id VARCHAR(36) NOT NULL,
        MODIFY COLUMN name VARCHAR(100) NOT NULL,
        MODIFY COLUMN description VARCHAR(255),
        MODIFY COLUMN createdAt DATETIME,
        MODIFY COLUMN updatedAt DATETIME;
      
      -- Fix budgets table
      ALTER TABLE budgets 
        MODIFY COLUMN id VARCHAR(36) NOT NULL,
        MODIFY COLUMN amount DECIMAL(10,2) NOT NULL,
        MODIFY COLUMN category VARCHAR(100),
        MODIFY COLUMN startDate DATETIME NOT NULL,
        MODIFY COLUMN endDate DATETIME NOT NULL,
        MODIFY COLUMN userId VARCHAR(36),
        MODIFY COLUMN createdAt DATETIME,
        MODIFY COLUMN updatedAt DATETIME;
      
      -- Fix users table
      ALTER TABLE users 
        MODIFY COLUMN id VARCHAR(36) NOT NULL,
        MODIFY COLUMN username VARCHAR(100) NOT NULL,
        MODIFY COLUMN email VARCHAR(255) NOT NULL,
        MODIFY COLUMN createdAt DATETIME,
        MODIFY COLUMN updatedAt DATETIME;
      
      -- Fix posts table
      ALTER TABLE posts 
        MODIFY COLUMN id VARCHAR(36) NOT NULL,
        MODIFY COLUMN title VARCHAR(255) NOT NULL,
        MODIFY COLUMN content TEXT,
        MODIFY COLUMN userId VARCHAR(36),
        MODIFY COLUMN createdAt DATETIME,
        MODIFY COLUMN updatedAt DATETIME;
    `;
    
    await executeMySQLQuery(sql);
    console.log('Database schema standardized successfully');
  } catch (error) {
    console.error('Error standardizing database schema:', error);
    throw error;
  }
}

export { mysqlConfig, rdsConfig, rdsClient }; 