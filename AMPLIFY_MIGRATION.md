# AWS Amplify v6 Migration Guide

This guide explains how to migrate your code from AWS Amplify v5 to v6, which is what we're using in this project.

## API Changes

### Old Way (v5)

```javascript
import { API, graphqlOperation } from 'aws-amplify';

// Query
const result = await API.graphql(graphqlOperation(queries.getItem, { id: '123' }));

// Mutation
const result = await API.graphql(graphqlOperation(mutations.createItem, { input: itemDetails }));
```

### New Way (v6)

```javascript
import { generateClient } from 'aws-amplify/api';

// Create a client
const client = generateClient();

// Query
const result = await client.graphql({
  query: queries.getItem,
  variables: { id: '123' }
});

// Mutation
const result = await client.graphql({
  query: mutations.createItem,
  variables: { input: itemDetails }
});
```

## Auth Changes

### Old Way (v5)

```javascript
import { Auth } from 'aws-amplify';

// Sign in
await Auth.signIn(username, password);

// Get current user
const user = await Auth.currentAuthenticatedUser();
```

### New Way (v6)

```javascript
import { signIn, getCurrentUser } from 'aws-amplify/auth';

// Sign in
await signIn({ username, password });

// Get current user
const user = await getCurrentUser();
```

## Storage Changes

### Old Way (v5)

```javascript
import { Storage } from 'aws-amplify';

// Upload file
await Storage.put(key, file);

// Get file
const url = await Storage.get(key);
```

### New Way (v6)

```javascript
import { uploadData, getUrl } from 'aws-amplify/storage';

// Upload file
await uploadData({ key, data: file });

// Get file
const { url } = await getUrl({ key });
```

## Configuration Changes

### Old Way (v5)

```javascript
import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_xxxxxxxx',
    userPoolWebClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    identityPoolId: 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  },
  API: {
    graphql_endpoint: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
    graphql_headers: async () => ({
      'x-api-key': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    })
  }
});
```

### New Way (v6)

```javascript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      region: 'us-east-1',
      userPoolId: 'us-east-1_xxxxxxxx',
      userPoolClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
      identityPoolId: 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    }
  },
  API: {
    GraphQL: {
      endpoint: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql',
      apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      region: 'us-east-1',
      defaultAuthMode: 'apiKey'
    }
  }
});
```

## Benefits of v6

1. **Tree-shaking**: Only imports what you need, reducing bundle size
2. **Modular imports**: Better organization and clearer dependencies
3. **TypeScript improvements**: Better type safety and autocompletion
4. **Consistent API**: More consistent parameter naming and structure
5. **Better error handling**: More detailed error messages

For more information, see the [official AWS Amplify v6 migration guide](https://docs.amplify.aws/react/build-a-backend/auth/migrate-from-v5-to-v6/). 