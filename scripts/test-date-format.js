// Test script to verify date formatting for MySQL TIMESTAMP compatibility

// Test case 1: Format a date from a date picker (YYYY-MM-DD)
const dateFromPicker = '2025-03-12';
const formattedDate1 = new Date(dateFromPicker + 'T12:00:00').toISOString().slice(0, 19).replace('T', ' ');
console.log('Original date from picker:', dateFromPicker);
console.log('Formatted for MySQL:', formattedDate1);

// Test case 2: Format a date from JavaScript Date object
const jsDate = new Date();
const formattedDate2 = jsDate.toISOString().slice(0, 19).replace('T', ' ');
console.log('Original JS Date:', jsDate);
console.log('Formatted for MySQL:', formattedDate2);

// Test case 3: Format a future date (beyond 2038)
const futureDate = '2040-01-01';
const formattedDate3 = new Date(futureDate + 'T12:00:00').toISOString().slice(0, 19).replace('T', ' ');
console.log('Future date (beyond 2038):', futureDate);
console.log('Formatted for MySQL:', formattedDate3);

console.log('\nNote: MySQL TIMESTAMP has a valid range from 1970-01-01 to 2038-01-19.');
console.log('If you need to store dates beyond this range, consider using DATETIME instead.'); 