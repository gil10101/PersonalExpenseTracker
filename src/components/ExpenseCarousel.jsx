import React, { useState, useEffect } from 'react';
import ExpenseLineChart from './ExpenseLineChart';
import ExpensePieChart from './ExpensePieChart';
import ExpenseBarChart from './ExpenseBarChart';
import ExpenseList from './ExpenseList';
import './ExpenseCarousel.css';

const ExpenseCarousel = ({ expenses, onDelete, onEdit }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [chartData, setChartData] = useState({
        line: { labels: [], values: [] },
        pie: { labels: [], values: [] },
        bar: { labels: [], values: [] }
    });

    // Function to get month name
    const getMonthName = (month) => {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[month];
    };

    // Function to navigate to previous month
    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    // Function to navigate to next month
    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Function to handle year change
    const handleYearChange = (e) => {
        setCurrentYear(parseInt(e.target.value));
    };

    // Function to handle month change
    const handleMonthChange = (e) => {
        setCurrentMonth(parseInt(e.target.value));
    };

    // Helper function to parse dates consistently
    const parseDate = (dateString) => {
        try {
            // Try to parse as is (should work for ISO-8601 format)
            const dateObj = new Date(dateString);
            
            // Check if the date is valid
            if (!isNaN(dateObj.getTime())) {
                return dateObj;
            }
            
            // If invalid, try alternative parsing
            if (dateString.includes('T')) {
                // It's an ISO format but might be malformed
                const datePart = dateString.split('T')[0];
                const [year, month, day] = datePart.split('-');
                return new Date(year, month - 1, day);
            } else if (dateString.includes(' ')) {
                // It's a MySQL format
                const datePart = dateString.split(' ')[0];
                const [year, month, day] = datePart.split('-');
                return new Date(year, month - 1, day);
            } else {
                // It's just a date string YYYY-MM-DD
                const [year, month, day] = dateString.split('-');
                return new Date(year, month - 1, day);
            }
        } catch (err) {
            console.error('Error parsing date:', dateString, err);
            // Return current date as fallback
            return new Date();
        }
    };

    // Process expenses data for charts
    useEffect(() => {
        if (!expenses || expenses.length === 0) {
            // Set empty data if no expenses
            setChartData({
                line: { labels: [], values: [] },
                pie: { labels: [], values: [] },
                bar: { labels: [], values: [] }
            });
            return;
        }
        
        // Filter expenses for current month and year
        const filteredExpenses = expenses.filter(expense => {
            const expenseDate = parseDate(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });
        
        // Process data for line chart (daily expenses)
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dailyExpenses = Array(daysInMonth).fill(0);
        
        filteredExpenses.forEach(expense => {
            const expenseDate = parseDate(expense.date);
            const day = expenseDate.getDate() - 1;
            dailyExpenses[day] += parseFloat(expense.amount);
        });
        
        const lineData = {
            labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
            values: dailyExpenses
        };
        
        // Process data for pie chart (expenses by category)
        const categoryMap = {};
        
        filteredExpenses.forEach(expense => {
            if (categoryMap[expense.category]) {
                categoryMap[expense.category] += parseFloat(expense.amount);
            } else {
                categoryMap[expense.category] = parseFloat(expense.amount);
            }
        });
        
        const pieData = {
            labels: Object.keys(categoryMap),
            values: Object.values(categoryMap)
        };
        
        // Process data for bar chart (comparison with previous months)
        const monthsToCompare = 3;
        const comparisonMonths = [];
        const comparisonValues = [];
        
        for (let i = 0; i < monthsToCompare; i++) {
            let month = currentMonth - i;
            let year = currentYear;
            
            if (month < 0) {
                month += 12;
                year -= 1;
            }
            
            const monthName = getMonthName(month).substring(0, 3);
            comparisonMonths.unshift(`${monthName} ${year}`);
            
            // Calculate total expenses for this month
            const monthExpenses = expenses.filter(expense => {
                const expenseDate = parseDate(expense.date);
                return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
            });
            
            const totalAmount = monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
            comparisonValues.unshift(totalAmount);
        }
        
        const barData = {
            labels: comparisonMonths,
            values: comparisonValues
        };
        
        setChartData({
            line: lineData,
            pie: pieData,
            bar: barData
        });
        
    }, [expenses, currentMonth, currentYear]);

    // Generate year options for dropdown
    const currentYearActual = new Date().getFullYear();
    const yearOptions = [];
    for (let i = currentYearActual - 5; i <= currentYearActual; i++) {
        yearOptions.push(i);
    }

    // Filter expenses for the current month and year for ExpenseList
    const filteredExpenses = expenses ? expenses.filter(expense => {
        const expenseDate = parseDate(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    }) : [];

    return (
        <div className="charts-section">
            <div className="controls">
                <select 
                    value={currentMonth} 
                    onChange={handleMonthChange}
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>{getMonthName(i)}</option>
                    ))}
                </select>
                
                <select 
                    value={currentYear} 
                    onChange={handleYearChange}
                >
                    {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            
            <h2 className="period-title">{getMonthName(currentMonth)} {currentYear}</h2>
            
            <div className="chart-container">
                <div className="chart">
                    <ExpenseLineChart data={chartData.line} />
                </div>
                
                <div className="chart">
                    <ExpensePieChart data={chartData.pie} />
                </div>
                
                <div className="chart">
                    <ExpenseBarChart data={chartData.bar} />
                </div>
            </div>
            
            <div className="month-navigation-buttons">
                <button className="nav-button" onClick={goToPreviousMonth}>
                    Previous Month
                </button>
                <button className="nav-button" onClick={goToNextMonth}>
                    Next Month
                </button>
            </div>
            
            <ExpenseList 
                expenses={filteredExpenses} 
                onDelete={onDelete} 
                onEdit={onEdit} 
            />
        </div>
    );
};

export default ExpenseCarousel;