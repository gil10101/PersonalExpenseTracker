import React, { useState } from "react";
import PropTypes from "prop-types";
import './ExpenseForm.css';

const ExpenseForm = ({ onSubmit }) => {
    const [expense, setExpense] = useState({ name: "", amount: "", category: "", date: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpense((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, amount, category, date } = expense;
        if (!name || !amount || !category || !date) {
            alert("Please fill out all fields");
            return;
        }
        onSubmit(expense);
        setExpense({ name: "", amount: "", category: "", date: "" });
    };

    return (
        <form onSubmit={handleSubmit} className="expense-form-container">
            <h2>Add New Expense</h2>
            <div className="form-fields">
                {[
                    { label: "Expense Name", type: "text", name: "name", placeholder: "e.g., Groceries" },
                    { label: "Amount", type: "number", name: "amount", placeholder: "e.g., 50" },
                    { label: "Date", type: "date", name: "date" },
                ].map(({ label, type, name, placeholder }) => (
                    <div key={name} className="form-field">
                        <label htmlFor={name}>{label}</label>
                        <input
                            type={type}
                            id={name}
                            name={name}
                            value={expense[name]}
                            onChange={handleChange}
                            placeholder={placeholder}
                        />
                    </div>
                ))}
                <div className="form-field">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={expense.category}
                        onChange={handleChange}
                    >
                        <option value="">Select a category</option>
                        {["Food", "Transport", "Entertainment", "Utilities", "Other"].map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <button type="submit" className="submit-button">
                Add Expense
            </button>
        </form>
    );
};

ExpenseForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

export default ExpenseForm;