/**
 * This script runs all the setup steps in sequence
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to execute a command and wait for user confirmation
function executeStep(command, description) {
  return new Promise((resolve) => {
    console.log(`\n=== ${description} ===\n`);
    
    rl.question(`Press Enter to run: ${command} (or type 'skip' to skip this step): `, (answer) => {
      if (answer.toLowerCase() === 'skip') {
        console.log(`Skipping: ${command}`);
        resolve();
        return;
      }
      
      try {
        console.log(`Running: ${command}`);
        execSync(command, { stdio: 'inherit' });
        console.log(`\n✅ ${description} completed successfully!\n`);
      } catch (error) {
        console.error(`\n❌ Error during ${description}:`, error.message);
        console.log('Continuing with next step...');
      }
      
      rl.question('Press Enter to continue to the next step...', () => {
        resolve();
      });
    });
  });
}

// Main function to run all steps
async function runAllSteps() {
  console.log('=== Personal Expense Tracker Setup ===');
  console.log('This script will guide you through setting up your database and AppSync API.');
  console.log('You can skip any step by typing "skip" when prompted.');
  
  try {
    // Step 1: Test database connection
    await executeStep('npm run test-db', 'Test database connection');
    
    // Step 2: Configure security groups (guidance only)
    await executeStep('npm run security-guide', 'Security group configuration guidance');
    
    // Step 3: Set up database tables
    await executeStep('npm run setup-db', 'Create database tables');
    
    // Step 4: Prepare Lambda function
    await executeStep('npm run prepare-lambda', 'Prepare Lambda function for deployment');
    
    // Step 5: Generate AppSync resolver templates
    await executeStep('npm run generate-resolvers', 'Generate AppSync resolver templates');
    
    console.log('\n=== Setup Complete ===');
    console.log('Next steps:');
    console.log('1. Deploy the Lambda function from scripts/lambda-package');
    console.log('2. Configure your AppSync resolvers using the templates in scripts/appsync-resolvers');
    console.log('3. Test your setup by running a GraphQL query in the AppSync console');
    console.log('\nRefer to DB_SETUP.md for detailed instructions on each step.');
    
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    rl.close();
  }
}

// This file now serves as the main entry point for all setup operations
// It incorporates functionality from:
// - setup-database.js
// - setup-appsync.js
// - configure-security-group.js
// - prepare-lambda.js

runAllSteps(); 