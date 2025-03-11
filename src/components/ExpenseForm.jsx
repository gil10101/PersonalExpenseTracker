import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import './ExpenseForm.css';

const ExpenseForm = ({ onSubmit }) => {
    const [expense, setExpense] = useState({ name: "", amount: "", category: "", date: "", description: "" });
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Load saved data from local storage
    useEffect(() => {
        const savedExpense = JSON.parse(localStorage.getItem("expense"));
        if (savedExpense) setExpense(savedExpense);
    }, []);

    // Save form data to local storage
    useEffect(() => {
        localStorage.setItem("expense", JSON.stringify(expense));
    }, [expense]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Prevent negative values for amount
        if (name === "amount" && value < 0) return;

        setExpense((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, amount, category, date } = expense;

        if (!name || !amount || !category || !date) {
            alert("Please fill out all required fields.");
            return;
        }

        onSubmit(expense);
        setExpense({ name: "", amount: "", category: "", date: "", description: "" });
        setIsSubmitted(true);

        setTimeout(() => setIsSubmitted(false), 2000);
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
                    <select id="category" name="category" value={expense.category} onChange={handleChange}>
                        <option value="">Select a category</option>
                        {["Food", "Transport", "Entertainment", "Utilities", "Other"].map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={expense.description}
                        onChange={handleChange}
                        placeholder="Optional: Add a description for this expense"
                    />
                </div>
            </div>
            <button type="submit" className={`submit-button ${isSubmitted ? "submitted" : ""}`}>
                {isSubmitted ? "Expense Added!" : "Add Expense"}
            </button>
        </form>
    );
};

ExpenseForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

export default ExpenseForm;
