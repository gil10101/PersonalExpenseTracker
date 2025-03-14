import { client } from '../src/utils/amplifyConfig.js';
import * as mutations from '../src/graphql/mutations.js';

/**
 * Test expense creation with the updated resolvers
 */
async function testExpenseCreation() {
  try {
    console.log('Testing expense creation with updated resolvers...');
    
    // Create a test expense with a future date
    const expenseData = {
      name: 'Test Expense',
      amount: 100.00,
      category: 'Test',
      date: new Date('2025-03-12T12:00:00Z').toISOString(),
      userId: 'test@example.com'
    };
    
    console.log('Creating expense with data:', expenseData);
    
    // Call the createExpense mutation
    const response = await client.graphql({
      query: mutations.createExpense,
      variables: {
        name: expenseData.name,
        amount: expenseData.amount,
        category: expenseData.category,
        date: expenseData.date,
        userId: expenseData.userId
      },
      authMode: 'apiKey'
    });
    
    console.log('Create expense response:', response);
    console.log('✅ Expense created successfully!');
    
    // Return the created expense ID for cleanup
    return response.data.createExpense.id;
  } catch (error) {
    console.error('❌ Error creating expense:', error);
    throw error;
  }
}

/**
 * Delete the test expense
 * @param {string} expenseId - The ID of the expense to delete
 */
async function deleteTestExpense(expenseId) {
  try {
    console.log(`Deleting test expense with ID: ${expenseId}`);
    
    // Call the deleteExpense mutation
    const response = await client.graphql({
      query: mutations.deleteExpense,
      variables: { id: expenseId },
      authMode: 'apiKey'
    });
    
    console.log('Delete expense response:', response);
    console.log('✅ Test expense deleted successfully!');
  } catch (error) {
    console.error('❌ Error deleting test expense:', error);
  }
}

/**
 * Run the test
 */
async function runTest() {
  let expenseId = null;
  
  try {
    // Create a test expense
    expenseId = await testExpenseCreation();
    
    // Wait a moment to ensure the expense is created
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clean up by deleting the test expense
    if (expenseId) {
      await deleteTestExpense(expenseId);
    }
    
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Clean up even if the test fails
    if (expenseId) {
      await deleteTestExpense(expenseId);
    }
  }
}

// Run the test
runTest().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 