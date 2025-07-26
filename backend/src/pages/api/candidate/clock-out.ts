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
    // Get candidate info from token
    const token = req.cookies?.candidate_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const candidate = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if clocked in today
    const existingRecord = await pool.query(
      `SELECT * FROM presence WHERE cdtid = $1 AND date = $2`,
      [candidate.cdtid, today]
    );

    if (existingRecord.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Vous devez d'abord pointer l'entrée" 
      });
    }

    if (existingRecord.rows[0].heure_sortie) {
      return res.status(400).json({ 
        success: false, 
        error: "Vous avez déjà pointé la sortie aujourd'hui" 
      });
    }

    // Update presence record with clock out time
    const currentTime = new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    await pool.query(
      `UPDATE presence SET heure_sortie = $1, statut = $2 WHERE cdtid = $3 AND date = $4`,
      [currentTime, 'Terminé', candidate.cdtid, today]
    );

    // Update daily report with clock out time
    await pool.query(
      `UPDATE rapports_journaliers SET heure_sortie = $1 WHERE cdtid = $2 AND date = $3`,
      [currentTime, candidate.cdtid, today]
    );

    return res.status(200).json({ 
      success: true, 
      message: "Pointage de sortie enregistré",
      heure_sortie: currentTime
    });

  } catch (error) {
    console.error("Error in clock-out:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 