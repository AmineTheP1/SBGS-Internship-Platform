import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { handleCors } from "../../../utilities/cors";

// Confirm presence endpoint for supervisors - Updated

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) return;

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
    const { cdtid, date, confirmed } = req.body;

    if (!cdtid || !date || confirmed === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: "CDTID, date et confirmed sont obligatoires" 
      });
    }

    // Verify supervisor is assigned to this intern
    const assignmentCheck = await pool.query(
      `SELECT * FROM assignations_stage WHERE resid = $1 AND cdtid = $2 AND statut = 'Actif'`,
      [supervisor.resid, cdtid]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: "Not authorized to manage this intern" });
    }

    // Check if attendance record exists for this date
    // Use multiple date formats for comparison to be more robust
    const attendanceCheck = await pool.query(
      `SELECT * FROM presence WHERE cdtid = $1 AND (DATE(date) = $2 OR date::text LIKE $3)`,
      [cdtid, date, `${date}%`]
    );

    if (attendanceCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Aucun pointage trouvé pour cette date. L'étudiant doit d'abord pointer." 
      });
    }

    // Update existing attendance record with supervisor confirmation
    await pool.query(
      `UPDATE presence 
       SET confirme_par_superviseur = $1, date_confirmation = NOW()
       WHERE cdtid = $2 AND (DATE(date) = $3 OR date::text LIKE $4)`,
      [confirmed, cdtid, date, `${date}%`]
    );

    const message = confirmed 
      ? "Présence confirmée avec succès"
      : "Absence confirmée avec succès";

    return res.status(200).json({ 
      success: true, 
      message: message
    });

  } catch (error) {
    console.error("Error confirming presence:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 