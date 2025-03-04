import React, { useState } from "react";
import PropTypes from "prop-types"; // Import prop-types
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { Amplify } from "aws-amplify";
//import awsconfig from "./aws-exports";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseList from "./components/ExpenseList";
import ExpenseChart from "./components/ExpenseChart";

//Amplify.configure(awsconfig);
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
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Personal Expense Tracker</h1>
          <ExpenseForm onSubmit={handleExpenseSubmit} />
          <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
          <ExpenseChart expenses={expenses} />
          <button
            onClick={signOut}
            className="mt-6 w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    </QueryClientProvider>
  );
}

// Add prop type validation
App.propTypes = {
  signOut: PropTypes.func.isRequired, // signOut is a required function
  user: PropTypes.object, // user is an optional object
};

export default withAuthenticator(App);