import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Get supervisor info from token
    const token = req.cookies?.supervisor_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const supervisor = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Create assignations table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS assignations_stage (
          id SERIAL PRIMARY KEY,
          resid VARCHAR(255) NOT NULL,
          cdtid VARCHAR(255) NOT NULL,
          date_assignation TIMESTAMP DEFAULT NOW(),
          statut VARCHAR(50) DEFAULT 'Actif',
          FOREIGN KEY (resid) REFERENCES responsables_stage(resid),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
        )
      `);
    } catch (error) {
      console.log("Assignations table might already exist or error occurred:", error);
    }

    // Get assigned interns
    const result = await pool.query(
      `SELECT 
        c.cdtid,
        c.nom,
        c.prenom,
        c.email,
        c.imageurl,
        d.statut as statut_candidature,
        d.typestage,
        d.periode,
        a.date_assignation,
        a.statut as statut_assignation
       FROM assignations_stage a
       JOIN candidat c ON a.cdtid = c.cdtid
       LEFT JOIN demandes_stage d ON c.cdtid = d.cdtid
       WHERE a.resid = $1 AND a.statut = 'Actif'
       ORDER BY a.date_assignation DESC`,
      [supervisor.resid]
    );

    return res.status(200).json({ 
      success: true,
      interns: result.rows
    });

  } catch (error) {
    console.error("Error getting assigned interns:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 