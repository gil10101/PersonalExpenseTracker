import { 
  executeMySQLQuery, 
  executeRDSQuery, 
  executeSQLFile, 
  fixExpensesTable, 
  standardizeDatabase, 
  mysqlConfig, 
  rdsConfig 
} from './sql-utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check database connection
 * @returns {Promise<void>}
 */
async function checkConnection() {
  try {
    console.log('Checking database connection...');
    console.log(`Using host: ${mysqlConfig.host}`);
    console.log(`Using database: ${mysqlConfig.database}`);
    
    const result = await executeMySQLQuery('SELECT NOW() as current_time');
    console.log('Database connection successful');
    console.log(`Current database time: ${result[0].current_time}`);
  } catch (error) {
    console.error('Error checking database connection:', error);
    throw error;
  }
}

/**
 * Check table structure
 * @param {string} tableName - The name of the table to check
 * @returns {Promise<void>}
 */
async function checkTableStructure(tableName) {
  try {
    console.log(`Checking structure of table ${tableName}...`);
    
    const result = await executeMySQLQuery(`DESCRIBE ${tableName}`);
    console.log(`Structure of table ${tableName}:`);
    console.table(result);
  } catch (error) {
    console.error(`Error checking structure of table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Check all tables
 * @returns {Promise<void>}
 */
async function checkAllTables() {
  try {
    console.log('Checking all tables...');
    
    const result = await executeMySQLQuery('SHOW TABLES');
    const tables = result.map(row => Object.values(row)[0]);
    
    console.log('Tables in database:');
    console.table(tables);
    
    for (const table of tables) {
      await checkTableStructure(table);
    }
  } catch (error) {
    console.error('Error checking all tables:', error);
    throw error;
  }
}

/**
 * Setup database tables
 * @returns {Promise<void>}
 */
async function setupTables() {
  try {
    console.log('Setting up database tables...');
    
    // SQL statements to create tables
    const sql = `
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) NOT NULL,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        createdAt DATETIME,
        updatedAt DATETIME,
        PRIMARY KEY (id)
      );
      
      -- Create expenses table
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATETIME NOT NULL,
        userId VARCHAR(36),
        createdAt DATETIME,
        updatedAt DATETIME,
        PRIMARY KEY (id),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      
      -- Create categories table
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        createdAt DATETIME,
        updatedAt DATETIME,
        PRIMARY KEY (id)
      );
      
      -- Create budgets table
      CREATE TABLE IF NOT EXISTS budgets (
        id VARCHAR(36) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        userId VARCHAR(36),
        createdAt DATETIME,
        updatedAt DATETIME,
        PRIMARY KEY (id),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      
      -- Create posts table
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        userId VARCHAR(36),
        createdAt DATETIME,
        updatedAt DATETIME,
        PRIMARY KEY (id),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_expenses_userId ON expenses(userId);
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_budgets_userId ON budgets(userId);
      CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts(userId);
    `;
    
    await executeMySQLQuery(sql);
    console.log('Database tables set up successfully');
  } catch (error) {
    console.error('Error setting up database tables:', error);
    throw error;
  }
}

/**
 * Add sample data
 * @returns {Promise<void>}
 */
async function addSampleData() {
  try {
    console.log('Adding sample data...');
    
    // SQL statements to add sample data
    const sql = `
      -- Add sample users
      INSERT IGNORE INTO users (id, username, email, createdAt, updatedAt)
      VALUES 
        ('user-1', 'johndoe', 'john@example.com', NOW(), NOW()),
        ('user-2', 'janedoe', 'jane@example.com', NOW(), NOW());
      
      -- Add sample categories
      INSERT IGNORE INTO categories (id, name, description, createdAt, updatedAt)
      VALUES 
        ('cat-1', 'Food', 'Groceries and dining out', NOW(), NOW()),
        ('cat-2', 'Transportation', 'Gas, public transit, and car maintenance', NOW(), NOW()),
        ('cat-3', 'Entertainment', 'Movies, games, and hobbies', NOW(), NOW()),
        ('cat-4', 'Utilities', 'Electricity, water, and internet', NOW(), NOW());
      
      -- Add sample expenses
      INSERT IGNORE INTO expenses (id, name, amount, category, date, userId, createdAt, updatedAt)
      VALUES 
        ('exp-1', 'Grocery shopping', 85.75, 'Food', NOW(), 'user-1', NOW(), NOW()),
        ('exp-2', 'Gas', 45.50, 'Transportation', NOW(), 'user-1', NOW(), NOW()),
        ('exp-3', 'Movie tickets', 25.00, 'Entertainment', DATE_SUB(NOW(), INTERVAL 1 DAY), 'user-1', NOW(), NOW()),
        ('exp-4', 'Internet bill', 65.00, 'Utilities', DATE_SUB(NOW(), INTERVAL 2 DAY), 'user-1', NOW(), NOW()),
        ('exp-5', 'Restaurant', 55.25, 'Food', DATE_SUB(NOW(), INTERVAL 3 DAY), 'user-2', NOW(), NOW());
      
      -- Add sample budgets
      INSERT IGNORE INTO budgets (id, amount, category, startDate, endDate, userId, createdAt, updatedAt)
      VALUES 
        ('bud-1', 500.00, 'Food', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'user-1', NOW(), NOW()),
        ('bud-2', 200.00, 'Transportation', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'user-1', NOW(), NOW()),
        ('bud-3', 100.00, 'Entertainment', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'user-1', NOW(), NOW());
      
      -- Add sample posts
      INSERT IGNORE INTO posts (id, title, content, userId, createdAt, updatedAt)
      VALUES 
        ('post-1', 'My Budget Journey', 'I started tracking my expenses and it has changed my life!', 'user-1', NOW(), NOW()),
        ('post-2', 'Saving Tips', 'Here are some tips to save money on groceries...', 'user-2', NOW(), NOW());
    `;
    
    await executeMySQLQuery(sql);
    console.log('Sample data added successfully');
  } catch (error) {
    console.error('Error adding sample data:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'check-connection':
        await checkConnection();
        break;
      case 'check-tables':
        await checkAllTables();
        break;
      case 'check-table':
        if (args.length < 2) {
          console.error('Missing table name. Usage: node manage-database.js check-table <tableName>');
          process.exit(1);
        }
        await checkTableStructure(args[1]);
        break;
      case 'setup-tables':
        await setupTables();
        break;
      case 'fix-expenses':
        await fixExpensesTable();
        break;
      case 'standardize':
        await standardizeDatabase();
        break;
      case 'add-sample-data':
        await addSampleData();
        break;
      case 'run-sql-file':
        if (args.length < 2) {
          console.error('Missing SQL file path. Usage: node manage-database.js run-sql-file <filePath>');
          process.exit(1);
        }
        await executeSQLFile(args[1]);
        break;
      case 'setup-all':
        await setupTables();
        await standardizeDatabase();
        await addSampleData();
        break;
      default:
        console.log('Available commands:');
        console.log('  check-connection - Check database connection');
        console.log('  check-tables - Check all tables');
        console.log('  check-table <tableName> - Check structure of a specific table');
        console.log('  setup-tables - Create database tables');
        console.log('  fix-expenses - Fix expenses table structure');
        console.log('  standardize - Standardize database schema');
        console.log('  add-sample-data - Add sample data');
        console.log('  run-sql-file <filePath> - Execute SQL from a file');
        console.log('  setup-all - Setup tables, standardize schema, and add sample data');
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 