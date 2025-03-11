import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ExpenseBarChart.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseBarChart = ({ data }) => {
  // Create chart data with useMemo to prevent unnecessary re-renders
  const chartData = useMemo(() => ({
    labels: data?.labels || [],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: data?.values || [],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(79, 70, 229, 0.8)',
      },
    ],
  }), [data]);

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
        position: 'top',
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
        text: 'Monthly Comparison',
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
          padding: 10
        },
        title: {
          display: true,
          text: "Month",
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
    barPercentage: 0.7,
    categoryPercentage: 0.7
  }), []);

  // Handle empty data case
  if (!data?.labels?.length) {
    return (
      <div className="expense-bar-chart-container">
        <h2>Monthly Comparison</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <p style={{ color: "#6B7280", fontSize: "1rem", textAlign: "center" }}>
            No expense data available for comparison.<br />
            Add expenses across multiple months to see trends!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-bar-chart-container">
      <h2>Monthly Comparison</h2>
      <div>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ExpenseBarChart; 