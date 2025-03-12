import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'database-1.cluster-c3c62mgwis8h.us-east-2.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'S9ZxGl9BhIiMbOpWFIKw',
  port: parseInt(process.env.DB_PORT || '3306', 10)
};

async function createDatabase() {
  let connection;
  
  try {
    console.log('Connecting to database server...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`User: ${dbConfig.user}`);
    console.log(`Port: ${dbConfig.port}`);
    
    // First connect without specifying a database
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      connectTimeout: 60000 // Increase timeout to 60 seconds
    });
    
    console.log('Connected to database server');
    
    // Check if the database exists
    const [rows] = await connection.execute(`SHOW DATABASES LIKE 'expense_tracker'`);
    
    if (rows.length === 0) {
      console.log('Database expense_tracker does not exist, creating it...');
      await connection.execute('CREATE DATABASE expense_tracker');
      console.log('Database expense_tracker created successfully');
    } else {
      console.log('Database expense_tracker already exists');
    }
    
    // Connect to the expense_tracker database
    await connection.changeUser({ database: 'expense_tracker' });
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('No tables found in the database, creating tables...');
      
      // Create tables
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS expenses (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          category VARCHAR(255) NOT NULL,
          date DATETIME NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS budgets (
          id VARCHAR(36) PRIMARY KEY,
          userId VARCHAR(36) NOT NULL,
          categoryId VARCHAR(36) NOT NULL,
          category VARCHAR(255),
          amount DECIMAL(10, 2) NOT NULL,
          month INT NOT NULL,
          year INT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Tables created successfully');
    } else {
      console.log('Tables already exist in the database');
      console.log('Existing tables:');
      tables.forEach(table => {
        console.log(`- ${Object.values(table)[0]}`);
      });
    }
    
    console.log('✅ Database setup completed successfully');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createDatabase(); 