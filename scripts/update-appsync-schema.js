#!/usr/bin/env node

/**
 * This script updates the AppSync schema with the contents of schema.graphql
 */

import { 
  AppSyncClient, 
  StartSchemaCreationCommand,
  GetSchemaCreationStatusCommand
} from '@aws-sdk/client-appsync';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  region: process.env.AWS_REGION || 'us-east-2'
};

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// Function to prompt for required configuration
async function promptForConfig() {
  if (!appSyncConfig.apiId) {
    appSyncConfig.apiId = await new Promise(resolve => {
      rl.question('Enter your AppSync API ID: ', answer => resolve(answer));
    });
  }

  console.log('\nUsing the following configuration:');
  console.log(`API ID: ${appSyncConfig.apiId}`);
  console.log(`Region: ${appSyncConfig.region}`);
  
  const confirm = await new Promise(resolve => {
    rl.question('\nDo you want to update the schema? (y/n): ', answer => 
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    );
  });
  
  return confirm;
}

// Function to read schema file
function readSchemaFile() {
  try {
    const schemaPath = path.join(__dirname, '..', 'schema.graphql');
    console.log(`Reading schema from ${schemaPath}...`);
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file read successfully');
    
    return schema;
  } catch (error) {
    console.error(`❌ Error reading schema file: ${error.message}`);
    return null;
  }
}

// Function to update schema
async function updateSchema(schema) {
  try {
    console.log('Updating AppSync schema...');
    
    const command = new StartSchemaCreationCommand({
      apiId: appSyncConfig.apiId,
      definition: Buffer.from(schema)
    });
    
    await appSyncClient.send(command);
    console.log('✅ Schema update initiated');
    
    // Wait for schema creation to complete
    await waitForSchemaCreation();
    
    return true;
  } catch (error) {
    console.error(`❌ Error updating schema: ${error.message}`);
    return false;
  }
}

// Function to wait for schema creation to complete
async function waitForSchemaCreation() {
  try {
    console.log('Waiting for schema update to complete...');
    
    let status = 'PROCESSING';
    let attempts = 0;
    const maxAttempts = 30; // Wait for up to 5 minutes (30 * 10 seconds)
    
    while (status === 'PROCESSING' && attempts < maxAttempts) {
      attempts++;
      
      // Wait for 10 seconds before checking status
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const command = new GetSchemaCreationStatusCommand({
        apiId: appSyncConfig.apiId
      });
      
      const response = await appSyncClient.send(command);
      status = response.status;
      
      console.log(`Schema update status: ${status} (attempt ${attempts}/${maxAttempts})`);
      
      if (status === 'SUCCESS') {
        console.log('✅ Schema update completed successfully');
        return true;
      } else if (status === 'FAILED') {
        console.error(`❌ Schema update failed: ${response.details}`);
        return false;
      }
    }
    
    if (status === 'PROCESSING') {
      console.error('❌ Schema update timed out');
      return false;
    }
    
    return status === 'SUCCESS';
  } catch (error) {
    console.error(`❌ Error checking schema update status: ${error.message}`);
    return false;
  }
}

// Main function
async function updateAppSyncSchema() {
  try {
    console.log('🚀 Starting AppSync schema update process...');
    
    // Prompt for configuration
    const shouldProceed = await promptForConfig();
    
    if (!shouldProceed) {
      console.log('Update cancelled by user');
      rl.close();
      return;
    }
    
    // Read schema file
    const schema = readSchemaFile();
    
    if (!schema) {
      console.error('Cannot proceed with update as schema file could not be read');
      rl.close();
      return;
    }
    
    // Update schema
    const updated = await updateSchema(schema);
    
    if (updated) {
      console.log('\n✅ AppSync schema update completed');
      console.log('Your AppSync API is now using the updated schema');
      console.log('\nDon\'t forget to run the setup-all-resolvers.js script to create resolvers for the new schema');
    } else {
      console.error('\n❌ AppSync schema update failed');
    }
  } catch (error) {
    console.error('\n❌ Error in schema update process:', error.message);
  } finally {
    rl.close();
  }
}

// Run the main function
updateAppSyncSchema(); 