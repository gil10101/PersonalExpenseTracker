#!/usr/bin/env node

/**
 * This script sets up a single resolver (getAllExpenses) for testing
 * Use this if you encounter issues with the full setup script
 */

import { 
  AppSyncClient, 
  CreateResolverCommand,
  GetDataSourceCommand,
  UpdateResolverCommand
} from '@aws-sdk/client-appsync';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// AppSync configuration
const appSyncConfig = {
  apiId: process.env.APPSYNC_API_ID || '',
  region: process.env.AWS_REGION || 'us-east-2',
  dataSourceName: process.env.LAMBDA_DATASOURCE_NAME || 'lambda_data'
};

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// Add sleep function after imports
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function promptForConfig() {
  if (!appSyncConfig.apiId) {
    appSyncConfig.apiId = await new Promise(resolve => {
      rl.question('Enter your AppSync API ID: ', answer => resolve(answer));
    });
  }

  if (!appSyncConfig.dataSourceName) {
    appSyncConfig.dataSourceName = await new Promise(resolve => {
      rl.question('Enter your Lambda data source name (default: lambda_data): ', answer => {
        return resolve(answer || 'lambda_data');
      });
    });
  }

  console.log('\nUsing the following configuration:');
  console.log(`API ID: ${appSyncConfig.apiId}`);
  console.log(`Region: ${appSyncConfig.region}`);
  console.log(`Data Source: ${appSyncConfig.dataSourceName}\n`);
}

async function verifyDataSource() {
  try {
    console.log(`Verifying data source: ${appSyncConfig.dataSourceName}`);
    
    const command = new GetDataSourceCommand({
      apiId: appSyncConfig.apiId,
      name: appSyncConfig.dataSourceName
    });
    
    const response = await appSyncClient.send(command);
    
    if (response.dataSource) {
      console.log('✅ Data source verified');
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

// Update the setupGetAllExpensesResolver function with retry logic
async function setupGetAllExpensesResolver() {
  try {
    console.log('Setting up resolver for Query.getAllExpenses...');
    
    // Define mapping templates
    const requestMappingTemplate = `{
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {
    "field": "getAllExpenses",
    "arguments": {}
  }
}`;

    const responseMappingTemplate = `$util.toJson($ctx.result)`;
    
    try {
      // Try to create the resolver
      const createCommand = new CreateResolverCommand({
        apiId: appSyncConfig.apiId,
        typeName: 'Query',
        fieldName: 'getAllExpenses',
        dataSourceName: appSyncConfig.dataSourceName,
        requestMappingTemplate,
        responseMappingTemplate
      });
      
      await appSyncClient.send(createCommand);
      console.log('✅ Resolver created successfully');
    } catch (error) {
      // Handle rate limiting
      if (error.name === 'TooManyRequestsException') {
        console.log('⚠️ Rate limit hit, waiting 5 seconds before retrying...');
        await sleep(5000);
        return await setupGetAllExpensesResolver(); // Retry recursively
      }
      
      // If resolver already exists, try to update it
      if (error.name === 'BadRequestException' && error.message.includes('already exists')) {
        console.log('Resolver already exists. Updating...');
        
        // Wait to avoid rate limiting
        await sleep(1000);
        
        const updateCommand = new UpdateResolverCommand({
          apiId: appSyncConfig.apiId,
          typeName: 'Query',
          fieldName: 'getAllExpenses',
          dataSourceName: appSyncConfig.dataSourceName,
          requestMappingTemplate,
          responseMappingTemplate
        });
        
        try {
          await appSyncClient.send(updateCommand);
          console.log('✅ Resolver updated successfully');
        } catch (updateError) {
          if (updateError.name === 'TooManyRequestsException') {
            console.log('⚠️ Rate limit hit during update, waiting 5 seconds before retrying...');
            await sleep(5000);
            return await setupGetAllExpensesResolver(); // Retry recursively
          }
          throw updateError;
        }
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up resolver:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting manual resolver setup...');
    
    // Prompt for configuration
    await promptForConfig();
    
    // Verify data source
    const dataSourceExists = await verifyDataSource();
    if (!dataSourceExists) {
      console.error('❌ Cannot proceed without a valid data source');
      rl.close();
      return;
    }
    
    // Setup getAllExpenses resolver
    const success = await setupGetAllExpensesResolver();
    
    if (success) {
      console.log('\n✅ Resolver setup complete!');
      console.log('Try running this query in AppSync Console:');
      console.log(`
query {
  getAllExpenses {
    id
    title
    amount
    date
    category
  }
}
      `);
    } else {
      console.error('❌ Failed to set up resolver');
    }
  } catch (error) {
    console.error('❌ Error in setup process:', error.message);
  } finally {
    rl.close();
  }
}

// Run the main function
main(); 