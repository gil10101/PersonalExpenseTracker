const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false // Changed to false for Aurora Serverless
  }
};

// Create a connection pool
let pool;

// Initialize the connection pool
const initializePool = async () => {
  if (!pool) {
    console.log('Creating connection pool...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USERNAME}`);
    console.log(`Port: ${process.env.DB_PORT || 3306}`);
    
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Connection pool created successfully');
  }
  return pool;
};

// Helper function to execute SQL queries
const executeQuery = async (query, params = []) => {
  try {
    const pool = await initializePool();
    console.log(`Executing query: ${query}`);
    console.log('Parameters:', JSON.stringify(params));
    const [rows] = await pool.execute(query, params);
    console.log(`Query executed successfully, returned ${rows.length} rows`);
    
    // Transform the database column names to match GraphQL field names
    const transformedRows = rows.map(row => {
      // Create a new object to avoid modifying the original row
      const transformedRow = {};
      
      // Copy each property with the correct name
      for (const key in row) {
        // For fields that might be in snake_case in the database
        // Map user_id to userId, created_at to createdAt, etc.
        const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        
        // Use the camelCase key for the transformation
        transformedRow[camelCaseKey] = row[key];
        
        // Also keep the original key if it's different
        if (camelCaseKey !== key) {
          transformedRow[key] = row[key];
        }
      }
      
      return transformedRow;
    });
    
    return transformedRows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Resolver functions for GraphQL operations
const resolvers = {
  // Query resolvers
  Query: {
    getExpensesByCategory: async (category) => {
      const query = 'SELECT * FROM expenses WHERE category = ? ORDER BY date DESC';
      return executeQuery(query, [category]);
    },
    
    getExpensesByDateRange: async (startDate, endDate) => {
      const query = 'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC';
      return executeQuery(query, [startDate, endDate]);
    },
    
    getAllExpenses: async (userId) => {
      let query = 'SELECT * FROM expenses';
      let params = [];
      
      // If userId is provided, add a WHERE clause
      if (userId) {
        query += ' WHERE userId = ?';
        params.push(userId);
      }
      
      // Add ordering
      query += ' ORDER BY date DESC';
      
      // Execute the query and get transformed results
      const results = await executeQuery(query, params);
      
      // Additional explicit field mapping to ensure GraphQL compatibility
      return results.map(expense => ({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        userId: expense.userId || expense.user_id, // Handle both possible column names
        createdAt: expense.createdAt || expense.created_at, // Handle both possible column names
        updatedAt: expense.updatedAt || expense.updated_at // Handle both possible column names
      }));
    },
    
    getAllCategories: async () => {
      const query = 'SELECT * FROM categories ORDER BY name';
      return executeQuery(query);
    },
    
    getBudgetsByMonth: async (userId, month, year) => {
      const query = `
        SELECT b.id, b.amount, c.name as category, c.id as category_id
        FROM budgets b
        JOIN categories c ON b.category_id = c.id
        WHERE b.user_id = ? AND b.month = ? AND b.year = ?
      `;
      return executeQuery(query, [userId, month, year]);
    }
  },
  
  // Mutation resolvers
  Mutation: {
    createExpense: async (name, amount, category, date, userId) => {
      console.log('Creating expense with params:', { name, amount, category, date, userId });
      
      // Validate required fields
      if (!name || !amount || !category || !date) {
        throw new Error('Missing required fields: name, amount, category, and date are required');
      }
      
      // Generate a UUID for the expense
      const expenseId = require('crypto').randomUUID();
      
      // Begin transaction
      const pool = await initializePool();
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Insert the expense
        const insertExpenseQuery = `
          INSERT INTO expenses (id, name, amount, category, date, userId)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(insertExpenseQuery, [expenseId, name, amount, category, date, userId]);
        
        // Commit the transaction
        await connection.commit();
        
        // Return the created expense
        return {
          id: expenseId,
          name,
          amount,
          category,
          date,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } catch (error) {
        // Rollback the transaction in case of error
        await connection.rollback();
        console.error('Error creating expense:', error);
        throw error;
      } finally {
        connection.release();
      }
    },
    
    updateExpense: async (id, name, amount, category, date) => {
      // Build the SET clause dynamically based on provided fields
      const updates = [];
      const params = [];
      
      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
      }
      
      if (amount !== undefined) {
        updates.push('amount = ?');
        params.push(amount);
      }
      
      if (category !== undefined) {
        updates.push('category = ?');
        params.push(category);
      }
      
      if (date !== undefined) {
        updates.push('date = ?');
        params.push(date);
      }
      
      // Add the ID to the params array
      params.push(id);
      
      // Execute the update query
      const query = `
        UPDATE expenses
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await executeQuery(query, params);
      
      // Return the updated expense
      const getExpenseQuery = 'SELECT * FROM expenses WHERE id = ?';
      const [updatedExpense] = await executeQuery(getExpenseQuery, [id]);
      return updatedExpense;
    },
    
    deleteExpense: async (id) => {
      // Get the expense before deleting it
      const getExpenseQuery = 'SELECT * FROM expenses WHERE id = ?';
      const [expense] = await executeQuery(getExpenseQuery, [id]);
      
      if (!expense) {
        throw new Error(`Expense with ID ${id} not found`);
      }
      
      // Delete the expense
      const deleteQuery = 'DELETE FROM expenses WHERE id = ?';
      await executeQuery(deleteQuery, [id]);
      
      return expense;
    },
    
    createBudget: async (userId, categoryId, amount, month, year) => {
      // Generate a UUID for the budget
      const budgetId = require('crypto').randomUUID();
      
      // Insert the budget
      const query = `
        INSERT INTO budgets (id, user_id, category_id, amount, month, year)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE amount = ?
      `;
      
      await executeQuery(query, [budgetId, userId, categoryId, amount, month, year, amount]);
      
      // Return the created budget
      return {
        id: budgetId,
        user_id: userId,
        category_id: categoryId,
        amount,
        month,
        year,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }
};

// Lambda handler
exports.handler = async (event) => {
  try {
    // Extract the GraphQL operation from the event
    const { field, arguments: args } = event;
    
    console.log('Lambda handler received event:', JSON.stringify(event, null, 2));
    console.log('Field:', field);
    console.log('Arguments:', JSON.stringify(args, null, 2));
    
    // Determine if it's a query or mutation
    const operationType = field.startsWith('get') || field === 'getAllExpenses' || field === 'getAllCategories' || field === 'getBudgetsByMonth'
      ? 'Query'
      : 'Mutation';
    
    // Call the appropriate resolver
    const resolver = resolvers[operationType][field];
    if (!resolver) {
      throw new Error(`Resolver for ${field} not found`);
    }
    
    // Execute the resolver with the provided arguments
    const result = await resolver(...Object.values(args));
    
    return result;
  } catch (error) {
    console.error('Error in Lambda resolver:', error);
    throw error;
  }
}; 