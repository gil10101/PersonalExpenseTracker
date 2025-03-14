-- Check users table structure
DESCRIBE users;

-- List some users to see their structure
SELECT * FROM users LIMIT 5;

-- Find user by email
SELECT id, username, email FROM users WHERE email = 'nathanb10101@gmail.com'; 