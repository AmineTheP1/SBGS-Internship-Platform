import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import sendEmail from "../../../utilities/sendEmail";
import { handleCors } from "../../../utilities/cors";

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
    const { cdtid, date_absence, motif, justifiee } = req.body;

    if (!cdtid || !date_absence) {
      return res.status(400).json({ 
        success: false, 
        error: "CDTID et date d'absence sont obligatoires" 
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

    // Insert absence record with justifiee set to true when supervisor marks it
    await pool.query(
      `INSERT INTO absences (cdtid, date_absence, motif, justifiee, notee_par) 
       VALUES ($1, $2, $3, $4, $5)`,
      [cdtid, date_absence, motif || null, true, supervisor.resid]
    );

    // Increment total absences in stages table
    await pool.query(
      `UPDATE stages SET dureetotaleabsences = dureetotaleabsences + 1 
       WHERE demandes_stageid = (
         SELECT dsgid FROM demandes_stage WHERE cdtid = $1 LIMIT 1
       )`,
      [cdtid]
    );

    // Get candidate info to send email
    const candidateResult = await pool.query(
      `SELECT c.prenom, c.nom, c.email FROM candidat c WHERE c.cdtid = $1`,
      [cdtid]
    );

    if (candidateResult.rows.length > 0) {
      const candidate = candidateResult.rows[0];
      const fullName = `${candidate.prenom} ${candidate.nom}`.trim();
      
      // Send email to candidate
      await sendEmail({
        to: candidate.email,
        subject: "Absence justifiée - Notification",
        text: `Bonjour ${fullName},\n\nVotre absence du ${new Date(date_absence).toLocaleDateString('fr-FR')} a été notée par votre responsable de stage.\n\nMotif: ${motif || 'Non spécifié'}\nStatut: Justifiée\n\nCordialement,\nSBGS Plateforme`,
        html: undefined
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Absence notée avec succès"
    });

  } catch (error) {
    console.error("Error marking absence:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 