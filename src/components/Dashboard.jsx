import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ExpenseChart from './ExpenseChart';
import ExpensePieChart from './ExpensePieChart';
import ExpenseBarChart from './ExpenseBarChart';
import { listExpenses } from '../utils/expenseAPI';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const data = await listExpenses();
        setExpenses(data);
        
        // Calculate total expenses
        const total = data.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalExpense(total);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        setError('Failed to load expenses. Please try again later.');
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
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

  if (loading) return <div className="text-center mt-5">Loading dashboard data...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <Container>
      <h2 className="mb-4">Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>Total Expenses</Card.Title>
              <Card.Text className="display-4">${totalExpense.toFixed(2)}</Card.Text>
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
              <Card.Text className="display-4">{expenses.length}</Card.Text>
              <Link to="/expenses">
                <Button variant="info">View Transactions</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Expense Distribution</Card.Title>
              <ExpensePieChart data={pieChartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Expenses by Category</Card.Title>
              <ExpenseBarChart expenses={expenses} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 