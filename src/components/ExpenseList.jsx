import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { listExpenses, deleteExpense } from '../utils/expenseAPI';
import './ExpenseList.css';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Function to fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await listExpenses();
      // Sort expenses by date (newest first)
      const sortedExpenses = [...data].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setExpenses(sortedExpenses);
      setError(null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle expense deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setDeleteLoading(true);
        await deleteExpense(id);
        // Refresh the expense list
        fetchExpenses();
      } catch (err) {
        console.error('Error deleting expense:', err);
        setError('Failed to delete expense. Please try again later.');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get category badge color
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Food': 'primary',
      'Transportation': 'success',
      'Housing': 'danger',
      'Entertainment': 'warning',
      'Utilities': 'info',
      'Healthcare': 'secondary',
      'Education': 'dark'
    };
    
    return categoryColors[category] || 'light';
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading expenses...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Expense List</h2>
        <Link to="/add-expense">
          <Button variant="success">Add New Expense</Button>
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {expenses.length === 0 ? (
        <Alert variant="info">
          No expenses found. Click the "Add New Expense" button to create one.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped hover className="expense-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.name}</td>
                  <td>${expense.amount.toFixed(2)}</td>
                  <td>
                    <Badge bg={getCategoryColor(expense.category)}>
                      {expense.category}
                    </Badge>
                  </td>
                  <td>{formatDate(expense.date)}</td>
                  <td>
                    <Link to={`/edit-expense/${expense.id}`} className="me-2">
                      <Button variant="outline-primary" size="sm">Edit</Button>
                    </Link>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      disabled={deleteLoading}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default ExpenseList;
