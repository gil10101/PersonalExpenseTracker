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

// Custom request template for getAllExpenses
const requestTemplate = `
{
  "version": "2018-05-29",
  "statements": ["SELECT * FROM expenses"]
}
`;

// Custom response template for getAllExpenses
const responseTemplate = `
#if($context.result.data)
  $util.toJson($context.result.data)
#else
  []
#end
`;

async function updateGetAllExpensesResolver() {
  try {
    // Get the current resolver
    const getResolverParams = {
      apiId: appSyncConfig.apiId,
      typeName: 'Query',
      fieldName: 'getAllExpenses'
    };
    
    console.log('Fetching current resolver for Query.getAllExpenses...');
    
    try {
      const resolverData = await appSyncClient.send(new GetResolverCommand(getResolverParams));
      console.log('Current resolver found');
      
      // Update the resolver
      const updateResolverParams = {
        apiId: appSyncConfig.apiId,
        typeName: 'Query',
        fieldName: 'getAllExpenses',
        dataSourceName: appSyncConfig.dataSourceName,
        requestMappingTemplate: requestTemplate,
        responseMappingTemplate: responseTemplate
      };
      
      console.log('Updating resolver for Query.getAllExpenses...');
      await appSyncClient.send(new UpdateResolverCommand(updateResolverParams));
      console.log('✅ Resolver for Query.getAllExpenses updated successfully');
    } catch (error) {
      if (error.name === 'NotFoundException') {
        console.log('Resolver not found, creating a new one...');
        
        // Create the resolver
        const createResolverParams = {
          apiId: appSyncConfig.apiId,
          typeName: 'Query',
          fieldName: 'getAllExpenses',
          dataSourceName: appSyncConfig.dataSourceName,
          requestMappingTemplate: requestTemplate,
          responseMappingTemplate: responseTemplate
        };
        
        await appSyncClient.send(new CreateResolverCommand(createResolverParams));
        console.log('✅ Resolver for Query.getAllExpenses created successfully');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error updating resolver:', error);
  }
}

updateGetAllExpensesResolver(); 