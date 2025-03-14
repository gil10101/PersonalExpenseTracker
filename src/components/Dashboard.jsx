import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ExpenseChart from './ExpenseChart';
import ExpensePieChart from './ExpensePieChart';
import ExpenseBarChart from './ExpenseBarChart';
import { listExpenses } from '../utils/expenseAPI';
import { useAuth } from '../utils/AuthContext';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalExpense, setTotalExpense] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [placeholderCount, setPlaceholderCount] = useState(0);
  const { user } = useAuth();

  // Get user email (prefer email attribute, fallback to username)
  const userEmail = user?.email || user?.username || 'User';

  // Function to check if an expense is a placeholder
  const isPlaceholderExpense = (expense) => {
    return expense.isPlaceholder || 
           expense.id.startsWith('placeholder-') || 
           expense.id.startsWith('recovered-');
  };

  // Function to fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug log to see user information
      console.log('User info in Dashboard:', user);
      console.log('Using userId for expenses:', user?.id);
      
      // Pass the user ID to filter expenses - use ID, not email
      const data = await listExpenses(user?.id);
      
      if (data && Array.isArray(data)) {
        setExpenses(data);
        
        // Count placeholder expenses
        const placeholders = data.filter(expense => isPlaceholderExpense(expense));
        setPlaceholderCount(placeholders.length);
        
        // Calculate total expenses safely - exclude placeholders from total
        const realExpenses = data.filter(expense => !isPlaceholderExpense(expense));
        const total = realExpenses.reduce((sum, expense) => {
          const amount = typeof expense.amount === 'number' ? expense.amount : 0;
          return sum + amount;
        }, 0);
        
        setTotalExpense(total);
        
        // Reset retry count on success
        setRetryCount(0);
      } else {
        // If we got no data
        setExpenses([]);
        setTotalExpense(0);
        setPlaceholderCount(0);
        
        // Only show error if this is not a retry
        if (retryCount === 0) {
          setError('No expense data available. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please try again later.');
      setExpenses([]);
      setTotalExpense(0);
      setPlaceholderCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchExpenses();
  };

  // Fetch expenses when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Group expenses by category - with safety checks and excluding placeholders
  const expensesByCategory = expenses
    .filter(expense => !isPlaceholderExpense(expense)) // Only include real expenses
    .reduce((acc, expense) => {
      if (!expense) return acc;
      
      const category = expense.category || 'Other';
      const amount = typeof expense.amount === 'number' ? expense.amount : 0;
      
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += amount;
      return acc;
    }, {});

  // Format data for pie chart
  const pieChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ]
      }
    ]
  };

  if (loading) return (
    <Container>
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading dashboard data...</span>
        </Spinner>
        <p className="mt-2">Loading your expense data...</p>
      </div>
    </Container>
  );

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          Dashboard
          {placeholderCount > 0 && (
            <Badge bg="warning" className="ms-2" style={{ fontSize: '0.5em', verticalAlign: 'middle' }}>
              {placeholderCount} partial
            </Badge>
          )}
        </h2>
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            className="me-3" 
            onClick={handleRetry}
            disabled={loading}
          >
            Refresh
          </Button>
          <p className="mb-0 text-muted">Welcome back, <strong>{userEmail}</strong>!</p>
        </div>
      </div>
      
      {placeholderCount > 0 && (
        <Alert variant="warning" className="mb-3">
          <p className="mb-0">
            <strong>Note:</strong> Some expense data is incomplete. 
            {placeholderCount} of {expenses.length} expenses are showing partial data. 
            Click "Refresh" to try loading full data.
          </p>
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center mb-4">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={handleRetry}>
            Try Again
          </Button>
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>Total Expenses</Card.Title>
              <Card.Text className="display-4">${totalExpense.toFixed(2)}</Card.Text>
              {placeholderCount > 0 && (
                <small className="text-muted d-block mb-2">
                  (Excludes {placeholderCount} partial expenses)
                </small>
              )}
              <Link to="/expenses">
                <Button variant="primary">View All Expenses</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>Categories</Card.Title>
              <Card.Text className="display-4">{Object.keys(expensesByCategory).length}</Card.Text>
              <Link to="/add-expense">
                <Button variant="success">Add New Expense</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>Transactions</Card.Title>
              <Card.Text className="display-4">
                {expenses.length - placeholderCount}
                {placeholderCount > 0 && (
                  <small className="text-muted" style={{ fontSize: '0.4em' }}> (+{placeholderCount} partial)</small>
                )}
              </Card.Text>
              <Link to="/expenses">
                <Button variant="info">View Transactions</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {(expenses.length - placeholderCount) > 0 ? (
        <Row>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Expense Distribution</Card.Title>
                {Object.keys(expensesByCategory).length > 0 ? (
                  <ExpensePieChart data={pieChartData} />
                ) : (
                  <div className="text-center text-muted py-4">
                    No complete expense data available for chart
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Expenses by Category</Card.Title>
                {Object.keys(expensesByCategory).length > 0 ? (
                  <ExpenseBarChart expenses={expenses.filter(e => !isPlaceholderExpense(e))} />
                ) : (
                  <div className="text-center text-muted py-4">
                    No complete expense data available for chart
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : !error && (
        <Alert variant="info">
          No expenses found. Click the "Add New Expense" button to create one.
        </Alert>
      )}
    </Container>
  );
};

export default Dashboard; 