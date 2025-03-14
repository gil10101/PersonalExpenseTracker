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
  } catch (error) {
    console.error('❌ Error deploying resolvers:', error);
  }
}

// Run the deployment function
deployExpenseDateResolver().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 