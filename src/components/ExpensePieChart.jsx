import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './ExpensePieChart.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ data }) => {
    // Always create chart data and options with useMemo to prevent unnecessary re-renders
    const chartData = useMemo(() => ({
        labels: data?.labels || [],
        datasets: [
            {
                label: 'Expenses by Category',
                data: data?.values || [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                ],
                borderWidth: 1,
            },
        ],
    }), [data]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    padding: 20,
                    usePointStyle: true,
                    boxWidth: 8
                }
            },
            title: {
                display: true,
                text: 'Expenses by Category',
                font: {
                    family: "'Inter', sans-serif",
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: "rgba(17, 24, 39, 0.8)",
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 14
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 13
                },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: $${value.toFixed(2)}`;
                    }
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        }
    }), []);

    // Handle empty data case
    if (!data?.labels?.length) {
        return (
            <div className="expense-pie-chart-container">
                <h2>Expenses by Category</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <p style={{ color: "#6B7280", fontSize: "1rem", textAlign: "center" }}>
                        No expense data available for this period.<br />
                        Add some expenses to see your category breakdown!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="expense-pie-chart-container">
            <h2>Expenses by Category</h2>
            <div>
                <Pie data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default ExpensePieChart;
