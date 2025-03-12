#!/usr/bin/env node

/**
 * This script uploads the GraphQL schema to AppSync
 */

import { 
  AppSyncClient, 
  StartSchemaCreationCommand
} from '@aws-sdk/client-appsync';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get the directory name
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
  apiId: process.env.APPSYNC_API_ID || 'x5ujbpctlnbsxahehbvnt3ie3y',
  region: process.env.AWS_REGION || 'us-east-2',
  schemaPath: path.join(__dirname, 'schema-template.graphql')
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
  console.log(`Schema Path: ${appSyncConfig.schemaPath}\n`);
}

// Function to upload schema
async function uploadSchema() {
  try {
    console.log('Reading schema file...');
    
    if (!fs.existsSync(appSyncConfig.schemaPath)) {
      console.error(`❌ Schema file not found at ${appSyncConfig.schemaPath}`);
      return false;
    }
    
    const schemaContent = fs.readFileSync(appSyncConfig.schemaPath, 'utf8');
    console.log('Schema file read successfully');
    
    console.log('Uploading schema to AppSync...');
    
    const command = new StartSchemaCreationCommand({
      apiId: appSyncConfig.apiId,
      definition: Buffer.from(schemaContent)
    });
    
    const response = await appSyncClient.send(command);
    
    if (response.status === 'PROCESSING') {
      console.log('✅ Schema upload started successfully');
      console.log('Schema creation is being processed by AppSync');
      console.log('This may take a few minutes to complete');
      return true;
    } else {
      console.error(`❌ Schema upload failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error uploading schema:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting AppSync schema upload process...');
    
    // Prompt for configuration
    await promptForConfig();
    
    // Upload schema
    const success = await uploadSchema();
    
    if (success) {
      console.log('\n✅ Schema upload process initiated');
      console.log('Please check the AWS AppSync console to verify the schema was created successfully');
      console.log('After the schema is created, run the create-resolvers script to create the resolvers');
    } else {
      console.error('\n❌ Schema upload process failed');
    }
  } catch (error) {
    console.error('❌ Error in schema upload process:', error.message);
  } finally {
    rl.close();
  }
}

// Run the main function
main(); 