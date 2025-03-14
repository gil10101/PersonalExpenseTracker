import { executeMySQLQuery } from './sql-utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deploy the database schema changes
 */
async function deployDatabaseChanges() {
  try {
    console.log('Deploying database schema changes...');
    
    // Path to the SQL script
    const sqlScriptPath = path.join(__dirname, 'fix-date-column.sql');
    
    // Check if the script exists
    if (!fs.existsSync(sqlScriptPath)) {
      throw new Error(`SQL script not found at ${sqlScriptPath}`);
    }
    
    // Read the SQL script
    const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0 && !statement.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing SQL: ${statement}`);
      try {
        const result = await executeMySQLQuery(statement);
        console.log('Result:', result);
      } catch (error) {
        // If the error is about the index already existing, we can ignore it
        if (error.message.includes('Duplicate key name')) {
          console.log('Index already exists, continuing...');
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ Database schema changes deployed successfully');
  } catch (error) {
    console.error('❌ Error deploying database schema changes:', error);
  }
}

// Run the deployment function
deployDatabaseChanges().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 