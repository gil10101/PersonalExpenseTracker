#!/usr/bin/env node

/**
 * This script tests the cross-region connection to your database
 * It sends a simple GraphQL query to your AppSync API
 */

const https = require('https');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// AppSync configuration
const appSyncConfig = {
  endpoint: process.env.VITE_GRAPHQL_ENDPOINT || 'https://tov3dxzvsfe4pdrvwv46uawjty.appsync-api.us-east-2.amazonaws.com/graphql',
  apiKey: process.env.VITE_GRAPHQL_API_KEY || 'da2-w63pn5x5efd47ponjrsxlyy6m4'
};

// Function to make a GraphQL request
function makeGraphQLRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ 
      query,
      variables
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': appSyncConfig.apiKey
      }
    };
    
    console.log('Making request to:', appSyncConfig.endpoint);
    
    const req = https.request(appSyncConfig.endpoint, options, (res) => {
      console.log('Response status code:', res.statusCode);
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    req.write(data);
    req.end();
  });
}

// Function to test database connection with a simple query
async function testDatabaseConnection() {
  console.log('Testing database connection with a simple query...');
  
  // Simple query to get all expenses
  const query = `
    query GetAllExpenses {
      getAllExpenses {
        id
        name
        amount
        category
        date
      }
    }
  `;
  
  try {
    const response = await makeGraphQLRequest(query);
    
    if (response.errors) {
      console.error('GraphQL errors:', JSON.stringify(response.errors, null, 2));
      return false;
    }
    
    if (response.data) {
      console.log('✅ Query successful!');
      console.log('Data received:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.error('❌ No data received');
      return false;
    }
  } catch (error) {
    console.error('❌ Error executing query:', error.message);
    return false;
  }
}

// Function to test database connection with a mutation
async function testDatabaseMutation() {
  console.log('\nTesting database connection with a simple mutation...');
  
  // Simple mutation to create an expense
  const mutation = `
    mutation CreateExpense(
      $name: String!,
      $amount: Float!,
      $category: String!,
      $date: String!
    ) {
      createExpense(
        name: $name,
        amount: $amount,
        category: $category,
        date: $date
      ) {
        id
        name
        amount
        category
        date
      }
    }
  `;
  
  const variables = {
    name: "Test Expense",
    amount: 10.99,
    category: "Test",
    date: new Date().toISOString()
  };
  
  try {
    const response = await makeGraphQLRequest(mutation, variables);
    
    if (response.errors) {
      console.error('GraphQL errors:', JSON.stringify(response.errors, null, 2));
      return false;
    }
    
    if (response.data) {
      console.log('✅ Mutation successful!');
      console.log('Data received:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.error('❌ No data received');
      return false;
    }
  } catch (error) {
    console.error('❌ Error executing mutation:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Testing cross-region database connection...');
    console.log(`AppSync Endpoint: ${appSyncConfig.endpoint}`);
    console.log(`API Key: ${'*'.repeat(appSyncConfig.apiKey.length - 4)}${appSyncConfig.apiKey.substring(appSyncConfig.apiKey.length - 4)}`);
    
    // Test query
    const querySuccess = await testDatabaseConnection();
    
    // Test mutation if query was successful
    let mutationSuccess = false;
    if (querySuccess) {
      mutationSuccess = await testDatabaseMutation();
    }
    
    console.log('\n📋 Test Results:');
    console.log(`Query Test: ${querySuccess ? '✅ Passed' : '❌ Failed'}`);
    
    if (querySuccess) {
      console.log(`Mutation Test: ${mutationSuccess ? '✅ Passed' : '❌ Failed'}`);
    }
    
    if (querySuccess && mutationSuccess) {
      console.log('\n🎉 Success! Your cross-region database connection is working correctly.');
      console.log('Your AppSync API in us-east-2 is successfully connecting to your database in us-east-1.');
    } else {
      console.log('\n⚠️ There were issues with your cross-region database connection.');
      console.log('Please check the error messages above and verify your configuration.');
    }
    
  } catch (error) {
    console.error('\n❌ Error in testing process:', error.message);
  }
}

// Run the main function
main(); 