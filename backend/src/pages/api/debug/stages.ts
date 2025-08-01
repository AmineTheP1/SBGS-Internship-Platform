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
    // Get all stages with supervisor info
    const result = await pool.query(`
      SELECT 
        s.stagesid,
        s.responsables_stageid,
        rs.nom as supervisor_nom,
        rs.prenom as supervisor_prenom,
        rs.resid
      FROM stages s
      LEFT JOIN responsables_stage rs ON s.responsables_stageid = rs.resid
      ORDER BY s.stagesid
    `);

    res.status(200).json({ 
      success: true, 
      stages: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching stages:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la récupération des stages." });
  }
} 