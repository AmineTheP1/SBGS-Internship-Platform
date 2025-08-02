const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixAttestations() {
  try {
    console.log('Starting attestation fix...');
    
    // Add rapportid column if it doesn't exist
    await pool.query(`
      ALTER TABLE attestations_stage ADD COLUMN IF NOT EXISTS rapportid VARCHAR(16)
    `);
    
    console.log('Added rapportid column');
    
    // Get all attestations that don't have rapportid set
    const attestations = await pool.query(`
      SELECT atsid, cdtid, stagesid 
      FROM attestations_stage 
      WHERE rapportid IS NULL
    `);
    
    console.log(`Found ${attestations.rows.length} attestations to fix`);
    
    // For each attestation, find the corresponding rapport and update it
    for (const attestation of attestations.rows) {
      const rapportResult = await pool.query(`
        SELECT rstid 
        FROM rapports_stage 
        WHERE cdtid = $1 AND stagesid = $2 
        LIMIT 1
      `, [attestation.cdtid, attestation.stagesid]);
      
      if (rapportResult.rows.length > 0) {
        await pool.query(`
          UPDATE attestations_stage 
          SET rapportid = $1 
          WHERE atsid = $2
        `, [rapportResult.rows[0].rstid, attestation.atsid]);
        
        console.log(`Updated attestation ${attestation.atsid} with rapportid ${rapportResult.rows[0].rstid}`);
      } else {
        console.log(`No rapport found for attestation ${attestation.atsid}`);
      }
    }
    
    console.log('Attestation fix completed');
    
  } catch (error) {
    console.error('Error fixing attestations:', error);
  } finally {
    await pool.end();
  }
}

fixAttestations(); 