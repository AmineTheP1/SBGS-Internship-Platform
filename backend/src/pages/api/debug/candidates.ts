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
    const result = await pool.query(
      "SELECT cdtid, nom, prenom, email FROM candidat ORDER BY cdtid"
    );

    res.status(200).json({ 
      success: true, 
      candidates: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la récupération des candidats." });
  }
} 