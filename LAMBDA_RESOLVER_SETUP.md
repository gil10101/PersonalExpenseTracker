# Lambda Resolver Setup Guide

This guide walks you through setting up AWS AppSync resolvers that use your Lambda function as a data source to communicate with your MySQL database.

## Prerequisites

1. AWS AppSync API already created
2. Lambda function deployed with MySQL connectivity
3. Lambda data source created in AppSync 
4. NodeJS and npm installed

## Setup Steps

### 1. Create the Lambda Data Source in AppSync

1. Go to your AppSync API in AWS Console
2. Navigate to "Data Sources"
3. Click "Create data source"
4. Fill in these details:
   - Name: `lambda_data` (or your preferred name)
   - Data source type: AWS Lambda function
   - Region: Select your Lambda function's region
   - Function ARN: Select your Lambda function
   - For Service Role: Create new role (recommended)
5. Click "Create"

### 2. Configure Environment Variables

1. Open the `.env` file in this directory
2. Replace the placeholder values with your actual configuration:
   ```
   APPSYNC_API_ID=your_appsync_api_id
   AWS_REGION=us-east-2  # Change to your region
   LAMBDA_DATASOURCE_NAME=lambda_data  # Match the name from step 1
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Setup Script

```bash
node scripts/setup-lambda-resolvers.js
```

The script will:
1. Connect to your AppSync API
2. Identify all Query and Mutation operations in your schema
3. Set up resolvers for each operation to use your Lambda function
4. Optionally set up field resolvers (recommended to skip this - select 'n' when prompted)

### 5. Verify Resolver Setup

1. Go to your AppSync API in AWS Console
2. Navigate to "Schema"
3. Check that resolvers are attached to your operations
4. Test a query in the "Queries" section:
   ```graphql
   query GetAllExpenses {
     getAllExpenses {
       id
       title
       amount
       date
       category
     }
   }
   ```

## Resolver Mapping Templates

The script creates these mapping templates for your resolvers:

### Request Mapping Template
```
{
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {
    "field": "$context.info.fieldName",
    "arguments": $util.toJson($context.arguments)
  }
}
```

### Response Mapping Template
```
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end

$util.toJson($ctx.result)
```

## Troubleshooting

If you encounter issues:
1. Check CloudWatch logs for both AppSync and Lambda
2. Verify your Lambda function can access your database
3. Ensure your Lambda role has appropriate permissions
4. Test the Lambda function directly with test events
5. Make sure your schema defines all the types properly 