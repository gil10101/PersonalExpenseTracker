#!/usr/bin/env node

/**
 * This script automates the migration of an Aurora Serverless MySQL database
 * from one AWS region to another (specifically from us-east-1 to us-east-2)
 */

const { 
  RDSClient, 
  CreateDBClusterSnapshotCommand,
  CopyDBClusterSnapshotCommand,
  RestoreDBClusterFromSnapshotCommand,
  DescribeDBClusterSnapshotsCommand,
  DescribeDBClustersCommand
} = require('@aws-sdk/client-rds');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration with defaults from environment variables
const config = {
  sourceRegion: 'us-east-1',
  targetRegion: 'us-east-2',
  dbClusterIdentifier: process.env.DB_NAME || 'database-2',
  snapshotIdentifier: `${process.env.DB_NAME || 'database-2'}-migration-snapshot`,
  targetSnapshotIdentifier: `${process.env.DB_NAME || 'database-2'}-migration-snapshot-east-2`,
  newDbClusterIdentifier: `${process.env.DB_NAME || 'database-2'}-new`,
  // You'll need to provide your AWS account ID
  awsAccountId: process.env.AWS_ACCOUNT_ID || ''
};

// Create RDS clients for source and target regions
const sourceRdsClient = new RDSClient({ region: config.sourceRegion });
const targetRdsClient = new RDSClient({ region: config.targetRegion });

// Function to prompt for required configuration
async function promptForConfig() {
  if (!config.awsAccountId) {
    config.awsAccountId = await new Promise(resolve => {
      rl.question('Enter your AWS Account ID: ', answer => resolve(answer));
    });
  }

  const confirmDbName = await new Promise(resolve => {
    rl.question(`Is '${config.dbClusterIdentifier}' the correct database cluster name? (y/n): `, answer => 
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    );
  });

  if (!confirmDbName) {
    config.dbClusterIdentifier = await new Promise(resolve => {
      rl.question('Enter the correct database cluster name: ', answer => resolve(answer));
    });
    
    // Update derived names
    config.snapshotIdentifier = `${config.dbClusterIdentifier}-migration-snapshot`;
    config.targetSnapshotIdentifier = `${config.dbClusterIdentifier}-migration-snapshot-east-2`;
    config.newDbClusterIdentifier = `${config.dbClusterIdentifier}-new`;
  }

  console.log('\nUsing the following configuration:');
  console.log(`Source Region: ${config.sourceRegion}`);
  console.log(`Target Region: ${config.targetRegion}`);
  console.log(`DB Cluster Identifier: ${config.dbClusterIdentifier}`);
  console.log(`Snapshot Identifier: ${config.snapshotIdentifier}`);
  console.log(`Target Snapshot Identifier: ${config.targetSnapshotIdentifier}`);
  console.log(`New DB Cluster Identifier: ${config.newDbClusterIdentifier}`);
  console.log(`AWS Account ID: ${config.awsAccountId}`);

  const confirm = await new Promise(resolve => {
    rl.question('\nDo you want to proceed with the migration? (y/n): ', answer => 
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    );
  });

  return confirm;
}

