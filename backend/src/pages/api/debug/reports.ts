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
    // Get all reports
    const result = await pool.query(`
      SELECT 
        r.rstid,
        r.url,
        r.titre,
        r.commentaire,
        r.dateenvoi,
        r.statut,
        r.cdtid,
        r.stagesid,
        c.nom,
        c.prenom,
        s.responsables_stageid
      FROM rapports_stage r
      LEFT JOIN candidat c ON r.cdtid = c.cdtid
      LEFT JOIN stages s ON r.stagesid = s.stagesid
      ORDER BY r.dateenvoi DESC
    `);

    res.status(200).json({ 
      success: true, 
      reports: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la récupération des rapports." });
  }
} 