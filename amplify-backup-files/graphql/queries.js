/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getExpense = /* GraphQL */ `
  query GetExpense($id: ID!) {
    getExpense(id: $id) {
      id
      name
      amount
      category
      date
      createdAt
      updatedAt
    }
  }
`;
export const listExpenses = /* GraphQL */ `
  query ListExpenses(
    $filter: ModelExpenseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listExpenses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        amount
        category
        date
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getExpensesByCategory = /* GraphQL */ `
  query GetExpensesByCategory($category: String!) {
    getExpensesByCategory(category: $category) {
      id
      name
      amount
      category
      date
      createdAt
      updatedAt
    }
  }
`;
export const getExpensesByDateRange = /* GraphQL */ `
  query GetExpensesByDateRange($startDate: AWSDateTime!, $endDate: AWSDateTime!) {
    getExpensesByDateRange(startDate: $startDate, endDate: $endDate) {
      id
      name
      amount
      category
      date
      createdAt
      updatedAt
    }
  }
`;
export const getTodo = /* GraphQL */ `
  query GetTodo($id: ID!) {
    getTodo(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const listTodos = /* GraphQL */ `
  query ListTodos(
    $filter: ModelTodoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncTodos = /* GraphQL */ `
  query SyncTodos(
    $filter: ModelTodoFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncTodos(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        description
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
