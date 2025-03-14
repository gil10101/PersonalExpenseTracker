import { executeMySQLQuery } from './sql-utils.js';

/**
 * Test direct SQL execution
 */
async function testDirectSQL() {
  try {
    console.log('Testing direct SQL execution...');
    
    // Create a test expense with a future date
    const testDate = new Date('2025-03-12T12:00:00Z').toISOString().slice(0, 19).replace('T', ' ');
    
    console.log('Using test date:', testDate);
    
    // Insert a test expense
    const insertQuery = `
      INSERT INTO expenses (name, amount, category, date, userId)
      VALUES ('Test Direct SQL', 200.00, 'Test', '${testDate}', 'test@example.com')
    `;
    
    console.log('Executing insert query:', insertQuery);
    const insertResult = await executeMySQLQuery(insertQuery);
    console.log('Insert result:', insertResult);
    
    // Get the inserted ID
    const insertId = insertResult.insertId;
    console.log('Inserted ID:', insertId);
    
    // Verify the expense was created
    const selectQuery = `SELECT * FROM expenses WHERE id = ${insertId}`;
    console.log('Executing select query:', selectQuery);
    const selectResult = await executeMySQLQuery(selectQuery);
    console.log('Select result:', selectResult);
    
    // Clean up by deleting the test expense
    const deleteQuery = `DELETE FROM expenses WHERE id = ${insertId}`;
    console.log('Executing delete query:', deleteQuery);
    const deleteResult = await executeMySQLQuery(deleteQuery);
    console.log('Delete result:', deleteResult);
    
    console.log('✅ Direct SQL test completed successfully!');
  } catch (error) {
    console.error('❌ Error in direct SQL test:', error);
  }
}

// Run the test
testDirectSQL().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 