import { 
  LambdaClient, 
  CreateFunctionCommand,
  InvokeCommand
} from '@aws-sdk/client-lambda';
import { 
  IAMClient,
  CreateRoleCommand,
  AttachRolePolicyCommand,
  GetRoleCommand
} from '@aws-sdk/client-iam';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '../.env' });

// AWS configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-2'
};

// Create clients
const lambdaClient = new LambdaClient(awsConfig);
const iamClient = new IAMClient(awsConfig);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'database-1.cluster-c3c62mgwis8h.us-east-2.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'S9ZxGl9BhIiMbOpWFIKw',
  database: 'expense_tracker',
  port: parseInt(process.env.DB_PORT || '3306', 10)
};

// Lambda function name
const functionName = 'ExpenseTrackerDatabaseSetup';

// Role name for Lambda
const roleName = 'ExpenseTrackerLambdaRole';

// Create a temporary directory for the Lambda package
const tempDir = path.join(__dirname, 'lambda-package');
const nodeModulesDir = path.join(tempDir, 'node_modules');
const sqlFilePath = path.join(__dirname, 'setup-tables.sql');

async function createLambdaRole() {
  try {
    // Check if role already exists
    try {
      const getRoleParams = {
        RoleName: roleName
      };
      const roleData = await iamClient.send(new GetRoleCommand(getRoleParams));
      console.log(`✅ Role ${roleName} already exists`);
      return roleData.Role.Arn;
    } catch (error) {
      if (error.name !== 'NoSuchEntity') {
        throw error;
      }
    }

    // Create role
    const createRoleParams = {
      RoleName: roleName,
      AssumeRolePolicyDocument: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com'
            },
            Action: 'sts:AssumeRole'
          }
        ]
      })
    };

    const roleData = await iamClient.send(new CreateRoleCommand(createRoleParams));
    console.log(`✅ Role ${roleName} created`);

    // Attach policies
    const policies = [
      'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole',
      'arn:aws:iam::aws:policy/AmazonRDSFullAccess'
    ];

    for (const policyArn of policies) {
      const attachPolicyParams = {
        RoleName: roleName,
        PolicyArn: policyArn
      };
      await iamClient.send(new AttachRolePolicyCommand(attachPolicyParams));
      console.log(`✅ Policy ${policyArn} attached to role ${roleName}`);
    }

    // Wait for role to propagate
    console.log('Waiting for role to propagate...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    return roleData.Role.Arn;
  } catch (error) {
    console.error('❌ Error creating Lambda role:', error);
    throw error;
  }
}

async function createLambdaPackage() {
  try {
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create index.js file
    const indexJsContent = `
const mysql = require('mysql2/promise');
const fs = require('fs');

exports.handler = async (event) => {
  let connection;
  
  try {
    // Database configuration
    const dbConfig = {
      host: '${dbConfig.host}',
      user: '${dbConfig.user}',
      password: '${dbConfig.password}',
      port: ${dbConfig.port}
    };
    
    console.log('Connecting to database server...');
    
    // First connect without specifying a database
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Connected to database server');
    
    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS expense_tracker');
    console.log('Database expense_tracker created or already exists');
    
    // Connect to the expense_tracker database
    await connection.changeUser({ database: 'expense_tracker' });
    
    // Read SQL file
    const sql = \`${fs.readFileSync(sqlFilePath, 'utf8')}\`;
    
    // Split SQL statements
    const statements = sql.split(';').filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await connection.execute(statement);
    }
    
    console.log('✅ Database tables created successfully');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Database setup completed successfully' })
    };
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error setting up database', error: error.message })
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
`;

    fs.writeFileSync(path.join(tempDir, 'index.js'), indexJsContent);
    console.log('✅ Lambda function code created');

    // Create package.json
    const packageJsonContent = {
      name: 'expense-tracker-database-setup',
      version: '1.0.0',
      description: 'Lambda function to set up the expense tracker database',
      main: 'index.js',
      dependencies: {
        'mysql2': '^3.6.0'
      }
    };

    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJsonContent, null, 2)
    );
    console.log('✅ package.json created');

    // Install dependencies
    console.log('Installing dependencies...');
    await execPromise('cd lambda-package && npm install');
    console.log('✅ Dependencies installed');

    // Create zip file
    console.log('Creating zip file...');
    await execPromise('cd lambda-package && zip -r ../lambda-package.zip .');
    console.log('✅ Lambda package created');

    return path.join(__dirname, 'lambda-package.zip');
  } catch (error) {
    console.error('❌ Error creating Lambda package:', error);
    throw error;
  }
}

async function createLambdaFunction(roleArn, zipFilePath) {
  try {
    // Check if function already exists
    try {
      await lambdaClient.send({
        FunctionName: functionName
      });
      console.log(`Function ${functionName} already exists, updating...`);
      // Update function code
      await lambdaClient.send({
        FunctionName: functionName,
        ZipFile: fs.readFileSync(zipFilePath)
      });
      console.log(`✅ Function ${functionName} updated`);
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }

      // Create function
      const createFunctionParams = {
        FunctionName: functionName,
        Runtime: 'nodejs18.x',
        Role: roleArn,
        Handler: 'index.handler',
        Code: {
          ZipFile: fs.readFileSync(zipFilePath)
        },
        Timeout: 30,
        MemorySize: 256,
        Environment: {
          Variables: {
            NODE_ENV: 'production'
          }
        }
      };

      await lambdaClient.send(new CreateFunctionCommand(createFunctionParams));
      console.log(`✅ Function ${functionName} created`);
    }

    // Invoke function
    console.log('Invoking Lambda function...');
    const invokeParams = {
      FunctionName: functionName,
      InvocationType: 'RequestResponse',
      LogType: 'Tail'
    };

    const response = await lambdaClient.send(new InvokeCommand(invokeParams));
    
    // Decode and log the response
    const payload = JSON.parse(Buffer.from(response.Payload).toString());
    console.log('Lambda function response:', payload);
    
    // Decode and log the logs
    if (response.LogResult) {
      const logs = Buffer.from(response.LogResult, 'base64').toString();
      console.log('Lambda function logs:', logs);
    }

    console.log('✅ Database setup completed');
  } catch (error) {
    console.error('❌ Error creating or invoking Lambda function:', error);
    throw error;
  }
}

async function setupDatabase() {
  try {
    console.log('Setting up database using Lambda...');
    
    // Create Lambda role
    const roleArn = await createLambdaRole();
    
    // Create Lambda package
    const zipFilePath = await createLambdaPackage();
    
    // Create and invoke Lambda function
    await createLambdaFunction(roleArn, zipFilePath);
    
    console.log('✅ Database setup process completed');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setupDatabase(); 