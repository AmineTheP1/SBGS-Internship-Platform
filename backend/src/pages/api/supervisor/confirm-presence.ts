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
    console.log("Confirm presence endpoint called");
    console.log("Request body:", req.body);
    
    // Get supervisor info from token
    const token = req.cookies?.supervisor_token;

    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const supervisor = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const { cdtid, date, confirmed } = req.body;

    console.log("Extracted data:", { cdtid, date, confirmed });

    if (!cdtid || confirmed === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: "CDTID et confirmed sont obligatoires" 
      });
    }
    
    // Use today's date if no date provided
    let normalizedDate = date || new Date().toISOString().split('T')[0];
    try {
      // Handle different date formats
      if (normalizedDate.includes('T')) {
        // If date includes time component (ISO format)
        normalizedDate = normalizedDate.split('T')[0];
      } else if (normalizedDate.includes('/')) {
        // If date is in DD/MM/YYYY format
        const parts = normalizedDate.split('/');
        normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    } catch (error) {
      console.error('Error normalizing date:', error);
      // Continue with original date if normalization fails
    }

    console.log("Normalized date:", normalizedDate);
    console.log("Today's date:", new Date().toISOString().split('T')[0]);

    // Verify supervisor is assigned to this intern
    const assignmentCheck = await pool.query(
      `SELECT * FROM assignations_stage WHERE resid = $1 AND cdtid = $2 AND statut = 'Actif'`,
      [supervisor.resid, cdtid]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: "Not authorized to manage this intern" });
    }

    // Check if attendance record exists for this date
    const attendanceCheck = await pool.query(
      `SELECT * FROM presence WHERE cdtid = $1 AND DATE(date AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Casablanca') = $2`,
      [cdtid, normalizedDate]
    );

    console.log("Attendance check result:", attendanceCheck.rows);
    
    // Also check for any presence records for this candidate
    const allPresenceCheck = await pool.query(
      `SELECT * FROM presence WHERE cdtid = $1 ORDER BY date DESC LIMIT 5`,
      [cdtid]
    );
    console.log("All presence records for this candidate:", allPresenceCheck.rows);

    if (attendanceCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Aucun pointage trouvé pour cette date. L'étudiant doit d'abord pointer." 
      });
    }

    // Update existing attendance record with supervisor confirmation
    const updateResult = await pool.query(
      `UPDATE presence 
       SET confirme_par_superviseur = $1, date_confirmation = NOW()
       WHERE cdtid = $2 AND DATE(date AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Casablanca') = $3
       RETURNING id`,
      [confirmed, cdtid, normalizedDate]
    );
    
    console.log("Update result:", updateResult.rows);
    
    if (updateResult.rowCount === 0) {
      console.error('Failed to update presence record for cdtid:', cdtid, 'date:', date);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la mise à jour de la présence"
      });
    }

    // If confirmed = false (absence), create an absence record
    if (!confirmed) {
      try {
        // Check if absence record already exists for this date
        const existingAbsence = await pool.query(
          `SELECT * FROM absences WHERE cdtid = $1 AND date_absence = $2`,
          [cdtid, normalizedDate]
        );

        if (existingAbsence.rows.length === 0) {
          // Create new absence record
          const absenceResult = await pool.query(
            `INSERT INTO absences (cdtid, date_absence, motif, justifiee, notee_par, date_creation)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING id`,
            [cdtid, normalizedDate, 'Absence confirmée par le superviseur', false, supervisor.resid]
          );
          console.log("Absence record created:", absenceResult.rows);
        }
      } catch (error) {
        console.error('Error creating absence record:', error);
        // Continue processing even if absence creation fails
        // We don't want to fail the whole request if just the absence creation fails
      }
    }

    const message = confirmed 
      ? "Présence confirmée avec succès"
      : "Absence confirmée avec succès";

    console.log("Success message:", message);

    return res.status(200).json({ 
      success: true, 
      message: message
    });

  } catch (error) {
    console.error("Error confirming presence:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
}