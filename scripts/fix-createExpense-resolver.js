import { 
  AppSyncClient, 
  UpdateResolverCommand,
  GetResolverCommand,
  CreateResolverCommand
} from '@aws-sdk/client-appsync';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// AppSync configuration
const appSyncConfig = {
  apiId: process.env.APPSYNC_API_ID || 'x5ujbpctlnbsxahehbvnt3ie3y',
  region: process.env.AWS_REGION || 'us-east-2',
  dataSourceName: process.env.APPSYNC_DATASOURCE_NAME || 'ExpenseDB'
};

console.log('Using the following configuration:');
console.log(`API ID: ${appSyncConfig.apiId}`);
console.log(`Region: ${appSyncConfig.region}`);
console.log(`Data Source: ${appSyncConfig.dataSourceName}`);

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// Custom request template for createExpense
const requestTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "INSERT INTO expenses (id, name, amount, category, date, userId, createdAt, updatedAt) VALUES (:id, :name, :amount, :category, :date, :userId, NOW(), NOW())",
    "SELECT * FROM expenses WHERE id = :id"
  ],
  "variableMap": {
    ":id": $util.toJson($util.autoId()),
    ":name": $util.toJson($ctx.args.name),
    ":amount": $util.toJson($ctx.args.amount),
    ":category": $util.toJson($ctx.args.category),
    ":date": $util.toJson($ctx.args.date),
    ":userId": $util.toJson($ctx.args.userId)
  }
}
`;

// Custom response template for createExpense
const responseTemplate = `
#if($context.result.data[1][0])
  $util.toJson($context.result.data[1][0])
#else
  $util.toJson(null)
#end
`;

async function updateCreateExpenseResolver() {
  try {
    // Get the current resolver
    const getResolverParams = {
      apiId: appSyncConfig.apiId,
      typeName: 'Mutation',
      fieldName: 'createExpense'
    };
    
    console.log('Fetching current resolver for Mutation.createExpense...');
    
    try {
      const resolverData = await appSyncClient.send(new GetResolverCommand(getResolverParams));
      console.log('Current resolver found');
      
      // Update the resolver
      const updateResolverParams = {
        apiId: appSyncConfig.apiId,
        typeName: 'Mutation',
        fieldName: 'createExpense',
        dataSourceName: appSyncConfig.dataSourceName,
        requestMappingTemplate: requestTemplate,
        responseMappingTemplate: responseTemplate
      };
      
      console.log('Updating resolver for Mutation.createExpense...');
      await appSyncClient.send(new UpdateResolverCommand(updateResolverParams));
      console.log('✅ Resolver for Mutation.createExpense updated successfully');
    } catch (error) {
      if (error.name === 'NotFoundException') {
        console.log('Resolver not found, creating a new one...');
        
        // Create the resolver
        const createResolverParams = {
          apiId: appSyncConfig.apiId,
          typeName: 'Mutation',
          fieldName: 'createExpense',
          dataSourceName: appSyncConfig.dataSourceName,
          requestMappingTemplate: requestTemplate,
          responseMappingTemplate: responseTemplate
        };
        
        await appSyncClient.send(new CreateResolverCommand(createResolverParams));
        console.log('✅ Resolver for Mutation.createExpense created successfully');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error updating resolver:', error);
  }
}

updateCreateExpenseResolver(); 