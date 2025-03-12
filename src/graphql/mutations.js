/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createExpense = /* GraphQL */ `
  mutation CreateExpense(
    $name: String!,
    $amount: Float!,
    $category: String!,
    $date: AWSDateTime!,
    $userId: ID
  ) {
    createExpense(
      name: $name,
      amount: $amount,
      category: $category,
      date: $date,
      userId: $userId
    ) {
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

export const updateExpense = /* GraphQL */ `
  mutation UpdateExpense(
    $id: ID!,
    $name: String,
    $amount: Float,
    $category: String,
    $date: AWSDateTime
  ) {
    updateExpense(
      id: $id,
      name: $name,
      amount: $amount,
      category: $category,
      date: $date
    ) {
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

export const deleteExpense = /* GraphQL */ `
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id) {
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

export const createBudget = /* GraphQL */ `
  mutation CreateBudget(
    $userId: ID!,
    $categoryId: ID!,
    $amount: Float!,
    $month: Int!,
    $year: Int!
  ) {
    createBudget(
      userId: $userId,
      categoryId: $categoryId,
      amount: $amount,
      month: $month,
      year: $year
    ) {
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