import React, { useState } from "react";
import PropTypes from "prop-types"; // Import prop-types

const ExpenseForm = ({ onSubmit }) => {
    const [expense, setExpense] = useState({
        name: "",
        amount: "",
        category: "",
        date: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpense((prevExpense) => ({
            ...prevExpense,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!expense.name || !expense.amount || !expense.category || !expense.date) {
            alert("Please fill out all fields");
            return;
        }
        onSubmit(expense);
        setExpense({
            name: "",
            amount: "",
            category: "",
            date: "",
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Expense</h2>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label htmlFor="expense-name" className="block text-sm font-medium text-gray-700">
                        Expense Name
                    </label>
                    <input
                        type="text"
                        id="expense-name"
                        name="name"
                        value={expense.name}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Groceries"
                    />
                </div>
                <div>
                    <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700">
                        Amount
                    </label>
                    <input
                        type="number"
                        id="expense-amount"
                        name="amount"
                        value={expense.amount}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 50"
                    />
                </div>
                <div>
                    <label htmlFor="expense-category" className="block text-sm font-medium text-gray-700">
                        Category
                    </label>
                    <select
                        id="expense-category"
                        name="category"
                        value={expense.category}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Select a category</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="expense-date" className="block text-sm font-medium text-gray-700">
                        Date
                    </label>
                    <input
                        type="date"
                        id="expense-date"
                        name="date"
                        value={expense.date}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Add Expense
                </button>
            </div>
        </form>
    );
};

// Add prop type validation
ExpenseForm.propTypes = {
    onSubmit: PropTypes.func.isRequired, // onSubmit is a required function
};

export default ExpenseForm;