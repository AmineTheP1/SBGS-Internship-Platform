import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { handleCors } from "../../../utilities/cors";
import sendEmail from "../../../utilities/sendEmail";

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
    // Get HR info from token
    const token = req.cookies?.hr_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const hr = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!hr.role || hr.role !== 'hr') {
      return res.status(403).json({ success: false, error: "Accès non autorisé" });
    }

    const { cdtid, emailContent, subject } = req.body;

    if (!cdtid || !emailContent) {
      return res.status(400).json({ success: false, error: "Missing required parameters" });
    }

    // Get candidate details
    const candidateResult = await pool.query(
      `SELECT nom, prenom, email FROM candidat WHERE cdtid = $1`,
      [cdtid]
    );

    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Candidate not found" });
    }

    const candidate = candidateResult.rows[0];
    
    // Send email to candidate
    try {
      await sendEmail({
        to: candidate.email,
        subject: subject || "Proposition d'entretien - SBGS",
        text: emailContent,
        html: emailContent.replace(/\n/g, '<br>')
      });

      // Log the interview proposal in the database
      await pool.query(
        `INSERT INTO propositions_entretien 
         (cdtid, date_proposition, contenu_email, statut)
         VALUES ($1, NOW(), $2, 'Envoyé')`,
        [cdtid, emailContent]
      );

      return res.status(200).json({ 
        success: true, 
        message: "Proposition d'entretien envoyée avec succès" 
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return res.status(500).json({ 
        success: false, 
        error: "Erreur lors de l'envoi de l'email" 
      });
    }

  } catch (error) {
    console.error("Error sending interview proposal:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
}