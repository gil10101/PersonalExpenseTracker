#!/usr/bin/env node

/**
 * This script updates the AppSync data source to point to a new database endpoint
 * Use this after migrating your database to a new region
 */

const { 
  AppSyncClient, 
  UpdateDataSourceCommand,
  GetDataSourceCommand
} = require('@aws-sdk/client-appsync');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// AppSync configuration
const appSyncConfig = {
  apiId: process.env.APPSYNC_API_ID || 'x5ujbpctlnbsxahehbvnt3ie3y',
  region: process.env.AWS_REGION || 'us-east-2',
  dataSourceName: process.env.APPSYNC_DATASOURCE_NAME || 'ExpenseDB'
};

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '',
  newHost: '',
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'database-2',
  port: process.env.DB_PORT || '3306'
};

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// Function to prompt for required configuration
async function promptForConfig() {
  console.log('Current database configuration:');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`Username: ${dbConfig.username}`);
  console.log(`Database: ${dbConfig.database}`);
  console.log(`Port: ${dbConfig.port}`);
  
  dbConfig.newHost = await new Promise(resolve => {
    rl.question('\nEnter the new database endpoint: ', answer => resolve(answer));
  });
  
  if (!dbConfig.password) {
    dbConfig.password = await new Promise(resolve => {
      rl.question('Enter the database password: ', answer => resolve(answer));
    });
  }
  
  console.log('\nUsing the following configuration:');
  console.log(`API ID: ${appSyncConfig.apiId}`);
  console.log(`Region: ${appSyncConfig.region}`);
  console.log(`Data Source Name: ${appSyncConfig.dataSourceName}`);
  console.log(`New Database Host: ${dbConfig.newHost}`);
  
  const confirm = await new Promise(resolve => {
    rl.question('\nDo you want to update the data source? (y/n): ', answer => 
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    );
  });
  
  return confirm;
}

// Function to get current data source configuration
async function getDataSource() {
  try {
    console.log(`Getting current data source configuration for ${appSyncConfig.dataSourceName}...`);
    
    const command = new GetDataSourceCommand({
      apiId: appSyncConfig.apiId,
      name: appSyncConfig.dataSourceName
    });
    
    const response = await appSyncClient.send(command);
    
    if (response.dataSource) {
      console.log('✅ Data source found');
      console.log(`Type: ${response.dataSource.type}`);
      console.log(`Service Role ARN: ${response.dataSource.serviceRoleArn}`);
      
      return response.dataSource;
    } else {
      console.error('❌ Data source not found');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error getting data source: ${error.message}`);
    return null;
  }
}

// Function to update data source
async function updateDataSource(dataSource) {
  try {
    console.log(`Updating data source ${appSyncConfig.dataSourceName}...`);
    
    // Create a new relationalDatabaseConfig with the updated endpoint
    const relationalDatabaseConfig = {
      ...dataSource.relationalDatabaseConfig,
      awsSecretStoreArn: dataSource.relationalDatabaseConfig.awsSecretStoreArn,
      databaseName: dbConfig.database,
      rdsHttpEndpointConfig: {
        ...dataSource.relationalDatabaseConfig.rdsHttpEndpointConfig,
        awsRegion: 'us-east-2', // Update to the new region
        dbClusterIdentifier: dbConfig.newHost,
        databaseName: dbConfig.database,
        schema: 'mysql'
      }
    };
    
    const command = new UpdateDataSourceCommand({
      apiId: appSyncConfig.apiId,
      name: appSyncConfig.dataSourceName,
      type: dataSource.type,
      serviceRoleArn: dataSource.serviceRoleArn,
      relationalDatabaseConfig: relationalDatabaseConfig
    });
    
    const response = await appSyncClient.send(command);
    
    console.log('✅ Data source updated successfully');
    console.log(`New endpoint: ${dbConfig.newHost}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error updating data source: ${error.message}`);
    return false;
  }
}

// Main function
async function updateAppSyncDataSource() {
  try {
    console.log('🚀 Starting AppSync data source update process...');
    
    // Prompt for configuration
    const shouldProceed = await promptForConfig();
    
    if (!shouldProceed) {
      console.log('Update cancelled by user');
      rl.close();
      return;
    }
    
    // Get current data source configuration
    const dataSource = await getDataSource();
    
    if (!dataSource) {
      console.error('Cannot proceed with update as data source was not found');
      rl.close();
      return;
    }
    
    // Update data source
    const updated = await updateDataSource(dataSource);
    
    if (updated) {
      console.log('\n✅ AppSync data source update completed');
      console.log('Your AppSync API is now configured to use the new database endpoint');
      
      // Update .env file
      console.log('\nDon\'t forget to update your .env file with the new database endpoint:');
      console.log(`DB_HOST=${dbConfig.newHost}`);
    } else {
      console.error('\n❌ AppSync data source update failed');
    }
  } catch (error) {
    console.error('\n❌ Error in data source update process:', error.message);
  } finally {
    rl.close();
  }
}

// Run the main function
updateAppSyncDataSource(); 