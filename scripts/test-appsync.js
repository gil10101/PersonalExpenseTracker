/**
 * This script tests the connection to AWS AppSync
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsExports from '../aws-exports.js';
import * as queries from '../src/graphql/queries.js';
import dotenv from 'dotenv';

// Load environment variables (for backward compatibility)
dotenv.config();

// Configure Amplify directly with aws-exports.js
Amplify.configure(awsExports);
const client = generateClient();

/**
 * Test the AppSync connection by running a simple query
 */
async function testAppSyncConnection() {
  console.log('Testing AppSync connection...');
  console.log('Using AppSync endpoint:', awsExports.API.GraphQL.endpoint);
  
  try {
    // Test with a simple query
    const result = await client.graphql({
      query: queries.getAllExpenses,
      authMode: 'apiKey'
    });
    
    console.log('Connection successful!');
    console.log('Query result:', JSON.stringify(result.data, null, 2));
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error connecting to AppSync:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test if this file is executed directly
if (process.argv[1].includes('test-appsync.js')) {
  testAppSyncConnection()
    .then(result => {
      if (result.success) {
        console.log('✅ AppSync connection test passed!');
        process.exit(0);
      } else {
        console.error('❌ AppSync connection test failed!');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error during test:', err);
      process.exit(1);
    });
}

export default testAppSyncConnection;