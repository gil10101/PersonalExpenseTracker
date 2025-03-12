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
    console.log('Parameters:', params);
    const [rows] = await pool.execute(query, params);
    console.log(`Query executed successfully, returned ${rows.length} rows`);
    return rows;
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
    
    getAllExpenses: async () => {
      const query = 'SELECT * FROM expenses ORDER BY date DESC';
      return executeQuery(query);
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
      // Generate a UUID for the expense
      const expenseId = require('crypto').randomUUID();
      
      // Begin transaction
      const pool = await initializePool();
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Insert the expense
        const insertExpenseQuery = `
          INSERT INTO expenses (id, name, amount, category, date)
          VALUES (?, ?, ?, ?, ?)
        `;
        await connection.execute(insertExpenseQuery, [expenseId, name, amount, category, date]);
        
        // Link the expense to the user
        if (userId) {
          const linkExpenseQuery = `
            INSERT INTO user_expenses (user_id, expense_id)
            VALUES (?, ?)
          `;
          await connection.execute(linkExpenseQuery, [userId, expenseId]);
        }
        
        // Commit the transaction
        await connection.commit();
        
        // Return the created expense
        return {
          id: expenseId,
          name,
          amount,
          category,
          date,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } catch (error) {
        // Rollback the transaction in case of error
        await connection.rollback();
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