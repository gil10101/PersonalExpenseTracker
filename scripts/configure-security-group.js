/**
 * This script provides guidance on configuring security groups for Aurora Serverless
 * It doesn't make any actual changes to AWS resources
 */

console.log('Aurora Serverless Security Group Configuration Guide');
console.log('===================================================');
console.log('');
console.log('To allow connections to your Aurora Serverless database, follow these steps:');
console.log('');
console.log('1. Go to the AWS RDS Console: https://console.aws.amazon.com/rds/');
console.log('2. Select your database: database-2');
console.log('3. In the "Connectivity & security" tab, note the VPC security group');
console.log('4. Go to the EC2 Console: https://console.aws.amazon.com/ec2/');
console.log('5. Select "Security Groups" in the left navigation');
console.log('6. Find and select the security group used by your database');
console.log('7. Select the "Inbound rules" tab');
console.log('8. Click "Edit inbound rules"');
console.log('9. Add a rule with the following settings:');
console.log('   - Type: MySQL/Aurora (3306)');
console.log('   - Source: Depending on your needs:');
console.log('     * For development: Your IP address or 0.0.0.0/0 (not recommended for production)');
console.log('     * For Lambda: The Lambda security group or VPC CIDR');
console.log('10. Click "Save rules"');
console.log('');
console.log('For Lambda to access the database:');
console.log('1. Ensure your Lambda function is in the same VPC as the database');
console.log('2. Configure the Lambda function with the appropriate subnet and security group');
console.log('3. The Lambda security group should allow outbound traffic to the database');
console.log('4. The database security group should allow inbound traffic from the Lambda security group');
console.log('');
console.log('For more information, see:');
console.log('https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraServerless.html#aurora-serverless.security'); 