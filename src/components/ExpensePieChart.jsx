import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ data }) => {
    // Use incoming props for chart data
    const chartData = useMemo(() => ({
        labels: data?.labels || [],
        datasets: [
            {
                data: data?.datasets?.[0]?.data || [],
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
                position: 'bottom',
                labels: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    padding: 15,
                    usePointStyle: true,
                    boxWidth: 8
                }
            },
            title: {
                display: false
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
                        const total = context.chart._metasets[context.datasetIndex].total;
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        },
        animation: {
            duration: 800,
            easing: 'easeOutQuart'
        },
        layout: {
            padding: 10
        }
    }), []);

    // Handle empty data case
    if (!data?.labels?.length) {
        return (
            <div className="flex items-center justify-center h-full min-h-[200px] bg-muted rounded-md text-muted-foreground text-sm p-4 text-center">
                <p>No expense data available for this period.</p>
            </div>
        );
    }

    return (
        <div className="flex-grow flex items-center justify-center w-full h-full min-h-[250px] relative animate-in fade-in duration-300">
            <Pie data={chartData} options={chartOptions} />
        </div>
    );
};

export default ExpensePieChart;
