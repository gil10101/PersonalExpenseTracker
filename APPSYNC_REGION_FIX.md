# AppSync Region Configuration Fix

This guide will help you fix the AppSync connection error: "Unable to assume role arn:aws:iam::717279732805:role/service-role/appsync-ds-rds-oLHVY4k9SHww-database-2::717279732805::arn:aws:appsync:us-east-2:717279732805:apis/x5ujbpctlnbsxahehbvnt3ie3y."

## Prerequisites

Before running the scripts, make sure you have:

1. AWS CLI installed and configured with appropriate credentials
2. Node.js installed (v14 or later)
3. Required npm packages installed:
   ```
   cd scripts
   npm install @aws-sdk/client-appsync @aws-sdk/client-iam dotenv
   ```

## Step 1: Fix IAM Role Trust Relationship

The first step is to update the IAM role trust relationship to ensure AppSync can assume the role:

```bash
node scripts/fix-iam-trust-relationship.js
```

This script will:
- Check the current trust policy of the IAM role
- Update the trust policy to allow AppSync to assume the role
- Display the updated trust policy

## Step 2: Fix AppSync Data Source Configuration

After fixing the IAM role trust relationship, update the AppSync data source configuration:

```bash
node scripts/fix-appsync-region.js
```

This script will:
- Get the current data source configuration
- Update the configuration to ensure it's properly set up for us-east-2 region
- Display the updated configuration

## Step 3: Test the AppSync Connection

After fixing the configuration, test the AppSync connection:

```bash
node scripts/test-appsync.js
```

This script will:
- Connect to AppSync using the configured endpoint
- Run a simple query to verify the connection
- Display the query results

## Troubleshooting

If you're still experiencing issues after running these scripts, check the following:

1. **IAM Role Permissions**: Ensure the IAM role has the necessary permissions to access the database. You may need to add additional policies to the role.

2. **Database Security Group**: Make sure the database security group allows connections from AppSync. You may need to add an inbound rule to allow traffic from AppSync.

3. **Database Connectivity**: Verify that the database is running and accessible. You can use the `test-connection.js` script to check the database connectivity.

4. **AWS Console**: Check the AWS AppSync console for any error messages or logs that might provide more information about the issue.

5. **Region Consistency**: Ensure all resources (AppSync, IAM role, database) are in the same region (us-east-2).

## Manual Configuration

If the scripts don't work, you can manually configure the resources:

1. **IAM Role Trust Relationship**:
   - Go to the IAM console: https://console.aws.amazon.com/iam/
   - Find the role: `service-role/appsync-ds-rds-oLHVY4k9SHww-database-2`
   - Click on the "Trust relationships" tab
   - Click "Edit trust relationship"
   - Add AppSync as a trusted entity:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Principal": {
             "Service": "appsync.amazonaws.com"
           },
           "Action": "sts:AssumeRole"
         }
       ]
     }
     ```

2. **AppSync Data Source**:
   - Go to the AppSync console: https://console.aws.amazon.com/appsync/
   - Select your API
   - Go to "Data Sources"
   - Find your data source and click "Edit"
   - Update the region to "us-east-2"
   - Update the service role ARN if needed
   - Click "Save"

## Additional Resources

- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html)
- [IAM Roles and Trust Relationships](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_terms-and-concepts.html)
- [Cross-Region Access with AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/security-authorization.html) 