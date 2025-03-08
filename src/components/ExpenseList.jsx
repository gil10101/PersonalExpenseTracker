import React, { useState } from "react";
import "./ExpenseList.css";

const ExpenseList = ({ expenses, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredExpenses = expenses.filter((expense) =>
        expense.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredExpenses.sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "amount") return b.amount - a.amount;
        return new Date(b.date) - new Date(a.date);
    });

    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const displayedExpenses = filteredExpenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="expense-list-container">
            <h2 className="expense-list-title">Expense List</h2>
            <div className="controls">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="sort-select"
                    onChange={(e) => setSortBy(e.target.value)}
                    value={sortBy}
                >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="amount">Sort by Amount</option>
                </select>
            </div>
            <div className="table-container">
                <table className="expense-table">
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
                        {displayedExpenses.map((expense, index) => (
                            <tr key={index} className="expense-row">
                                <td>{expense.name}</td>
                                <td>${expense.amount}</td>
                                <td>{expense.category}</td>
                                <td>{expense.date}</td>
                                <td>
                                    <button
                                        className="delete-button"
                                        onClick={() => onDelete(index)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-buttons">
                {currentPage > 1 && (
                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </button>
                )}
                {currentPage < totalPages && (
                    <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};

export default ExpenseList;