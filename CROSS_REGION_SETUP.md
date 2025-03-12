# Cross-Region Database Access Guide

This guide outlines the steps to configure your AWS AppSync API in `us-east-2` to access your Aurora Serverless MySQL database in `us-east-1`.

## Overview

Your setup involves:
- AppSync API in `us-east-2`
- Aurora Serverless MySQL database in `us-east-1`

While it's generally recommended to keep your resources in the same region, cross-region access is possible with proper configuration.

## Prerequisites

- AWS CLI installed and configured with appropriate permissions
- Access to AWS Management Console with permissions for AppSync and RDS
- Your database credentials and endpoint information

## Configuration Steps

### 1. Check Your Current Configuration

Run the check script to see your current AppSync data source configuration:

```bash
node scripts/check-appsync-datasource.js
```

This will show you if your data source is correctly configured for cross-region access.

### 2. Configure Cross-Region Access

If your data source is not correctly configured, run the configuration script:

```bash
node scripts/configure-cross-region.js
```

This script will:
- Update your AppSync data source to point to your database in `us-east-1`
- Configure the correct region settings for cross-region access

### 3. Update Security Groups

Your database security group needs to allow connections from the AppSync service:

1. **Navigate to the EC2 Console**:
   - Go to the [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
   - Ensure you're in the **us-east-1** (N. Virginia) region

2. **Update Security Group**:
   - Find the security group associated with your database
   - Add an inbound rule to allow MySQL traffic (port 3306) from the AppSync service
   - You can use the CIDR block for the `us-east-2` region: `52.15.0.0/16`
   - Or, for better security, create a specific security group for AppSync in `us-east-2` and reference it

### 4. Update IAM Roles

The IAM role used by your AppSync API needs permissions to access resources in `us-east-1`:

1. **Navigate to the IAM Console**:
   - Go to the [AWS IAM Console](https://console.aws.amazon.com/iam/)

2. **Update the AppSync Service Role**:
   - Find the role used by your AppSync API (check in the AppSync console under Data Sources)
   - Add a policy that allows access to your RDS resources in `us-east-1`
   - Example policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds-data:ExecuteStatement",
        "rds-data:BatchExecuteStatement",
        "rds-data:BeginTransaction",
        "rds-data:CommitTransaction",
        "rds-data:RollbackTransaction"
      ],
      "Resource": [
        "arn:aws:rds:us-east-1:YOUR_ACCOUNT_ID:cluster:database-2"
      ]
    }
  ]
}
```

### 5. Test the Connection

Run the test script to verify that your cross-region connection is working:

```bash
node scripts/test-cross-region-connection.js
```

This script will:
- Send a simple GraphQL query to your AppSync API
- Verify that the API can successfully connect to your database
- Test both read and write operations

## Performance Considerations

Cross-region access has some performance implications:

1. **Latency**: Requests between regions will have higher latency (typically 50-100ms additional)
2. **Cost**: AWS charges for data transfer between regions
3. **Complexity**: Troubleshooting issues is more complex with cross-region setups

## Monitoring and Troubleshooting

### Monitoring

Monitor your cross-region setup using:
- CloudWatch Logs for AppSync
- RDS Performance Insights
- CloudWatch Metrics for both AppSync and RDS

### Common Issues and Solutions

1. **Connection Timeouts**:
   - Check security group settings
   - Verify IAM permissions
   - Ensure the database is publicly accessible or has proper VPC endpoints

2. **Permission Errors**:
   - Verify the AppSync service role has cross-region permissions
   - Check that the database user has appropriate permissions

3. **High Latency**:
   - This is expected with cross-region access
   - Consider moving resources to the same region for better performance

## Alternative: Moving Your Database

If you experience issues with cross-region access or want to optimize performance, consider moving your database to `us-east-2`:

```bash
node scripts/migrate-aurora-region.js
```

See the [Aurora Region Migration Guide](AURORA_REGION_MIGRATION.md) for detailed instructions.

## Conclusion

With proper configuration, your AppSync API in `us-east-2` can successfully connect to your Aurora database in `us-east-1`. However, for optimal performance and simplicity, consider eventually migrating your database to the same region as your API. 