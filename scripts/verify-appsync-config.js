#!/usr/bin/env node

/**
 * This script verifies the AppSync configuration by checking:
 * 1. The API ID is correct
 * 2. The API is accessible
 * 3. The schema is properly defined
 */

const { 
  AppSyncClient, 
  ListTypesCommand,
  GetDataSourceCommand
} = require('@aws-sdk/client-appsync');
const https = require('https');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// AppSync configuration
const appSyncConfig = {
  apiId: process.env.APPSYNC_API_ID || 'x5ujbpctlnbsxahehbvnt3ie3y',
  region: process.env.AWS_REGION || 'us-east-2',
  endpoint: process.env.VITE_GRAPHQL_ENDPOINT || 'https://tov3dxzvsfe4pdrvwv46uawjty.appsync-api.us-east-2.amazonaws.com/graphql',
  apiKey: process.env.VITE_GRAPHQL_API_KEY || 'da2-w63pn5x5efd47ponjrsxlyy6m4',
  dataSourceName: process.env.APPSYNC_DATASOURCE_NAME || 'ExpenseDB'
};

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// Function to verify API ID
async function verifyApiId() {
  try {
    console.log(`Verifying API ID: ${appSyncConfig.apiId}`);
    
    const command = new ListTypesCommand({
      apiId: appSyncConfig.apiId,
      format: 'SDL'
    });
    
    const response = await appSyncClient.send(command);
    
    if (response.types && response.types.length > 0) {
      console.log('✅ API ID is valid');
      console.log(`Found ${response.types.length} types in the schema`);
      return true;
    } else {
      console.error('❌ API ID verification failed: No types found in schema');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying API ID:', error.message);
    return false;
  }
}

// Function to verify data source
async function verifyDataSource() {
  try {
    console.log(`Verifying data source: ${appSyncConfig.dataSourceName}`);
    
    const command = new GetDataSourceCommand({
      apiId: appSyncConfig.apiId,
      name: appSyncConfig.dataSourceName
    });
    
    const response = await appSyncClient.send(command);
    
    if (response.dataSource) {
      console.log('✅ Data source exists');
      console.log(`Data source type: ${response.dataSource.type}`);
      return true;
    } else {
      console.error('❌ Data source not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying data source:', error.message);
    return false;
  }
}

// Function to make a GraphQL request
function makeGraphQLRequest(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': appSyncConfig.apiKey
      }
    };
    
    const req = https.request(appSyncConfig.endpoint, options, (res) => {
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
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Function to verify API accessibility
async function verifyApiAccessibility() {
  try {
    console.log(`Verifying API accessibility at: ${appSyncConfig.endpoint}`);
    
    // GraphQL introspection query to get schema information
    const query = `
      query IntrospectionQuery {
        __schema {
          queryType {
            name
          }
          types {
            name
            kind
          }
        }
      }
    `;
    
    const response = await makeGraphQLRequest(query);
    
    if (response.data && response.data.__schema) {
      console.log('✅ API is accessible');
      console.log(`Query type: ${response.data.__schema.queryType.name}`);
      console.log(`Number of types: ${response.data.__schema.types.length}`);
      return true;
    } else if (response.errors) {
      console.error('❌ API returned errors:', JSON.stringify(response.errors, null, 2));
      return false;
    } else {
      console.error('❌ API returned unexpected response:', JSON.stringify(response, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying API accessibility:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('🔍 Verifying AppSync configuration...');
    console.log('\nConfiguration:');
    console.log(`API ID: ${appSyncConfig.apiId}`);
    console.log(`Region: ${appSyncConfig.region}`);
    console.log(`Endpoint: ${appSyncConfig.endpoint}`);
    console.log(`API Key: ${'*'.repeat(appSyncConfig.apiKey.length - 4)}${appSyncConfig.apiKey.substring(appSyncConfig.apiKey.length - 4)}`);
    console.log(`Data Source: ${appSyncConfig.dataSourceName}`);
    
    console.log('\n1. Verifying API ID...');
    const apiIdValid = await verifyApiId();
    
    console.log('\n2. Verifying data source...');
    const dataSourceValid = await verifyDataSource();
    
    console.log('\n3. Verifying API accessibility...');
    const apiAccessible = await verifyApiAccessibility();
    
    console.log('\nVerification Summary:');
    console.log(`API ID: ${apiIdValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`Data Source: ${dataSourceValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`API Accessibility: ${apiAccessible ? '✅ Accessible' : '❌ Not accessible'}`);
    
    if (apiIdValid && dataSourceValid && apiAccessible) {
      console.log('\n✅ AppSync configuration is valid');
    } else {
      console.error('\n❌ AppSync configuration has issues');
    }
  } catch (error) {
    console.error('\n❌ Error in verification process:', error.message);
  }
}

// Run the main function
main(); 