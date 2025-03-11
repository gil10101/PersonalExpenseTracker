import React, { useState } from "react";
import ExpenseChart from "./ExpenseChart";
import ExpensePieChart from "./ExpensePieChart";
import ExpenseLineChart from "./ExpenseLineChart";
import ExpenseList from "./ExpenseList";
import "./ExpenseCarousel.css";

const ExpenseCarousel = ({ expenses, onDelete, onEdit }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const filteredExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
            expenseDate.getMonth() + 1 === selectedMonth &&
            expenseDate.getFullYear() === selectedYear
        );
    });

    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value));
    };

    const handleYearChange = (e) => {
        setSelectedYear(parseInt(e.target.value));
    };

    return (
        <div className="charts-section">
            <div className="controls">
                <select value={selectedMonth} onChange={handleMonthChange}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select value={selectedYear} onChange={handleYearChange}>
                    {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={new Date().getFullYear() - i}>
                            {new Date().getFullYear() - i}
                        </option>
                    ))}
                </select>
            </div>
            <div className="chart-container">
                <ExpenseChart expenses={filteredExpenses} />
                <ExpensePieChart expenses={filteredExpenses} />
                <ExpenseLineChart expenses={filteredExpenses} />
            </div>
            <ExpenseList expenses={filteredExpenses} onDelete={onDelete} onEdit={onEdit} />
        </div>
    );
};

export default ExpenseCarousel;