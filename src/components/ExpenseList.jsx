import React from 'react';
import ExpenseItem from './ExpenseItem';

function ExpenseList({ expenses, handleDelete }) {
  // Group expenses by month
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[month]) {
      groups[month] = [];
    }
    
    groups[month].push(expense);
    return groups;
  }, {});

  // Calculate total for each month
  const monthlyTotals = Object.keys(groupedExpenses).reduce((totals, month) => {
    totals[month] = groupedExpenses[month].reduce((sum, expense) => sum + expense.amount, 0);
    return totals;
  }, {});

  // Calculate grand total
  const grandTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="expense-list">
      <h2>Expenses</h2>
      
      {Object.keys(groupedExpenses).length > 0 ? (
        <>
          {Object.keys(groupedExpenses).map(month => (
            <div key={month} className="expense-month">
              <div className="month-header">
                <h3>{month}</h3>
                <p className="month-total">Total: ${monthlyTotals[month].toFixed(2)}</p>
              </div>
              
              {groupedExpenses[month].map(expense => (
                <ExpenseItem 
                  key={expense.id} 
                  expense={expense} 
                  onDelete={handleDelete} 
                />
              ))}
            </div>
          ))}
          
          <div className="grand-total">
            <h3>Grand Total</h3>
            <p>${grandTotal.toFixed(2)}</p>
          </div>
        </>
      ) : (
        <p className="no-expenses">No expenses recorded yet. Add your first expense!</p>
      )}
    </div>
  );
}

export default ExpenseList;
