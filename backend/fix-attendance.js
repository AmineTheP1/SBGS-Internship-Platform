const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sbgs_db',
});

async function fixAttendanceRecords() {
  try {
    console.log('Fixing attendance records...');
    
    // Fix attendance records that don't have proper NULL values for confirme_par_superviseur
    const result1 = await pool.query(`
      UPDATE presence 
      SET confirme_par_superviseur = NULL 
      WHERE confirme_par_superviseur IS NOT TRUE AND confirme_par_superviseur IS NOT FALSE
    `);
    
    console.log(`Updated ${result1.rowCount} records for confirme_par_superviseur`);
    
    // Also ensure date_confirmation is NULL for unconfirmed records
    const result2 = await pool.query(`
      UPDATE presence 
      SET date_confirmation = NULL 
      WHERE confirme_par_superviseur IS NULL
    `);
    
    console.log(`Updated ${result2.rowCount} records for date_confirmation`);
    
    // Show current state
    const checkResult = await pool.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN confirme_par_superviseur IS NULL THEN 1 END) as unconfirmed,
        COUNT(CASE WHEN confirme_par_superviseur = true THEN 1 END) as confirmed_true,
        COUNT(CASE WHEN confirme_par_superviseur = false THEN 1 END) as confirmed_false
      FROM presence
    `);
    
    console.log('Current attendance records state:', checkResult.rows[0]);
    
  } catch (error) {
    console.error('Error fixing attendance records:', error);
  } finally {
    await pool.end();
  }
}

fixAttendanceRecords(); 