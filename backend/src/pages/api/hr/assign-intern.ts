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
    // Verify HR authentication
    const token = req.cookies?.hr_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated as HR" });
    }

    const hr = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // All HR users can assign interns

    const { cdtid, resid } = req.body;

    if (!cdtid || !resid) {
      return res.status(400).json({ 
        success: false, 
        error: "cdtid et resid sont requis" 
      });
    }

    // Create assignations table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS assignations_stage (
          id SERIAL PRIMARY KEY,
          resid VARCHAR(255) NOT NULL,
          cdtid VARCHAR(255) NOT NULL,
          date_assignation TIMESTAMP DEFAULT NOW(),
          statut VARCHAR(50) DEFAULT 'Actif',
          FOREIGN KEY (resid) REFERENCES responsables_stage(resid),
          FOREIGN KEY (cdtid) REFERENCES candidat(cdtid)
        )
      `);
    } catch (error) {
      console.log("Assignations table might already exist or error occurred:", error);
    }

    // Check if candidate exists
    const candidateResult = await pool.query("SELECT cdtid, nom, prenom, email FROM candidat WHERE cdtid = $1", [cdtid]);
    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Candidat non trouvé" });
    }

    // Check if supervisor exists
    const supervisorResult = await pool.query("SELECT resid, nom, prenom, email FROM responsables_stage WHERE resid = $1", [resid]);
    if (supervisorResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Responsable de stage non trouvé" });
    }

    // Check if assignment already exists
    const existingAssignment = await pool.query(
      "SELECT id FROM assignations_stage WHERE cdtid = $1 AND resid = $2 AND statut = 'Actif'",
      [cdtid, resid]
    );
    if (existingAssignment.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Ce stagiaire est déjà assigné à ce responsable" });
    }

    // Deactivate any existing assignments for this candidate
    await pool.query(
      "UPDATE assignations_stage SET statut = 'Inactif' WHERE cdtid = $1 AND statut = 'Actif'",
      [cdtid]
    );

    // Create new assignment
    await pool.query(
      `INSERT INTO assignations_stage (resid, cdtid, statut) VALUES ($1, $2, 'Actif')`,
      [resid, cdtid]
    );

    const candidate = candidateResult.rows[0];
    const supervisor = supervisorResult.rows[0];

    // Send email notification to supervisor
    const sendEmailModule = await import("../../../utilities/sendEmail");
    const emailText = `Bonjour ${supervisor.prenom} ${supervisor.nom},

Un nouveau stagiaire vous a été assigné :

Nom : ${candidate.prenom} ${candidate.nom}
Email : ${candidate.email}
ID Candidat : ${candidate.cdtid}

Vous pouvez maintenant suivre ce stagiaire depuis votre tableau de bord.

Cordialement,
L'équipe RH - SBGS`;

    await sendEmailModule.default({ 
      to: supervisor.email, 
      subject: "Nouveau stagiaire assigné - SBGS", 
      text: emailText 
    });

    return res.status(200).json({ 
      success: true, 
      message: "Stagiaire assigné avec succès",
      assignment: {
        cdtid,
        resid,
        candidate: candidate,
        supervisor: supervisor
      }
    });

  } catch (error) {
    console.error("Error assigning intern:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 