import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { createExpense, getExpense, updateExpense } from '../utils/expenseAPI';
import { useAuth } from '../utils/AuthContext';
import './ExpenseForm.css';

const ExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Predefined categories
  const categories = [
    'Food', 
    'Transportation', 
    'Housing', 
    'Entertainment', 
    'Utilities', 
    'Healthcare', 
    'Education', 
    'Shopping', 
    'Personal', 
    'Other'
  ];

  // Fetch expense data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchExpense();
    }
  }, [id]);

  // Function to fetch expense data
  const fetchExpense = async () => {
    try {
      setFetchLoading(true);
      const expense = await getExpense(id);
      
      if (expense) {
        // Format date for form input (YYYY-MM-DD)
        const formattedDate = new Date(expense.date).toISOString().split('T')[0];
        
        setFormData({
          name: expense.name,
          amount: expense.amount.toString(),
          category: expense.category,
          date: formattedDate
        });
      } else {
        setError('Expense not found');
        navigate('/expenses');
      }
    } catch (err) {
      console.error('Error fetching expense:', err);
      setError('Failed to load expense data. Please try again later.');
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.amount || !formData.category || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Format date for AWS AppSync AWSDateTime compatibility
      let formattedDate = formData.date;
      try {
        // Create a date object and ensure it's valid
        const dateObj = new Date(formData.date);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Invalid date');
        }
        
        // Format as ISO-8601 string for AWSDateTime scalar type
        formattedDate = dateObj.toISOString();
        
        console.log('Formatted date in form:', formattedDate);
      } catch (err) {
        console.error('Error formatting date in form:', err);
        // Keep original date if there's an error in formatting
      }
      
      const updatedData = {
        ...formData,
        date: formattedDate,
        amount: parseFloat(formData.amount),
        userId: user?.id || user?.email || null // Include user ID from auth context
      };
      
      console.log('User data available:', user);
      console.log('Sending expense with userId:', updatedData.userId);
      
      if (isEditMode) {
        await updateExpense(updatedData);
        setSuccess('Expense updated successfully!');
      } else {
        await createExpense(updatedData);
        setSuccess('Expense added successfully!');
      }
      
      // Reset form after submission
      setFormData({
        name: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      // Navigate back to expenses list after a short delay
      setTimeout(() => {
        navigate('/expenses');
      }, 1500);
      
      // Trigger refresh of expense list if onSave is defined
      if (typeof onSave === 'function') {
        onSave();
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Failed to save expense. Please try again later.');
    }
  };

  if (fetchLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading expense data...</span>
        </Spinner>
        <p className="mt-2">Loading expense data...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Header as="h2" className="text-center">
          {isEditMode ? 'Edit Expense' : 'Add New Expense'}
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Expense Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter expense name"
                disabled={loading}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Amount ($)</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                step="0.01"
                min="0.01"
                disabled={loading}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>
            
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/expenses')}
                disabled={loading}
                className="me-md-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    {isEditMode ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  isEditMode ? 'Update Expense' : 'Add Expense'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ExpenseForm;
