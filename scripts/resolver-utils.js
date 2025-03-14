import { 
  AppSyncClient, 
  UpdateResolverCommand,
  GetResolverCommand,
  CreateResolverCommand
} from '@aws-sdk/client-appsync';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// AppSync configuration
const appSyncConfig = {
  apiId: process.env.APPSYNC_API_ID || 'x5ujbpctlnbsxahehbvnt3ie3y',
  region: process.env.AWS_REGION || 'us-east-2',
  dataSourceName: process.env.APPSYNC_DATASOURCE_NAME || 'ExpenseDB'
};

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

/**
 * Get a resolver from AppSync
 * @param {string} typeName - The GraphQL type name
 * @param {string} fieldName - The GraphQL field name
 * @returns {Promise<Object>} - The resolver or null if not found
 */
export async function getResolver(typeName, fieldName) {
  try {
    const params = {
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName
    };
    
    const command = new GetResolverCommand(params);
    const response = await appSyncClient.send(command);
    return response;
  } catch (error) {
    if (error.name === 'NotFoundException') {
      return null;
    }
    throw error;
  }
}

/**
 * Create a resolver in AppSync
 * @param {string} typeName - The GraphQL type name
 * @param {string} fieldName - The GraphQL field name
 * @param {string} requestTemplate - The request mapping template
 * @param {string} responseTemplate - The response mapping template
 * @returns {Promise<Object>} - The created resolver
 */
export async function createResolver(typeName, fieldName, requestTemplate, responseTemplate) {
  try {
    const params = {
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName,
      dataSourceName: appSyncConfig.dataSourceName,
      requestMappingTemplate: requestTemplate,
      responseMappingTemplate: responseTemplate
    };
    
    const command = new CreateResolverCommand(params);
    const response = await appSyncClient.send(command);
    return response;
  } catch (error) {
    console.error(`Error creating resolver for ${typeName}.${fieldName}:`, error);
    throw error;
  }
}

/**
 * Update a resolver in AppSync
 * @param {string} typeName - The GraphQL type name
 * @param {string} fieldName - The GraphQL field name
 * @param {string} requestTemplate - The request mapping template
 * @param {string} responseTemplate - The response mapping template
 * @returns {Promise<Object>} - The updated resolver
 */
export async function updateResolver(typeName, fieldName, requestTemplate, responseTemplate) {
  try {
    const params = {
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName,
      dataSourceName: appSyncConfig.dataSourceName,
      requestMappingTemplate: requestTemplate,
      responseMappingTemplate: responseTemplate
    };
    
    const command = new UpdateResolverCommand(params);
    const response = await appSyncClient.send(command);
    return response;
  } catch (error) {
    console.error(`Error updating resolver for ${typeName}.${fieldName}:`, error);
    throw error;
  }
}

/**
 * Create or update a resolver in AppSync
 * @param {string} typeName - The GraphQL type name
 * @param {string} fieldName - The GraphQL field name
 * @param {string} requestTemplate - The request mapping template
 * @param {string} responseTemplate - The response mapping template
 * @returns {Promise<Object>} - The created or updated resolver
 */
export async function createOrUpdateResolver(typeName, fieldName, requestTemplate, responseTemplate) {
  try {
    // Check if resolver exists
    const existingResolver = await getResolver(typeName, fieldName);
    
    if (existingResolver) {
      console.log(`Updating existing resolver for ${typeName}.${fieldName}`);
      return await updateResolver(typeName, fieldName, requestTemplate, responseTemplate);
    } else {
      console.log(`Creating new resolver for ${typeName}.${fieldName}`);
      return await createResolver(typeName, fieldName, requestTemplate, responseTemplate);
    }
  } catch (error) {
    console.error(`Error creating/updating resolver for ${typeName}.${fieldName}:`, error);
    throw error;
  }
}

/**
 * Load a template file
 * @param {string} templatePath - The path to the template file
 * @returns {string} - The template content
 */
export function loadTemplate(templatePath) {
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error loading template from ${templatePath}:`, error);
    throw error;
  }
}

export { appSyncConfig, appSyncClient }; 