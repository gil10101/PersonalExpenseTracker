import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { listExpenses, deleteExpense } from '../utils/expenseAPI';
import { useAuth } from '../utils/AuthContext';
import './ExpenseList.css';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [placeholderCount, setPlaceholderCount] = useState(0);
  const { user } = useAuth();

  // Load expenses on component mount
  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Function to fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug log to see user information
      console.log('User info in ExpenseList:', user);
      
      // Use consistent userId field from the user object
      // This matches the field name in the database (userId in camelCase)
      console.log('Using userId for expenses:', user?.id);
      
      // Pass the user ID to filter expenses
      const data = await listExpenses(user?.id);
      
      // If we got data, process it
      if (data && Array.isArray(data)) {
        // Reset retry count on success
        setRetryCount(0);
        
        // Count placeholder/recovered expenses
        const placeholders = data.filter(expense => 
          expense.isPlaceholder || expense.id.startsWith('placeholder-') || expense.id.startsWith('recovered-')
        );
        setPlaceholderCount(placeholders.length);
        
        // Sort expenses by date (newest first) - with null safety
        const sortedExpenses = [...data].sort((a, b) => {
          // Handle missing dates
          if (!a.date) return 1;
          if (!b.date) return -1;
          
          try {
            return new Date(b.date) - new Date(a.date);
          } catch (err) {
            console.error('Date sorting error:', err);
            return 0;
          }
        });
        
        setExpenses(sortedExpenses);
      } else {
        // If no data returned, set empty array
        setExpenses([]);
        setPlaceholderCount(0);
        // Only show error if this wasn't a retry attempt
        if (retryCount === 0) {
          setError('No expense data available. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchExpenses();
  };

  // Function to handle expense deletion
  const handleDelete = async (id) => {
    // Don't allow deletion of placeholder expenses
    if (id.startsWith('placeholder-') || id.startsWith('recovered-')) {
      alert('Cannot delete this expense until data is fully loaded. Please try again later.');
      return;
    }
    
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
    if (!dateString) return 'N/A';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    
    // Parse the date string to a Date object
    let dateObj;
    try {
      // Try to parse as is (should work for ISO-8601 format)
      dateObj = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (e) {
      // Fallback parsing for different formats
      try {
        if (dateString.includes('T')) {
          // It's an ISO format but might be malformed
          const datePart = dateString.split('T')[0];
          const [year, month, day] = datePart.split('-');
          dateObj = new Date(year, month - 1, day);
        } else if (dateString.includes(' ')) {
          // It's a MySQL format
          const datePart = dateString.split(' ')[0];
          const [year, month, day] = datePart.split('-');
          dateObj = new Date(year, month - 1, day);
        } else {
          // It's just a date string YYYY-MM-DD
          const [year, month, day] = dateString.split('-');
          dateObj = new Date(year, month - 1, day);
        }
      } catch (err) {
        console.error('Error parsing date:', dateString, err);
        return 'Invalid date';
      }
    }
    
    return dateObj.toLocaleDateString(undefined, options);
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
      'Education': 'dark',
      'Other': 'light'
    };
    
    return categoryColors[category] || 'light';
  };
  
  // Function to safely format amount
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    
    try {
      // Convert to number if it's a string
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return `$${numAmount.toFixed(2)}`;
    } catch (err) {
      console.error('Error formatting amount:', amount, err);
      return '$0.00';
    }
  };
  
  // Function to check if an expense is a placeholder
  const isPlaceholderExpense = (expense) => {
    return expense.isPlaceholder || 
           expense.id.startsWith('placeholder-') || 
           expense.id.startsWith('recovered-');
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
        <h2>
          Expense List
          {placeholderCount > 0 && (
            <Badge bg="warning" className="ms-2" style={{ fontSize: '0.5em', verticalAlign: 'middle' }}>
              {placeholderCount} partial
            </Badge>
          )}
        </h2>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2" 
            onClick={handleRetry}
            disabled={loading}
          >
            Refresh
          </Button>
          <Link to="/add-expense">
            <Button variant="success">Add New Expense</Button>
          </Link>
        </div>
      </div>
      
      {placeholderCount > 0 && (
        <Alert variant="warning" className="mb-3">
          <Alert.Heading>Some expense data is incomplete</Alert.Heading>
          <p>
            Due to temporary data access limits, {placeholderCount} expense{placeholderCount !== 1 ? 's' : ''} may 
            be showing partial information. You can click "Refresh" to try loading full data.
          </p>
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={handleRetry}>
            Try Again
          </Button>
        </Alert>
      )}
      
      {expenses.length === 0 && !error ? (
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
              {expenses.map((expense) => {
                const isPlaceholder = isPlaceholderExpense(expense);
                
                return (
                  <tr 
                    key={expense.id || `expense-${Math.random()}`}
                    className={isPlaceholder ? "placeholder-row" : ""}
                    style={isPlaceholder ? { opacity: 0.7 } : {}}
                  >
                    <td>
                      {expense.name || 'Unnamed Expense'}
                      {isPlaceholder && (
                        <Badge bg="warning" pill className="ms-2">Partial</Badge>
                      )}
                    </td>
                    <td>{formatAmount(expense.amount)}</td>
                    <td>
                      <Badge bg={getCategoryColor(expense.category)}>
                        {expense.category || 'Uncategorized'}
                      </Badge>
                    </td>
                    <td>{formatDate(expense.date)}</td>
                    <td>
                      {isPlaceholder ? (
                        <Button variant="outline-secondary" size="sm" disabled>
                          Loading...
                        </Button>
                      ) : (
                        <>
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
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default ExpenseList;
