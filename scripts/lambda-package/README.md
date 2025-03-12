# Lambda Resolver Deployment

This package contains the Lambda resolver for the Personal Expense Tracker application.

## Deployment Instructions

1. Upload this entire directory as a ZIP file to AWS Lambda
2. Configure the following environment variables:
   - DB_HOST: database-2.cluster-c26a6o2q3bp.us-east-1.rds.amazonaws.com
   - DB_USERNAME: admin
   - DB_PASSWORD: your_password_here
   - DB_NAME: database-2
   - DB_PORT: 3306

3. Configure the Lambda function to run in the same VPC as your Aurora Serverless database
4. Ensure the security group allows the Lambda function to access the database

## Testing the Lambda

You can test the Lambda with the following test event:

```json
{
  "field": "getAllCategories",
  "arguments": {}
}
```

This should return the list of categories from your database.
