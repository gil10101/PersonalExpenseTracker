#!/usr/bin/env node

/**
 * This script adds the necessary permissions to the IAM role
 * to allow it to execute statements on the RDS database
 */

import { 
  IAMClient, 
  GetRoleCommand,
  PutRolePolicyCommand
} from '@aws-sdk/client-iam';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// IAM role ARN from .env
const roleArn = process.env.APPSYNC_SERVICE_ROLE_ARN || 'arn:aws:iam::717279732805:role/service-role/appsync-ds-rds-oLHVY4k9SHww-database-2';

// Extract role name from ARN - get everything after the last '/'
const roleName = roleArn.split('/').pop();

// Extract account ID from the role ARN
const accountId = roleArn.split(':')[4];

// Region
const region = process.env.AWS_REGION || 'us-east-2';

console.log(`Role ARN: ${roleArn}`);
console.log(`Extracted Role Name: ${roleName}`);
console.log(`Account ID: ${accountId}`);
console.log(`Region: ${region}`);

// Create IAM client
const iamClient = new IAMClient({
  region: region
});

// Function to get current role
async function getRole() {
  try {
    console.log(`Getting role: ${roleName}`);
    
    const command = new GetRoleCommand({
      RoleName: roleName
    });
    
    const response = await iamClient.send(command);
    
    if (response.Role) {
      console.log('✅ Role found');
      return response.Role;
    } else {
      console.error('❌ Role not found');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error getting role: ${error.message}`);
    return null;
  }
}

// Function to add RDS Data API permissions
async function addRdsDataPermissions() {
  try {
    console.log('Adding RDS Data API permissions to the role...');
    
    // Create a policy that allows the role to execute statements on the RDS database
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'rds-data:ExecuteStatement',
            'rds-data:BatchExecuteStatement',
            'rds-data:BeginTransaction',
            'rds-data:CommitTransaction',
            'rds-data:RollbackTransaction'
          ],
          Resource: [
            `arn:aws:rds:${region}:${accountId}:cluster:*`,
            `arn:aws:rds:${region}:${accountId}:cluster-endpoint:*`
          ]
        },
        {
          Effect: 'Allow',
          Action: [
            'secretsmanager:GetSecretValue'
          ],
          Resource: [
            `arn:aws:secretsmanager:${region}:${accountId}:secret:*`
          ]
        }
      ]
    };
    
    const command = new PutRolePolicyCommand({
      RoleName: roleName,
      PolicyName: 'RDSDataAPIAccess',
      PolicyDocument: JSON.stringify(policyDocument)
    });
    
    await iamClient.send(command);
    
    console.log('✅ RDS Data API permissions added successfully');
    console.log('Policy document:');
    console.log(JSON.stringify(policyDocument, null, 2));
    
    return true;
  } catch (error) {
    console.error(`❌ Error adding RDS Data API permissions: ${error.message}`);
    return false;
  }
}

// Main function
async function fixIamPermissions() {
  try {
    console.log('🔍 Checking IAM role permissions...');
    
    // Get role
    const role = await getRole();
    
    if (!role) {
      console.error('Cannot proceed with update as role could not be retrieved');
      console.log('\nAlternative approach:');
      console.log('1. Go to the AWS IAM console: https://console.aws.amazon.com/iam/');
      console.log('2. Find the role: appsync-ds-rds-oLHVY4k9SHww-database-2');
      console.log('3. Click on the "Permissions" tab');
      console.log('4. Click "Add permissions" > "Create inline policy"');
      console.log('5. Add the following policy:');
      console.log(`
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds-data:ExecuteStatement",
        "rds-data:BatchExecuteStatement",
        "rds-data:BeginTransaction",
        "rds-data:CommitTransaction",
        "rds-data:RollbackTransaction"
      ],
      "Resource": [
        "arn:aws:rds:${region}:${accountId}:cluster:*",
        "arn:aws:rds:${region}:${accountId}:cluster-endpoint:*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:${region}:${accountId}:secret:*"
      ]
    }
  ]
}
      `);
      return;
    }
    
    // Add RDS Data API permissions
    const updated = await addRdsDataPermissions();
    
    if (updated) {
      console.log('\n✅ IAM role permissions update completed');
      console.log('The role now has the necessary permissions to execute statements on the RDS database');
      
      console.log('\nNext steps:');
      console.log('1. Run the test-appsync.js script to verify the connection');
    } else {
      console.error('\n❌ IAM role permissions update failed');
    }
  } catch (error) {
    console.error('\n❌ Error in permissions update process:', error.message);
  }
}

// Run the main function
fixIamPermissions(); 