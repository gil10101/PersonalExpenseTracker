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
  } catch (error) {
    console.error('❌ Error deploying query resolvers:', error);
  }
}

// Run the deployment function
deployQueryResolvers().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 