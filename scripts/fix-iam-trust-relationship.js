#!/usr/bin/env node

/**
 * This script checks and updates the IAM role trust relationship
 * to ensure AppSync can assume the role
 */

import { 
  IAMClient, 
  GetRoleCommand,
  UpdateAssumeRolePolicyCommand 
} from '@aws-sdk/client-iam';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// IAM role ARN from .env
const roleArn = process.env.APPSYNC_SERVICE_ROLE_ARN || 'arn:aws:iam::717279732805:role/service-role/appsync-ds-rds-oLHVY4k9SHww-database-2';

// Extract role name from ARN - get everything after the last '/'
const roleName = roleArn.split('/').pop();

console.log(`Role ARN: ${roleArn}`);
console.log(`Extracted Role Name: ${roleName}`);

// AppSync API ID and region
const apiId = process.env.APPSYNC_API_ID || 'x5ujbpctlnbsxahehbvnt3ie3y';
const region = process.env.AWS_REGION || 'us-east-2';
const accountId = roleArn.split(':')[4]; // Extract account ID from the role ARN

// Create IAM client
const iamClient = new IAMClient({
  region: region
});

// Function to get current trust policy
async function getTrustPolicy() {
  try {
    console.log(`Getting trust policy for role: ${roleName}`);
    
    const command = new GetRoleCommand({
      RoleName: roleName
    });
    
    const response = await iamClient.send(command);
    
    if (response.Role && response.Role.AssumeRolePolicyDocument) {
      const trustPolicy = JSON.parse(decodeURIComponent(response.Role.AssumeRolePolicyDocument));
      console.log('Current trust policy:');
      console.log(JSON.stringify(trustPolicy, null, 2));
      
      return trustPolicy;
    } else {
      console.error('❌ Could not retrieve trust policy');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error getting trust policy: ${error.message}`);
    return null;
  }
}

// Function to update trust policy
async function updateTrustPolicy(currentPolicy) {
  try {
    console.log('Updating trust policy to allow AppSync in us-east-2 to assume the role...');
    
    // Create a new trust policy that includes AppSync with the correct region
    const newTrustPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            Service: 'appsync.amazonaws.com'
          },
          Action: 'sts:AssumeRole',
          Condition: {
            StringEquals: {
              'aws:SourceAccount': accountId
            },
            ArnEquals: {
              'aws:SourceArn': `arn:aws:appsync:${region}:${accountId}:apis/${apiId}`
            }
          }
        }
      ]
    };
    
    console.log('New trust policy:');
    console.log(JSON.stringify(newTrustPolicy, null, 2));
    
    const command = new UpdateAssumeRolePolicyCommand({
      RoleName: roleName,
      PolicyDocument: JSON.stringify(newTrustPolicy)
    });
    
    await iamClient.send(command);
    
    console.log('✅ Trust policy updated successfully');
    
    return true;
  } catch (error) {
    console.error(`❌ Error updating trust policy: ${error.message}`);
    return false;
  }
}

// Main function
async function fixIamTrustRelationship() {
  try {
    console.log('🔍 Checking IAM role trust relationship...');
    
    // Get current trust policy
    const currentPolicy = await getTrustPolicy();
    
    if (!currentPolicy) {
      console.error('Cannot proceed with update as trust policy could not be retrieved');
      console.log('\nAlternative approach:');
      console.log('1. Go to the AWS IAM console: https://console.aws.amazon.com/iam/');
      console.log('2. Find the role: appsync-ds-rds-oLHVY4k9SHww-database-2');
      console.log('3. Click on the "Trust relationships" tab');
      console.log('4. Click "Edit trust relationship"');
      console.log('5. Add AppSync as a trusted entity with the correct region:');
      console.log(`
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "appsync.amazonaws.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "aws:SourceAccount": "${accountId}"
        },
        "ArnEquals": {
          "aws:SourceArn": "arn:aws:appsync:${region}:${accountId}:apis/${apiId}"
        }
      }
    }
  ]
}
      `);
      return;
    }
    
    // Check if the current policy has the wrong region
    let needsUpdate = true;
    if (currentPolicy && currentPolicy.Statement) {
      for (const statement of currentPolicy.Statement) {
        if (statement.Principal && statement.Principal.Service === 'appsync.amazonaws.com' &&
            statement.Condition && statement.Condition.ArnEquals && 
            statement.Condition.ArnEquals['aws:SourceArn']) {
          const sourceArn = statement.Condition.ArnEquals['aws:SourceArn'];
          if (sourceArn.includes(`:${region}:`)) {
            console.log(`✅ Trust policy already configured for region ${region}`);
            needsUpdate = false;
            break;
          }
        }
      }
    }
    
    if (needsUpdate) {
      // Update trust policy
      const updated = await updateTrustPolicy(currentPolicy);
      
      if (updated) {
        console.log('\n✅ IAM role trust relationship update completed');
        console.log(`AppSync in ${region} can now assume the role to access your database`);
      } else {
        console.error('\n❌ IAM role trust relationship update failed');
      }
    }
    
    console.log('\nNext steps:');
    console.log('1. Run the fix-appsync-region.js script to update the AppSync data source');
    console.log('2. Run the test-appsync.js script to verify the connection');
  } catch (error) {
    console.error('\n❌ Error in trust relationship update process:', error.message);
  }
}

// Run the main function
fixIamTrustRelationship(); 