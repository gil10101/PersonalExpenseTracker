import React from "react";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import './ExpensePieChart.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ expenses }) => {
    // Aggregate expenses by category
    const categories = {};
    expenses.forEach((expense) => {
        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }
        categories[expense.category] += parseFloat(expense.amount);
    });

    // Prepare data for the pie chart
    const chartData = {
        labels: Object.keys(categories),
        datasets: [
            {
                label: "Total Amount Spent",
                data: Object.values(categories),
                backgroundColor: [
                    "#6366F1",
                    "#F59E0B",
                    "#EF4444",
                    "#10B981",
                    "#3B82F6",
                ],
                hoverOffset: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        let value = tooltipItem.raw;
                        return `$${value}`;
                    },
                },
            },
        },
    };

    return (
        <div className="expense-pie-chart-container">
            <h2>Expense Breakdown</h2>
            <div>
                <Pie data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default ExpensePieChart;
