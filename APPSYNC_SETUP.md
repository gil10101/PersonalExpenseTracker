# AWS AppSync Setup Guide

This guide explains how to set up AWS AppSync with Aurora Serverless MySQL for your Personal Expense Tracker application.

## Prerequisites

- AWS Account with access to AppSync and Aurora Serverless
- Aurora Serverless MySQL database already set up
- AWS CLI configured with appropriate permissions

## Setup Process

You can set up the AppSync API in one of two ways:

### Option 1: Automated Setup

Run the following command to start the guided setup process:

```bash
npm run setup-appsync
```

This script will:
1. Upload the GraphQL schema to AppSync
2. Create resolvers for all queries and mutations
3. Test the API to ensure it's working correctly

Follow the prompts to complete the setup process.

### Option 2: Manual Setup

If you prefer to set up the API manually, follow these steps:

#### Step 1: Upload the GraphQL Schema

```bash
npm run upload-schema
```

This will upload the schema defined in `scripts/schema-template.graphql` to your AppSync API.

Wait for the schema creation to complete in the AWS AppSync console before proceeding.

#### Step 2: Create Resolvers

```bash
npm run create-resolvers
```

This will create resolvers for all queries and mutations defined in the schema, connecting them to your Aurora Serverless MySQL database.

#### Step 3: Test the API

```bash
npm run test-appsync
```

This will test the API to ensure it's working correctly.

## Configuration

The scripts use the following environment variables from your `.env` file:

```
APPSYNC_API_ID=your-appsync-api-id
APPSYNC_DATASOURCE_NAME=your-datasource-name
AWS_REGION=your-aws-region
```

Make sure these variables are set correctly before running the scripts.

## Schema

The GraphQL schema defines the following types:

- **Expense**: Represents an expense record
- **Category**: Represents an expense category
- **Budget**: Represents a budget for a specific category and month

And the following operations:

- **Queries**:
  - `getAllExpenses`: Get all expenses
  - `getExpenseById`: Get an expense by ID
  - `getExpensesByCategory`: Get expenses by category
  - `getExpensesByDateRange`: Get expenses within a date range
  - `getAllCategories`: Get all categories
  - `getBudgetsByMonth`: Get budgets for a specific month

- **Mutations**:
  - `createExpense`: Create a new expense
  - `updateExpense`: Update an existing expense
  - `deleteExpense`: Delete an expense
  - `createCategory`: Create a new category
  - `createBudget`: Create a new budget

## Resolvers

The resolvers connect the GraphQL operations to your Aurora Serverless MySQL database using SQL statements.

For example, the `getAllExpenses` resolver executes the following SQL:

```sql
SELECT * FROM expenses
```

And the `createExpense` resolver executes:

```sql
INSERT INTO expenses (name, amount, category, date, userId) VALUES (:name, :amount, :category, :date, :userId)
SELECT * FROM expenses WHERE id = LAST_INSERT_ID()
```

## Troubleshooting

If you encounter any issues during the setup process:

1. **Schema Upload Fails**: Check that your AppSync API ID is correct and that you have the necessary permissions.

2. **Resolver Creation Fails**: Verify that your data source is correctly set up and that the schema has been successfully created.

3. **API Tests Fail**: Check the error messages for clues. Common issues include:
   - Missing tables in the database
   - Incorrect data source configuration
   - Permission issues

4. **"No schema definition exists" Error**: This means the schema hasn't been uploaded or hasn't finished processing. Wait for the schema creation to complete before creating resolvers.

5. **Database Connection Issues**: Ensure your Aurora Serverless database is accessible from AppSync. Check security groups and network settings.

For more detailed information, refer to the AWS documentation:
- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html)
- [Aurora Serverless Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless.html) 