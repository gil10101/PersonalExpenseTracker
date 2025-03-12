#!/usr/bin/env node

/**
 * This script installs the necessary dependencies for the database migration scripts
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Function to check if a package is installed
function isPackageInstalled(packageName) {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    return (
      (packageJson.dependencies && packageJson.dependencies[packageName]) ||
      (packageJson.devDependencies && packageJson.devDependencies[packageName])
    );
  } catch (error) {
    console.error('Error checking package.json:', error.message);
    return false;
  }
}

// Main function
async function installDependencies() {
  try {
    console.log('🚀 Installing dependencies for database migration scripts...');
    
    // List of required packages
    const requiredPackages = [
      '@aws-sdk/client-rds',
      '@aws-sdk/client-appsync',
      'dotenv'
    ];
    
    // Check which packages need to be installed
    const packagesToInstall = requiredPackages.filter(pkg => !isPackageInstalled(pkg));
    
    if (packagesToInstall.length === 0) {
      console.log('✅ All required packages are already installed');
      return;
    }
    
    console.log(`Installing packages: ${packagesToInstall.join(', ')}`);
    
    // Install the packages
    await runCommand('npm', ['install', '--save-dev', ...packagesToInstall]);
    
    console.log('\n✅ Dependencies installed successfully');
    console.log('You can now run the migration scripts:');
    console.log('1. node scripts/migrate-aurora-region.js');
    console.log('2. node scripts/update-appsync-datasource.js');
  } catch (error) {
    console.error('\n❌ Error installing dependencies:', error.message);
  }
}

// Run the main function
installDependencies(); 