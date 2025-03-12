import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import awsExports from '../aws-exports.js';

// Load environment variables
dotenv.config();

// Configure Amplify
Amplify.configure(awsExports);
const client = generateClient();

// Create a sample expense
const sampleExpense = {
  id: uuidv4(),
  name: 'Sample Expense',
  amount: 42.99,
  category: 'Food',
  date: new Date().toISOString(),
  userId: 'sample-user-id'
};

// GraphQL mutation for creating an expense
const createExpenseMutation = /* GraphQL */ `
  mutation CreateExpense(
    $name: String!,
    $amount: Float!,
    $category: String!,
    $date: AWSDateTime!,
    $userId: ID
  ) {
    createExpense(
      name: $name,
      amount: $amount,
      category: $category,
      date: $date,
      userId: $userId
    ) {
      id
      name
      amount
      category
      date
      createdAt
      updatedAt
    }
  }
`;

// Function to add a sample expense
async function addSampleExpense() {
  try {
    console.log('Adding sample expense...');
    console.log('Sample expense:', sampleExpense);
    
    const result = await client.graphql({
      query: createExpenseMutation,
      variables: {
        name: sampleExpense.name,
        amount: sampleExpense.amount,
        category: sampleExpense.category,
        date: sampleExpense.date,
        userId: sampleExpense.userId
      },
      authMode: 'apiKey'
    });
    
    console.log('✅ Sample expense added successfully');
    console.log('Result:', JSON.stringify(result.data, null, 2));
    
    return result.data;
  } catch (error) {
    console.error('❌ Error adding sample expense:', error);
    throw error;
  }
}

// Run the function
addSampleExpense()
  .then(() => {
    console.log('✅ Sample expense creation process completed');
  })
  .catch(error => {
    console.error('❌ Error in sample expense creation process:', error);
  }); 