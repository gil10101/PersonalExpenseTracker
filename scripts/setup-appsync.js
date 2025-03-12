#!/usr/bin/env node

/**
 * This script sets up the entire AppSync API in one go
 * It uploads the schema and creates the resolvers
 */

const { spawn } = require('child_process');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to run a command and wait for it to complete
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running command: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, { stdio: 'inherit' });
    
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', error => {
      reject(error);
    });
  });
}

// Function to prompt for confirmation
async function promptForConfirmation(message) {
  return new Promise(resolve => {
    rl.question(`${message} (y/n): `, answer => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting AppSync API setup process...');
    
    // Step 1: Upload schema
    console.log('\n📝 Step 1: Upload GraphQL schema to AppSync');
    const uploadSchema = await promptForConfirmation('Do you want to upload the GraphQL schema?');
    
    if (uploadSchema) {
      await runCommand('node', ['./scripts/upload-schema.js']);
      
      // Wait for schema creation to complete
      const waitForSchema = await promptForConfirmation('Has the schema creation completed in the AWS AppSync console?');
      
      if (!waitForSchema) {
        console.log('Please wait for the schema creation to complete before proceeding.');
        console.log('You can check the status in the AWS AppSync console.');
        console.log('Run this script again when the schema creation is complete.');
        rl.close();
        return;
      }
    }
    
    // Step 2: Create resolvers
    console.log('\n📝 Step 2: Create resolvers for the GraphQL API');
    const createResolvers = await promptForConfirmation('Do you want to create the resolvers?');
    
    if (createResolvers) {
      await runCommand('node', ['./scripts/create-appsync-resolvers.js']);
    }
    
    // Step 3: Test the API
    console.log('\n📝 Step 3: Test the AppSync API');
    const testApi = await promptForConfirmation('Do you want to test the API?');
    
    if (testApi) {
      await runCommand('node', ['./scripts/test-appsync.js']);
    }
    
    console.log('\n✅ AppSync API setup process completed');
    console.log('You can now use the API in your application');
  } catch (error) {
    console.error('\n❌ Error in AppSync API setup process:', error.message);
  } finally {
    rl.close();
  }
}

// Run the main function
main(); 