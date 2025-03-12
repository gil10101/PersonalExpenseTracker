import { 
  AppSyncClient, 
  UpdateDataSourceCommand,
  GetDataSourceCommand
} from '@aws-sdk/client-appsync';
import dotenv from 'dotenv';

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

async function updateDataSource() {
  try {
    // First, get the current data source configuration
    const getDataSourceParams = {
      apiId: appSyncConfig.apiId,
      name: appSyncConfig.dataSourceName
    };
    
    console.log(`Fetching data source: ${appSyncConfig.dataSourceName}`);
    const dataSourceResponse = await appSyncClient.send(new GetDataSourceCommand(getDataSourceParams));
    const dataSource = dataSourceResponse.dataSource;
    
    if (!dataSource) {
      console.error(`❌ Data source ${appSyncConfig.dataSourceName} not found`);
      return;
    }
    
    console.log('Current database name:', dataSource.relationalDatabaseConfig.rdsHttpEndpointConfig.databaseName);
    
    // Update the data source with the correct database name
    const updateDataSourceParams = {
      apiId: appSyncConfig.apiId,
      name: appSyncConfig.dataSourceName,
      type: dataSource.type,
      serviceRoleArn: dataSource.serviceRoleArn,
      relationalDatabaseConfig: {
        relationalDatabaseSourceType: dataSource.relationalDatabaseConfig.relationalDatabaseSourceType,
        rdsHttpEndpointConfig: {
          ...dataSource.relationalDatabaseConfig.rdsHttpEndpointConfig,
          databaseName: 'expense_tracker' // Update to the correct database name with underscore
        }
      }
    };
    
    console.log('Updating data source with database name: expense_tracker');
    await appSyncClient.send(new UpdateDataSourceCommand(updateDataSourceParams));
    
    console.log('✅ Data source updated successfully');
  } catch (error) {
    console.error('❌ Error updating data source:', error);
  }
}

updateDataSource(); 