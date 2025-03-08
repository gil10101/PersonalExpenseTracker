import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import "./ExpenseChart.css"; // Import the CSS file

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExpenseChart = ({ expenses }) => {
    // Aggregate expenses by category
    const categories = {};
    expenses.forEach((expense) => {
        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }
        categories[expense.category] += parseFloat(expense.amount);
    });

    // Prepare data for the chart
    const chartData = {
        labels: Object.keys(categories), // Categories (e.g., Food, Transport, etc.)
        datasets: [
            {
                label: "Total Expenses",
                data: Object.values(categories), // Total amounts for each category
                backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
                borderColor: "rgba(75, 192, 192, 1)", // Border color
                borderWidth: 1,
            },
        ],
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Expenses by Category",
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
                    text: "Category",
                },
            },
        },
    };

    return (
        <div className="expense-chart-container">
            <h2 className="chart-title">Expense Chart</h2>
            <div className="chart-wrapper">
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default ExpenseChart;