// App.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseCarousel from "./components/ExpenseCarousel";
import "./App.css";

Amplify.configure(awsconfig);
const queryClient = new QueryClient();

function App({ signOut, user }) {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);

  const handleExpenseSubmit = (expense) => {
    if (expense.id) {
      setExpenses((prevExpenses) =>
        prevExpenses.map((e) => (e.id === expense.id ? expense : e))
      );
    } else {
      setExpenses((prevExpenses) => [...prevExpenses, { ...expense, id: Date.now() }]);
    }
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id));
  };

  const handleEditExpense = (id) => {
    const expenseToEdit = expenses.find((expense) => expense.id === id);
    if (expenseToEdit) setEditingExpense(expenseToEdit);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <h1 className="app-title">Personal Expense Tracker</h1>
        <div className="app-layout">
          <div className="form-section">
            <ExpenseForm onSubmit={handleExpenseSubmit} editingExpense={editingExpense} />
          </div>
          <div className="divider"></div>
          <div className="charts-section">
            <ExpenseCarousel expenses={expenses} onDelete={handleDeleteExpense} onEdit={handleEditExpense} />
          </div>
        </div>
        <button onClick={signOut} className="sign-out-button">
          Sign Out
        </button>
      </div>
    </QueryClientProvider>
  );
}

App.propTypes = {
  signOut: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default withAuthenticator(App);
