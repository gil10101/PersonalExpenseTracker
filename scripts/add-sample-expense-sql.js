import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'database-1.cluster-c3c62mgwis8h.us-east-2.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'S9ZxGl9BhIiMbOpWFIKw',
  database: 'expense_tracker',
  port: parseInt(process.env.DB_PORT || '3306', 10)
};

// Create a sample expense
const sampleExpense = {
  id: uuidv4(),
  name: 'Sample Expense',
  amount: 42.99,
  category: 'Food',
  date: new Date().toISOString().slice(0, 19).replace('T', ' '), // Format for MySQL DATETIME
  userId: 'sample-user-id'
};

async function addSampleExpense() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      port: dbConfig.port,
      connectTimeout: 60000 // Increase timeout to 60 seconds
    });
    
    console.log('Connected to database');
    console.log('Adding sample expense:', sampleExpense);
    
    // Insert the sample expense
    const [result] = await connection.execute(
      'INSERT INTO expenses (id, name, amount, category, date, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [sampleExpense.id, sampleExpense.name, sampleExpense.amount, sampleExpense.category, sampleExpense.date, sampleExpense.userId]
    );
    
    console.log('✅ Sample expense added successfully');
    console.log('Result:', result);
    
    // Verify the expense was added
    const [rows] = await connection.execute('SELECT * FROM expenses WHERE id = ?', [sampleExpense.id]);
    
    console.log('Verification result:', rows);
    
    return rows[0];
  } catch (error) {
    console.error('❌ Error adding sample expense:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
addSampleExpense()
  .then(result => {
    console.log('✅ Sample expense creation process completed');
  })
  .catch(error => {
    console.error('❌ Error in sample expense creation process:', error);
  }); 