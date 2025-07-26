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
    // Get supervisor info from token
    const token = req.cookies?.supervisor_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const supervisor = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { cdtid, date_absence, motif, justifiee } = req.body;

    if (!cdtid || !date_absence) {
      return res.status(400).json({ 
        success: false, 
        error: "CDTID et date d'absence sont obligatoires" 
      });
    }

    // Verify supervisor is assigned to this intern
    const assignmentCheck = await pool.query(
      `SELECT * FROM assignations_stage WHERE rspid = $1 AND cdtid = $2 AND statut = 'Actif'`,
      [supervisor.rspid, cdtid]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: "Not authorized to manage this intern" });
    }

    // Check if absence already exists for this date
    const existingAbsence = await pool.query(
      `SELECT * FROM absences WHERE cdtid = $1 AND date_absence = $2`,
      [cdtid, date_absence]
    );

    if (existingAbsence.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Une absence est déjà notée pour cette date" 
      });
    }

    // Insert absence record
    await pool.query(
      `INSERT INTO absences (cdtid, date_absence, motif, justifiee, notee_par) 
       VALUES ($1, $2, $3, $4, $5)`,
      [cdtid, date_absence, motif || null, justifiee || false, supervisor.rspid]
    );

    return res.status(200).json({ 
      success: true, 
      message: "Absence notée avec succès"
    });

  } catch (error) {
    console.error("Error marking absence:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 