#!/usr/bin/env node

/**
 * This script automates the setup of all AppSync resolvers using Lambda as a data source
 * It configures both operation resolvers (Query/Mutation) and field resolvers
 * Specifically designed to work with a Lambda function that acts as a bridge to MySQL
 */

import { 
  AppSyncClient, 
  CreateResolverCommand,
  GetDataSourceCommand,
  ListTypesCommand,
  GetResolverCommand,
  UpdateResolverCommand
} from '@aws-sdk/client-appsync';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// AppSync configuration
const appSyncConfig = {
  apiId: process.env.APPSYNC_API_ID || '',
  region: process.env.AWS_REGION || 'us-east-2',
  dataSourceName: process.env.LAMBDA_DATASOURCE_NAME || 'lambda_data'
};

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// Lambda request mapping templates for all operations
const requestMappingTemplate = `{
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {
    "field": "$context.info.fieldName",
    "arguments": $util.toJson($context.arguments)
  }
}`;

// Lambda response mapping template for all operations
const responseMappingTemplate = `#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end

$util.toJson($ctx.result)`;

// Add this helper function at the top of the file, after the imports
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to prompt for required configuration
async function promptForConfig() {
  if (!appSyncConfig.apiId) {
    appSyncConfig.apiId = await new Promise(resolve => {
      rl.question('Enter your AppSync API ID: ', answer => resolve(answer));
    });
  }

  if (!appSyncConfig.dataSourceName) {
    appSyncConfig.dataSourceName = await new Promise(resolve => {
      rl.question('Enter your Lambda data source name (default: lambda_data): ', answer => {
        return resolve(answer || 'lambda_data');
      });
    });
  }

  console.log('\nUsing the following configuration:');
  console.log(`API ID: ${appSyncConfig.apiId}`);
  console.log(`Region: ${appSyncConfig.region}`);
  console.log(`Data Source: ${appSyncConfig.dataSourceName}\n`);
}

