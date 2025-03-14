import { AppSyncClient, EvaluateCodeCommand } from '@aws-sdk/client-appsync';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// AppSync configuration
const appSyncConfig = {
  apiId: process.env.APPSYNC_API_ID || 'x5ujbpctlnbsxahehbvnt3ie3y',
  region: process.env.AWS_REGION || 'us-east-2'
};

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

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
    
    // Create the GraphQL mutation
    const mutation = `
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
          userId
        }
      }
    `;
    
    // Create the variables
    const variables = {
      name: expenseData.name,
      amount: expenseData.amount,
      category: expenseData.category,
      date: expenseData.date,
      userId: expenseData.userId
    };
    
    // Execute the GraphQL mutation
    const response = await executeGraphQL(mutation, variables);
    
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
 * Execute a GraphQL operation
 * @param {string} query - The GraphQL query or mutation
 * @param {Object} variables - The variables for the operation
 * @returns {Promise<Object>} - The response
 */
async function executeGraphQL(query, variables) {
  try {
    const params = {
      apiId: appSyncConfig.apiId,
      code: `
        const query = \`${query}\`;
        const variables = ${JSON.stringify(variables)};
        
        const response = await fetch('https://${appSyncConfig.apiId}.appsync-api.${appSyncConfig.region}.amazonaws.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.APPSYNC_API_KEY
          },
          body: JSON.stringify({
            query,
            variables
          })
        });
        
        return await response.json();
      `,
      runtime: {
        name: 'APPSYNC_JS',
        runtimeVersion: '1.0.0'
      }
    };
    
    const command = new EvaluateCodeCommand(params);
    const response = await appSyncClient.send(command);
    
    return JSON.parse(response.evaluationResult);
  } catch (error) {
    console.error('Error executing GraphQL operation:', error);
    throw error;
  }
}

/**
 * Run the test
 */
async function runTest() {
  try {
    // Create a test expense
    const expenseId = await testExpenseCreation();
    
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
runTest().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 