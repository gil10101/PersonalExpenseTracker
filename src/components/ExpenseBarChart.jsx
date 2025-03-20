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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseBarChart = ({ expenses }) => {
  // Transform expense data into chart format
  const { categoryData, categories } = useMemo(() => {
    // Group expenses by category
    const categoryMap = {};
    
    if (!expenses || !expenses.length) {
      return { categoryData: [], categories: [] };
    }

    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      const amount = parseFloat(expense.amount) || 0;
      
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += amount;
    });

    // Sort categories by amount (highest first)
    const sortedCategories = Object.keys(categoryMap).sort(
      (a, b) => categoryMap[b] - categoryMap[a]
    );

    // Get the top categories (limit to 6 for readability)
    const topCategories = sortedCategories.slice(0, 6);
    
    // Create data array
    const categoryAmounts = topCategories.map(cat => categoryMap[cat]);
    
    return { 
      categoryData: categoryAmounts,
      categories: topCategories 
    };
  }, [expenses]);

  // Create chart data
  const chartData = useMemo(() => ({
    labels: categories,
    datasets: [
      {
        label: 'Expenses by Category',
        data: categoryData,
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(79, 70, 229, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(79, 70, 229, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: [
          'rgba(99, 102, 241, 0.9)',
          'rgba(79, 70, 229, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(16, 185, 129, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(239, 68, 68, 0.9)',
        ],
      },
    ],
  }), [categoryData, categories]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: {
      padding: {
        top: 5,
        right: 15,
        bottom: 5,
        left: 15
      }
    },
    plugins: {
      legend: {
        display: false
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
            return `$${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(243, 244, 246, 1)',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    },
    animation: {
      duration: 1000
    }
  }), []);

  // Handle empty data case
  if (!categoryData.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-muted rounded-md text-muted-foreground text-sm p-4 text-center">
        <p>No expense data available for categories.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center w-full h-full min-h-[250px] relative animate-in slide-in-from-left duration-600">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default ExpenseBarChart; 