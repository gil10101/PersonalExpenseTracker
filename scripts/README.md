# Scripts Directory

This directory contains utility scripts for managing the AWS AppSync API, database, and resolvers for the Personal Expense Tracker application.

## Core Utility Files

- **resolver-utils.js**: Utility functions for managing AppSync resolvers
- **sql-utils.js**: Utility functions for managing the database

## Main Management Scripts

- **manage-resolvers.js**: Consolidated script for managing all AppSync resolvers
- **manage-database.js**: Consolidated script for managing the database

## Directory Structure

- **appsync-resolvers/**: Contains resolver templates for AppSync
- **lambda-package/**: Contains Lambda function code for AppSync resolvers

## Usage

### Managing Resolvers

```bash
# Update all resolvers
node manage-resolvers.js

# Update a specific resolver
node manage-resolvers.js Query getExpense
node manage-resolvers.js Mutation createExpense
```

### Managing Database

```bash
# Check database connection
node manage-database.js check-connection

# Check all tables
node manage-database.js check-tables

# Check a specific table
node manage-database.js check-table expenses

# Setup database tables
node manage-database.js setup-tables

# Fix expenses table
node manage-database.js fix-expenses

# Standardize database schema
node manage-database.js standardize

# Add sample data
node manage-database.js add-sample-data

# Run a SQL file
node manage-database.js run-sql-file path/to/file.sql

# Setup everything (tables, standardize, sample data)
node manage-database.js setup-all
```

## Environment Variables

The scripts use the following environment variables from the `.env` file:

### AppSync Configuration
- `APPSYNC_API_ID`: AppSync API ID
- `AWS_REGION`: AWS region
- `APPSYNC_DATASOURCE_NAME`: AppSync data source name

### Database Configuration
- `DB_HOST`: Database host
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DB_PORT`: Database port (default: 3306)
- `DB_SSL`: Whether to use SSL (true/false)

### RDS Data API Configuration
- `DB_CLUSTER_ARN`: RDS cluster ARN
- `DB_SECRET_ARN`: RDS secret ARN 