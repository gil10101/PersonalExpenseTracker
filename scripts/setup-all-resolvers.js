#!/usr/bin/env node

/**
 * This script automates the setup of all AppSync resolvers for the Expense Tracker app
 * It sets up both operation resolvers (Query/Mutation) and field resolvers (Expense/Category/Budget)
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
import fs from 'fs';
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
  dataSourceName: process.env.APPSYNC_DATASOURCE_NAME || ''
};

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// SQL templates for operation resolvers
const sqlTemplates = {
  // Query resolvers
  getAllExpenses: {
    statements: ["SELECT * FROM expenses"]
  },
  getExpenseById: {
    statements: ["SELECT * FROM expenses WHERE id = :id"]
  },
  getExpensesByCategory: {
    statements: ["SELECT * FROM expenses WHERE category = :category"]
  },
  getExpensesByDateRange: {
    statements: [
      "SELECT * FROM expenses WHERE date BETWEEN :startDate AND :endDate"
    ]
  },
  getExpensesByUserId: {
    statements: ["SELECT * FROM expenses WHERE userId = :userId"]
  },
  getAllCategories: {
    statements: ["SELECT * FROM categories"]
  },
  getCategoryById: {
    statements: ["SELECT * FROM categories WHERE id = :id"]
  },
  getAllBudgets: {
    statements: ["SELECT * FROM budgets"]
  },
  getBudgetById: {
    statements: ["SELECT * FROM budgets WHERE id = :id"]
  },
  getBudgetsByMonth: {
    statements: [
      "SELECT * FROM budgets WHERE userId = :userId AND month = :month AND year = :year"
    ]
  },
  getBudgetsByUserId: {
    statements: ["SELECT * FROM budgets WHERE userId = :userId"]
  },
  // Add singlePost query resolver
  singlePost: {
    statements: ["SELECT * FROM posts WHERE id = :id"]
  },
  // Add User query resolvers
  getUser: {
    statements: ["SELECT * FROM users WHERE id = :id"]
  },
  getUserByUsername: {
    statements: ["SELECT * FROM users WHERE username = :username"]
  },
  getAllUsers: {
    statements: ["SELECT * FROM users"]
  },

  // Mutation resolvers
  createExpense: {
    statements: [
      "INSERT INTO expenses (name, amount, category, date, userId) VALUES (:name, :amount, :category, :date, :userId)",
      "SELECT * FROM expenses WHERE id = LAST_INSERT_ID()"
    ]
  },
  updateExpense: {
    statements: [
      "UPDATE expenses SET name = :name, amount = :amount, category = :category, date = :date WHERE id = :id",
      "SELECT * FROM expenses WHERE id = :id"
    ]
  },
  deleteExpense: {
    statements: [
      "SELECT * FROM expenses WHERE id = :id",
      "DELETE FROM expenses WHERE id = :id"
    ]
  },
  createCategory: {
    statements: [
      "INSERT INTO categories (name, description) VALUES (:name, :description)",
      "SELECT * FROM categories WHERE id = LAST_INSERT_ID()"
    ]
  },
  updateCategory: {
    statements: [
      "UPDATE categories SET name = :name, description = :description WHERE id = :id",
      "SELECT * FROM categories WHERE id = :id"
    ]
  },
  deleteCategory: {
    statements: [
      "SELECT * FROM categories WHERE id = :id",
      "DELETE FROM categories WHERE id = :id"
    ]
  },
  createBudget: {
    statements: [
      "INSERT INTO budgets (userId, categoryId, amount, month, year) VALUES (:userId, :categoryId, :amount, :month, :year)",
      "SELECT * FROM budgets WHERE id = LAST_INSERT_ID()"
    ]
  },
  updateBudget: {
    statements: [
      "UPDATE budgets SET amount = :amount, month = :month, year = :year WHERE id = :id",
      "SELECT * FROM budgets WHERE id = :id"
    ]
  },
  deleteBudget: {
    statements: [
      "SELECT * FROM budgets WHERE id = :id",
      "DELETE FROM budgets WHERE id = :id"
    ]
  },
  // Add putPost mutation resolver
  putPost: {
    statements: [
      "INSERT INTO posts (id, title) VALUES (:id, :title) ON DUPLICATE KEY UPDATE title = :title",
      "SELECT * FROM posts WHERE id = :id"
    ]
  },
  // Add User mutation resolvers
  createUser: {
    statements: [
      "INSERT INTO users (id, username, email) VALUES (:id, :username, :email)",
      "SELECT * FROM users WHERE id = :id"
    ]
  },
  updateUser: {
    statements: [
      "UPDATE users SET username = :username, email = :email WHERE id = :id",
      "SELECT * FROM users WHERE id = :id"
    ]
  },
  deleteUser: {
    statements: [
      "SELECT * FROM users WHERE id = :id",
      "DELETE FROM users WHERE id = :id"
    ]
  }
};

// Function to prompt for required configuration
async function promptForConfig() {
  if (!appSyncConfig.apiId) {
    appSyncConfig.apiId = await new Promise(resolve => {
      rl.question('Enter your AppSync API ID: ', answer => resolve(answer));
    });
  }

  if (!appSyncConfig.dataSourceName) {
    appSyncConfig.dataSourceName = await new Promise(resolve => {
      rl.question('Enter your AppSync data source name for Aurora Serverless: ', answer => resolve(answer));
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

// Function to create an operation resolver
async function createOperationResolver(typeName, fieldName, requestMappingTemplate) {
  try {
    console.log(`Creating operation resolver for ${typeName}.${fieldName}...`);
    
    // Create the response mapping template
    const responseMappingTemplate = `
      #if($ctx.error)
        $util.error($ctx.error.message, $ctx.error.type)
      #end
      
      #if($ctx.result.isEmpty())
        #return([])
      #end
      
      $util.toJson($ctx.result)
    `;
    
    const command = new CreateResolverCommand({
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName,
      dataSourceName: appSyncConfig.dataSourceName,
      requestMappingTemplate: JSON.stringify({
        version: '2018-05-29',
        statements: requestMappingTemplate.statements
      }),
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
async function updateOperationResolver(typeName, fieldName, requestMappingTemplate) {
  try {
    console.log(`Updating operation resolver for ${typeName}.${fieldName}...`);
    
    // Create the response mapping template
    const responseMappingTemplate = `
      #if($ctx.error)
        $util.error($ctx.error.message, $ctx.error.type)
      #end
      
      #if($ctx.result.isEmpty())
        #return([])
      #end
      
      $util.toJson($ctx.result)
    `;
    
    const command = new UpdateResolverCommand({
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName,
      dataSourceName: appSyncConfig.dataSourceName,
      requestMappingTemplate: JSON.stringify({
        version: '2018-05-29',
        statements: requestMappingTemplate.statements
      }),
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
async function createOrUpdateOperationResolver(typeName, fieldName, requestMappingTemplate) {
  try {
    // Check if resolver exists
    const exists = await resolverExists(typeName, fieldName);
    
    if (exists) {
      // Update existing resolver
      return await updateOperationResolver(typeName, fieldName, requestMappingTemplate);
    } else {
      // Create new resolver
      return await createOperationResolver(typeName, fieldName, requestMappingTemplate);
    }
  } catch (error) {
    console.error(`❌ Error creating/updating operation resolver for ${typeName}.${fieldName}:`, error.message);
    return false;
  }
}

// Function to create a field resolver
async function createFieldResolver(typeName, fieldName) {
  try {
    console.log(`Creating field resolver for ${typeName}.${fieldName}...`);
    
    // Create the request mapping template for field resolvers
    const requestMappingTemplate = `
      #if($context.source.${fieldName})
        #return($context.source.${fieldName})
      #else
        #return(null)
      #end
    `;
    
    // Create the response mapping template
    const responseMappingTemplate = `
      $util.toJson($context.result)
    `;
    
    const command = new CreateResolverCommand({
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName,
      dataSourceName: appSyncConfig.dataSourceName,
      requestMappingTemplate,
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
    
    // Create the request mapping template for field resolvers
    const requestMappingTemplate = `
      #if($context.source.${fieldName})
        #return($context.source.${fieldName})
      #else
        #return(null)
      #end
    `;
    
    // Create the response mapping template
    const responseMappingTemplate = `
      $util.toJson($context.result)
    `;
    
    const command = new UpdateResolverCommand({
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName,
      dataSourceName: appSyncConfig.dataSourceName,
      requestMappingTemplate,
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
    
    if (exists) {
      // Update existing resolver
      return await updateFieldResolver(typeName, fieldName);
    } else {
      // Create new resolver
      return await createFieldResolver(typeName, fieldName);
    }
  } catch (error) {
    console.error(`❌ Error creating/updating field resolver for ${typeName}.${fieldName}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting AppSync resolver setup process...');
    
    // Prompt for configuration
    await promptForConfig();
    
    // Verify data source
    const dataSourceExists = await verifyDataSource();
    if (!dataSourceExists) {
      console.error('❌ Cannot proceed without a valid data source');
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
    
    // Setup operation resolvers (Query and Mutation)
    if (queryType && mutationType) {
      // Create resolvers for Query fields
      console.log('\n📝 Setting up Query resolvers...');
      if (queryType.fields && Array.isArray(queryType.fields)) {
        for (const field of queryType.fields) {
          const fieldName = field.name;
          if (sqlTemplates[fieldName]) {
            await createOrUpdateOperationResolver('Query', fieldName, sqlTemplates[fieldName]);
          } else {
            console.warn(`⚠️ No SQL template found for Query.${fieldName}`);
          }
        }
      } else {
        console.error('❌ No fields found in Query type');
      }
      
      // Create resolvers for Mutation fields
      console.log('\n📝 Setting up Mutation resolvers...');
      if (mutationType.fields && Array.isArray(mutationType.fields)) {
        for (const field of mutationType.fields) {
          const fieldName = field.name;
          if (sqlTemplates[fieldName]) {
            await createOrUpdateOperationResolver('Mutation', fieldName, sqlTemplates[fieldName]);
          } else {
            console.warn(`⚠️ No SQL template found for Mutation.${fieldName}`);
          }
        }
      } else {
        console.error('❌ No fields found in Mutation type');
      }
    } else {
      console.error('❌ Query or Mutation type not found in schema');
    }
    
    // Setup field resolvers (Expense, Category, Budget, User)
    const entityTypes = [
      { type: expenseType, name: 'Expense' },
      { type: categoryType, name: 'Category' },
      { type: budgetType, name: 'Budget' },
      { type: schemaTypes.find(type => type.name === 'Post'), name: 'Post' },
      { type: userType, name: 'User' }
    ].filter(item => item.type); // Filter out undefined types
    
    if (entityTypes.length > 0) {
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
      console.error('❌ No entity types found in schema');
    }
    
    console.log('\n✅ AppSync resolver setup process completed');
    
    // Explicitly create resolvers for singlePost and putPost
    console.log('\n📝 Setting up additional resolvers...');
    
    // Create singlePost resolver
    if (sqlTemplates.singlePost) {
      console.log('Creating resolver for Query.singlePost...');
      await createOrUpdateOperationResolver('Query', 'singlePost', sqlTemplates.singlePost);
    }
    
    // Create putPost resolver
    if (sqlTemplates.putPost) {
      console.log('Creating resolver for Mutation.putPost...');
      await createOrUpdateOperationResolver('Mutation', 'putPost', sqlTemplates.putPost);
    }
    
    console.log('\n✅ All resolvers setup completed');
  } catch (error) {
    console.error('❌ Error in AppSync resolver setup process:', error.message);
  } finally {
    rl.close();
  }
}

// Run the main function
main();

// At the end of the file, replace the module.exports with export default
// module.exports = main;
export default main; 