// Function to verify the data source exists
async function verifyDataSource() {
  try {
    console.log(`Verifying data source: ${appSyncConfig.dataSourceName}`);
    
    const command = new GetDataSourceCommand({
      apiId: appSyncConfig.apiId,
      name: appSyncConfig.dataSourceName
    });
    
    const response = await appSyncClient.send(command);
    
    if (response.dataSource) {
      console.log('✅ Data source verified');
      return true;
    } else {
      console.error('❌ Data source not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying data source:', error.message);
    return false;
  }
}

// Function to get schema types
async function getSchemaTypes() {
  try {
    console.log('Fetching schema types...');
    
    const command = new ListTypesCommand({
      apiId: appSyncConfig.apiId,
      format: 'SDL'
    });
    
    const response = await appSyncClient.send(command);
    
    if (response.types) {
      console.log(`✅ Found ${response.types.length} types in schema`);
      
      // Process the types to extract fields
      const processedTypes = response.types.map(type => {
        // Extract fields from the type definition
        const fieldsMatch = type.definition.match(/type\s+\w+\s*{([^}]*)}/s);
        const fields = [];
        
        if (fieldsMatch && fieldsMatch[1]) {
          const fieldLines = fieldsMatch[1].trim().split('\n');
          
          for (const line of fieldLines) {
            const trimmedLine = line.trim();
            // Skip comments and empty lines
            if (trimmedLine && !trimmedLine.startsWith('#')) {
              // Extract field name (everything before the first colon or parenthesis)
              const fieldNameMatch = trimmedLine.match(/^(\w+)/);
              if (fieldNameMatch) {
                fields.push({
                  name: fieldNameMatch[1],
                  definition: trimmedLine
                });
              }
            }
          }
        }
        
        return {
          ...type,
          fields
        };
      });
      
      return processedTypes;
    } else {
      console.error('❌ No types found in schema');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching schema types:', error.message);
    return [];
  }
}

// Function to check if a resolver exists
async function resolverExists(typeName, fieldName) {
  try {
    const command = new GetResolverCommand({
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName
    });
    
    const response = await appSyncClient.send(command);
    return !!response.resolver;
  } catch (error) {
    // If the error is because the resolver doesn't exist, return false
    if (error.name === 'NotFoundException') {
      return false;
    }
    // For other errors, log and return false
    console.error(`❌ Error checking if resolver exists for ${typeName}.${fieldName}:`, error.message);
    return false;
  }
}

// Function to create an operation resolver with Lambda
async function createOperationResolver(typeName, fieldName) {
  try {
    console.log(`Creating operation resolver for ${typeName}.${fieldName}...`);
    
    const command = new CreateResolverCommand({
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName,
      dataSourceName: appSyncConfig.dataSourceName,
      requestMappingTemplate,
      responseMappingTemplate
    });
    
    await appSyncClient.send(command);
    console.log(`✅ Operation resolver created for ${typeName}.${fieldName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating operation resolver for ${typeName}.${fieldName}:`, error.message);
    return false;
  }
}

// Function to update an existing operation resolver
async function updateOperationResolver(typeName, fieldName) {
  try {
    console.log(`Updating operation resolver for ${typeName}.${fieldName}...`);
    
    const command = new UpdateResolverCommand({
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName,
      dataSourceName: appSyncConfig.dataSourceName,
      requestMappingTemplate,
      responseMappingTemplate
    });
    
    await appSyncClient.send(command);
    console.log(`✅ Operation resolver updated for ${typeName}.${fieldName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating operation resolver for ${typeName}.${fieldName}:`, error.message);
    return false;
  }
}

// Function to create or update an operation resolver
async function createOrUpdateOperationResolver(typeName, fieldName) {
  try {
    // Check if resolver exists
    const exists = await resolverExists(typeName, fieldName);
    
    // Add a delay to prevent Lambda throttling
    await sleep(1000); // Wait 1 second between operations
    
    if (exists) {
      // Update existing resolver
      return await updateOperationResolver(typeName, fieldName);
    } else {
      // Create new resolver
      return await createOperationResolver(typeName, fieldName);
    }
  } catch (error) {
    if (error.name === 'TooManyRequestsException') {
      console.log(`⚠️ Rate limit hit, waiting 5 seconds before retrying ${typeName}.${fieldName}...`);
      await sleep(5000); // Wait 5 seconds when hitting rate limits
      return await createOrUpdateOperationResolver(typeName, fieldName); // Retry
    }
    console.error(`❌ Error creating/updating operation resolver for ${typeName}.${fieldName}:`, error.message);
    return false;
  }
}

// Function to create a field resolver for Lambda data source
async function createFieldResolver(typeName, fieldName) {
  try {
    console.log(`Creating field resolver for ${typeName}.${fieldName}...`);
    
    // Create the request mapping template for field resolvers with Lambda
    const fieldRequestMappingTemplate = `{
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {
    "field": "${fieldName}",
    "source": $util.toJson($context.source),
    "arguments": $util.toJson($context.arguments)
  }
}`;
    
    const command = new CreateResolverCommand({
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName,
      dataSourceName: appSyncConfig.dataSourceName,
      requestMappingTemplate: fieldRequestMappingTemplate,
      responseMappingTemplate
    });
    
    await appSyncClient.send(command);
    console.log(`✅ Field resolver created for ${typeName}.${fieldName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating field resolver for ${typeName}.${fieldName}:`, error.message);
    return false;
  }
}

// Function to update an existing field resolver
async function updateFieldResolver(typeName, fieldName) {
  try {
    console.log(`Updating field resolver for ${typeName}.${fieldName}...`);
    
    // Create the request mapping template for field resolvers with Lambda
    const fieldRequestMappingTemplate = `{
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {
    "field": "${fieldName}",
    "source": $util.toJson($context.source),
    "arguments": $util.toJson($context.arguments)
  }
}`;
    
    const command = new UpdateResolverCommand({
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName,
      dataSourceName: appSyncConfig.dataSourceName,
      requestMappingTemplate: fieldRequestMappingTemplate,
      responseMappingTemplate
    });
    
    await appSyncClient.send(command);
    console.log(`✅ Field resolver updated for ${typeName}.${fieldName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating field resolver for ${typeName}.${fieldName}:`, error.message);
    return false;
  }
}

// Function to create or update a field resolver
async function createOrUpdateFieldResolver(typeName, fieldName) {
  try {
    // Check if resolver exists
    const exists = await resolverExists(typeName, fieldName);
    
    // Add a delay to prevent Lambda throttling
    await sleep(1000); // Wait 1 second between operations
    
    if (exists) {
      // Update existing resolver
      return await updateFieldResolver(typeName, fieldName);
    } else {
      // Create new resolver
      return await createFieldResolver(typeName, fieldName);
    }
  } catch (error) {
    if (error.name === 'TooManyRequestsException') {
      console.log(`⚠️ Rate limit hit, waiting 5 seconds before retrying ${typeName}.${fieldName}...`);
      await sleep(5000); // Wait 5 seconds when hitting rate limits
      return await createOrUpdateFieldResolver(typeName, fieldName); // Retry
    }
    console.error(`❌ Error creating/updating field resolver for ${typeName}.${fieldName}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting AppSync Lambda resolver setup process...');
    
    // Prompt for configuration
    await promptForConfig();
    
    // Verify data source
    const dataSourceExists = await verifyDataSource();
    if (!dataSourceExists) {
      console.error('❌ Cannot proceed without a valid Lambda data source');
      rl.close();
      return;
    }
    
    // Get schema types
    const schemaTypes = await getSchemaTypes();
    if (schemaTypes.length === 0) {
      console.error('❌ Cannot proceed without schema types');
      rl.close();
      return;
    }
    
    // Find all relevant types
    const queryType = schemaTypes.find(type => type.name === 'Query');
    const mutationType = schemaTypes.find(type => type.name === 'Mutation');
    const expenseType = schemaTypes.find(type => type.name === 'Expense');
    const categoryType = schemaTypes.find(type => type.name === 'Category');
    const budgetType = schemaTypes.find(type => type.name === 'Budget');
    const userType = schemaTypes.find(type => type.name === 'User');
    const postType = schemaTypes.find(type => type.name === 'Post');
    
    // Setup operation resolvers (Query and Mutation)
    if (queryType && mutationType) {
      // Create resolvers for Query fields
      console.log('\n📝 Setting up Query resolvers...');
      if (queryType.fields && Array.isArray(queryType.fields)) {
        for (const field of queryType.fields) {
          const fieldName = field.name;
          await createOrUpdateOperationResolver('Query', fieldName);
        }
      } else {
        console.error('❌ No fields found in Query type');
      }
      
      // Create resolvers for Mutation fields
      console.log('\n📝 Setting up Mutation resolvers...');
      if (mutationType.fields && Array.isArray(mutationType.fields)) {
        for (const field of mutationType.fields) {
          const fieldName = field.name;
          await createOrUpdateOperationResolver('Mutation', fieldName);
        }
      } else {
        console.error('❌ No fields found in Mutation type');
      }
    } else {
      console.error('❌ Query or Mutation type not found in schema');
    }
    
    // Setup field resolvers (Expense, Category, Budget, User, Post)
    const entityTypes = [
      { type: expenseType, name: 'Expense' },
      { type: categoryType, name: 'Category' },
      { type: budgetType, name: 'Budget' },
      { type: postType, name: 'Post' },
      { type: userType, name: 'User' }
    ].filter(item => item.type); // Filter out undefined types
    
    if (entityTypes.length > 0) {
      // Decide if you want to set up field resolvers or use response objects directly
      const setupFieldResolvers = await new Promise(resolve => {
        rl.question('Do you want to set up field resolvers for entity types? (y/n, default: n): ', answer => {
          return resolve(answer.toLowerCase() === 'y');
        });
      });
      
      if (setupFieldResolvers) {
        // Attach resolvers to entity fields
        for (const entityType of entityTypes) {
          console.log(`\n📝 Setting up ${entityType.name} field resolvers...`);
          
          if (entityType.type.fields && Array.isArray(entityType.type.fields)) {
            for (const field of entityType.type.fields) {
              const fieldName = field.name;
              await createOrUpdateFieldResolver(entityType.name, fieldName);
            }
          } else {
            console.error(`❌ No fields found in ${entityType.name} type`);
          }
        }
      } else {
        console.log('\n✅ Skipping field resolvers - Lambda will return complete objects');
      }
    } else {
      console.error('❌ No entity types found in schema');
    }
    
    console.log('\n✅ AppSync Lambda resolver setup process completed');
  } catch (error) {
    console.error('❌ Error in AppSync Lambda resolver setup process:', error.message);
  } finally {
    rl.close();
  }
}

// Run the main function
main();

export default main; 