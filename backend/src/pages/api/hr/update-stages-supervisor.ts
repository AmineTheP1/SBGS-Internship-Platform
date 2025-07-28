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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Get HR info from token
    const token = req.cookies?.hr_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const hr = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { cdtid, resid } = req.body;

    if (!cdtid || !resid) {
      return res.status(400).json({ 
        success: false, 
        error: "CDTID et RESID sont obligatoires" 
      });
    }

    // Get the demandes_stage record for this candidate
    const result = await pool.query(`
      SELECT dsgid FROM demandes_stage WHERE cdtid = $1 LIMIT 1
    `, [cdtid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Candidature non trouvée" });
    }

    const dsgid = result.rows[0].dsgid;

    // Update the stages table with the supervisor
    await pool.query(
      `UPDATE stages SET responsables_stageid = $1 WHERE demandes_stageid = $2`,
      [resid, dsgid]
    );

    return res.status(200).json({ 
      success: true, 
      message: "Superviseur mis à jour dans la table stages"
    });

  } catch (error) {
    console.error("Error updating stages supervisor:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 