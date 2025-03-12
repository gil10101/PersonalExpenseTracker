# AWS Amplify v6 Troubleshooting Guide

This guide provides solutions for common issues you might encounter when using AWS Amplify v6 with your Personal Expense Tracker application.

## Common Errors

### 1. "The requested module does not provide an export named 'API'"

**Error:**
```
Uncaught SyntaxError: The requested module '/node_modules/.vite/deps/aws-amplify.js?v=e83c3a6c' does not provide an export named 'API'
```

**Solution:**
AWS Amplify v6 uses a modular approach. Instead of importing `API` from `aws-amplify`, use:

```javascript
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// Use client.graphql instead of API.graphql
const result = await client.graphql({
  query: myQuery,
  variables: myVariables
});
```

### 2. "graphqlOperation is not a function"

**Error:**
```
Uncaught TypeError: graphqlOperation is not a function
```

**Solution:**
In Amplify v6, you don't need `graphqlOperation`. Instead, pass the query and variables directly:

```javascript
// Old way (v5)
const result = await API.graphql(graphqlOperation(queries.getItem, { id: '123' }));

// New way (v6)
const result = await client.graphql({
  query: queries.getItem,
  variables: { id: '123' }
});
```

### 3. "Cannot read properties of undefined (reading 'graphql')"

**Error:**
```
Uncaught TypeError: Cannot read properties of undefined (reading 'graphql')
```

**Solution:**
This usually happens when the Amplify configuration is incorrect or not loaded. Make sure:

1. You've configured Amplify correctly in your `App.jsx`:

```javascript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
      apiKey: import.meta.env.VITE_GRAPHQL_API_KEY,
      region: 'us-east-2',
      defaultAuthMode: 'apiKey'
    }
  }
});
```

2. Your environment variables are correctly set in `.env`:

```
VITE_GRAPHQL_ENDPOINT=https://your-appsync-endpoint.amazonaws.com/graphql
VITE_GRAPHQL_API_KEY=your-api-key
```

### 4. "Network Error"

**Error:**
```
Network Error: Network request failed
```

**Solution:**
This could be due to:

1. **CORS issues**: Make sure your AppSync API allows requests from your application's domain.
2. **API Key**: Check if your API key is valid and not expired.
3. **Network connectivity**: Ensure you have internet connectivity.
4. **AppSync API status**: Check if your AppSync API is running and accessible.

### 5. "Unauthorized"

**Error:**
```
Unauthorized: Not Authorized to access getExpenses on type Query
```

**Solution:**
This is an authentication issue:

1. Check if your API key is correct.
2. Verify that your AppSync API is configured to use API key authentication.
3. Ensure the API key has the necessary permissions to access the requested resources.

## Testing Your Connection

You can test your connection to AWS AppSync using the built-in test component:

1. Navigate to your application's dashboard.
2. Look for the "AWS Amplify Connection Test" card.
3. Click the "Test Connection" button.

Alternatively, you can run the server-side test script:

```bash
npm run test-appsync
```

## Debugging Tips

1. **Check browser console**: Open your browser's developer tools (F12) and check the console for errors.

2. **Inspect network requests**: In the Network tab of developer tools, look for GraphQL requests to your AppSync endpoint.

3. **Add logging**: Add console.log statements to track the flow of your code:

```javascript
console.log('Before API call');
try {
  const result = await client.graphql({
    query: queries.getAllExpenses
  });
  console.log('API response:', result);
} catch (error) {
  console.error('API error:', error);
}
```

4. **Check environment variables**: Make sure your environment variables are correctly loaded:

```javascript
console.log('GraphQL endpoint:', import.meta.env.VITE_GRAPHQL_ENDPOINT);
console.log('API key:', import.meta.env.VITE_GRAPHQL_API_KEY ? 'Set' : 'Not set');
```

5. **Verify AppSync configuration**: In the AWS Console, check your AppSync API configuration:
   - API key expiration date
   - Authentication settings
   - Schema definition

For more information, refer to the [AWS Amplify v6 documentation](https://docs.amplify.aws/react/build-a-backend/graphqlapi/query-data/). 