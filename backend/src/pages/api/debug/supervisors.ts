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
    // Get all supervisors
    const result = await pool.query(`
      SELECT 
        resid,
        nom,
        prenom,
        email,
        service
      FROM responsables_stage
      ORDER BY nom, prenom
    `);

    res.status(200).json({ 
      success: true, 
      supervisors: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching supervisors:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la récupération des superviseurs." });
  }
} 