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
        <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Expense Chart</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default ExpenseChart;