# Deployment Instructions

This document provides instructions on how to deploy the date format fixes for the Personal Expense Tracker application.

## Overview of Changes

1. **Client-Side Changes**: 
   - Updated date formatting in ExpenseForm.jsx to use ISO 8601 format for AWSDateTime
   - Updated updateExpense function in expenseAPI.js to handle date formatting

2. **Database Schema Changes**:
   - Modified the `date` column in the `expenses` table from TIMESTAMP to DATETIME
   - Added an index on the `date` column for better query performance

3. **AppSync Resolver Changes**:
   - Updated the mutation resolvers (createExpense, updateExpense, deleteExpense) to use SQL statements instead of Invoke operation
   - Updated the query resolvers (getAllExpenses, getExpensesByCategory, getExpensesByDateRange, getAllCategories, getBudgetsByMonth) to use SQL statements instead of Invoke operation
   - Updated both create and update operations to properly convert ISO 8601 dates to MySQL-compatible format

## Deployment Steps

### Prerequisites

Make sure you have the following environment variables set in your `.env` file:

```
DB_HOST=your-aurora-endpoint
DB_USER=admin
DB_PASSWORD=your-password
DB_NAME=expense_tracker
APPSYNC_API_ID=your-appsync-api-id
AWS_REGION=us-east-2
APPSYNC_DATASOURCE_NAME=ExpenseDB
```

### Option 1: Deploy All Changes at Once

Run the following command to deploy both database schema changes and resolver updates:

```bash
node scripts/deploy-all-changes.js
```

### Option 2: Deploy Changes Separately

#### Deploy Database Schema Changes Only

Run the following command to deploy only the database schema changes:

```bash
node scripts/deploy-database-changes.js
```

#### Deploy Mutation Resolver Changes Only

Run the following command to deploy only the mutation resolver changes:

```bash
node scripts/deploy-updated-resolvers.js
```

#### Deploy Query Resolver Changes Only

Run the following command to deploy only the query resolver changes:

```bash
node scripts/deploy-query-resolvers.js
```

### Verify the Changes

After deploying the changes, you should:

1. Try creating a new expense with a future date (e.g., 2025-03-12)
2. Verify that the expense is created successfully
3. Try updating an existing expense with a different date
4. Verify that the expense is updated successfully
5. Try listing all expenses and verify that they are displayed correctly
6. Try filtering expenses by category and date range

## Troubleshooting

If you encounter any issues during deployment:

1. Check the AWS AppSync console to verify that the resolvers were updated correctly
2. Check the Aurora RDS console to verify that the database schema was updated correctly
3. Check the application logs for any errors related to date formatting or resolver operations

If you continue to experience issues, you may need to:

1. Manually execute the SQL commands in the Aurora RDS console
2. Manually update the resolver templates in the AppSync console
3. Restart the application to ensure the client-side changes take effect

## Rollback Plan

If you need to roll back the changes:

1. Revert the database schema changes:
   ```sql
   ALTER TABLE expenses MODIFY COLUMN date TIMESTAMP NOT NULL;
   ```

2. Revert the resolver templates to their original versions:
   ```javascript
   // Original mutation resolver template
   {
     "version": "2018-05-29",
     "operation": "Invoke",
     "payload": {
       "field": $util.toJson($context.info.fieldName),
       "arguments": $util.toJson($context.arguments)
     }
   }
   ```

3. Revert the client-side changes in ExpenseForm.jsx and expenseAPI.js 