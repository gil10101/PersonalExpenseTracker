/**
 * This script prepares the Lambda function for deployment
 * It creates a ZIP file with the Lambda code and dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create a temporary directory for the Lambda package
const tempDir = path.join(__dirname, 'lambda-package');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Copy the Lambda resolver to the temp directory
const lambdaFile = path.join(__dirname, 'lambda-resolver.js');
const targetFile = path.join(tempDir, 'index.js');
fs.copyFileSync(lambdaFile, targetFile);

// Create a package.json for the Lambda
const packageJson = {
  "name": "expense-tracker-lambda",
  "version": "1.0.0",
  "description": "Lambda resolver for Personal Expense Tracker",
  "main": "index.js",
  "dependencies": {
    "mysql2": "^3.13.0"
  }
};

fs.writeFileSync(
  path.join(tempDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install --production', { cwd: tempDir, stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Create a README with deployment instructions
const readmeContent = `# Lambda Resolver Deployment

This package contains the Lambda resolver for the Personal Expense Tracker application.

## Deployment Instructions

1. Upload this entire directory as a ZIP file to AWS Lambda
2. Configure the following environment variables:
   - DB_HOST: database-2.cluster-c26a6o2q3bp.us-east-1.rds.amazonaws.com
   - DB_USERNAME: admin
   - DB_PASSWORD: your_password_here
   - DB_NAME: database-2
   - DB_PORT: 3306

3. Configure the Lambda function to run in the same VPC as your Aurora Serverless database
4. Ensure the security group allows the Lambda function to access the database

## Testing the Lambda

You can test the Lambda with the following test event:

\`\`\`json
{
  "field": "getAllCategories",
  "arguments": {}
}
\`\`\`

This should return the list of categories from your database.
`;

fs.writeFileSync(path.join(tempDir, 'README.md'), readmeContent);

console.log('Lambda package prepared successfully!');
console.log(`Package location: ${tempDir}`);
console.log('To deploy:');
console.log('1. Zip the contents of this directory');
console.log('2. Upload the ZIP file to AWS Lambda');
console.log('3. Configure the environment variables as specified in the README'); 