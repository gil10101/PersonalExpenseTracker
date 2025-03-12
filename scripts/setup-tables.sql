-- Create the expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  date DATETIME NOT NULL,
  userId VARCHAR(36),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  categoryId VARCHAR(36) NOT NULL,
  category VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the posts table
CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO posts (id, title) VALUES ('1', 'First Post') ON DUPLICATE KEY UPDATE title = title;
INSERT INTO categories (id, name, description) VALUES ('1', 'Food', 'Groceries and dining out') ON DUPLICATE KEY UPDATE name = name;
INSERT INTO categories (id, name, description) VALUES ('2', 'Transportation', 'Gas, public transit, and car maintenance') ON DUPLICATE KEY UPDATE name = name;
INSERT INTO categories (id, name, description) VALUES ('3', 'Entertainment', 'Movies, games, and other fun activities') ON DUPLICATE KEY UPDATE name = name; 