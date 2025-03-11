import React from 'react';

function ExpenseForm({ formData, setFormData, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>Add Expense</h2>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="What did you spend on?"
          required
        />
      </div>
      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={e => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
          required
        />
      </div>
      <div className="form-group">
        <label>Category</label>
        <select
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="Food">Food</option>
          <option value="Transportation">Transportation</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Utilities">Utilities</option>
          <option value="Housing">Housing</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Shopping">Shopping</option>
          <option value="Personal">Personal</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
        />
      </div>
      <button type="submit" className="btn btn-primary">Add Expense</button>
    </form>
  );
}

export default ExpenseForm;
