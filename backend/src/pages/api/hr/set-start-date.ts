import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import sendEmail from "../../../utilities/sendEmail";
import crypto from "crypto";

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
    // Get HR info from token
    const token = req.cookies?.hr_token;
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const hr = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { dsgid, startDate } = req.body;

    if (!dsgid || !startDate) {
      return res.status(400).json({ 
        success: false, 
        error: "DSGID et date de début sont obligatoires" 
      });
    }

    // Get candidate and internship details
    const result = await pool.query(`
      SELECT 
        c.cdtid, c.nom, c.prenom, c.email, c.statutetudiant as currentyear, c.telephone,
        d.typestage, d.periode, d.mois_debut, d.statut
      FROM demandes_stage d
      JOIN candidat c ON d.cdtid = c.cdtid
      WHERE d.dsgid = $1
      LIMIT 1
    `, [dsgid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Candidature non trouvée" });
    }

    const candidate = result.rows[0];

    // Check if candidate is accepted
    if (candidate.statut !== "Accepté") {
      return res.status(400).json({ success: false, error: "Seuls les candidats acceptés peuvent avoir une date de début" });
    }

    // Calculate end date based on duration
    const start = new Date(startDate);
    const durationMonths = parseInt(candidate.periode.split(' ')[0]); // Extract number from "2 mois"
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);

    // Check if date_debut and date_fin columns exist, if not create them
    try {
      await pool.query(`
        ALTER TABLE demandes_stage 
        ADD COLUMN IF NOT EXISTS date_debut DATE
      `);
    } catch (error) {
      console.log("date_debut column might already exist or error occurred:", error);
    }

    try {
      await pool.query(`
        ALTER TABLE demandes_stage 
        ADD COLUMN IF NOT EXISTS date_fin DATE
      `);
    } catch (error) {
      console.log("date_fin column might already exist or error occurred:", error);
    }

    // Generate a new password for the candidate
            const bcrypt = require('bcryptjs');
    const randomPassword = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10).toUpperCase();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
    // Update candidate with new password
    await pool.query(
      `UPDATE candidat SET password = $1 WHERE cdtid = $2`,
      [hashedPassword, candidate.cdtid]
    );

    // Update the application with start and end dates
    await pool.query(
      `UPDATE demandes_stage SET date_debut = $1, date_fin = $2 WHERE dsgid = $3`,
      [startDate, end.toISOString().split('T')[0], dsgid]
    );

    // Create stages table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS stages (
          stagesid VARCHAR(254) PRIMARY KEY,
          demandes_stageid VARCHAR(254),
          responsables_stageid VARCHAR(254),
          rhid VARCHAR(254),
          datedebut DATE,
          datefin DATE,
          serviceaffectation VARCHAR(254),
          dureetotaleabsences INTEGER DEFAULT 0
        )
      `);
    } catch (error) {
      console.log("stages table might already exist or error occurred:", error);
    }

    // Get the assigned supervisor for this candidate
    const assignmentResult = await pool.query(
      `SELECT a.resid, r.service 
       FROM assignations_stage a 
       JOIN responsables_stage r ON a.resid = r.resid 
       WHERE a.cdtid = $1 AND a.statut = 'Actif' LIMIT 1`,
      [candidate.cdtid]
    );

    // Generate stagesid
    const stagesid = crypto.randomBytes(8).toString('hex');

    // Insert record into stages table
    await pool.query(
      `INSERT INTO stages (stagesid, demandes_stageid, responsables_stageid, rhid, datedebut, datefin, serviceaffectation, dureetotaleabsences) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        stagesid,
        dsgid, // demandes_stageid
        assignmentResult.rows.length > 0 ? assignmentResult.rows[0].resid : null, // responsables_stageid
        hr.rhId, // rhid from JWT token 
        startDate, // datedebut
        end.toISOString().split('T')[0], // datefin
        assignmentResult.rows.length > 0 ? assignmentResult.rows[0].service : 'À définir', // serviceaffectation
        0 // dureetotaleabsences (default to 0)
      ]
    );

    // Send comprehensive email to candidate with credentials and dates
    const fullName = `${candidate.prenom} ${candidate.nom}`.trim();
    
    await sendEmail({
      to: candidate.email,
      subject: "Félicitations, vous avez été accepté(e) - Vos identifiants et dates de stage",
      text: `Bonjour ${fullName},

Félicitations, vous avez été accepté(e) pour le stage chez SBGS !

📅 Détails de votre stage :
- Date de début : ${new Date(startDate).toLocaleDateString('fr-FR')}
- Date de fin : ${end.toLocaleDateString('fr-FR')}
- Type de stage : ${candidate.typestage}
- Durée : ${candidate.periode}

🔐 Vos identifiants de connexion pour accéder à votre espace candidat :

Identifiant : ${candidate.cdtid}
Mot de passe : ${randomPassword}

Vous pouvez vous connecter sur notre plateforme pour suivre votre candidature et accéder aux informations importantes.

Veuillez vous présenter le jour de début à l'adresse de SBGS.

Cordialement,
SBGS Plateforme`
    });

    return res.status(200).json({ 
      success: true, 
      message: "Date de début définie avec succès",
      startDate: startDate,
      endDate: end.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error("Error setting start date:", error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
} 