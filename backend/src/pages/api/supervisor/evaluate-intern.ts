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
    // Get supervisor info from token
    const token = req.cookies?.supervisor_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const supervisor = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const { 
      cdtid, 
      technical_skills_score,
      work_quality_score,
      timeliness_score,
      teamwork_score,
      initiative_score,
      communication_score,
      supervisor_comments,
      rapportid
    } = req.body;

    if (!cdtid || !rapportid) {
      return res.status(400).json({ 
        success: false, 
        error: "CDTID et rapportid sont obligatoires" 
      });
    }

    // Verify supervisor is assigned to this intern
    const assignmentCheck = await pool.query(
      `SELECT * FROM assignations_stage WHERE resid = $1 AND cdtid = $2 AND statut = 'Actif'`,
      [supervisor.resid, cdtid]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: "Not authorized to evaluate this intern" });
    }

    // Verify the report exists and is approved
    const reportCheck = await pool.query(
      `SELECT * FROM rapports_stage WHERE rstid = $1 AND statut = 'Approuvé'`,
      [rapportid]
    );

    if (reportCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Rapport non trouvé ou non approuvé" 
      });
    }

    // Create evaluations table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS evaluations_stagiaire (
          evalid SERIAL PRIMARY KEY,
          cdtid VARCHAR(255) NOT NULL,
          rapportid VARCHAR(255) NOT NULL,
          resid VARCHAR(255) NOT NULL,
          competences_techniques INTEGER CHECK (competences_techniques >= 0 AND competences_techniques <= 10),
          qualite_travail INTEGER CHECK (qualite_travail >= 0 AND qualite_travail <= 10),
          respect_delais INTEGER CHECK (respect_delais >= 0 AND respect_delais <= 10),
          travail_equipe INTEGER CHECK (travail_equipe >= 0 AND travail_equipe <= 10),
          autonomie_initiative INTEGER CHECK (autonomie_initiative >= 0 AND autonomie_initiative <= 10),
          communication INTEGER CHECK (communication >= 0 AND communication <= 10),
          commentaires TEXT,
          date_evaluation TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid),
          FOREIGN KEY (rapportid) REFERENCES rapports_stage(rstid),
          FOREIGN KEY (resid) REFERENCES responsables_stage(resid)
        )
      `);
    } catch (error) {
      console.log("Evaluations table might already exist or error occurred:", error);
    }

    // Check if evaluation already exists for this report
    const evaluationCheck = await pool.query(
      `SELECT * FROM evaluations_stagiaire WHERE rapportid = $1`,
      [rapportid]
    );

    if (evaluationCheck.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Une évaluation existe déjà pour ce rapport" 
      });
    }

    // Insert evaluation
    await pool.query(
      `INSERT INTO evaluations_stagiaire 
       (cdtid, rapportid, resid, competences_techniques, qualite_travail, respect_delais, 
        travail_equipe, autonomie_initiative, communication, commentaires)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        cdtid, 
        rapportid, 
        supervisor.resid, 
        technical_skills_score || 0,
        work_quality_score || 0,
        timeliness_score || 0,
        teamwork_score || 0,
        initiative_score || 0,
        communication_score || 0,
        supervisor_comments || ''
      ]
    );

    // Get candidate email
    const candidateResult = await pool.query(
      `SELECT email, nom, prenom FROM candidat WHERE cdtid = $1`,
      [cdtid]
    );

    if (candidateResult.rows.length > 0) {
      const candidate = candidateResult.rows[0];
      
      // Send email to candidate
      try {
        await sendEmail({
          to: candidate.email,
          subject: 'Évaluation de stage complétée',
          text: `
            Bonjour ${candidate.prenom} ${candidate.nom},
            
            Votre superviseur a complété votre évaluation de stage.
            Vous pouvez consulter cette évaluation dans votre espace personnel.
            
            Cordialement,
            Système de gestion des stages
          `,
          html: undefined
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: "Évaluation du stagiaire enregistrée avec succès"
    });

  } catch (error) {
    console.error("Error evaluating intern:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
}