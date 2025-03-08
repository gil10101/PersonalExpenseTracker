import React from "react";
import ExpenseChart from "./ExpenseChart";
import ExpensePieChart from "./ExpensePieChart";
import ExpenseLineChart from "./ExpenseLineChart";
import "./ExpenseCarousel.css";

const ExpenseCarousel = ({ expenses }) => {
    return (
        <div className="charts-section">
            <div className="chart-container">
                <ExpenseChart expenses={expenses || []} />
                <ExpensePieChart expenses={expenses || []} />
                <ExpenseLineChart expenses={expenses || []} />
            </div>
        </div>
    );
};

export default ExpenseCarousel;