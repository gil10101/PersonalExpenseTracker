-- Insert a test expense
INSERT INTO expenses (
  id, 
  name, 
  amount, 
  category, 
  date, 
  userId, 
  createdAt, 
  updatedAt
) VALUES (
  UUID(), 
  'Test Expense', 
  49.99, 
  'Food', 
  NOW(), 
  'nathanb10101@gmail.com', 
  NOW(), 
  NOW()
);

-- Verify the insertion
SELECT * FROM expenses WHERE name = 'Test Expense';

-- Check all expenses
SELECT * FROM expenses; 