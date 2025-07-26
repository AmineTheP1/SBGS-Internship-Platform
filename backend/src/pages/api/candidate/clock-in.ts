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

    // Check if already clocked in today
    const existingRecord = await pool.query(
      `SELECT * FROM presence WHERE cdtid = $1 AND date = $2`,
      [candidate.cdtid, today]
    );

    if (existingRecord.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Vous êtes déjà pointé aujourd'hui" 
      });
    }

    // Create presence record
    const currentTime = new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    await pool.query(
      `INSERT INTO presence (cdtid, date, heure_entree, statut) VALUES ($1, $2, $3, $4)`,
      [candidate.cdtid, today, currentTime, 'En cours']
    );

    // Create daily report record
    await pool.query(
      `INSERT INTO rapports_journaliers (cdtid, date, nom_prenom, periode_stage, heure_entree, service_affectation) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        candidate.cdtid, 
        today, 
        `${candidate.prenom} ${candidate.nom}`,
        candidate.periode || 'Non spécifiée',
        currentTime,
        'À définir' // Will be updated by HR or supervisor
      ]
    );

    return res.status(200).json({ 
      success: true, 
      message: "Pointage d'entrée enregistré",
      heure_entree: currentTime
    });

  } catch (error) {
    console.error("Error in clock-in:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 