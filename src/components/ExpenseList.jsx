// ExpenseList.jsx
import React, { useState } from "react";
import "./ExpenseList.css";

const ExpenseList = ({ expenses, onDelete, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [visibleDescriptionId, setVisibleDescriptionId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const itemsPerPage = 5;

    const categories = ["Food", "Transport", "Entertainment", "Utilities", "Other"];

    const toggleDescription = (id) => {
        setVisibleDescriptionId((prevId) => (prevId === id ? null : id));
    };

    const handleEditChange = (e, id) => {
        const { name, value } = e.target;
        setEditValues((prev) => ({ ...prev, [id]: { ...prev[id], [name]: value } }));
    };

    const handleEditSubmit = (id) => {
        onEdit(id, editValues[id]);
        setEditingId(null);
    };

    const handleDelete = (id) => {
        document.getElementById(`expense-${id}`).classList.add("slide-out");
        setTimeout(() => onDelete(id), 300);
    };

    const filteredExpenses = expenses
        .filter((expense) =>
            expense?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((expense) =>
            categoryFilter === "all" ? true : expense?.category === categoryFilter
        );

    filteredExpenses.sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "amount") return Number(b.amount || 0) - Number(a.amount || 0);
        return new Date(b.date || "1970-01-01") - new Date(a.date || "1970-01-01");
    });

    const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));
    const displayedExpenses = filteredExpenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalAmount = filteredExpenses.reduce(
        (sum, exp) => sum + Number(exp.amount || 0),
        0
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
                <select
                    className="filter-select"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    value={categoryFilter}
                >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
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
                        {displayedExpenses.map((expense) => (
                            <>
                                <tr key={expense.id} id={`expense-${expense.id}`} className="expense-row">
                                    {editingId === expense.id ? (
                                        <>
                                            <td><input type="text" name="name" value={editValues[expense.id]?.name || expense.name} onChange={(e) => handleEditChange(e, expense.id)} /></td>
                                            <td><input type="number" name="amount" value={editValues[expense.id]?.amount || expense.amount} onChange={(e) => handleEditChange(e, expense.id)} /></td>
                                            <td>
                                                <select name="category" value={editValues[expense.id]?.category || expense.category} onChange={(e) => handleEditChange(e, expense.id)}>
                                                    {categories.map((category) => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td><input type="date" name="date" value={editValues[expense.id]?.date || expense.date} onChange={(e) => handleEditChange(e, expense.id)} /></td>
                                            <td><button className="save-button" onClick={() => handleEditSubmit(expense.id)}>Save</button></td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{expense.name || "N/A"}</td>
                                            <td>${Number(expense.amount || 0).toFixed(2)}</td>
                                            <td>{expense.category || "Uncategorized"}</td>
                                            <td>{expense.date ? new Date(expense.date).toLocaleDateString() : "N/A"}</td>
                                            <td>
                                                <button className="delete-button" onClick={() => handleDelete(expense.id)}>Delete</button>
                                                <button className="edit-button" onClick={() => setEditingId(expense.id)}>Edit</button>
                                                {expense.description && (
                                                    <button className="description-button" onClick={() => toggleDescription(expense.id)}>
                                                        {visibleDescriptionId === expense.id ? "-" : "+"}
                                                    </button>
                                                )}
                                            </td>
                                        </>
                                    )}
                                </tr>
                                {visibleDescriptionId === expense.id && expense.description && (
                                    <tr className="expense-description-row">
                                        <td colSpan="5" className="expense-description">{expense.description}</td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="total-expense">Total: ${totalAmount.toFixed(2)}</div>
        </div>
    );
};

export default ExpenseList;
