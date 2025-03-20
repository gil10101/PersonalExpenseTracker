// Mock API service to replace AWS Amplify/AppSync
// This file replaces Amplify configuration with a simple local data store

// In-memory data store for our expenses
let expensesData = [
  {
    id: '1',
    userId: '1',
    title: 'Groceries',
    amount: 75.50,
    date: '2023-05-15',
    category: 'Food',
    description: 'Weekly grocery shopping'
  },
  {
    id: '2',
    userId: '1',
    title: 'Gas',
    amount: 45.00,
    date: '2023-05-14',
    category: 'Transportation',
    description: 'Filled up the tank'
  },
  {
    id: '3',
    userId: '1',
    title: 'Movie tickets',
    amount: 25.00,
    date: '2023-05-13',
    category: 'Entertainment',
    description: 'Friday night movie'
  }
];

// Generate a simple UUID for new items
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// API service methods
export const api = {
  // Get all expenses for a user
  getExpenses: async (userId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return expensesData.filter(expense => expense.userId === userId);
  },
  
  // Get a single expense by ID
  getExpense: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return expensesData.find(expense => expense.id === id);
  },
  
  // Create a new expense
  createExpense: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newExpense = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    expensesData.push(newExpense);
    return newExpense;
  },
  
  // Update an existing expense
  updateExpense: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = expensesData.findIndex(expense => expense.id === id);
    if (index !== -1) {
      expensesData[index] = {
        ...expensesData[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return expensesData[index];
    }
    throw new Error('Expense not found');
  },
  
  // Delete an expense
  deleteExpense: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = expensesData.findIndex(expense => expense.id === id);
    if (index !== -1) {
      const deleted = expensesData[index];
      expensesData = expensesData.filter(expense => expense.id !== id);
      return deleted;
    }
    throw new Error('Expense not found');
  }
};

// Export the API service
export default api; 