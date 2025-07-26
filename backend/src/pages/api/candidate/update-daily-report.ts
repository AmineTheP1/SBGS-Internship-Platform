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
  res.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Get candidate info from token
    const token = req.cookies?.candidate_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const candidate = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { taches_effectuees, documents_utilises } = req.body;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if daily report exists for today
    const existingReport = await pool.query(
      `SELECT * FROM rapports_journaliers WHERE cdtid = $1 AND date = $2`,
      [candidate.cdtid, today]
    );

    if (existingReport.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Vous devez d'abord pointer l'entrée pour créer un rapport" 
      });
    }

    // Update daily report
    await pool.query(
      `UPDATE rapports_journaliers 
       SET taches_effectuees = $1, documents_utilises = $2, date_modification = NOW()
       WHERE cdtid = $3 AND date = $4`,
      [taches_effectuees, documents_utilises, candidate.cdtid, today]
    );

    return res.status(200).json({ 
      success: true, 
      message: "Rapport journalier mis à jour avec succès"
    });

  } catch (error) {
    console.error("Error updating daily report:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 