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
    // Get supervisor info from token
    const token = req.cookies?.supervisor_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const supervisor = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { cdtid, statut, commentaires, note } = req.body;

    if (!cdtid || !statut) {
      return res.status(400).json({ 
        success: false, 
        error: "CDTID et statut sont obligatoires" 
      });
    }

    // Verify supervisor is assigned to this intern
    const assignmentCheck = await pool.query(
      `SELECT * FROM assignations_stage WHERE rspid = $1 AND cdtid = $2 AND statut = 'Actif'`,
      [supervisor.rspid, cdtid]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: "Not authorized to review this intern" });
    }

    // Create final reports table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rapports_stage (
          id SERIAL PRIMARY KEY,
          cdtid VARCHAR(255) NOT NULL,
          titre VARCHAR(255) NOT NULL,
          contenu TEXT NOT NULL,
          fichier_url VARCHAR(500),
          statut VARCHAR(50) DEFAULT 'En attente',
          note INTEGER CHECK (note >= 0 AND note <= 20),
          commentaires_superviseur TEXT,
          date_soumission TIMESTAMP DEFAULT NOW(),
          date_revision TIMESTAMP,
          revise_par VARCHAR(255),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
        )
      `);
    } catch (error) {
      console.log("Final reports table might already exist or error occurred:", error);
    }

    // Check if final report exists
    const reportCheck = await pool.query(
      `SELECT * FROM rapports_stage WHERE cdtid = $1 ORDER BY date_soumission DESC LIMIT 1`,
      [cdtid]
    );

    if (reportCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Aucun rapport de stage trouvé pour ce stagiaire" 
      });
    }

    // Update final report
    await pool.query(
      `UPDATE rapports_stage 
       SET statut = $1, commentaires_superviseur = $2, note = $3, date_revision = NOW(), revise_par = $4
       WHERE cdtid = $5 AND id = $6`,
      [statut, commentaires || null, note || null, supervisor.rspid, cdtid, reportCheck.rows[0].id]
    );

    return res.status(200).json({ 
      success: true, 
      message: "Rapport de stage révisé avec succès"
    });

  } catch (error) {
    console.error("Error reviewing final report:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 