// Function to check if the database exists
async function checkDatabaseExists() {
  try {
    console.log(`Checking if database ${config.dbClusterIdentifier} exists in ${config.sourceRegion}...`);
    
    const command = new DescribeDBClustersCommand({
      DBClusterIdentifier: config.dbClusterIdentifier
    });
    
    const response = await sourceRdsClient.send(command);
    
    if (response.DBClusters && response.DBClusters.length > 0) {
      console.log(`✅ Database ${config.dbClusterIdentifier} exists`);
      console.log(`Endpoint: ${response.DBClusters[0].Endpoint}`);
      return true;
    } else {
      console.error(`❌ Database ${config.dbClusterIdentifier} not found`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error checking database: ${error.message}`);
    return false;
  }
}

// Function to wait for snapshot to be available
async function waitForSnapshotAvailable(client, snapshotIdentifier, region) {
  console.log(`Waiting for snapshot ${snapshotIdentifier} to be available in ${region}...`);
  
  let snapshotAvailable = false;
  let attempts = 0;
  const maxAttempts = 30; // 15 minutes max wait time
  
  while (!snapshotAvailable && attempts < maxAttempts) {
    attempts++;
    
    try {
      const command = new DescribeDBClusterSnapshotsCommand({
        DBClusterSnapshotIdentifier: snapshotIdentifier
      });
      
      const response = await client.send(command);
      
      if (response.DBClusterSnapshots && 
          response.DBClusterSnapshots.length > 0 && 
          response.DBClusterSnapshots[0].Status === 'available') {
        snapshotAvailable = true;
        console.log(`✅ Snapshot ${snapshotIdentifier} is now available`);
      } else {
        const status = response.DBClusterSnapshots[0].Status;
        console.log(`Snapshot status: ${status}. Waiting... (Attempt ${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      }
    } catch (error) {
      console.log(`Error checking snapshot status: ${error.message}. Waiting... (Attempt ${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    }
  }
  
  if (!snapshotAvailable) {
    throw new Error(`Snapshot ${snapshotIdentifier} did not become available within the timeout period`);
  }
  
  return snapshotAvailable;
}

// Function to create a snapshot
async function createSnapshot() {
  try {
    console.log(`Creating snapshot of ${config.dbClusterIdentifier} in ${config.sourceRegion}...`);
    
    const command = new CreateDBClusterSnapshotCommand({
      DBClusterIdentifier: config.dbClusterIdentifier,
      DBClusterSnapshotIdentifier: config.snapshotIdentifier
    });
    
    const response = await sourceRdsClient.send(command);
    
    console.log(`✅ Snapshot creation initiated: ${response.DBClusterSnapshot.DBClusterSnapshotIdentifier}`);
    console.log(`Status: ${response.DBClusterSnapshot.Status}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error creating snapshot: ${error.message}`);
    return false;
  }
}

// Function to copy snapshot to target region
async function copySnapshotToTargetRegion() {
  try {
    console.log(`Copying snapshot to ${config.targetRegion}...`);
    
    const command = new CopyDBClusterSnapshotCommand({
      SourceDBClusterSnapshotIdentifier: `arn:aws:rds:${config.sourceRegion}:${config.awsAccountId}:cluster-snapshot:${config.snapshotIdentifier}`,
      TargetDBClusterSnapshotIdentifier: config.targetSnapshotIdentifier,
      SourceRegion: config.sourceRegion,
      CopyTags: true
    });
    
    const response = await targetRdsClient.send(command);
    
    console.log(`✅ Snapshot copy initiated: ${response.DBClusterSnapshot.DBClusterSnapshotIdentifier}`);
    console.log(`Status: ${response.DBClusterSnapshot.Status}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error copying snapshot: ${error.message}`);
    return false;
  }
}

// Function to restore database in target region
async function restoreDatabaseInTargetRegion() {
  try {
    console.log(`Restoring database in ${config.targetRegion}...`);
    
    const command = new RestoreDBClusterFromSnapshotCommand({
      DBClusterIdentifier: config.newDbClusterIdentifier,
      SnapshotIdentifier: config.targetSnapshotIdentifier,
      Engine: 'aurora-mysql',
      EngineMode: 'serverless',
      ScalingConfiguration: {
        MinCapacity: 1, // Minimum ACUs
        MaxCapacity: 4, // Maximum ACUs
        AutoPause: true,
        SecondsUntilAutoPause: 300 // 5 minutes
      }
    });
    
    const response = await targetRdsClient.send(command);
    
    console.log(`✅ Database restoration initiated: ${response.DBCluster.DBClusterIdentifier}`);
    console.log(`Status: ${response.DBCluster.Status}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error restoring database: ${error.message}`);
    return false;
  }
}

// Main function
async function migrateDatabase() {
  try {
    console.log('🚀 Starting Aurora database region migration process...');
    
    // Prompt for configuration
    const shouldProceed = await promptForConfig();
    
    if (!shouldProceed) {
      console.log('Migration cancelled by user');
      rl.close();
      return;
    }
    
    // Check if database exists
    const databaseExists = await checkDatabaseExists();
    
    if (!databaseExists) {
      console.error('Cannot proceed with migration as the source database was not found');
      rl.close();
      return;
    }
    
    // Step 1: Create a snapshot
    console.log('\n📝 Step 1: Create a snapshot of the existing database');
    const snapshotCreated = await createSnapshot();
    
    if (!snapshotCreated) {
      console.error('Cannot proceed with migration as snapshot creation failed');
      rl.close();
      return;
    }
    
    // Wait for snapshot to be available
    await waitForSnapshotAvailable(sourceRdsClient, config.snapshotIdentifier, config.sourceRegion);
    
    // Step 2: Copy snapshot to target region
    console.log('\n📝 Step 2: Copy the snapshot to the target region');
    const snapshotCopied = await copySnapshotToTargetRegion();
    
    if (!snapshotCopied) {
      console.error('Cannot proceed with migration as snapshot copy failed');
      rl.close();
      return;
    }
    
    // Wait for copied snapshot to be available
    await waitForSnapshotAvailable(targetRdsClient, config.targetSnapshotIdentifier, config.targetRegion);
    
    // Step 3: Restore database in target region
    console.log('\n📝 Step 3: Restore the database in the target region');
    const databaseRestored = await restoreDatabaseInTargetRegion();
    
    if (!databaseRestored) {
      console.error('Database restoration failed');
      rl.close();
      return;
    }
    
    console.log('\n✅ Aurora database region migration process initiated');
    console.log('Please check the AWS RDS console to monitor the restoration progress');
    console.log(`New database cluster: ${config.newDbClusterIdentifier} in region ${config.targetRegion}`);
    console.log('\nAfter the database is fully restored:');
    console.log('1. Update your .env file with the new database endpoint');
    console.log('2. Update your AppSync data source to point to the new database');
    console.log('3. Test your application with the new database');
    console.log('4. Once everything is working, you can delete the old database');
    
  } catch (error) {
    console.error('\n❌ Error in database migration process:', error.message);
  } finally {
    rl.close();
  }
}

// Run the main function
migrateDatabase(); 