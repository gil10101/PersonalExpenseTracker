import React from "react";

const ExpenseList = ({ expenses, onDelete }) => {
    // If no expenses are provided, display a message
    if (!expenses || expenses.length === 0) {
        return <p className="text-gray-600 text-center">No expenses added yet.</p>;
    }

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Expense List</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Category</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((expense, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-700">{expense.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">${expense.amount}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{expense.category}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{expense.date}</td>
                                <td className="px-4 py-2 text-sm">
                                    <button
                                        onClick={() => onDelete(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpenseList;