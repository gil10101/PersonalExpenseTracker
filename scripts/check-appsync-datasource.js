#!/usr/bin/env node

/**
 * This script checks the current AppSync data source configuration
 * to verify it's correctly set up for cross-region database access
 */

const { 
  AppSyncClient, 
  GetDataSourceCommand
} = require('@aws-sdk/client-appsync');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// AppSync configuration
const appSyncConfig = {
  apiId: process.env.APPSYNC_API_ID || 'x5ujbpctlnbsxahehbvnt3ie3y',
  region: process.env.AWS_REGION || 'us-east-2',
  dataSourceName: process.env.APPSYNC_DATASOURCE_NAME || 'ExpenseDB'
};

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// Function to get data source details
async function getDataSourceDetails() {
  try {
    console.log(`Getting data source details for ${appSyncConfig.dataSourceName}...`);
    
    const command = new GetDataSourceCommand({
      apiId: appSyncConfig.apiId,
      name: appSyncConfig.dataSourceName
    });
    
    const response = await appSyncClient.send(command);
    
    if (response.dataSource) {
      console.log('✅ Data source found');
      console.log(`Name: ${response.dataSource.name}`);
      console.log(`Type: ${response.dataSource.type}`);
      
      if (response.dataSource.relationalDatabaseConfig) {
        const rdsConfig = response.dataSource.relationalDatabaseConfig;
        console.log('\nRelational Database Configuration:');
        console.log(`Database Name: ${rdsConfig.databaseName || 'Not specified'}`);
        
        if (rdsConfig.rdsHttpEndpointConfig) {
          console.log('\nRDS HTTP Endpoint Configuration:');
          console.log(`AWS Region: ${rdsConfig.rdsHttpEndpointConfig.awsRegion || 'Not specified'}`);
          console.log(`DB Cluster Identifier: ${rdsConfig.rdsHttpEndpointConfig.dbClusterIdentifier || 'Not specified'}`);
          console.log(`Database Name: ${rdsConfig.rdsHttpEndpointConfig.databaseName || 'Not specified'}`);
          console.log(`Schema: ${rdsConfig.rdsHttpEndpointConfig.schema || 'Not specified'}`);
          
          // Check if cross-region configuration is correct
          if (rdsConfig.rdsHttpEndpointConfig.awsRegion !== 'us-east-1') {
            console.log('\n⚠️ Cross-region issue detected:');
            console.log('Your AppSync API is in us-east-2 but your data source is configured for region:', 
              rdsConfig.rdsHttpEndpointConfig.awsRegion);
            console.log('For cross-region access, the data source region should be set to us-east-1');
          } else {
            console.log('\n✅ Cross-region configuration looks correct');
          }
        }
      }
      
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

// Function to check database connectivity
async function checkDatabaseConnectivity() {
  // This is a placeholder - in a real scenario, you would use the AWS SDK to test connectivity
  // to the database, but this requires credentials and permissions that might not be available
  console.log('\nTo verify database connectivity:');
  console.log('1. Go to the AppSync console: https://console.aws.amazon.com/appsync/');
  console.log('2. Select your API');
  console.log('3. Go to "Data Sources"');
  console.log('4. Find your data source and click "Edit"');
  console.log('5. Scroll down and click "Test Connection"');
}

// Main function
async function main() {
  try {
    console.log('🔍 Checking AppSync data source configuration...');
    
    // Get data source details
    const dataSource = await getDataSourceDetails();
    
    if (!dataSource) {
      console.error('Cannot proceed as data source was not found');
      return;
    }
    
    // Check database connectivity
    await checkDatabaseConnectivity();
    
    console.log('\n📋 Next steps for cross-region setup:');
    console.log('1. Ensure your database security group allows connections from the AppSync service');
    console.log('2. Verify that your IAM roles have permissions to access resources across regions');
    console.log('3. Test your API with a simple query to verify end-to-end connectivity');
    
  } catch (error) {
    console.error('\n❌ Error in checking process:', error.message);
  }
}

// Run the main function
main(); 