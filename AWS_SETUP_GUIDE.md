# AWS Setup Guide for Personal Expense Tracker

This guide will help you set up the necessary AWS resources to connect your Personal Expense Tracker application to AWS AppSync and Amazon RDS.

## Prerequisites

- An AWS account with appropriate permissions
- AWS CLI installed and configured
- Basic knowledge of AWS services

## Step 1: Set Up Amazon RDS Database

1. **Create an RDS instance:**
   - Go to the [Amazon RDS Console](https://console.aws.amazon.com/rds/)
   - Click "Create database"
   - Choose "MySQL" as the engine type
   - Select "Aurora Serverless" for the edition
   - Configure your database settings:
     - DB cluster identifier: `expense-tracker-db`
     - Master username: `admin` (or your preferred username)
     - Master password: Create a secure password
   - Configure advanced settings as needed
   - Create the database

2. **Configure Security Group:**
   - Ensure your RDS security group allows connections from your AppSync service
   - For development, you can temporarily allow connections from anywhere (0.0.0.0/0)
   - For production, restrict access to specific IP ranges or AWS services

3. **Create Database Schema:**
   - Connect to your RDS instance using a MySQL client
   - Create the necessary tables based on your GraphQL schema:

```sql
CREATE DATABASE expense_tracker;
USE expense_tracker;

CREATE TABLE expenses (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE budgets (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  categoryId VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Step 2: Set Up AWS AppSync

1. **Create an AppSync API:**
   - Go to the [AWS AppSync Console](https://console.aws.amazon.com/appsync/)
   - Click "Create API"
   - Choose "Design from scratch"
   - Enter a name for your API: `ExpenseTrackerAPI`
   - Click "Create"

2. **Define your GraphQL Schema:**
   - In the AppSync console, go to the "Schema" section
   - Copy and paste your schema from `schema.graphql` in your project
   - Click "Save Schema"

3. **Create a Data Source:**
   - In the AppSync console, go to the "Data Sources" section
   - Click "Create data source"
   - Enter a name: `ExpenseDB`
   - Select "Amazon RDS" as the data source type
   - Select your RDS cluster from the dropdown
   - Enter your database credentials
   - Click "Create"

4. **Create Resolvers:**
   - In the AppSync console, go to the "Schema" section
   - For each Query and Mutation in your schema, create a resolver:
     - Click "Attach" next to the operation
     - Select your RDS data source
     - Configure the resolver with appropriate SQL statements
     - Click "Save Resolver"

5. **Example Resolver for getAllExpenses:**
   - Request mapping template:

```
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM expenses"
  ]
}
```

   - Response mapping template:

```
$utils.toJson($utils.rds.toJsonObject($ctx.result)[0])
```

## Step 3: Configure Authentication

1. **Create a Cognito User Pool:**
   - Go to the [Amazon Cognito Console](https://console.aws.amazon.com/cognito/)
   - Click "Create user pool"
   - Configure your user pool settings
   - Create an app client for your application
   - Note the User Pool ID and App Client ID

2. **Configure AppSync Authentication:**
   - In the AppSync console, go to the "Settings" section
   - Under "Authorization types", select "Amazon Cognito User Pool"
   - Select your user pool and app client
   - You can also enable API key authentication for development

## Step 4: Update Your Application

1. **Update Environment Variables:**
   - Update your `.env` file with the correct values:

```
# Cognito Configuration
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_USER_POOL_CLIENT_ID=your-client-id
VITE_COGNITO_IDENTITY_POOL_ID=your-identity-pool-id

# API Configuration
VITE_GRAPHQL_ENDPOINT=your-appsync-endpoint
VITE_GRAPHQL_API_KEY=your-api-key

# AppSync Configuration for Scripts
APPSYNC_API_ID=your-appsync-api-id
APPSYNC_DATASOURCE_NAME=ExpenseDB
AWS_REGION=your-region

# Database Configuration
DB_HOST=your-rds-endpoint
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_PORT=3306
```

2. **Test the Connection:**
   - Run your application
   - Use the "Test AWS AppSync Connection" button to verify the connection

## Troubleshooting

### Common Issues:

1. **Connection Timeout:**
   - Check that your RDS security group allows connections from your AppSync service
   - Verify that your RDS instance is in the "Available" state

2. **Authentication Errors:**
   - Verify that your API key is valid and not expired
   - Check that your Cognito configuration is correct

3. **Schema Mismatch:**
   - Ensure your local schema.graphql matches the schema deployed to AppSync
   - Check that your resolver functions match your schema operations

4. **Database Errors:**
   - Verify that your database tables exist and match your schema
   - Check that your database credentials are correct

### Useful AWS CLI Commands:

```bash
# Check AppSync API status
aws appsync get-graphql-api --api-id your-api-id

# Check RDS instance status
aws rds describe-db-instances --db-instance-identifier your-db-identifier

# Test database connection
aws rds-data execute-statement --resource-arn your-db-arn --secret-arn your-secret-arn --sql "SELECT 1"
```

## Additional Resources

- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [Amazon RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [GraphQL Documentation](https://graphql.org/learn/)

## Security Best Practices

- Use IAM roles with least privilege
- Enable encryption for your RDS instance
- Use environment variables for sensitive information
- Implement proper authentication and authorization
- Regularly rotate API keys and database credentials
- Monitor your AWS resources for unusual activity 