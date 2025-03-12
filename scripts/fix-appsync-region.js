#!/usr/bin/env node

/**
 * This script fixes the AppSync data source configuration to ensure
 * it's properly set up for us-east-2 region
 */

import { 
  AppSyncClient, 
  UpdateDataSourceCommand,
  GetDataSourceCommand
} from '@aws-sdk/client-appsync';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// AppSync configuration
const appSyncConfig = {
  apiId: process.env.APPSYNC_API_ID || 'x5ujbpctlnbsxahehbvnt3ie3y',
  region: process.env.AWS_REGION || 'us-east-2',
  dataSourceName: process.env.APPSYNC_DATASOURCE_NAME || 'ExpenseDB',
  serviceRoleArn: process.env.APPSYNC_SERVICE_ROLE_ARN || 'arn:aws:iam::717279732805:role/service-role/appsync-ds-rds-oLHVY4k9SHww-database-2'
};

// Extract account ID from the role ARN
const accountId = appSyncConfig.serviceRoleArn.split(':')[4]; // 717279732805

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'database-1.cluster-c3c62mgwis8h.us-east-2.rds.amazonaws.com',
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'S9ZxGl9BhIiMbOpWFIKw',
  database: 'expense_tracker', // Use the expense_tracker database
  port: process.env.DB_PORT || '3306',
  clusterArn: `arn:aws:rds:us-east-2:${accountId}:cluster:database-1`
};

console.log('AppSync Configuration:');
console.log(`API ID: ${appSyncConfig.apiId}`);
console.log(`Region: ${appSyncConfig.region}`);
console.log(`Data Source Name: ${appSyncConfig.dataSourceName}`);

console.log('\nDatabase Configuration:');
console.log(`Host: ${dbConfig.host}`);
console.log(`Database: ${dbConfig.database}`);
console.log(`Cluster ARN: ${dbConfig.clusterArn}`);

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// Function to get current data source configuration
async function getDataSource() {
  try {
    console.log(`\nGetting current data source configuration for ${appSyncConfig.dataSourceName}...`);
    
    const command = new GetDataSourceCommand({
      apiId: appSyncConfig.apiId,
      name: appSyncConfig.dataSourceName
    });
    
    const response = await appSyncClient.send(command);
    
    if (response.dataSource) {
      console.log('✅ Data source found');
      console.log(`Type: ${response.dataSource.type}`);
      console.log(`Service Role ARN: ${response.dataSource.serviceRoleArn}`);
      
      if (response.dataSource.relationalDatabaseConfig) {
        const rdsConfig = response.dataSource.relationalDatabaseConfig;
        console.log('\nCurrent Relational Database Configuration:');
        
        if (rdsConfig.rdsHttpEndpointConfig) {
          console.log(`AWS Region: ${rdsConfig.rdsHttpEndpointConfig.awsRegion}`);
          console.log(`DB Cluster Identifier: ${rdsConfig.rdsHttpEndpointConfig.dbClusterIdentifier}`);
          console.log(`Database Name: ${rdsConfig.rdsHttpEndpointConfig.databaseName}`);
          console.log(`Schema: ${rdsConfig.rdsHttpEndpointConfig.schema}`);
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

// Function to update data source
async function updateDataSource(dataSource) {
  try {
    console.log(`\nUpdating data source ${appSyncConfig.dataSourceName}...`);
    
    // Create a new relationalDatabaseConfig with the updated region
    const relationalDatabaseConfig = {
      ...dataSource.relationalDatabaseConfig,
      databaseName: dbConfig.database,
    };
    
    // If using RDS HTTP endpoint, update the region
    if (relationalDatabaseConfig.rdsHttpEndpointConfig) {
      relationalDatabaseConfig.rdsHttpEndpointConfig = {
        ...relationalDatabaseConfig.rdsHttpEndpointConfig,
        awsRegion: 'us-east-2', // Ensure region is set to us-east-2
        dbClusterIdentifier: dbConfig.clusterArn,
        databaseName: dbConfig.database,
        schema: 'mysql'
      };
    }
    
    console.log('\nNew Relational Database Configuration:');
    console.log(`AWS Region: ${relationalDatabaseConfig.rdsHttpEndpointConfig.awsRegion}`);
    console.log(`DB Cluster Identifier: ${relationalDatabaseConfig.rdsHttpEndpointConfig.dbClusterIdentifier}`);
    console.log(`Database Name: ${relationalDatabaseConfig.rdsHttpEndpointConfig.databaseName}`);
    console.log(`Schema: ${relationalDatabaseConfig.rdsHttpEndpointConfig.schema}`);
    
    const command = new UpdateDataSourceCommand({
      apiId: appSyncConfig.apiId,
      name: appSyncConfig.dataSourceName,
      type: dataSource.type,
      serviceRoleArn: appSyncConfig.serviceRoleArn, // Use the role ARN from .env
      relationalDatabaseConfig: relationalDatabaseConfig
    });
    
    const response = await appSyncClient.send(command);
    
    console.log('\n✅ Data source updated successfully');
    console.log('Region set to: us-east-2');
    
    return true;
  } catch (error) {
    console.error(`\n❌ Error updating data source: ${error.message}`);
    console.error('Error details:', error);
    return false;
  }
}

// Main function
async function fixAppSyncDataSource() {
  try {
    console.log('🚀 Starting AppSync data source fix process...');
    console.log('Ensuring all configurations are set to us-east-2 region');
    
    // Get current data source configuration
    const dataSource = await getDataSource();
    
    if (!dataSource) {
      console.error('Cannot proceed with update as data source was not found');
      return;
    }
    
    // Update data source
    const updated = await updateDataSource(dataSource);
    
    if (updated) {
      console.log('\n✅ AppSync data source update completed');
      console.log('Your AppSync API is now configured to use us-east-2 region');
      
      console.log('\nNext steps:');
      console.log('1. Verify IAM role permissions in the AWS IAM console');
      console.log('2. Ensure the IAM role has a trust relationship with AppSync');
      console.log('3. Check that the database security group allows connections from AppSync');
      console.log('4. Run the test-appsync.js script to verify the connection');
    } else {
      console.error('\n❌ AppSync data source update failed');
    }
  } catch (error) {
    console.error('\n❌ Error in data source update process:', error.message);
  }
}

// Run the main function
fixAppSyncDataSource(); 