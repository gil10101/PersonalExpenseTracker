# Personal Expense Tracker

A React application for tracking personal expenses, built with React, AWS Amplify, and AppSync.

## Features

- Track expenses with name, amount, category, and date
- View expense summary on the dashboard
- Visualize expenses with charts
- Add, edit, and delete expenses
- Categorize expenses

## Technology Stack

- **Frontend**: React 19, React Router 7, React Bootstrap
- **State Management**: React Hooks
- **API**: AWS AppSync (GraphQL)
- **Authentication**: AWS Cognito
- **Styling**: Bootstrap 5, CSS
- **Build Tool**: Vite
- **Charts**: Chart.js with react-chartjs-2

## Project Structure

```
src/
├── components/         # React components
│   ├── Dashboard.jsx   # Main dashboard component
│   ├── ExpenseForm.jsx # Form for adding/editing expenses
│   ├── ExpenseList.jsx # List of expenses
│   ├── Header.jsx      # Navigation header
│   └── ...             # Chart components
├── graphql/            # GraphQL operations
│   ├── mutations.js    # GraphQL mutations
│   ├── queries.js      # GraphQL queries
│   └── subscriptions.js # GraphQL subscriptions
├── utils/              # Utility functions
│   ├── amplifyConfig.js # Amplify configuration
│   └── expenseAPI.js   # API functions for expenses
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── ...                 # Other files
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` with your AWS AppSync and Cognito credentials
4. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

The application uses the following environment variables:

- `VITE_GRAPHQL_ENDPOINT`: AppSync GraphQL endpoint
- `VITE_GRAPHQL_API_KEY`: AppSync API key
- `VITE_COGNITO_USER_POOL_ID`: Cognito user pool ID
- `VITE_COGNITO_USER_POOL_CLIENT_ID`: Cognito user pool client ID
- `VITE_COGNITO_IDENTITY_POOL_ID`: Cognito identity pool ID
- `AWS_REGION`: AWS region for all services

## Build

To build the application for production:

```
npm run build
```

## License

MIT
