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
import './ExpenseLineChart.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const ExpenseLineChart = ({ expenses }) => {
    // Sort expenses by date
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedExpenses.map((expense) => new Date(expense.date).toLocaleDateString());
    const data = sortedExpenses.map((expense) => parseFloat(expense.amount));

    const chartData = {
        labels,
        datasets: [
            {
                label: "Daily Expenses",
                data,
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
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Daily Expenses Over Time",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Amount ($)",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
            },
        },
    };

    return (
        <div className="expense-line-chart-container">
            <h2>Daily Expense Line Chart</h2>
            <div>
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default ExpenseLineChart;
