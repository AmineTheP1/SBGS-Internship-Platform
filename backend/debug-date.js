const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sbgs_db',
});

async function debugDates() {
  try {
    console.log('Checking date formats in presence table...');
    
    // Check a few attendance records
    const result = await pool.query(`
      SELECT 
        cdtid,
        date,
        heure_entree,
        confirme_par_superviseur,
        date_confirmation
      FROM presence 
      ORDER BY date DESC 
      LIMIT 5
    `);
    
    console.log('Sample attendance records:');
    result.rows.forEach((row, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  cdtid: ${row.cdtid}`);
      console.log(`  date: ${row.date} (type: ${typeof row.date})`);
      console.log(`  heure_entree: ${row.heure_entree}`);
      console.log(`  confirme_par_superviseur: ${row.confirme_par_superviseur}`);
      console.log(`  date_confirmation: ${row.date_confirmation}`);
      console.log('');
    });
    
    // Check today's date format
    const today = new Date().toISOString().split('T')[0];
    console.log(`Today's date (YYYY-MM-DD): ${today}`);
    
    // Check if there are any records for today
    const todayResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM presence 
      WHERE date = $1
    `, [today]);
    
    console.log(`Records for today (${today}): ${todayResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error debugging dates:', error);
  } finally {
    await pool.end();
  }
}

debugDates(); 