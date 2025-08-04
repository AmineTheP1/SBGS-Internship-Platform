const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkStatus() {
  try {
    console.log('Checking status values...');
    
    const result = await pool.query(`
      SELECT DISTINCT statut, COUNT(*) as count
      FROM demandes_stage
      GROUP BY statut
      ORDER BY count DESC
    `);
    
    console.log('Status distribution:');
    result.rows.forEach(row => {
      console.log(`"${row.statut}": ${row.count} candidates`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkStatus(); 