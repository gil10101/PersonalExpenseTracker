import React from 'react';

function ExpenseItem({ expense, onDelete }) {
  return (
    <div className="expense-item">
      <div className="expense-info">
        <h4 className="expense-name">{expense.name}</h4>
        <p className="expense-amount">${expense.amount.toFixed(2)}</p>
        <div className="expense-details">
          <span className="expense-category">{expense.category}</span>
          <span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
        </div>
      </div>
      <button 
        onClick={() => onDelete(expense.id)} 
        className="delete-btn" 
        aria-label="Delete expense"
      >
        Delete
      </button>
    </div>
  );
}

export default ExpenseItem; 