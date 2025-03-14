import React from 'react';

function ExpenseItem({ expense, onDelete }) {
  return (
    <div className="expense-item">
      <div className="expense-info">
        <h4 className="expense-name">{expense.name}</h4>
        <p className="expense-amount">${expense.amount.toFixed(2)}</p>
        <div className="expense-details">
          <span className="expense-category">{expense.category}</span>
          <span className="expense-date">
            {(() => {
              try {
                // Try to parse as is (should work for ISO-8601 format)
                const dateObj = new Date(expense.date);
                
                // Check if the date is valid
                if (!isNaN(dateObj.getTime())) {
                  return dateObj.toLocaleDateString();
                }
                
                // If invalid, try alternative parsing
                let dateString = expense.date;
                if (dateString.includes('T')) {
                  // It's an ISO format but might be malformed
                  const datePart = dateString.split('T')[0];
                  const [year, month, day] = datePart.split('-');
                  return new Date(year, month - 1, day).toLocaleDateString();
                } else if (dateString.includes(' ')) {
                  // It's a MySQL format
                  const datePart = dateString.split(' ')[0];
                  const [year, month, day] = datePart.split('-');
                  return new Date(year, month - 1, day).toLocaleDateString();
                } else {
                  // It's just a date string YYYY-MM-DD
                  const [year, month, day] = dateString.split('-');
                  return new Date(year, month - 1, day).toLocaleDateString();
                }
              } catch (err) {
                console.error('Error parsing date:', expense.date, err);
                return 'Invalid date';
              }
            })()}
          </span>
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