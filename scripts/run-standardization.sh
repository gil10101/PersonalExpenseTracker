#!/bin/bash

# Run the standardization process
echo "Starting database and resolver standardization..."

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@aws-sdk" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the standardization script
echo "Running standardization script..."
node standardize-database-and-resolvers.js

echo "Standardization process completed." 