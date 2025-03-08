import React, { useState } from "react";
import PropTypes from "prop-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseList from "./components/ExpenseList";
import ExpenseCarousel from "./components/ExpenseCarousel";
import "./App.css";

Amplify.configure(awsconfig);
const queryClient = new QueryClient();

function App({ signOut, user }) {
  const [expenses, setExpenses] = useState([]);

  const handleExpenseSubmit = (expense) => {
    setExpenses((prevExpenses) => [...prevExpenses, expense]);
  };

  const handleDeleteExpense = (index) => {
    setExpenses((prevExpenses) => prevExpenses.filter((_, i) => i !== index));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <h1 className="app-title">Personal Expense Tracker</h1>
        <div className="app-layout">
          <div className="form-section">
            <ExpenseForm onSubmit={handleExpenseSubmit} />
          </div>
          <div className="divider"></div>
          <div className="charts-section">
            <ExpenseCarousel expenses={expenses} />
            <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
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