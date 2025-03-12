#!/usr/bin/env node

/**
 * AWS Amplify Configuration Checker
 * 
 * This script checks your AWS Amplify configuration and environment variables
 * to help troubleshoot common issues with AWS Amplify v6.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Check if chalk is installed, if not, provide instructions
try {
  require.resolve('chalk');
} catch (e) {
  console.log('The "chalk" package is required for colored output.');
  console.log('Please install it using: npm install chalk');
  console.log('Then run this script again.');
  process.exit(1);
}

console.log(chalk.blue.bold('AWS Amplify Configuration Checker'));
console.log(chalk.blue('==============================\n'));

// Check environment variables
console.log(chalk.yellow.bold('1. Checking Environment Variables:'));

const requiredEnvVars = [
  { name: 'VITE_GRAPHQL_ENDPOINT', description: 'AppSync GraphQL Endpoint' },
  { name: 'VITE_GRAPHQL_API_KEY', description: 'AppSync API Key' },
  { name: 'VITE_USER_POOL_ID', description: 'Cognito User Pool ID' },
  { name: 'VITE_USER_POOL_CLIENT_ID', description: 'Cognito User Pool Client ID' },
  { name: 'VITE_IDENTITY_POOL_ID', description: 'Cognito Identity Pool ID' },
  { name: 'VITE_AWS_REGION', description: 'AWS Region' }
];

let envErrors = 0;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar.name];
  if (!value) {
    console.log(chalk.red(`❌ ${envVar.name} is missing`));
    envErrors++;
  } else {
    const displayValue = envVar.name.includes('KEY') || envVar.name.includes('SECRET') 
      ? `${value.substring(0, 5)}...${value.substring(value.length - 3)}` 
      : value;
    console.log(chalk.green(`✓ ${envVar.name} is set: ${displayValue}`));
  }
});

if (envErrors > 0) {
  console.log(chalk.red(`\n⚠️ Found ${envErrors} environment variable issues. Please check your .env file.`));
} else {
  console.log(chalk.green('\n✓ All required environment variables are set.'));
}

// Check App.jsx for Amplify configuration
console.log(chalk.yellow.bold('\n2. Checking Amplify Configuration in App.jsx:'));

const appJsxPath = path.join(process.cwd(), 'src', 'App.jsx');

try {
  if (fs.existsSync(appJsxPath)) {
    const appJsxContent = fs.readFileSync(appJsxPath, 'utf8');
    
    // Check for Amplify import
    const hasAmplifyImport = appJsxContent.includes('import { Amplify }') || 
                             appJsxContent.includes('import Amplify');
    
    // Check for Amplify.configure
    const hasAmplifyConfig = appJsxContent.includes('Amplify.configure');
    
    // Check for API configuration
    const hasApiConfig = appJsxContent.includes('API:') || 
                         appJsxContent.includes('api:');
    
    // Check for Auth configuration
    const hasAuthConfig = appJsxContent.includes('Auth:') || 
                          appJsxContent.includes('auth:');
    
    if (hasAmplifyImport) {
      console.log(chalk.green('✓ Amplify import found'));
    } else {
      console.log(chalk.red('❌ Amplify import not found. Add: import { Amplify } from "aws-amplify";'));
    }
    
    if (hasAmplifyConfig) {
      console.log(chalk.green('✓ Amplify.configure() found'));
    } else {
      console.log(chalk.red('❌ Amplify.configure() not found. Make sure to configure Amplify.'));
    }
    
    if (hasApiConfig) {
      console.log(chalk.green('✓ API configuration found'));
    } else {
      console.log(chalk.red('❌ API configuration not found. Add API configuration to Amplify.configure().'));
    }
    
    if (hasAuthConfig) {
      console.log(chalk.green('✓ Auth configuration found'));
    } else {
      console.log(chalk.red('❌ Auth configuration not found. Add Auth configuration to Amplify.configure().'));
    }
  } else {
    console.log(chalk.red(`❌ App.jsx not found at ${appJsxPath}`));
  }
} catch (error) {
  console.log(chalk.red(`❌ Error checking App.jsx: ${error.message}`));
}

// Check for AWS Amplify dependencies
console.log(chalk.yellow.bold('\n3. Checking AWS Amplify Dependencies:'));

try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const amplifyVersion = dependencies['aws-amplify'];
    if (amplifyVersion) {
      const isV6 = amplifyVersion.startsWith('^6') || amplifyVersion.startsWith('6');
      if (isV6) {
        console.log(chalk.green(`✓ aws-amplify version ${amplifyVersion} (v6 confirmed)`));
      } else {
        console.log(chalk.yellow(`⚠️ aws-amplify version ${amplifyVersion} (not v6, consider upgrading)`));
      }
    } else {
      console.log(chalk.red('❌ aws-amplify not found in dependencies'));
    }
  } else {
    console.log(chalk.red(`❌ package.json not found at ${packageJsonPath}`));
  }
} catch (error) {
  console.log(chalk.red(`❌ Error checking package.json: ${error.message}`));
}

// Check for GraphQL queries and mutations
console.log(chalk.yellow.bold('\n4. Checking GraphQL Queries and Mutations:'));

const graphqlPath = path.join(process.cwd(), 'src', 'graphql');
try {
  if (fs.existsSync(graphqlPath)) {
    const files = fs.readdirSync(graphqlPath);
    const queriesFile = files.find(file => file.toLowerCase().includes('queries'));
    const mutationsFile = files.find(file => file.toLowerCase().includes('mutations'));
    
    if (queriesFile) {
      console.log(chalk.green(`✓ GraphQL queries found: ${queriesFile}`));
    } else {
      console.log(chalk.yellow('⚠️ No GraphQL queries file found'));
    }
    
    if (mutationsFile) {
      console.log(chalk.green(`✓ GraphQL mutations found: ${mutationsFile}`));
    } else {
      console.log(chalk.yellow('⚠️ No GraphQL mutations file found'));
    }
  } else {
    console.log(chalk.yellow('⚠️ GraphQL directory not found at src/graphql'));
  }
} catch (error) {
  console.log(chalk.red(`❌ Error checking GraphQL files: ${error.message}`));
}

// Check for API usage in components
console.log(chalk.yellow.bold('\n5. Checking API Usage in Components:'));

const componentsPath = path.join(process.cwd(), 'src', 'components');
let oldApiUsage = false;

try {
  if (fs.existsSync(componentsPath)) {
    const checkComponentFiles = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          checkComponentFiles(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Check for old API import
          if (content.includes('import { API') || content.includes('import {API')) {
            console.log(chalk.red(`❌ Old API import found in ${filePath}`));
            oldApiUsage = true;
          }
          
          // Check for old graphqlOperation import
          if (content.includes('graphqlOperation')) {
            console.log(chalk.red(`❌ Old graphqlOperation usage found in ${filePath}`));
            oldApiUsage = true;
          }
          
          // Check for old API.graphql usage
          if (content.includes('API.graphql')) {
            console.log(chalk.red(`❌ Old API.graphql usage found in ${filePath}`));
            oldApiUsage = true;
          }
          
          // Check for new generateClient import
          if (content.includes('generateClient')) {
            console.log(chalk.green(`✓ New generateClient usage found in ${filePath}`));
          }
        }
      });
    };
    
    checkComponentFiles(componentsPath);
    
    if (!oldApiUsage) {
      console.log(chalk.green('✓ No old API usage patterns found'));
    }
  } else {
    console.log(chalk.yellow(`⚠️ Components directory not found at ${componentsPath}`));
  }
} catch (error) {
  console.log(chalk.red(`❌ Error checking component files: ${error.message}`));
}

// Summary
console.log(chalk.blue.bold('\nSummary:'));
console.log(chalk.blue('========\n'));

if (envErrors > 0 || oldApiUsage) {
  console.log(chalk.yellow('⚠️ Some issues were found with your AWS Amplify configuration.'));
  console.log(chalk.yellow('Please check the details above and refer to AMPLIFY_TROUBLESHOOTING.md for solutions.'));
} else {
  console.log(chalk.green('✓ Your AWS Amplify configuration looks good!'));
  console.log(chalk.green('If you are still experiencing issues, please refer to AMPLIFY_TROUBLESHOOTING.md.'));
}

console.log('\n' + chalk.blue('For more information, visit:'));
console.log(chalk.blue('https://docs.amplify.aws/react/build-a-backend/graphqlapi/query-data/')); 