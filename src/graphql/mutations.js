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
      userId
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
    $date: AWSDateTime,
    $userId: ID
  ) {
    updateExpense(
      id: $id,
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
      userId
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
      userId
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

export const createPost = /* GraphQL */ `
  mutation CreatePost(
    $title: String!
  ) {
    createPost(
      title: $title
    ) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const updatePost = /* GraphQL */ `
  mutation UpdatePost(
    $id: ID!,
    $title: String
  ) {
    updatePost(
      id: $id,
      title: $title
    ) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const deletePost = /* GraphQL */ `
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      id
      title
      createdAt
      updatedAt
    }
  }
`; 