// App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import components
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Header from './components/Header';

function App() {
  return (
    <div className="app-container">
      <Header />
      
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/add-expense" element={<ExpenseForm />} />
          <Route path="/edit-expense/:id" element={<ExpenseForm />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>Personal Expense Tracker</p>
      </footer>
    </div>
  );
}

export default App;
