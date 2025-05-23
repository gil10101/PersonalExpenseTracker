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

export const getAllExpenses = /* GraphQL */ `
  query GetAllExpenses($userId: ID) {
    getAllExpenses(userId: $userId) {
      id
      name
      amount
      category
      date
      userId
      createdAt
      updatedAt
    }
  }
`;

export const getAllCategories = /* GraphQL */ `
  query GetAllCategories {
    getAllCategories {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const getBudgetsByMonth = /* GraphQL */ `
  query GetBudgetsByMonth($userId: ID!, $month: Int!, $year: Int!) {
    getBudgetsByMonth(userId: $userId, month: $month, year: $year) {
      id
      userId
      categoryId
      category
      amount
      month
      year
      createdAt
      updatedAt
    }
  }
`;

export const getPost = /* GraphQL */ `
  query GetPost($id: ID!) {
    getPost(id: $id) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const listPosts = /* GraphQL */ `
  query ListPosts(
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`; 