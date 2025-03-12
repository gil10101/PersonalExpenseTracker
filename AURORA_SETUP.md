# Aurora Serverless MySQL Setup for Personal Expense Tracker

This guide provides detailed instructions on how to set up and connect your Aurora Serverless MySQL database to your Personal Expense Tracker application.

## Quick Start

For a guided setup process that walks you through all the steps, run:

```bash
npm run setup-all
```

This interactive script will guide you through:
1. Testing your database connection
2. Configuring security groups
3. Creating database tables
4. Preparing the Lambda function
5. Generating AppSync resolver templates

## Manual Setup

If you prefer to run each step manually, follow these instructions:

### 1. Test Database Connection

```bash
npm run test-db
```

This will test your connection to the Aurora Serverless database and show you available databases and tables.

### 2. Configure Security Groups

```bash
npm run security-guide
```

This will provide guidance on how to configure your security groups to allow connections to your Aurora Serverless database.

### 3. Create Database Tables

```bash
npm run setup-db
```

This will create the necessary tables in your Aurora Serverless database.

### 4. Prepare Lambda Function

```bash
npm run prepare-lambda
```

This will create a package in the `scripts/lambda-package` directory with everything you need to deploy to AWS Lambda.

### 5. Generate AppSync Resolver Templates

```bash
npm run generate-resolvers
```

This will create a directory with resolver templates for each GraphQL operation in your schema.

## Troubleshooting

### Module Type Errors

If you encounter errors related to ES modules vs CommonJS, run:

```bash
npm run fix-modules
```

This will convert your CommonJS scripts to ES modules or vice versa, depending on your package.json configuration.

### Connection Issues

If you're having trouble connecting to your Aurora Serverless database, check:

1. Your `.env` file has the correct database credentials:
   ```
   DB_HOST=database-2.cluster-c26a6o2q3bp.us-east-1.rds.amazonaws.com
   DB_USERNAME=admin
   DB_PASSWORD=S9ZxGl9BhIiMbOpWFIKw
   DB_NAME=database-2
   DB_PORT=3306
   ```

2. Your security groups are configured correctly to allow connections from your IP address or Lambda function.

3. Your Aurora Serverless database is publicly accessible or in the same VPC as your Lambda function.

## Database Schema

The database includes the following tables:

1. **expenses**: Stores all expense records
2. **categories**: Stores expense categories
3. **users**: Stores user information
4. **user_expenses**: Links users to their expenses
5. **budgets**: Stores budget information by category and month

## Next Steps

After setting up your Aurora Serverless database and AppSync API:

1. Deploy your Lambda function to AWS Lambda
2. Configure your AppSync resolvers using the generated templates
3. Test your setup by running a GraphQL query in the AppSync console
4. Start using your Personal Expense Tracker application!

For more detailed instructions, refer to the [DB_SETUP.md](./DB_SETUP.md) file. 