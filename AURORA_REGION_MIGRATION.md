# Aurora Database Region Migration Guide

This guide outlines the steps to migrate your Aurora Serverless MySQL database from `us-east-1` to `us-east-2` to match your AppSync API region.

## Prerequisites

- AWS CLI installed and configured with appropriate permissions
- Access to AWS Management Console with permissions for RDS/Aurora
- Temporary downtime window for your application (during the final cutover)

## Migration Steps

### 1. Create a Snapshot of Your Existing Database

1. **Navigate to the RDS Console**:
   - Go to the [AWS RDS Console](https://console.aws.amazon.com/rds/)
   - Ensure you're in the **us-east-1** (N. Virginia) region

2. **Create a Manual Snapshot**:
   - Select your database cluster (`database-2`)
   - Click "Actions" → "Take snapshot"
   - Name the snapshot (e.g., `database-2-migration-snapshot`)
   - Click "Take snapshot" and wait for it to complete (this may take several minutes)

### 2. Copy the Snapshot to the Target Region

1. **Copy the Snapshot to us-east-2**:
   - Once the snapshot is complete, select it
   - Click "Actions" → "Copy snapshot"
   - For "Destination Region", select **us-east-2** (Ohio)
   - Provide a name for the copy (e.g., `database-2-migration-snapshot-east-2`)
   - Optionally enable encryption
   - Click "Copy snapshot"
   - This process may take some time depending on the size of your database

### 3. Restore the Database in the New Region

1. **Switch to the us-east-2 Region**:
   - In the AWS Console, change your region to **us-east-2** (Ohio)

2. **Restore from Snapshot**:
   - Go to "Snapshots" in the RDS console
   - Select your copied snapshot
   - Click "Actions" → "Restore snapshot"
   - Configure your new database:
     - DB instance identifier: `database-2` (or a new name)
     - Choose "Serverless" for capacity type
     - Set the same VPC, subnet group, and security group settings as appropriate
     - Configure capacity settings (ACUs) to match your requirements
     - Set the same parameter group or create a new one
     - Click "Restore DB cluster"

### 4. Update Security Groups and Network Settings

1. **Configure Security Groups**:
   - Ensure the security group for your new database allows connections from your AppSync API
   - Navigate to EC2 → Security Groups
   - Select the security group associated with your new database
   - Add inbound rules to allow MySQL traffic (port 3306) from your AppSync API's security group

2. **Test Connectivity**:
   - Use a tool like MySQL Workbench or the AWS CLI to test connectivity to your new database

### 5. Update Your Application Configuration

1. **Update Environment Variables**:
   - Update your `.env` file with the new database endpoint and region:

```
# Database Configuration
DB_HOST=<new-database-endpoint-in-us-east-2>
DB_USERNAME=admin
DB_PASSWORD=S9ZxGl9BhIiMbOpWFIKw
DB_NAME=database-2
DB_PORT=3306
```

2. **Update AppSync Data Source**:
   - In the AppSync console, update your data source to point to the new database endpoint
   - This may require recreating the data source with the new connection details

### 6. Migrate Data (If Needed)

If you've made changes to the original database after taking the snapshot, you'll need to migrate that data:

1. **Use AWS Database Migration Service (DMS)**:
   - Set up a DMS task to migrate data from the source to the target database
   - Configure continuous replication until cutover

2. **Alternative: Use MySQL Tools**:
   - Use `mysqldump` to export data from the source database
   - Import the data to the target database

### 7. Perform the Cutover

1. **Schedule Downtime**:
   - Notify users of planned downtime
   - Stop write operations to the source database

2. **Final Data Sync**:
   - Perform a final data synchronization if needed

3. **Update Application**:
   - Deploy your application with the updated configuration pointing to the new database

4. **Test**:
   - Verify that your application works correctly with the new database

### 8. Clean Up

1. **Monitor the New Database**:
   - Ensure everything is working as expected for a few days

2. **Decommission the Old Database**:
   - Once you're confident in the migration, you can delete the old database in us-east-1
   - Note: Consider keeping it as a backup for a short period

## Using AWS CLI for Migration

You can also perform these steps using the AWS CLI:

```bash
# 1. Create a snapshot of your existing database
aws rds create-db-cluster-snapshot \
  --db-cluster-identifier database-2 \
  --db-cluster-snapshot-identifier database-2-migration-snapshot \
  --region us-east-1

# 2. Wait for the snapshot to be available
aws rds wait db-cluster-snapshot-available \
  --db-cluster-snapshot-identifier database-2-migration-snapshot \
  --region us-east-1

# 3. Copy the snapshot to the target region
aws rds copy-db-cluster-snapshot \
  --source-db-cluster-snapshot-identifier database-2-migration-snapshot \
  --target-db-cluster-snapshot-identifier database-2-migration-snapshot-east-2 \
  --source-region us-east-1 \
  --region us-east-2

# 4. Wait for the copied snapshot to be available
aws rds wait db-cluster-snapshot-available \
  --db-cluster-snapshot-identifier database-2-migration-snapshot-east-2 \
  --region us-east-2

# 5. Restore the database in the new region
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier database-2-new \
  --snapshot-identifier database-2-migration-snapshot-east-2 \
  --engine aurora-mysql \
  --engine-mode serverless \
  --region us-east-2
```

## Automation Script

You can create a Node.js script to automate this process. Here's a template:

```javascript
// scripts/migrate-aurora-region.js
const { 
  RDSClient, 
  CreateDBClusterSnapshotCommand,
  CopyDBClusterSnapshotCommand,
  RestoreDBClusterFromSnapshotCommand,
  DescribeDBClusterSnapshotsCommand
} = require('@aws-sdk/client-rds');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const config = {
  sourceRegion: 'us-east-1',
  targetRegion: 'us-east-2',
  dbClusterIdentifier: 'database-2',
  snapshotIdentifier: 'database-2-migration-snapshot',
  targetSnapshotIdentifier: 'database-2-migration-snapshot-east-2',
  newDbClusterIdentifier: 'database-2-new'
};

// Create RDS clients for source and target regions
const sourceRdsClient = new RDSClient({ region: config.sourceRegion });
const targetRdsClient = new RDSClient({ region: config.targetRegion });

// Function to wait for snapshot to be available
async function waitForSnapshotAvailable(client, snapshotIdentifier) {
  console.log(`Waiting for snapshot ${snapshotIdentifier} to be available...`);
  
  let snapshotAvailable = false;
  while (!snapshotAvailable) {
    const command = new DescribeDBClusterSnapshotsCommand({
      DBClusterSnapshotIdentifier: snapshotIdentifier
    });
    
    const response = await client.send(command);
    
    if (response.DBClusterSnapshots && 
        response.DBClusterSnapshots.length > 0 && 
        response.DBClusterSnapshots[0].Status === 'available') {
      snapshotAvailable = true;
      console.log(`Snapshot ${snapshotIdentifier} is now available`);
    } else {
      console.log(`Snapshot status: ${response.DBClusterSnapshots[0].Status}. Waiting...`);
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    }
  }
}

// Main function
async function migrateDatabase() {
  try {
    // Step 1: Create a snapshot of the existing database
    console.log(`Creating snapshot of ${config.dbClusterIdentifier} in ${config.sourceRegion}...`);
    const createSnapshotCommand = new CreateDBClusterSnapshotCommand({
      DBClusterIdentifier: config.dbClusterIdentifier,
      DBClusterSnapshotIdentifier: config.snapshotIdentifier
    });
    
    await sourceRdsClient.send(createSnapshotCommand);
    
    // Wait for the snapshot to be available
    await waitForSnapshotAvailable(sourceRdsClient, config.snapshotIdentifier);
    
    // Step 2: Copy the snapshot to the target region
    console.log(`Copying snapshot to ${config.targetRegion}...`);
    const copySnapshotCommand = new CopyDBClusterSnapshotCommand({
      SourceDBClusterSnapshotIdentifier: `arn:aws:rds:${config.sourceRegion}:${process.env.AWS_ACCOUNT_ID}:cluster-snapshot:${config.snapshotIdentifier}`,
      TargetDBClusterSnapshotIdentifier: config.targetSnapshotIdentifier,
      SourceRegion: config.sourceRegion
    });
    
    await targetRdsClient.send(copySnapshotCommand);
    
    // Wait for the copied snapshot to be available
    await waitForSnapshotAvailable(targetRdsClient, config.targetSnapshotIdentifier);
    
    // Step 3: Restore the database in the new region
    console.log(`Restoring database in ${config.targetRegion}...`);
    const restoreCommand = new RestoreDBClusterFromSnapshotCommand({
      DBClusterIdentifier: config.newDbClusterIdentifier,
      SnapshotIdentifier: config.targetSnapshotIdentifier,
      Engine: 'aurora-mysql',
      EngineMode: 'serverless'
    });
    
    await targetRdsClient.send(restoreCommand);
    
    console.log(`Database restoration initiated. New database cluster: ${config.newDbClusterIdentifier}`);
    console.log('Please check the AWS RDS console to monitor the restoration progress.');
    
  } catch (error) {
    console.error('Error during database migration:', error);
  }
}

// Run the migration
migrateDatabase();
```

## Important Considerations

1. **Downtime**: This process will require some downtime for your application.
2. **Data Consistency**: Ensure all data is properly migrated, especially if your application continues to write to the source database during migration.
3. **Costs**: You will be charged for:
   - The snapshot storage
   - Data transfer between regions
   - Running both databases during the migration period
4. **Testing**: Thoroughly test your application with the new database before decommissioning the old one.

## After Migration

After successfully migrating your database, update your AppSync data source to point to the new database endpoint. This will ensure that your API and database are in the same region, reducing latency and data transfer costs. 