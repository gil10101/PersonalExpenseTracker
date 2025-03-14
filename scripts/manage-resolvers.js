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

// Define resolver types and fields
const resolvers = {
  Query: [
    'getExpense',
    'getAllExpenses',
    'getExpensesByCategory',
    'getExpensesByDate',
    'getCategory',
    'getAllCategories',
    'getBudget',
    'getAllBudgets',
    'getPost',
    'getAllPosts'
  ],
  Mutation: [
    'createExpense',
    'updateExpense',
    'deleteExpense',
    'createCategory',
    'updateCategory',
    'deleteCategory',
    'createBudget',
    'updateBudget',
    'deleteBudget',
    'createPost',
    'updatePost',
    'deletePost'
  ]
};

/**
 * Update a specific resolver
 * @param {string} typeName - The GraphQL type name
 * @param {string} fieldName - The GraphQL field name
 * @returns {Promise<void>}
 */
async function updateSpecificResolver(typeName, fieldName) {
  try {
    console.log(`Updating resolver for ${typeName}.${fieldName}...`);
    
    // Determine template paths
    const typeDir = typeName.toLowerCase();
    const fieldDir = fieldName.toLowerCase();
    
    let requestTemplatePath;
    let responseTemplatePath;
    
    // Check if type-specific template exists
    const typeSpecificDir = path.join(templatesDir, typeDir);
    if (fs.existsSync(typeSpecificDir)) {
      const typeSpecificRequestPath = path.join(typeSpecificDir, `${fieldName}.request.vtl`);
      const typeSpecificResponsePath = path.join(typeSpecificDir, `${fieldName}.response.vtl`);
      
      if (fs.existsSync(typeSpecificRequestPath) && fs.existsSync(typeSpecificResponsePath)) {
        requestTemplatePath = typeSpecificRequestPath;
        responseTemplatePath = typeSpecificResponsePath;
      }
    }
    
    // If type-specific template doesn't exist, use generic template
    if (!requestTemplatePath || !responseTemplatePath) {
      const genericDir = path.join(templatesDir, typeName.toLowerCase());
      requestTemplatePath = path.join(genericDir, 'default.request.vtl');
      responseTemplatePath = path.join(genericDir, 'default.response.vtl');
    }
    
    // Load templates
    const requestTemplate = loadTemplate(requestTemplatePath);
    const responseTemplate = loadTemplate(responseTemplatePath);
    
    // Update resolver
    await createOrUpdateResolver(typeName, fieldName, requestTemplate, responseTemplate);
    console.log(`Resolver for ${typeName}.${fieldName} updated successfully`);
  } catch (error) {
    console.error(`Error updating resolver for ${typeName}.${fieldName}:`, error);
  }
}

/**
 * Update all resolvers
 * @returns {Promise<void>}
 */
async function updateAllResolvers() {
  try {
    console.log('Updating all resolvers...');
    console.log(`Using AppSync API ID: ${appSyncConfig.apiId}`);
    console.log(`Using AppSync region: ${appSyncConfig.region}`);
    console.log(`Using data source: ${appSyncConfig.dataSourceName}`);
    
    // Update Query resolvers
    for (const fieldName of resolvers.Query) {
      await updateSpecificResolver('Query', fieldName);
    }
    
    // Update Mutation resolvers
    for (const fieldName of resolvers.Mutation) {
      await updateSpecificResolver('Mutation', fieldName);
    }
    
    console.log('All resolvers updated successfully');
  } catch (error) {
    console.error('Error updating all resolvers:', error);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // No arguments, update all resolvers
    await updateAllResolvers();
  } else if (args.length === 2) {
    // Two arguments: typeName and fieldName
    const [typeName, fieldName] = args;
    await updateSpecificResolver(typeName, fieldName);
  } else {
    console.error('Invalid arguments. Usage: node manage-resolvers.js [typeName fieldName]');
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 