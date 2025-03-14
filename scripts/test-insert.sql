-- Test inserting a new expense
-- Replace USER_ID_HERE with the actual user ID from the check-users.sql query
INSERT INTO expenses (
  id, 
  name, 
  amount, 
  category, 
  date, 
  user_id
) VALUES (
  UUID(), 
  'Test Expense', 
  49.99, 
  'Food', 
  NOW(), 
  'USER_ID_HERE'
); 