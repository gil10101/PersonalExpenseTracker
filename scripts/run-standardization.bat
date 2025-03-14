@echo off
echo Starting database and resolver standardization...

REM Install dependencies if needed
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)

REM Run the standardization script
echo Running standardization script...
node standardize-database-and-resolvers.js

echo Standardization process completed.
pause 