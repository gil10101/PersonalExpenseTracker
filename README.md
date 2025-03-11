# Personal Expense Tracker

A React application for tracking personal expenses using AWS Amplify Gen2.

## Setup

### Environment Variables

This project uses environment variables for AWS Amplify configuration. Follow these steps to set up your environment:

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values with your actual AWS Amplify configuration:
   ```
   # Cognito Configuration
   VITE_COGNITO_USER_POOL_ID=your-user-pool-id
   VITE_COGNITO_USER_POOL_CLIENT_ID=your-user-pool-client-id
   VITE_COGNITO_IDENTITY_POOL_ID=your-identity-pool-id

   # API Configuration
   VITE_GRAPHQL_ENDPOINT=your-graphql-endpoint
   VITE_GRAPHQL_API_KEY=your-api-key
   ```

   You can find these values in your AWS Amplify console or in the `amplify_outputs.json` file after running `amplify push`.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## AWS Amplify Gen2 Configuration

This project uses AWS Amplify Gen2 for authentication and API access. The configuration is handled in the following files:

- `src/amplifyconfiguration.js`: Main configuration file for AWS Amplify
- `amplify/data/resource.ts`: Data model definition
- `amplify/auth/resource.ts`: Authentication configuration
- `amplify/backend.ts`: Backend configuration

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the production version
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint to check for code issues

## Features
- Create, read, update, and delete expenses
- Categorize expenses
- View expense history
- Filter expenses by category and date range
- Visualize spending patterns

## Troubleshooting
- If you encounter GraphQL errors, check that your schema matches the expected input/output types
- For authentication issues, verify your Cognito setup
- For database connection issues, check your AWS RDS configuration

## Deployment
To deploy your application to AWS:
```
npx amplify publish
```

This will build your React application and deploy it to AWS Amplify hosting.
