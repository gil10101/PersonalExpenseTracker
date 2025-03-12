# Database Setup for Personal Expense Tracker

This guide will help you set up and connect your Aurora Serverless MySQL database to your Personal Expense Tracker application.

## Prerequisites

- AWS Account with access to RDS (Aurora Serverless) and AppSync
- Node.js and npm installed
- Personal Expense Tracker application code

## Step 1: Configure Environment Variables

1. Update your `.env` file with your Aurora Serverless MySQL database credentials:

```
# Database Configuration
DB_HOST=database-2.cluster-c26a6o2q3bp.us-east-1.rds.amazonaws.com
DB_USERNAME=admin
DB_PASSWORD=S9ZxGl9BhIiMbOpWFIKw
DB_NAME=database-2
DB_PORT=3306
```

## Step 2: Install Required Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

This will install the necessary packages including `mysql2` and `dotenv` for database connectivity.

## Step 3: Configure Security Groups

Before you can connect to your Aurora Serverless database, you need to configure the security groups to allow inbound connections.

Run the following command to see instructions:

```bash
npm run security-guide
```

Follow the instructions to configure your security groups in the AWS Console.

## Step 4: Test Database Connection

Before creating tables, test your connection to the Aurora Serverless database:

```bash
npm run test-db
```

This will attempt to connect to your database and list available databases and tables.

## Step 5: Create Database Tables

If the connection test is successful, run the database setup script to create the necessary tables:

```bash
npm run setup-db
```

This script will:
- Connect to your Aurora Serverless MySQL database
- Create the database if it doesn't exist
- Create the required tables (expenses, categories, users, user_expenses, budgets)
- Insert default categories

If you encounter module type errors, run:

```bash
npm run fix-modules
```

## Step 6: Prepare Lambda Resolver

To deploy the Lambda resolver that will connect AppSync to your Aurora Serverless database:

```bash
npm run prepare-lambda
```

This will create a package in the `scripts/lambda-package` directory with everything you need to deploy to AWS Lambda.

Follow the instructions in the generated README file to deploy the Lambda function.

## Step 7: Generate AppSync Resolver Templates

To generate the resolver templates for your AppSync API:

```bash
npm run generate-resolvers
```

This will create a directory with resolver templates for each GraphQL operation in your schema.

## Step 8: Configure AppSync Resolvers

1. Go to your AWS AppSync console
2. Select your API
3. Go to the "Data Sources" section
4. Create a new data source:
   - Data source type: AWS Lambda function
   - Name: ExpenseTrackerLambdaDataSource
   - Region: Select your Lambda function's region
   - Function ARN: Select your Lambda function

5. Follow the instructions in the `scripts/appsync-resolvers/README.md` file to configure your resolvers.

## Step 9: Test Your Setup

1. Go to the "Queries" section in AppSync
2. Try running a query, such as:

```graphql
query {
  getAllCategories {
    id
    name
    description
  }
}
```

You should see the default categories that were inserted during setup.

## Database Schema

The database includes the following tables:

1. **expenses**: Stores all expense records
2. **categories**: Stores expense categories
3. **users**: Stores user information
4. **user_expenses**: Links users to their expenses
5. **budgets**: Stores budget information by category and month

## Using the Database in Your Application

The application is already configured to use the GraphQL API, which connects to your Aurora Serverless database through the Lambda resolver. You can use the provided GraphQL queries and mutations in your React components to interact with the database.

Example:

```javascript
import { generateClient } from 'aws-amplify/api';
import { getAllExpenses } from './graphql/queries';
import { createExpense } from './graphql/mutations';

// Create a client
const client = generateClient();

// Fetch all expenses
const fetchExpenses = async () => {
  try {
    const expenseData = await client.graphql({
      query: getAllExpenses
    });
    const expenses = expenseData.data.getAllExpenses;
    console.log('Expenses:', expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
  }
};

// Create a new expense
const addExpense = async (expenseDetails) => {
  try {
    const { name, amount, category, date } = expenseDetails;
    const result = await client.graphql({
      query: createExpense,
      variables: {
        name,
        amount: parseFloat(amount),
        category,
        date: new Date(date).toISOString()
      }
    });
    console.log('New expense created:', result.data.createExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
  }
};
```

## Troubleshooting

If you encounter any issues:

1. Check your database connection parameters in the `.env` file
2. Ensure your Aurora Serverless database is accessible from your Lambda function
   - Check the security group settings to allow inbound connections
   - Make sure the database is publicly accessible or in the same VPC as your Lambda
3. Check the Lambda function logs in AWS CloudWatch
4. Verify that your AppSync resolvers are correctly configured
5. Check the AppSync logs for any errors

### Common Issues and Solutions

#### Module Type Errors

If you see errors related to ES modules vs CommonJS, run:

```bash
npm run fix-modules
```

#### Connection Timeout

If you see connection timeout errors, it's likely a security group issue. Run:

```bash
npm run security-guide
```

And follow the instructions to configure your security groups.

#### Lambda Execution Role Permissions

Ensure your Lambda execution role has the following permissions:
- AmazonRDSDataFullAccess
- AWSLambdaVPCAccessExecutionRole

For more detailed information, refer to the AWS documentation:
- [Aurora Serverless](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless.html)
- [AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) 