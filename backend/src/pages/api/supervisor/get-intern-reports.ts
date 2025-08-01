import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { superviseurid } = req.query;

    if (!superviseurid) {
      return res.status(400).json({ success: false, error: "superviseurid est requis." });
    }

    // Create reports table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rapports_stage (
        id SERIAL PRIMARY KEY,
        cdtid VARCHAR(16) REFERENCES candidat(cdtid),
        titre VARCHAR(255) NOT NULL,
        description TEXT,
        url_fichier VARCHAR(500) NOT NULL,
        date_soumission TIMESTAMP DEFAULT NOW(),
        statut VARCHAR(20) DEFAULT 'En attente',
        commentaires_superviseur TEXT,
        date_approbation TIMESTAMP,
        superviseurid VARCHAR(16)
      )
    `);

    // Get all reports from interns assigned to this supervisor
    const result = await pool.query(
      `SELECT r.*, c.nom, c.prenom, c.email 
       FROM rapports_stage r
       JOIN assignations_stage a ON r.stagesid = a.stagesid
       JOIN candidat c ON a.cdtid = c.cdtid
       JOIN stages s ON a.stagesid = s.stagesid
       WHERE s.responsables_stageid = $1
       ORDER BY r.dateenvoi DESC`,
      [superviseurid]
    );

    res.status(200).json({ 
      success: true, 
      reports: result.rows 
    });

  } catch (error) {
    console.error('Error fetching intern reports:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la récupération des rapports." });
  }
} 