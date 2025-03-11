import React, { useMemo } from 'react';

function Dashboard({ expenses }) {
  const stats = useMemo(() => {
    if (!expenses.length) return null;

    // Total expenses
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Category breakdown
    const categories = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});
    
    // Sort categories by amount (descending)
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / total) * 100
      }));
    
    // Monthly breakdown (last 6 months)
    const today = new Date();
    const monthlyData = {};
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[monthYear] = 0;
    }
    
    // Fill in the data
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (monthlyData[monthYear] !== undefined) {
        monthlyData[monthYear] += expense.amount;
      }
    });
    
    return {
      total,
      categories: sortedCategories,
      monthly: Object.entries(monthlyData).reverse()
    };
  }, [expenses]);

  if (!stats) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p className="no-data">Add some expenses to see your statistics here.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stat-card total-card">
        <h3>Total Expenses</h3>
        <p className="stat-value">${stats.total.toFixed(2)}</p>
      </div>
      
      <div className="stat-card">
        <h3>Top Categories</h3>
        <div className="category-breakdown">
          {stats.categories.slice(0, 5).map(cat => (
            <div key={cat.category} className="category-item">
              <div className="category-bar-container">
                <div className="category-name">{cat.category}</div>
                <div className="category-amount">${cat.amount.toFixed(2)}</div>
              </div>
              <div className="category-bar-wrapper">
                <div 
                  className="category-bar" 
                  style={{ width: `${cat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="stat-card">
        <h3>Monthly Trend</h3>
        <div className="monthly-trend">
          {stats.monthly.map(([month, amount]) => (
            <div key={month} className="month-bar-container">
              <div className="month-name">{month}</div>
              <div className="month-bar-wrapper">
                <div 
                  className="month-bar" 
                  style={{ 
                    height: `${Math.max(5, (amount / stats.total) * 150)}px` 
                  }}
                ></div>
              </div>
              <div className="month-amount">${amount.toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 