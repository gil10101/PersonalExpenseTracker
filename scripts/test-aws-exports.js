/**
 * This script tests the connection to AWS AppSync using aws-exports.js directly
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsExports from '../aws-exports.js';

// Configure Amplify directly with aws-exports.js
console.log('Configuring Amplify with aws-exports.js...');
console.log('AppSync endpoint:', awsExports.API.GraphQL.endpoint);
console.log('Region:', awsExports.API.GraphQL.region);
console.log('Auth mode:', awsExports.API.GraphQL.defaultAuthMode);

Amplify.configure(awsExports);
const client = generateClient();

/**
 * Test the AppSync connection with a simple query
 */
async function testAppSyncConnection() {
  console.log('Testing AppSync connection...');
  
  try {
    // Simple test query
    const testQuery = /* GraphQL */ `
      query TestConnection {
        __schema {
          queryType {
            name
          }
        }
      }
    `;
    
    const result = await client.graphql({
      query: testQuery,
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

// Run the test
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