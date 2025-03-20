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
        maintainAspectRatio: false,
        layout: {
            padding: 0, // Ensures no extra padding
        },
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
        <div className="bg-card rounded-lg border border-border shadow-sm p-6 w-full animate-in fade-in duration-300 min-h-[350px] flex flex-col">
            <h2 className="text-foreground text-xl font-semibold mb-4 pb-3 border-b border-border flex items-center justify-between">Expense Chart</h2>
            <div className="flex-1 flex items-center justify-center min-h-[250px] relative">
                <Bar data={chartData} options={chartOptions} className="w-full h-full max-h-[350px]" />
            </div>
        </div>
    );
};

export default ExpenseChart;