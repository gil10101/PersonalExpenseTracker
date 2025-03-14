-- Check the structure of the expenses table
DESCRIBE expenses;

-- Check if all required columns exist
SELECT 
  COUNT(*) AS total_columns,
  SUM(CASE WHEN COLUMN_NAME = 'id' THEN 1 ELSE 0 END) AS has_id,
  SUM(CASE WHEN COLUMN_NAME = 'name' THEN 1 ELSE 0 END) AS has_name,
  SUM(CASE WHEN COLUMN_NAME = 'amount' THEN 1 ELSE 0 END) AS has_amount,
  SUM(CASE WHEN COLUMN_NAME = 'category' THEN 1 ELSE 0 END) AS has_category,
  SUM(CASE WHEN COLUMN_NAME = 'date' THEN 1 ELSE 0 END) AS has_date,
  SUM(CASE WHEN COLUMN_NAME = 'userId' THEN 1 ELSE 0 END) AS has_userId,
  SUM(CASE WHEN COLUMN_NAME = 'createdAt' THEN 1 ELSE 0 END) AS has_createdAt,
  SUM(CASE WHEN COLUMN_NAME = 'updatedAt' THEN 1 ELSE 0 END) AS has_updatedAt
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expenses'; 