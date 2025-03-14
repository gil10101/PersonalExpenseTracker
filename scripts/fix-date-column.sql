-- Modify the date column in expenses table to use DATETIME instead of TIMESTAMP
ALTER TABLE expenses MODIFY COLUMN date DATETIME NOT NULL;

-- Verify the change
DESCRIBE expenses;

-- If you need to convert existing data, you can use:
-- UPDATE expenses SET date = CONVERT(date, DATETIME);

-- Add an index on the date column for better query performance
ALTER TABLE expenses ADD INDEX idx_date (date);

-- Verify the index
SHOW INDEX FROM expenses; 