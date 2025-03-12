-- Create the database
CREATE DATABASE IF NOT EXISTS expense_tracker;

-- Use the database
USE expense_tracker;

-- Create tables
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, category_id, month, year)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT IGNORE INTO categories (id, name, description) VALUES
  ('1', 'Food', 'Groceries, restaurants, and food delivery'),
  ('2', 'Transportation', 'Gas, public transit, and ride-sharing'),
  ('3', 'Housing', 'Rent, mortgage, and utilities'),
  ('4', 'Entertainment', 'Movies, games, and streaming services'),
  ('5', 'Shopping', 'Clothing, electronics, and other retail purchases'),
  ('6', 'Health', 'Medical expenses, prescriptions, and fitness'),
  ('7', 'Travel', 'Flights, hotels, and vacation expenses'),
  ('8', 'Education', 'Tuition, books, and courses'),
  ('9', 'Personal', 'Personal care and miscellaneous expenses'),
  ('10', 'Bills', 'Regular monthly bills and subscriptions');

-- Insert default user
INSERT IGNORE INTO users (id, username, email) VALUES
  ('1', 'default', 'default@example.com'); 