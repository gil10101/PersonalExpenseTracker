import { executeMySQLQuery } from './sql-utils.js';
import { 
  createOrUpdateResolver, 
  loadTemplate, 
  appSyncConfig 
} from './resolver-utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define resolver templates directory
const templatesDir = path.join(__dirname, 'appsync-resolvers');

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
    return true;
  } catch (error) {
    console.error('❌ Error deploying database schema changes:', error);
    return false;
  }
}

/**
 * Deploy the updated expense date resolver
 */
async function deployExpenseDateResolver() {
  try {
    console.log('Deploying updated expense date resolver...');
    console.log(`Using AppSync API ID: ${appSyncConfig.apiId}`);
    console.log(`Using AppSync region: ${appSyncConfig.region}`);
    console.log(`Using data source: ${appSyncConfig.dataSourceName}`);
    
    // Paths to the resolver templates
    const requestTemplatePath = path.join(templatesDir, 'expense', 'date.request.vtl');
    const responseTemplatePath = path.join(templatesDir, 'expense', 'date.response.vtl');
    
    // Check if the templates exist
    if (!fs.existsSync(requestTemplatePath)) {
      throw new Error(`Request template not found at ${requestTemplatePath}`);
    }
    
    if (!fs.existsSync(responseTemplatePath)) {
      throw new Error(`Response template not found at ${responseTemplatePath}`);
    }
    
    // Load templates
    const requestTemplate = fs.readFileSync(requestTemplatePath, 'utf8');
    const responseTemplate = fs.readFileSync(responseTemplatePath, 'utf8');
    
    // Update the resolver for Expense.date
    console.log('Updating Expense.date resolver...');
    await createOrUpdateResolver('Expense', 'date', requestTemplate, responseTemplate);
    console.log('✅ Expense.date resolver updated successfully');
    
    // Also update the resolver for Mutation.createExpense
    console.log('Updating Mutation.createExpense resolver...');
    const mutationRequestTemplatePath = path.join(templatesDir, 'mutation', 'createExpense.request.vtl');
    const mutationResponseTemplatePath = path.join(templatesDir, 'mutation', 'createExpense.response.vtl');
    
    if (fs.existsSync(mutationRequestTemplatePath) && fs.existsSync(mutationResponseTemplatePath)) {
      const mutationRequestTemplate = fs.readFileSync(mutationRequestTemplatePath, 'utf8');
      const mutationResponseTemplate = fs.readFileSync(mutationResponseTemplatePath, 'utf8');
      await createOrUpdateResolver('Mutation', 'createExpense', mutationRequestTemplate, mutationResponseTemplate);
      console.log('✅ Mutation.createExpense resolver updated successfully');
    } else {
      console.log('⚠️ Mutation.createExpense templates not found, skipping update');
    }
    
    // Also update the resolver for Mutation.updateExpense
    console.log('Updating Mutation.updateExpense resolver...');
    const updateRequestTemplatePath = path.join(templatesDir, 'mutation', 'updateExpense.request.vtl');
    const updateResponseTemplatePath = path.join(templatesDir, 'mutation', 'updateExpense.response.vtl');
    
    if (fs.existsSync(updateRequestTemplatePath) && fs.existsSync(updateResponseTemplatePath)) {
      const updateRequestTemplate = fs.readFileSync(updateRequestTemplatePath, 'utf8');
      const updateResponseTemplate = fs.readFileSync(updateResponseTemplatePath, 'utf8');
      await createOrUpdateResolver('Mutation', 'updateExpense', updateRequestTemplate, updateResponseTemplate);
      console.log('✅ Mutation.updateExpense resolver updated successfully');
    } else {
      console.log('⚠️ Mutation.updateExpense templates not found, skipping update');
    }
    
    console.log('✅ All resolvers updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deploying resolvers:', error);
    return false;
  }
}

/**
 * Deploy the updated query resolvers
 */
async function deployQueryResolvers() {
  try {
    console.log('Deploying updated query resolvers...');
    console.log(`Using AppSync API ID: ${appSyncConfig.apiId}`);
    console.log(`Using AppSync region: ${appSyncConfig.region}`);
    console.log(`Using data source: ${appSyncConfig.dataSourceName}`);
    
    // Define the query resolvers to update
    const queryResolvers = [
      'getAllExpenses',
      'getExpensesByCategory',
      'getExpensesByDateRange',
      'getAllCategories',
      'getBudgetsByMonth'
    ];
    
    // Update each query resolver
    for (const fieldName of queryResolvers) {
      // Paths to the resolver templates
      const requestTemplatePath = path.join(templatesDir, 'query', `${fieldName}.request.vtl`);
      const responseTemplatePath = path.join(templatesDir, 'query', `${fieldName}.response.vtl`);
      
      // Check if the templates exist
      if (!fs.existsSync(requestTemplatePath)) {
        console.log(`⚠️ Request template not found at ${requestTemplatePath}, skipping`);
        continue;
      }
      
      if (!fs.existsSync(responseTemplatePath)) {
        console.log(`⚠️ Response template not found at ${responseTemplatePath}, skipping`);
        continue;
      }
      
      // Load templates
      const requestTemplate = fs.readFileSync(requestTemplatePath, 'utf8');
      const responseTemplate = fs.readFileSync(responseTemplatePath, 'utf8');
      
      // Update the resolver
      console.log(`Updating Query.${fieldName} resolver...`);
      await createOrUpdateResolver('Query', fieldName, requestTemplate, responseTemplate);
      console.log(`✅ Query.${fieldName} resolver updated successfully`);
    }
    
    console.log('✅ All query resolvers updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deploying query resolvers:', error);
    return false;
  }
}

/**
 * Deploy all changes
 */
async function deployAllChanges() {
  console.log('Starting deployment of all changes...');
  
  // First deploy database changes
  const dbSuccess = await deployDatabaseChanges();
  
  // Then deploy mutation resolver changes
  const mutationSuccess = await deployExpenseDateResolver();
  
  // Then deploy query resolver changes
  const querySuccess = await deployQueryResolvers();
  
  if (dbSuccess && mutationSuccess && querySuccess) {
    console.log('✅ All changes deployed successfully');
  } else {
    console.error('❌ Some deployments failed. Please check the logs above for details.');
    process.exit(1);
  }
}

// Run the deployment function
deployAllChanges().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 