const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sbgs_db',
});

async function addThemeField() {
  try {
    console.log('Adding theme_stage field to assignations_stage table...');
    
    const result = await pool.query(`
      ALTER TABLE assignations_stage ADD COLUMN IF NOT EXISTS theme_stage VARCHAR(255)
    `);
    
    console.log('Theme field added successfully!');
    
    // Verify the column exists
    const checkResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'assignations_stage' AND column_name = 'theme_stage'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('Theme field verified:', checkResult.rows[0]);
    } else {
      console.log('Theme field not found');
    }
    
  } catch (error) {
    console.error('Error adding theme field:', error);
  } finally {
    await pool.end();
  }
}

addThemeField(); 