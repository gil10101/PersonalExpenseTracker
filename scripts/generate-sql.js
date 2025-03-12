#!/usr/bin/env node

/**
 * This script generates the SQL commands needed to set up the database and tables
 * You can run these commands in the AWS RDS Query Editor
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function generateSql() {
  try {
    // Get the database name from environment variables
    const dbName = process.env.DB_NAME || 'expense_tracker';
    
    // Read the SQL file with table definitions
    const sqlFilePath = path.join(__dirname, 'create_tables.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    // Generate the SQL commands
    let sqlCommands = `-- Create the database\nCREATE DATABASE IF NOT EXISTS ${dbName};\n\n`;
    sqlCommands += `-- Use the database\nUSE ${dbName};\n\n`;
    sqlCommands += `-- Create tables\n${sqlContent}`;
    
    // Write the SQL commands to a file
    const outputFilePath = path.join(__dirname, 'setup-database.sql');
    await fs.writeFile(outputFilePath, sqlCommands);
    
    console.log(`SQL commands generated and saved to ${outputFilePath}`);
    console.log('\nInstructions:');
    console.log('1. Go to the AWS RDS console: https://console.aws.amazon.com/rds/');
    console.log('2. Select your database cluster');
    console.log('3. Click on "Query Editor"');
    console.log('4. Connect to your database using your credentials');
    console.log('5. Copy and paste the SQL commands from the generated file');
    console.log('6. Run the commands');
    
    // Also print the SQL commands to the console
    console.log('\nSQL Commands:');
    console.log(sqlCommands);
    
    return {
      success: true,
      message: 'SQL commands generated successfully'
    };
  } catch (error) {
    console.error('Error generating SQL commands:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the function if this file is executed directly
if (process.argv[1].includes('generate-sql.js')) {
  generateSql()
    .then(result => {
      if (result.success) {
        console.log('✅ SQL commands generated successfully!');
        process.exit(0);
      } else {
        console.error('❌ SQL commands generation failed!');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error during SQL commands generation:', err);
      process.exit(1);
    });
}

export default generateSql; 