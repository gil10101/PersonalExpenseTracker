// Test script to verify date formatting for AWSDateTime GraphQL type

// Test case 1: Format a date from a date picker (YYYY-MM-DD)
const dateFromPicker = '2025-03-12';
const formattedDate1 = new Date(dateFromPicker + 'T12:00:00Z').toISOString();
console.log('Original date from picker:', dateFromPicker);
console.log('Formatted for AWSDateTime:', formattedDate1);

// Test case 2: Format a date from JavaScript Date object
const jsDate = new Date();
const formattedDate2 = jsDate.toISOString();
console.log('Original JS Date:', jsDate);
console.log('Formatted for AWSDateTime:', formattedDate2);

// Test case 3: Format a future date (beyond 2038)
const futureDate = '2040-01-01';
const formattedDate3 = new Date(futureDate + 'T12:00:00Z').toISOString();
console.log('Future date (beyond 2038):', futureDate);
console.log('Formatted for AWSDateTime:', formattedDate3);

console.log('\nNote: AWSDateTime expects ISO 8601 format strings (e.g., YYYY-MM-DDThh:mm:ss.sssZ)');
console.log('This format is compatible with JavaScript\'s Date.toISOString() method.'); 