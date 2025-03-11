// App.jsx
import React, { useState, useEffect } from 'react';
import { client } from './amplifyconfiguration.js';
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import { createExpense, listExpenses, deleteExpense, updateExpense } from './utils/expenseAPI';

// Import components
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Dashboard from './components/Dashboard';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const expensesData = await listExpenses();
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setAlert({
        type: 'danger',
        message: `Error fetching expenses: ${error.message}`
      });
    }
  };

  const addExpense = async (expense) => {
    try {
      // Format the expense data according to the schema
      const expenseInput = {
        name: expense.name,
        amount: parseFloat(expense.amount),
        category: expense.category,
        date: new Date(expense.date).toISOString(),
      };
      
      // Call the API to create the expense
      const newExpense = await createExpense(expenseInput);
      
      // Update the local state with the new expense
      setExpenses([...expenses, newExpense]);
      
      // Show success message
      setAlert({
        type: 'success',
        message: 'Expense added successfully!'
      });
      
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    } catch (error) {
      console.error('Error adding expense:', error);
      setAlert({
        type: 'danger',
        message: `Error adding expense: ${error.message}`
      });
      
      setTimeout(() => {
        setAlert(null);
      }, 5000);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter(expense => expense.id !== id));
      setAlert({
        type: 'success',
        message: 'Expense deleted successfully!'
      });
      
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting expense:', error);
      setAlert({
        type: 'danger',
        message: `Error deleting expense: ${error.message}`
      });
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    
    try {
      if (!formData.name || !formData.amount) {
        setError('Name and amount are required');
        return;
      }
      
      // Create a properly formatted expense object
      const expenseInput = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      };
      
      console.log('Submitting expense:', expenseInput);
      
      const result = await client.graphql({
        query: mutations.createExpense,
        variables: { input: expenseInput }
      });
      
      console.log('Create expense result:', result);
      
      if (result.data && result.data.createExpense) {
        // Reset form on success
        setFormData({
          name: '',
          amount: '',
          category: 'Food',
          date: new Date().toISOString().split('T')[0]
        });
        
        // Refresh expense list
        fetchExpenses();
      } else {
        setError('Failed to create expense. Please try again.');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      
      // More detailed error logging
      if (error.errors) {
        error.errors.forEach((err, index) => {
          console.error(`Error ${index + 1}:`, err);
        });
      }
      
      setError('Failed to create expense. Please check your input and try again.');
    }
  }

  return (
    <div className="app-container">
      <Header />
      
      <div className="container">
        <div className="main-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="page-grid">
            <div>
              <ExpenseForm 
                formData={formData} 
                setFormData={setFormData} 
                handleSubmit={handleSubmit} 
                error={error}
              />
              
              <div className="mt-6">
                <Dashboard expenses={expenses} />
              </div>
            </div>
            
            <ExpenseList 
              expenses={expenses} 
              handleDelete={handleDeleteExpense} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
