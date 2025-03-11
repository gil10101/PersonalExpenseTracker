import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import "./ExpenseLineChart.css";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const ExpenseLineChart = ({ expenses = [] }) => {
    // Aggregate expenses by date
    const aggregatedExpenses = expenses.reduce((acc, expense) => {
        if (!expense?.date || !expense?.amount) return acc; // Skip invalid data

        const date = new Date(expense.date).toISOString().split("T")[0]; // Standardized YYYY-MM-DD format
        acc[date] = (acc[date] || 0) + parseFloat(expense.amount);
        return acc;
    }, {});

    // Convert to sorted arrays
    const sortedEntries = Object.entries(aggregatedExpenses)
        .map(([date, amount]) => ({ date: new Date(date), amount }))
        .sort((a, b) => a.date - b.date);

    const sortedLabels = sortedEntries.map(item => item.date.toLocaleDateString());
    const sortedData = sortedEntries.map(item => item.amount);

    const chartData = {
        labels: sortedLabels,
        datasets: [
            {
                label: "Daily Expenses",
                data: sortedData,
                fill: false,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Daily Expenses Over Time" },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: "Amount ($)" },
            },
            x: {
                title: { display: true, text: "Date" },
            },
        },
    };

    return (
        <div className="expense-line-chart-container">
            <h2>Daily Expense Line Chart</h2>
            <Line data={chartData} options={chartOptions} />
        </div>
    );
};

export default ExpenseLineChart;