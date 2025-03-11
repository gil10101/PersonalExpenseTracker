import React from 'react';

function Header() {
  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <h1 className="app-title">Personal Expense Tracker</h1>
          <nav className="main-nav">
            <ul>
              <li><a href="#dashboard" className="active">Dashboard</a></li>
              <li><a href="#expenses">Expenses</a></li>
              <li><a href="#reports">Reports</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header; 