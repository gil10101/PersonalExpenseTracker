/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateExpense = /* GraphQL */ `
  subscription OnCreateExpense($filter: ModelSubscriptionExpenseFilterInput) {
    onCreateExpense(filter: $filter) {
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

export const onUpdateExpense = /* GraphQL */ `
  subscription OnUpdateExpense($filter: ModelSubscriptionExpenseFilterInput) {
    onUpdateExpense(filter: $filter) {
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

export const onDeleteExpense = /* GraphQL */ `
  subscription OnDeleteExpense($filter: ModelSubscriptionExpenseFilterInput) {
    onDeleteExpense(filter: $filter) {
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