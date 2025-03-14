const { AppSyncClient, CreateDataSourceCommand, ListDataSourcesCommand } = require('@aws-sdk/client-appsync');

// Configure the AWS SDK
const client = new AppSyncClient({ region: 'us-east-2' }); // Replace with your AWS region if different

// Your AppSync API ID
const apiId = 'x5ujbpctlnbsxahehbvnt3ie3y'; // Your API ID

// Helper function to create a data source if it doesn't exist
async function createDataSourceIfNotExists(name, type, config) {
  try {
    // Check if data source already exists
    const listParams = {
      apiId
    };
    
    const existingDataSources = await client.send(new ListDataSourcesCommand(listParams));
    const existingDataSource = existingDataSources.dataSources.find(ds => ds.name === name);
    
    if (existingDataSource) {
      console.log(`Data source ${name} already exists.`);
      return;
    }
    
    // Create data source
    const params = {
      apiId,
      name,
      type,
      ...config
    };
    
    await client.send(new CreateDataSourceCommand(params));
    console.log(`Successfully created data source ${name}`);
  } catch (error) {
    console.error(`Error creating data source ${name}:`, error);
  }
}

// Main function to create all data sources
async function createAllDataSources() {
  try {
    console.log('Starting data source creation process...');
    
    // Create RDS data source for Aurora MySQL Serverless
    await createDataSourceIfNotExists('ExpenseDB', 'RELATIONAL_DATABASE', {
      relationalDatabaseConfig: {
        relationalDatabaseSourceType: 'RDS_HTTP_ENDPOINT',
        rdsHttpEndpointConfig: {
          awsRegion: 'us-east-2',
          dbClusterIdentifier: 'arn:aws:rds:us-east-2:717279732805:cluster:database-1',
          databaseName: 'expense_tracker',
          schema: 'mysql',
          awsSecretStoreArn: 'arn:aws:secretsmanager:us-east-2:717279732805:secret:rdscluster-8b754dba-2ca0-4e5e-9f6f-f8717f2e5fbd-c5Jp8Y'
        }
      }
    });
    
    console.log('Data source creation process completed successfully!');
  } catch (error) {
    console.error('Error in data source creation process:', error);
  }
}

// Run the script
createAllDataSources(); 