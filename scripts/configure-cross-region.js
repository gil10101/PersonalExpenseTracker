#!/usr/bin/env node

/**
 * This script configures your AppSync data source for cross-region database access
 * It updates the data source to point to your Aurora database in us-east-1
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
  host: process.env.DB_HOST || 'database-2.cluster-c26a6o2q3bp.us-east-1.rds.amazonaws.com',
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'database-2',
  port: process.env.DB_PORT || '3306',
  region: 'us-east-1' // The database region
};

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// Function to prompt for required configuration
async function promptForConfig() {
  console.log('Current configuration:');
  console.log(`AppSync API ID: ${appSyncConfig.apiId}`);
  console.log(`AppSync Region: ${appSyncConfig.region}`);
  console.log(`Data Source Name: ${appSyncConfig.dataSourceName}`);
  console.log(`Database Host: ${dbConfig.host}`);
  console.log(`Database Name: ${dbConfig.database}`);
  console.log(`Database Region: ${dbConfig.region}`);
  
  if (!dbConfig.password) {
    dbConfig.password = await new Promise(resolve => {
      rl.question('\nEnter your database password: ', answer => resolve(answer));
    });
  }
  
  const confirm = await new Promise(resolve => {
    rl.question('\nDo you want to configure cross-region access with these settings? (y/n): ', answer => 
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

// Function to update data source for cross-region access
async function updateDataSourceForCrossRegion(dataSource) {
  try {
    console.log(`Updating data source ${appSyncConfig.dataSourceName} for cross-region access...`);
    
    // Extract the cluster identifier from the host
    // Format: database-2.cluster-c26a6o2q3bp.us-east-1.rds.amazonaws.com
    const dbClusterIdentifier = dbConfig.host.split('.')[0];
    
    // Create a new relationalDatabaseConfig with cross-region settings
    const relationalDatabaseConfig = {
      ...dataSource.relationalDatabaseConfig,
      databaseName: dbConfig.database,
      rdsHttpEndpointConfig: {
        ...dataSource.relationalDatabaseConfig?.rdsHttpEndpointConfig,
        awsRegion: dbConfig.region, // Set to us-east-1
        dbClusterIdentifier: dbClusterIdentifier,
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
    
    console.log('✅ Data source updated successfully for cross-region access');
    console.log(`Database region: ${dbConfig.region}`);
    console.log(`Database cluster: ${dbClusterIdentifier}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error updating data source: ${error.message}`);
    return false;
  }
}

// Main function
async function configureCrossRegion() {
  try {
    console.log('🚀 Starting cross-region configuration process...');
    
    // Prompt for configuration
    const shouldProceed = await promptForConfig();
    
    if (!shouldProceed) {
      console.log('Configuration cancelled by user');
      rl.close();
      return;
    }
    
    // Get current data source configuration
    const dataSource = await getDataSource();
    
    if (!dataSource) {
      console.error('Cannot proceed with configuration as data source was not found');
      rl.close();
      return;
    }
    
    // Update data source for cross-region access
    const updated = await updateDataSourceForCrossRegion(dataSource);
    
    if (updated) {
      console.log('\n✅ Cross-region configuration completed');
      console.log('Your AppSync API in us-east-2 is now configured to access your database in us-east-1');
      
      console.log('\n📋 Next steps:');
      console.log('1. Verify the configuration in the AWS AppSync console');
      console.log('2. Test the connection using the "Test Connection" button in the console');
      console.log('3. Update your security groups to allow cross-region access');
      console.log('4. Test your API with a simple query');
    } else {
      console.error('\n❌ Cross-region configuration failed');
    }
  } catch (error) {
    console.error('\n❌ Error in configuration process:', error.message);
  } finally {
    rl.close();
  }
}

// Run the main function
configureCrossRegion(); 