# AppSync Resolver Configuration

This directory contains the resolver templates for your AppSync API.

## Directory Structure

- `query/`: Contains resolvers for Query operations
- `mutation/`: Contains resolvers for Mutation operations
- `expense/`: Contains resolvers for Expense fields
- `category/`: Contains resolvers for Category fields
- `budget/`: Contains resolvers for Budget fields

Each operation has two files:
- `<operation>.request.vtl`: The request mapping template
- `<operation>.response.vtl`: The response mapping template

## How to Configure Resolvers in AppSync

1. Go to the AWS AppSync console: https://console.aws.amazon.com/appsync/
2. Select your API
3. Go to the "Schema" section
4. For each field in the Query and Mutation types:
   a. Click "Attach" next to the field
   b. Select your Lambda data source
   c. Copy the content of the corresponding request mapping template
   d. Copy the content of the corresponding response mapping template
   e. Click "Save Resolver"

## Query Operations

- singlePost
- getExpensesByCategory
- getExpensesByDateRange
- getAllExpenses
- getAllCategories
- getBudgetsByMonth

## Mutation Operations

- putPost
- createExpense
- name
- amount
- category
- date
- userId
- updateExpense
- id
- name
- amount
- category
- date
- deleteExpense
- createBudget
- userId
- categoryId
- amount
- month
- year

## Expense Fields

- id
- name
- amount
- category
- date
- createdAt
- updatedAt

## Category Fields

- id
- name
- description
- createdAt
- updatedAt

## Budget Fields

- id
- userId
- categoryId
- category
- amount
- month
- year
- createdAt
- updatedAt
