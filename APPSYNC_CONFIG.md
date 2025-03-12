# AWS AppSync Configuration

This document contains the configuration details for the AWS AppSync GraphQL API used in the Personal Expense Tracker application.

## API Details

| Property | Value |
|----------|-------|
| API Name | My AppSync API |
| API ID | x5ujbpctlnbsxahehbvnt3ie3y |
| API ARN | arn:aws:appsync:us-east-2:711727973280:apis/x5ujbpctlnbsxahehbvnt3ie3y |
| API Type | GraphQL API |
| Private API | Off |

## Endpoints

| Endpoint Type | URL |
|---------------|-----|
| GraphQL Endpoint | https://tov3dxzvsfe4pdrvwv46uawjty.appsync-api.us-east-2.amazonaws.com/graphql |
| Real-time Endpoint | wss://tov3dxzvsfe4pdrvwv46uawjty.appsync-realtime-api.us-east-2.amazonaws.com/graphql |

## Data Source Configuration

The AppSync API is configured to use an Aurora Serverless MySQL database as the data source.

| Property | Value |
|----------|-------|
| Data Source Name | ExpenseDB |
| Database Type | Aurora Serverless MySQL |
| Region | us-east-2 |

## Environment Variables

The following environment variables are used to configure the AppSync API in the application:

```
# API Configuration
VITE_GRAPHQL_ENDPOINT=https://tov3dxzvsfe4pdrvwv46uawjty.appsync-api.us-east-2.amazonaws.com/graphql
VITE_GRAPHQL_API_KEY=da2-w63pn5x5efd47ponjrsxlyy6m4

# AppSync Configuration for Scripts
APPSYNC_API_ID=x5ujbpctlnbsxahehbvnt3ie3y
APPSYNC_DATASOURCE_NAME=ExpenseDB
AWS_REGION=us-east-2
```

## Using the API

To use the AppSync API in your application, you need to:

1. Configure the AWS Amplify library with the AppSync details
2. Use the GraphQL API to query and mutate data
3. Optionally, use the real-time endpoint for subscriptions

Example configuration in your application:

```javascript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
      apiKey: import.meta.env.VITE_GRAPHQL_API_KEY,
      region: 'us-east-2'
    }
  }
});
```

## Testing the API

You can test the API using the `test-appsync.js` script in the `scripts` directory:

```bash
node scripts/test-appsync.js
```

This script will run an introspection query to verify that the API is accessible and properly configured. 