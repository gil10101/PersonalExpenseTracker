import React, { useRef, useEffect, useMemo } from "react";
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
    Filler,
} from "chart.js";
import "./ExpenseLineChart.css";

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    LineElement, 
    PointElement, 
    Title, 
    Tooltip, 
    Legend,
    Filler
);

const ExpenseLineChart = ({ data }) => {
    const chartRef = useRef(null);

    // Create chart data with useMemo to prevent unnecessary re-renders
    const chartData = useMemo(() => {
        // Filter out days with zero expenses for point display
        const nonZeroIndices = data?.values ? 
            data.values.map((value, index) => value > 0 ? index : -1).filter(index => index !== -1) : 
            [];
        
        const pointRadius = Array(data?.values?.length || 0).fill(0);
        const pointHoverRadius = Array(data?.values?.length || 0).fill(0);
        
        // Only set radius for non-zero points
        nonZeroIndices.forEach(index => {
            pointRadius[index] = 6;
            pointHoverRadius[index] = 8;
        });

        return {
            labels: data?.labels || [],
            datasets: [
                {
                    label: "Daily Expenses",
                    data: data?.values || [],
                    fill: {
                        target: 'origin',
                        above: 'rgba(16, 185, 129, 0.1)',
                    },
                    backgroundColor: "rgba(16, 185, 129, 0.6)",
                    borderColor: "rgba(16, 185, 129, 1)",
                    tension: 0.3,
                    pointRadius: pointRadius, // Dynamic point radius array
                    pointBackgroundColor: "rgba(16, 185, 129, 1)",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointHoverRadius: pointHoverRadius, // Dynamic hover radius array
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgba(16, 185, 129, 1)",
                    pointHoverBorderWidth: 2,
                },
            ],
        };
    }, [data]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 20,
                right: 25,
                bottom: 20,
                left: 25
            }
        },
        plugins: {
            legend: { 
                position: "top",
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
                text: "Daily Expenses",
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
                        return `$${context.raw.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                    drawBorder: false
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    callback: function(value) {
                        return '$' + value;
                    },
                    padding: 10
                },
                title: { 
                    display: true, 
                    text: "Amount ($)",
                    font: {
                        family: "'Inter', sans-serif",
                        size: 13,
                        weight: 'bold'
                    },
                    padding: {bottom: 10}
                },
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    maxRotation: 45,
                    minRotation: 45,
                    padding: 10
                },
                title: { 
                    display: true, 
                    text: "Day of Month",
                    font: {
                        family: "'Inter', sans-serif",
                        size: 13,
                        weight: 'bold'
                    },
                    padding: {top: 10}
                },
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        },
        elements: {
            line: {
                borderWidth: 3
            }
        }
    }), []);

    // Handle empty data case
    if (!data?.labels?.length) {
        return (
            <div className="expense-line-chart-container">
                <h2>Daily Expenses</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <p style={{ color: "#6B7280", fontSize: "1rem", textAlign: "center" }}>
                        No expense data available for this period.<br />
                        Add some expenses to see your daily spending!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="expense-line-chart-container">
            <h2>Daily Expenses</h2>
            <div>
                <Line 
                    ref={chartRef}
                    data={chartData} 
                    options={chartOptions} 
                />
            </div>
        </div>
    );
};

export default ExpenseLineChart;