import { client } from './amplifyConfig.js';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';

/**
 * Create a new expense
 * @param {Object} expenseData - The expense data
 * @returns {Promise} - The created expense
 */
export const createExpense = async (expenseData) => {
  try {
    console.log('Creating expense with data:', expenseData);
    const response = await client.graphql({
      query: mutations.createExpense,
      variables: {
        name: expenseData.name,
        amount: expenseData.amount,
        category: expenseData.category,
        date: expenseData.date,
        userId: expenseData.userId || null
      },
      authMode: 'apiKey'
    });
    console.log('Create expense response:', response);
    return response.data.createExpense;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

/**
 * List all expenses
 * @returns {Promise} - Array of expenses
 */
export const listExpenses = async () => {
  try {
    console.log('Fetching expenses...');
    
    const response = await client.graphql({
      query: queries.getAllExpenses,
      authMode: 'apiKey'
    });
    
    console.log('List expenses response:', response);
    
    // If we have errors but the request didn't throw, log them
    if (response.errors) {
      console.error('GraphQL errors:', response.errors);
      return [];
    }
    
    return response.data.getAllExpenses || [];
  } catch (error) {
    console.error('Error listing expenses:', error);
    // Return empty array to prevent app from crashing
    return [];
  }
};

/**
 * Get an expense by ID
 * @param {string} id - The expense ID
 * @returns {Promise} - The expense
 */
export const getExpense = async (id) => {
  try {
    console.log('Getting expense with ID:', id);
    const response = await client.graphql({
      query: queries.getExpense,
      variables: { id },
      authMode: 'apiKey'
    });
    console.log('Get expense response:', response);
    return response.data.getExpense;
  } catch (error) {
    console.error('Error getting expense:', error);
    throw error;
  }
};

/**
 * Update an expense
 * @param {Object} expenseData - The expense data with ID
 * @returns {Promise} - The updated expense
 */
export const updateExpense = async (expenseData) => {
  try {
    console.log('Updating expense with data:', expenseData);
    const response = await client.graphql({
      query: mutations.updateExpense,
      variables: {
        id: expenseData.id,
        name: expenseData.name,
        amount: expenseData.amount,
        category: expenseData.category,
        date: expenseData.date
      },
      authMode: 'apiKey'
    });
    console.log('Update expense response:', response);
    return response.data.updateExpense;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Delete an expense
 * @param {string} id - The expense ID
 * @returns {Promise} - The deleted expense
 */
export const deleteExpense = async (id) => {
  try {
    console.log('Deleting expense with ID:', id);
    const response = await client.graphql({
      query: mutations.deleteExpense,
      variables: { id },
      authMode: 'apiKey'
    });
    console.log('Delete expense response:', response);
    return response.data.deleteExpense;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}; 