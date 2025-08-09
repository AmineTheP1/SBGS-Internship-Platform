import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { handleCors } from "../../../utilities/cors";
import sendEmail from "../../../utilities/sendEmail";

// Create propositions_entretien table if it doesn't exist
async function ensurePropositionsEntretienTable(pool: Pool) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS propositions_entretien (
        id SERIAL PRIMARY KEY,
        cdtid VARCHAR(255) NOT NULL,
        date_proposition TIMESTAMP DEFAULT NOW(),
        email_content TEXT,
        subject VARCHAR(255),
        FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
      )
    `);
  } catch (error) {
    console.error("Error creating propositions_entretien table:", error);
  }
}

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
    // Ensure the propositions_entretien table exists
    await ensurePropositionsEntretienTable(pool);
   

    console.log('Request body:', req.body);
    const { cdtid, emailContent, subject } = req.body;

    console.log('Extracted values:', { cdtid: cdtid ? 'Present' : 'Missing', emailContent: emailContent ? 'Present' : 'Missing', subject: subject ? 'Present' : 'Missing' });
    
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
        `INSERT INTO propositions_entretien (cdtid, email_content, subject) VALUES ($1, $2, $3)`,
        [cdtid, emailContent, subject || "Proposition d'entretien - SBGS"]
      );
      
      console.log('Email sent successfully to candidate:', candidate.email);

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