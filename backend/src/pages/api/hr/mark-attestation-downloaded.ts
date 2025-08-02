import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { cdtid, rapportid } = req.body;

    if (!cdtid || !rapportid) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    // First, add the downloaded column if it doesn't exist
    await pool.query(`
      ALTER TABLE attestations_stage ADD COLUMN IF NOT EXISTS downloaded BOOLEAN DEFAULT FALSE
    `);

    // Update the attestation to mark it as downloaded
    const result = await pool.query(`
      UPDATE attestations_stage 
      SET dategeneration = NOW(), downloaded = true
      WHERE stagesid = (
        SELECT s.stagesid 
        FROM stages s 
        JOIN rapports_stage r ON s.stagesid = r.stagesid 
        WHERE r.cdtid = $1 AND r.rstid = $2
      )
    `, [cdtid, rapportid]);

    console.log(`Attestation marked as downloaded for candidate ${cdtid}, rapport ${rapportid}`);

    res.status(200).json({ 
      success: true, 
      message: "Attestation marked as downloaded successfully."
    });

  } catch (error) {
    console.error('Error marking attestation as downloaded:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la mise à jour de l'attestation." });
  }
} 