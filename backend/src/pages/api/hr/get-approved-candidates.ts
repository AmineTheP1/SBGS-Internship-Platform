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
    // Get candidates with approved reports (excluding those with downloaded attestations)
    const result = await pool.query(`
      SELECT DISTINCT
        c.cdtid,
        c.nom,
        c.prenom,
        c.email,
        c.cin,
        c.statutetudiant,
        c.telephone,
        c.imageurl,
        r.rstid as rapportid,
        r.titre as rapport_titre,
        r.datevalidation,
        r.statut as rapport_statut,
        s.stagesid,
        e.nom as ecole_nom
      FROM candidat c
      JOIN rapports_stage r ON c.cdtid = r.cdtid
      JOIN stages s ON r.stagesid = s.stagesid
      LEFT JOIN ecole e ON c.ecoleid = e.ecoleid
      LEFT JOIN attestations_stage ats ON s.stagesid = ats.stagesid AND c.cdtid = ats.cdtid AND r.rstid = ats.rapportid
      WHERE r.statut = 'Approuvé'
      AND (ats.downloaded IS NULL OR ats.downloaded = FALSE)
      ORDER BY r.datevalidation DESC
    `);

    res.status(200).json({ 
      success: true, 
      candidates: result.rows 
    });

  } catch (error) {
    console.error('Error fetching approved candidates:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la récupération des candidats avec rapports approuvés." });
  }
} 