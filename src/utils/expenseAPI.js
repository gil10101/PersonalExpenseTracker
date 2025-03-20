import api from './amplifyConfig.js';

// Helper function to delay execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory cache for expenses
let expensesCache = {
  data: null,
  timestamp: 0,
  userId: null
};

// Mock data to use as fallbacks when fields are missing due to rate limiting
const fallbackCategories = ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Other'];

/**
 * Create a new expense
 * @param {Object} expenseData - The expense data
 * @returns {Promise} - The created expense
 */
export const createExpense = async (expenseData) => {
  try {
    console.log('Creating expense with data:', expenseData);
    
    // Validate required fields
    if (!expenseData.name || !expenseData.amount || !expenseData.category || !expenseData.date) {
      console.error('Missing required fields:', { 
        name: !!expenseData.name, 
        amount: !!expenseData.amount, 
        category: !!expenseData.category, 
        date: !!expenseData.date 
      });
      throw new Error('Missing required fields');
    }
    
    // Using consistent field names with the database
    const response = await api.createExpense({
      title: expenseData.name,
      amount: parseFloat(expenseData.amount), // Ensure amount is a number
      category: expenseData.category,
      date: expenseData.date,
      userId: expenseData.userId || '1', // Default to user 1 if not provided
      description: expenseData.description || ''
    });
    
    console.log('Create expense response:', response);
    return response;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

/**
 * Process the raw expenses from the API and handle errors
 * @param {Array} rawExpenses - The raw expense array from the API response
 * @param {Array} errors - Any errors from the API response
 * @returns {Array} - Processed expense array with fallbacks for missing data
 */
const processExpenses = (rawExpenses, errors = []) => {
  if (!rawExpenses || !Array.isArray(rawExpenses)) {
    return [];
  }
  
  console.log('Processing expenses:', rawExpenses);
  
  // Map of which fields had errors for which expense index
  const errorMap = errors.reduce((map, error) => {
    if (error && error.path && error.path.length >= 3) {
      const expenseIndex = error.path[1];
      const fieldName = error.path[2];
      
      if (!map[expenseIndex]) {
        map[expenseIndex] = new Set();
      }
      map[expenseIndex].add(fieldName);
    }
    return map;
  }, {});
  
  // Process each expense, filling in missing data
  return rawExpenses.map((expense, index) => {
    // If the entire expense is null, create a placeholder
    if (!expense) {
      return {
        id: `placeholder-${index}-${Date.now()}`,
        name: 'Loading...',
        amount: 0,
        category: fallbackCategories[index % fallbackCategories.length],
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPlaceholder: true
      };
    }
    
    // Check if specific fields are missing (due to errors)
    const fieldErrors = errorMap[index] || new Set();
    
    // Fill in missing fields
    if (fieldErrors.size > 0) {
      const result = { ...expense };
      
      if (fieldErrors.has('id') || !result.id) {
        result.id = `recovered-${index}-${Date.now()}`;
      }
      
      if (fieldErrors.has('name') || !result.name) {
        result.name = 'Expense ' + (index + 1);
      }
      
      if (fieldErrors.has('amount') || result.amount === undefined || result.amount === null) {
        result.amount = 0;
      }
      
      if (fieldErrors.has('category') || !result.category) {
        result.category = fallbackCategories[index % fallbackCategories.length];
      }
      
      if (fieldErrors.has('date') || !result.date) {
        result.date = new Date().toISOString();
      }
      
      return result;
    }
    
    return expense;
  }).filter(Boolean); // Remove any null/undefined entries
};

/**
 * List all expenses for the current user
 * @param {string} userId - Optional user ID to filter expenses
 * @returns {Promise} - Array of expenses
 */
export const listExpenses = async (userId = null) => {
  try {
    // Default to user 1 if no userId provided
    const effectiveUserId = userId || '1';
    
    console.log(`Fetching expenses for userId: ${effectiveUserId}`);
    
    const expenses = await api.getExpenses(effectiveUserId);
    
    // Convert expense objects to match expected format in components
    return expenses.map(expense => ({
      id: expense.id,
      name: expense.title, // Map title to name for existing components
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

/**
 * Get a specific expense by ID
 * @param {string} id - The expense ID
 * @returns {Promise} - The expense data
 */
export const getExpense = async (id) => {
  try {
    const expense = await api.getExpense(id);
    
    // Convert to match expected format in components
    return {
      id: expense.id,
      name: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    };
  } catch (error) {
    console.error('Error fetching expense details:', error);
    throw error;
  }
};

/**
 * Update an existing expense
 * @param {Object} expenseData - The updated expense data
 * @returns {Promise} - The updated expense
 */
export const updateExpense = async (expenseData) => {
  try {
    // Map from component fields to API fields
    const response = await api.updateExpense(expenseData.id, {
      title: expenseData.name,
      amount: parseFloat(expenseData.amount),
      category: expenseData.category,
      date: expenseData.date,
      description: expenseData.description || ''
    });
    
    // Convert response to match expected format
    return {
      id: response.id,
      name: response.title,
      amount: response.amount,
      category: response.category,
      date: response.date,
      description: response.description,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    };
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Delete an expense by ID
 * @param {string} id - The expense ID to delete
 * @returns {Promise} - The deleted expense data
 */
export const deleteExpense = async (id) => {
  try {
    const response = await api.deleteExpense(id);
    return response;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}; 