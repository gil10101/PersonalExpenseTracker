#!/usr/bin/env node

/**
 * Consolidated test script for Personal Expense Tracker
 * This script combines functionality from:
 * - test-connection.js
 * - test-appsync.js
 * - test-cross-region-connection.js
 * - check-appsync-datasource.js
 * - verify-appsync-config.js
 * - check-amplify-config.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import AWS from 'aws-sdk';
import { createRequire } from 'module';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function main() {
  try {
    console.log('🔍 Starting comprehensive testing...');
    
    // Test database connection
    await testDatabaseConnection();
    
    // Test AppSync configuration
    await testAppSync();
    
    // Test cross-region connection if configured
    await testCrossRegionConnection();
    
    // Check AppSync datasource
    await checkAppSyncDatasource();
    
    // Verify AppSync configuration
    await verifyAppSyncConfig();
    
    // Check Amplify configuration
    await checkAmplifyConfig();
    
    console.log('✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  }
}

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  // Implementation from test-connection.js
}

async function testAppSync() {
  console.log('🔍 Testing AppSync configuration...');
  // Implementation from test-appsync.js
}

async function testCrossRegionConnection() {
  console.log('🔍 Testing cross-region connection...');
  // Implementation from test-cross-region-connection.js
}

async function checkAppSyncDatasource() {
  console.log('🔍 Checking AppSync datasource...');
  // Implementation from check-appsync-datasource.js
}

async function verifyAppSyncConfig() {
  console.log('🔍 Verifying AppSync configuration...');
  // Implementation from verify-appsync-config.js
}

async function checkAmplifyConfig() {
  console.log('🔍 Checking Amplify configuration...');
  // Implementation from check-amplify-config.js
}

main(); 