import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

// Configure Amplify with environment variables
const config = {
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'https://tov3dxzvsfe4pdrvwv46uawjty.appsync-api.us-east-2.amazonaws.com/graphql',
      region: import.meta.env.AWS_REGION || 'us-east-2',
      defaultAuthMode: 'apiKey',
      apiKey: import.meta.env.VITE_GRAPHQL_API_KEY || 'da2-w63pn5x5efd47ponjrsxlyy6m4'
    }
  },
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-2_VT8wQfSHh',
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '2tsqob7t5fuidn9ntd505jnkj4',
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || 'us-east-2:9d8e77c4-28fd-4b59-8fb6-584ed46de845'
    }
  }
};

// Pre-configure a client for use throughout the app
let client;

// Configure Amplify
export const configureAmplify = () => {
  // Configure Amplify using the config object
  Amplify.configure(config);
  
  console.log('Amplify configured with AppSync endpoint:', config.API.GraphQL.endpoint);
  
  // Generate the client after configuration
  client = generateClient();
  return client;
};

// Initialize the client immediately
configureAmplify();

// Export the client and config
export { client, config }; 